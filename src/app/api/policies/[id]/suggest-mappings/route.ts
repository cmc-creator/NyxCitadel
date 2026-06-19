import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { JC_STANDARDS } from '@/lib/jc-standards';
import { standardsLibrary } from '@/lib/standards-library';
import { CARF_STANDARDS } from '@/lib/carf-standards';

export const dynamic = 'force-dynamic';

// Condensed standard list for prompt — just ref + title
function getStandardsSummary(): string {
  const tjc = JC_STANDARDS.flatMap(ch =>
    ch.standards.map(s => `TJC|${s.ref}|${s.title}`)
  );
  const cms = standardsLibrary
    .filter(s => s.category === 'CMS')
    .map(s => `CMS|${s.standard}|${s.title}`);
  const carf = CARF_STANDARDS.flatMap(sec =>
    sec.standards.map(s => `CARF|${s.ref}|${s.title}`)
  );
  return [...tjc, ...cms, ...carf].join('\n');
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  const policy = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    select: { title: true, category: true, summary: true, standardRef: true, regulatoryBody: true },
  });

  if (!policy) {
    return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
  }

  const standardsSummary = getStandardsSummary();

  const prompt = `You are a hospital compliance expert. Given a policy, identify which regulatory standards it most likely addresses.

POLICY:
Title: ${policy.title}
Category: ${policy.category}
${policy.summary ? `Summary: ${policy.summary}` : ''}
${policy.standardRef ? `Existing standard ref: ${policy.standardRef}` : ''}
${policy.regulatoryBody.length ? `Regulatory bodies: ${policy.regulatoryBody.join(', ')}` : ''}

AVAILABLE STANDARDS (format: framework|ref|title):
${standardsSummary}

Return a JSON array of the top 8 most relevant standards this policy addresses. Each item: { "framework": "TJC"|"CMS"|"CARF", "standardRef": "...", "standardTitle": "..." }

Return ONLY valid JSON, no explanation.`;

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]';

  let suggestions: { framework: string; standardRef: string; standardTitle: string }[] = [];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      suggestions = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // return empty if parse fails
  }

  return NextResponse.json({ suggestions });
}
