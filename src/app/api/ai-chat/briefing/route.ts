import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ briefing: null, reason: 'no_api_key' });
  }

  const facilityId = session.user.facilityId;
  const now = new Date();
  const in7Days = addDays(now, 7);

  const [
    overdueCaps,
    overdueCalendar,
    grievanceOverdueAck,
    grievanceOverdueRes,
    adhsOverdue,
    openSentinels,
    expiringTraining,
    dueSoonCalendar,
    pendingIad,
    openHipaaBreaches,
    csDiscrepancies,
  ] = await Promise.all([
    prisma.correctiveActionPlan.count({
      where: { facilityId, targetDate: { lt: now }, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.calendarEvent.count({
      where: { facilityId, dueDate: { lt: now }, completedDate: null, status: { not: 'COMPLETED' } },
    }),
    prisma.grievanceRecord.count({
      where: { facilityId, acknowledgmentDate: null, acknowledgmentDueDate: { lt: now }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
    }),
    prisma.grievanceRecord.count({
      where: { facilityId, resolutionDate: null, resolutionDueDate: { lt: now }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
    }),
    prisma.incidentReport.count({
      where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { lt: now } },
    }),
    prisma.incidentReport.count({
      where: { facilityId, severity: 'SENTINEL', status: { not: 'CLOSED' } },
    }),
    prisma.trainingRecord.count({
      where: { facilityId, expiryDate: { gte: now, lte: in7Days }, status: { not: 'EXEMPT' } },
    }),
    prisma.calendarEvent.count({
      where: { facilityId, dueDate: { gte: now, lte: in7Days }, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } },
    }),
    prisma.incidentReport.count({
      where: { facilityId, iadRequired: true, iadSubmitted: false, status: { not: 'CLOSED' } },
    }),
    prisma.hipaaBreachLog.count({
      where: { facilityId, status: { notIn: ['CLOSED', 'REPORTED_TO_HHS'] } },
    }),
    prisma.controlledSubstanceLog.count({
      where: { facilityId, status: 'DISCREPANCY_OPEN' },
    }),
  ]);

  const contextLines: string[] = [];
  if (openSentinels > 0)
    contextLines.push(`${openSentinels} open sentinel event${openSentinels > 1 ? 's' : ''} require RCA (JC 45-day window)`);
  if (csDiscrepancies > 0)
    contextLines.push(`${csDiscrepancies} controlled substance discrepanc${csDiscrepancies > 1 ? 'ies' : 'y'} require immediate resolution (DEA-auditable)`);
  if (adhsOverdue > 0)
    contextLines.push(`${adhsOverdue} ADHS incident report${adhsOverdue > 1 ? 's' : ''} are past their filing deadline (ARS 36-2402)`);
  if (grievanceOverdueAck > 0)
    contextLines.push(`${grievanceOverdueAck} grievance${grievanceOverdueAck > 1 ? 's' : ''} have missed the 7-day CMS acknowledgment deadline (CMS 482.13(e))`);
  if (grievanceOverdueRes > 0)
    contextLines.push(`${grievanceOverdueRes} grievance${grievanceOverdueRes > 1 ? 's' : ''} have missed the 30-day CMS resolution deadline (CMS 482.13(e))`);
  if (openHipaaBreaches > 0)
    contextLines.push(`${openHipaaBreaches} open HIPAA breach${openHipaaBreaches > 1 ? 'es' : ''} require follow-up`);
  if (overdueCaps > 0)
    contextLines.push(`${overdueCaps} corrective action plan${overdueCaps > 1 ? 's' : ''} are past their target completion date`);
  if (overdueCalendar > 0)
    contextLines.push(`${overdueCalendar} compliance calendar event${overdueCalendar > 1 ? 's' : ''} are overdue`);
  if (pendingIad > 0)
    contextLines.push(`${pendingIad} incident${pendingIad > 1 ? 's' : ''} require IAD submission to ADHS`);
  if (expiringTraining > 0)
    contextLines.push(`${expiringTraining} staff training record${expiringTraining > 1 ? 's' : ''} expire within 7 days`);
  if (dueSoonCalendar > 0)
    contextLines.push(`${dueSoonCalendar} compliance event${dueSoonCalendar > 1 ? 's' : ''} are due within 7 days`);

  const allClear = contextLines.length === 0;

  const userPrompt = allClear
    ? `The compliance dashboard shows no overdue or urgent items today. Write a brief 1-2 sentence encouraging daily briefing for the compliance team. Mention that proactive compliance is the foundation of survey readiness.`
    : `Current compliance status:\n${contextLines.map(l => `- ${l}`).join('\n')}\n\nWrite a concise daily briefing (3-5 sentences max) summarizing the most critical items and what actions to prioritize today. Be direct and action-oriented. Do not use bullet points. Address the team directly (e.g., "You have..." or "Today's priority..."). Order by regulatory severity.`;

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 280,
      system: `You are Sentry, the compliance assistant robot for an acute psychiatric hospital. Your daily briefings are concise, accurate, and help compliance staff quickly understand what needs immediate attention. When noting overdue regulatory items, reference the specific standard. Keep responses under 5 sentences.`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const block = response.content[0];
    const briefing = block.type === 'text' ? block.text.trim() : null;
    return NextResponse.json({ briefing, allClear });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Claude request failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
