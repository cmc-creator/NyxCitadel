import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "The AI assistant is not configured yet. Please ask your administrator to add an Anthropic API key to enable NyxAI.",
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

  // Build message array from prior history (capped at last 20) + new user message.
  // Filter out any system messages — Anthropic takes system as a top-level param.
  const anthropicMessages = [
    ...history.slice(-20).filter((m) => m.role !== 'system').map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message.trim() },
  ];

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    const block = response.content[0];
    const reply = block.type === 'text' ? block.text : 'No response received.';
    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Claude request failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
