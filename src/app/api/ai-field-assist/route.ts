import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const FIELD_SYSTEM_PROMPT = `You are Sentry, a compliance writing assistant for acute psychiatric hospitals. Your job is to help staff write clear, professional documentation for regulatory compliance records.

Guidelines:
- Use professional clinical language appropriate for a psychiatric hospital
- Never invent patient names, MRNs, staff names, or specific dates/times unless provided in context
- Use placeholder language like "[patient]", "[staff name]", "[date/time]" when specifics are unknown
- Write in past tense for events that occurred; future tense for plans and corrective actions
- Keep responses focused on the specific field requested
- Narrative fields (incident descriptions, RCA factors): 3-6 sentences
- Plan fields (corrective actions, monitoring plans): 2-4 sentences
- Summary fields: 2-3 sentences
- Always end with a complete sentence
- Return only the field content itself, no preamble like "Here is..." or "This field should..."`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 });

  let body: {
    fieldLabel?: string;
    pageContext?: string;
    formHints?: Record<string, string>;
    existingText?: string;
    action?: 'suggest' | 'improve';
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    fieldLabel,
    pageContext,
    formHints = {},
    existingText,
    action = 'suggest',
  } = body;

  if (!fieldLabel || !pageContext) {
    return NextResponse.json({ error: 'fieldLabel and pageContext are required' }, { status: 400 });
  }

  // Truncate hints to prevent prompt injection / oversized input
  const safeHints = Object.fromEntries(
    Object.entries(formHints)
      .filter(([, v]) => typeof v === 'string' && v.trim())
      .slice(0, 10)
      .map(([k, v]) => [k.slice(0, 50), (v as string).slice(0, 200)])
  );

  const hintsText = Object.entries(safeHints)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  let userPrompt: string;
  if (action === 'improve' && existingText) {
    userPrompt = [
      `Page: ${pageContext.slice(0, 100)}`,
      `Field: "${fieldLabel.slice(0, 100)}"`,
      hintsText ? `Form context:\n${hintsText}` : '',
      `\nExisting text to improve:\n"${existingText.slice(0, 1000)}"`,
      '\nImprove this to be clearer, more professional, and more complete for a compliance record. Return only the improved text.',
    ].filter(Boolean).join('\n');
  } else {
    userPrompt = [
      `Page: ${pageContext.slice(0, 100)}`,
      `Field: "${fieldLabel.slice(0, 100)}"`,
      hintsText ? `Form context:\n${hintsText}` : '',
      '\nWrite professional content for this field. Return only the field text.',
    ].filter(Boolean).join('\n');
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 512,
      system: FIELD_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const block = response.content[0];
    const suggestion = block.type === 'text' ? block.text.trim() : '';
    return NextResponse.json({ suggestion });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
