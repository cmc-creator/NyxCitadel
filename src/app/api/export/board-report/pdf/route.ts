import { NextResponse } from 'next/server';
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { auth } from '@/lib/auth';
import { getBoardReportSummary } from '@/lib/reporting/board-report-summary';

function drawLine(page: PDFPage, y: number, color = rgb(0.88, 0.9, 0.95)) {
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color });
}

function drawBarChart(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  values: Array<{ label: string; value: number }>,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
) {
  const max = Math.max(1, ...values.map((item) => item.value));
  page.drawText(title, { x, y: y + height + 20, size: 11, font, color: rgb(0.18, 0.2, 0.26) });
  page.drawRectangle({ x, y, width, height, borderWidth: 1, borderColor: rgb(0.9, 0.92, 0.96), color: rgb(0.99, 0.99, 1) });

  const innerWidth = width - 24;
  const barWidth = Math.max(14, Math.floor(innerWidth / Math.max(values.length * 2, 1)));
  const gap = Math.max(8, Math.floor((innerWidth - values.length * barWidth) / Math.max(values.length - 1, 1)));

  values.forEach((item, index) => {
    const barHeight = Math.max(4, Math.round((item.value / max) * (height - 34)));
    const barX = x + 12 + index * (barWidth + gap);
    page.drawRectangle({ x: barX, y: y + 18, width: barWidth, height: barHeight, color });
    page.drawText(String(item.value), { x: barX, y: y + 18 + barHeight + 4, size: 8, font, color: rgb(0.33, 0.36, 0.42) });
    page.drawText(item.label, { x: barX - 2, y: y + 6, size: 8, font, color: rgb(0.4, 0.43, 0.5) });
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await getBoardReportSummary(session.user.facilityId);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  let y = height - 56;

  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: rgb(0.31, 0.27, 0.9) });
  page.drawText('NyxCitadel', { x: 50, y: height - 55, size: 12, font: bold, color: rgb(1, 1, 1) });
  page.drawText('Board Compliance Report', { x: 50, y: height - 88, size: 24, font: bold, color: rgb(1, 1, 1) });

  const subtitle = `${summary.facility?.name ?? 'Facility'} · ${summary.generatedAt.toLocaleDateString()}`;
  page.drawText(subtitle, { x: 50, y: height - 108, size: 11, font: regular, color: rgb(0.93, 0.93, 1) });

  y = height - 170;

  page.drawText('Executive Snapshot', { x: 50, y, size: 16, font: bold, color: rgb(0.07, 0.09, 0.15) });
  y -= 28;

  const cards = [
    ['Resilience Grade', `${summary.resilienceGrade} (${summary.resilienceScore}/100)`],
    ['Training Compliance', `${summary.trainingPct}%`],
    ['Open CAPs', String(summary.metrics.openCaps)],
    ['Incidents (90d)', String(summary.metrics.incidentCount90)],
  ] as const;

  cards.forEach(([label, value], index) => {
    const x = 50 + (index % 2) * 250;
    const row = Math.floor(index / 2);
    const top = y - row * 74;
    page.drawRectangle({ x, y: top - 44, width: 220, height: 56, borderWidth: 1, borderColor: rgb(0.87, 0.89, 0.93), color: rgb(0.98, 0.98, 1) });
    page.drawText(label, { x: x + 14, y: top - 12, size: 10, font: regular, color: rgb(0.42, 0.45, 0.51) });
    page.drawText(value, { x: x + 14, y: top - 32, size: 18, font: bold, color: rgb(0.12, 0.13, 0.2) });
  });

  y -= 170;
  drawLine(page, y);
  y -= 26;

  page.drawText('Key Risk Indicators', { x: 50, y, size: 16, font: bold, color: rgb(0.07, 0.09, 0.15) });
  y -= 24;

  const indicators = [
    ['Critical / High Incidents (90d)', String(summary.metrics.criticalIncidentCount)],
    ['Overdue CAPs', String(summary.metrics.overdueCaps)],
    ['Open Grievances', String(summary.metrics.grievancesOpen)],
    ['Open HIPAA Breaches', String(summary.metrics.openHipaaBreaches)],
    ['Expiring Licenses (90d)', String(summary.metrics.expiringLicenses90)],
    ['Controlled Substance Discrepancies', String(summary.metrics.csDiscrepanciesOpen)],
    ['Policies Due in 90 Days', String(summary.metrics.upcomingPolicies)],
  ];

  indicators.forEach(([label, value]) => {
    page.drawText(label, { x: 60, y, size: 11, font: regular, color: rgb(0.2, 0.23, 0.28) });
    page.drawText(value, { x: 475, y, size: 11, font: bold, color: rgb(0.07, 0.09, 0.15) });
    y -= 20;
  });

  y -= 10;
  drawLine(page, y);
  y -= 26;

  page.drawText('Board Highlights', { x: 50, y, size: 16, font: bold, color: rgb(0.07, 0.09, 0.15) });
  y -= 24;

  const highlights = summary.highlights.length > 0 ? summary.highlights : ['No acute board-level compliance escalations identified in the current reporting window.'];
  highlights.slice(0, 8).forEach((item) => {
    page.drawCircle({ x: 58, y: y + 4, size: 2.4, color: rgb(0.31, 0.27, 0.9) });
    page.drawText(item, { x: 70, y, size: 11, font: regular, color: rgb(0.2, 0.23, 0.28), maxWidth: 460 });
    y -= 22;
  });

  y -= 6;
  page.drawRectangle({ x: 50, y: y - 62, width: 495, height: 62, color: rgb(0.95, 0.97, 1), borderColor: rgb(0.82, 0.86, 0.96), borderWidth: 1 });
  page.drawText('Recommendation', { x: 62, y: y - 18, size: 11, font: bold, color: rgb(0.17, 0.24, 0.52) });
  page.drawText(
    summary.trainingPct < 80 || summary.metrics.overdueCaps > 0
      ? 'Prioritize overdue CAP closure and training recovery this week before the next executive review.'
      : 'Maintain current compliance cadence and continue weekly leadership review of open risk items.',
    { x: 62, y: y - 38, size: 10.5, font: regular, color: rgb(0.2, 0.23, 0.28), maxWidth: 465 },
  );

  const trendPage = pdf.addPage([595, 842]);
  const trendValuesIncidents = summary.trends.map((point) => ({ label: point.label, value: point.incidentCount }));
  const trendValuesCaps = summary.trends.map((point) => ({ label: point.label, value: point.capClosures }));
  const trendValuesTraining = summary.trends.map((point) => ({ label: point.label, value: point.trainingCompletions }));

  trendPage.drawRectangle({ x: 0, y: 740, width, height: 102, color: rgb(0.08, 0.12, 0.2) });
  trendPage.drawText('Trend Outlook', { x: 50, y: 785, size: 24, font: bold, color: rgb(1, 1, 1) });
  trendPage.drawText('Six-month operational trend view for board packets and leadership review.', {
    x: 50,
    y: 764,
    size: 11,
    font: regular,
    color: rgb(0.86, 0.89, 0.95),
  });

  trendPage.drawText('90-Day Direction of Travel', { x: 50, y: 708, size: 16, font: bold, color: rgb(0.08, 0.12, 0.2) });
  const comparisonCards = [
    ['Incidents', `${summary.comparisons.incidentsDeltaPct > 0 ? '+' : ''}${summary.comparisons.incidentsDeltaPct}% vs prior 90d`],
    ['Critical Incidents', `${summary.comparisons.criticalIncidentsDeltaPct > 0 ? '+' : ''}${summary.comparisons.criticalIncidentsDeltaPct}% vs prior 90d`],
    ['CAP Closures', `${summary.comparisons.capClosuresDeltaPct > 0 ? '+' : ''}${summary.comparisons.capClosuresDeltaPct}% vs prior 90d`],
    ['Training Completions', `${summary.comparisons.trainingCompletionsDeltaPct > 0 ? '+' : ''}${summary.comparisons.trainingCompletionsDeltaPct}% vs prior 90d`],
  ] as const;

  comparisonCards.forEach(([label, value], index) => {
    const x = 50 + (index % 2) * 245;
    const top = 680 - Math.floor(index / 2) * 76;
    trendPage.drawRectangle({ x, y: top - 46, width: 220, height: 58, borderWidth: 1, borderColor: rgb(0.88, 0.9, 0.95), color: rgb(0.98, 0.99, 1) });
    trendPage.drawText(label, { x: x + 12, y: top - 12, size: 10, font: regular, color: rgb(0.38, 0.42, 0.48) });
    trendPage.drawText(value, { x: x + 12, y: top - 31, size: 12, font: bold, color: rgb(0.12, 0.16, 0.22) });
  });

  drawLine(trendPage, 520);
  drawBarChart(trendPage, 50, 360, 495, 125, 'Monthly Incidents', trendValuesIncidents, regular, rgb(0.86, 0.25, 0.28));
  drawBarChart(trendPage, 50, 205, 495, 125, 'Monthly CAP Closures', trendValuesCaps, regular, rgb(0.18, 0.63, 0.42));
  drawBarChart(trendPage, 50, 50, 495, 125, 'Monthly Training Completions', trendValuesTraining, regular, rgb(0.18, 0.4, 0.88));

  if (summary.automationHistory.length > 0) {
    trendPage.drawText('Operational Cadence', { x: 50, y: 500, size: 16, font: bold, color: rgb(0.08, 0.12, 0.2) });
    let historyY = 478;
    summary.automationHistory.slice(0, 4).forEach((entry) => {
      const text = entry.runType === 'alerts'
        ? `${entry.triggeredBy === 'admin' ? 'Manual' : 'Scheduled'} alerts ${entry.mode} · ${entry.notificationsCreated} alerts, ${entry.digestsSent} digests${entry.failures > 0 ? `, ${entry.failures} failures` : ''}`
        : `${entry.triggeredBy === 'admin' ? 'Manual' : 'Scheduled'} exports ${entry.mode} · ${entry.sent} sent to ${entry.recipients} recipients${entry.failures > 0 ? `, ${entry.failures} failures` : ''}`;
      trendPage.drawCircle({ x: 58, y: historyY + 4, size: 2.2, color: rgb(0.31, 0.27, 0.9) });
      trendPage.drawText(`${new Date(entry.createdAt).toLocaleDateString()} · ${text}`, {
        x: 70,
        y: historyY,
        size: 10,
        font: regular,
        color: rgb(0.2, 0.23, 0.28),
        maxWidth: 460,
      });
      historyY -= 18;
    });
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="board-report-${summary.generatedAt.toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
