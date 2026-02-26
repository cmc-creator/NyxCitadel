import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message, history } = await req.json();
  if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 });

  // Pull facility context
  const facilityId = session.user.facilityId;
  const now = new Date();

  const [overdueCount, openCaps, openIncidents, upcomingCount] = await Promise.all([
    prisma.calendarEvent.count({
      where: { facilityId, dueDate: { lt: now }, completedDate: null, status: { not: 'COMPLETED' } },
    }),
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.incident.count({
      where: { facilityId, status: { notIn: ['CLOSED'] } },
    }),
    prisma.calendarEvent.count({
      where: { facilityId, dueDate: { gte: now, lte: addDays(now, 30) }, status: { notIn: ['COMPLETED', 'WAIVED', 'NA'] } },
    }),
  ]);

  const systemPrompt = `You are NyxAI, the compliance assistant for Destiny Springs Healthcare — a 60-bed acute inpatient psychiatric facility in Peoria, Arizona.

Current facility status (as of today ${now.toLocaleDateString()}):
- Overdue compliance events: ${overdueCount}
- Upcoming events in 30 days: ${upcomingCount}
- Open corrective action plans: ${openCaps}
- Open incidents: ${openIncidents}

Governing bodies: Joint Commission (CAMH accreditation), CMS Conditions of Participation (42 CFR 482 / IPF), Arizona ADHS (A.A.C. R9-10 Behavioral Health licensure).

You help with:
- Answering JC, CMS, and AZ ADHS regulatory questions for acute psychiatric facilities
- Interpreting standards (EM standards, life safety, patient rights, QAPI)
- Drafting Corrective Action Plan (CAP) language
- Suggesting risk mitigation strategies
- Reviewing policy content for compliance gaps
- Explaining QAPI improvement methodology (PDSA cycles)
- Summarizing overdue or upcoming compliance requirements
- De-escalation training requirements under AZ A.A.C. R9-10-308(D)

Be concise, accurate, and cite specific standard references when relevant. If unsure, say so — accuracy matters in regulatory compliance.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: 'user', content: message },
  ];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "AI assistant is not configured yet. Ask your administrator to add the OPENAI_API_KEY environment variable in Vercel. Once configured, I can help with compliance questions, draft CAP language, explain JC/CMS standards, and more.",
    });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('OpenAI error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? 'No response from AI.';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Assistant error:', err);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 });
  }
}
