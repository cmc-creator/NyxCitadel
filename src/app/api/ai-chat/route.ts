import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are NyxAI, a compliance assistant for acute psychiatric hospitals.
You specialize in:
- Joint Commission (JC) standards, especially behavioral health, NPSG, and emergency management
- CMS Conditions of Participation (CoPs) including 482.13 patient rights and grievance requirements
- Arizona ADHS regulations for behavioral health facilities (A.A.C. R9-10)
- QAPI methodology, PDSA cycles, and performance improvement
- Root cause analysis (RCA), corrective action plans (CAP), and plan of correction (POC)
- HBIPS core measures and psychiatric quality metrics
- Restraint and seclusion regulations (CMS 482.13(e))
- Infection control, HVA/emergency preparedness, and governance

Always provide accurate, practical guidance. When citing specific standards, include the standard number (e.g., JC EC.02.06.01, CMS 482.13). Acknowledge uncertainty when appropriate and recommend verifying against official regulatory publications.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "The AI assistant is not configured yet. Please ask your administrator to add an OpenAI API key to enable NyxAI.",
    });
  }

  let body: { message?: string; history?: Message[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Build message array: system + prior history (capped at last 20) + new user message
  const messages: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message.trim() },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    const msg = err?.error?.message ?? 'OpenAI request failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content ?? 'No response received.';
  return NextResponse.json({ reply });
}
