import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Shield,
  FileBarChart,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Activity,
  ClipboardList,
  Siren,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Board Compliance Report' };

export default async function BoardReportPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const since90   = new Date(Date.now() - 90  * 24 * 60 * 60 * 1000);
  const since60   = new Date(Date.now() - 60  * 24 * 60 * 60 * 1000);
  const now       = new Date();
  const in90      = new Date(Date.now() + 90  * 24 * 60 * 60 * 1000);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const thisMonth = now.getMonth() + 1;
  const thisYear  = now.getFullYear();

  const [
    facility,
    irLast90,
    rcaApproved,
    capsCompleted,
    capsOpen,
    trainingAll,
    trainingCompleted,
    drillsLast90,
    qapiMetrics,
    surveys,
    grievancesLast90,
    grievancesOpen,
    recentCaps,
    criticalIR,
    // New module stats
    expiringLicenses90,
    csDiscrepanciesOpen,
    openHipaaBreaches,
    activeHolds,
    restraintDeathsYtd,
  ] = await Promise.all([
    prisma.facility.findUnique({
      where: { id: facilityId },
      select: { name: true, city: true, state: true, licenseNumber: true, bedCount: true, facilityType: true },
    }),
    prisma.incidentReport.count({
      where: { facilityId, incidentDate: { gte: since90 } },
    }),
    prisma.rootCauseAnalysis.count({
      where: { facilityId, status: { in: ['APPROVED', 'SUBMITTED_TO_JC', 'CLOSED'] } },
    }),
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: 'COMPLETED' },
    }),
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS', 'OVERDUE'] } },
    }),
    prisma.trainingRecord.count({
      where: { facilityId, isRequired: true },
    }),
    prisma.trainingRecord.count({
      where: { facilityId, isRequired: true, status: 'COMPLETED' },
    }),
    prisma.drill.findMany({
      where: { facilityId, scheduledDate: { gte: since90 } },
      orderBy: { scheduledDate: 'desc' },
      select: { id: true, drillName: true, drillType: true, status: true, scheduledDate: true, aarGeneratedAt: true, resilienceGrade: true },
    }),
    prisma.qapiMetric.findMany({
      where: { facilityId, year: thisYear, month: thisMonth },
      select: { metricName: true, value: true, target: true, unit: true },
      take: 8,
      orderBy: { metricName: 'asc' },
    }),
    prisma.survey.findMany({
      where: { facilityId, conductedDate: { gte: since90 } },
      orderBy: { conductedDate: 'desc' },
      select: { surveyType: true, regulatoryBody: true, conductedDate: true, outcome: true, findingCount: true },
      take: 5,
    }),
    prisma.grievanceRecord.count({
      where: { facilityId, dateReceived: { gte: since90 } },
    }),
    prisma.grievanceRecord.count({
      where: { facilityId, status: { in: ['OPEN', 'UNDER_REVIEW', 'ACKNOWLEDGMENT_SENT', 'PENDING_RESOLUTION'] } },
    }),
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
      orderBy: { targetDate: 'asc' },
      take: 5,
      select: { capNumber: true, title: true, status: true, targetDate: true, priority: true },
    }),
    prisma.incidentReport.findMany({
      where: {
        facilityId,
        incidentDate: { gte: since90 },
        aiTriageSeverity: { in: ['CRITICAL', 'HIGH'] },
      },
      orderBy: { incidentDate: 'desc' },
      select: {
        irNumber: true,
        incidentDate: true,
        incidentType: true,
        aiTriageSeverity: true,
        aiTriageReason: true,
        unitName: true,
        status: true,
        aiCascadeTriggered: true,
      },
      take: 10,
    }),
    // New module queries
    prisma.providerLicense.count({ where: { provider: { facilityId }, expiryDate: { lte: in90 }, status: 'ACTIVE' } }),
    prisma.controlledSubstanceLog.count({ where: { facilityId, status: 'DISCREPANCY_OPEN' } }),
    prisma.hipaaBreachLog.count({ where: { facilityId, status: { notIn: ['CLOSED', 'REPORTED_TO_HHS'] } } }),
    prisma.involuntaryHoldLog.count({ where: { facilityId, status: 'ACTIVE' } }),
    prisma.restraintEvent.count({ where: { facilityId, deathOccurred: true, eventDate: { gte: yearStart } } }),
  ]);

  const trainingPct = trainingAll > 0 ? Math.round((trainingCompleted / trainingAll) * 100) : 100;
  const drillsCompleted = drillsLast90.filter((d) => d.status === 'COMPLETED').length;
  const aarCompleted    = drillsLast90.filter((d) => d.aarGeneratedAt).length;
  const reportDate      = formatDate(now);

  function resilScore() {
    let score = trainingPct * 0.4;
    const irRate = irLast90 === 0 ? 100 : irLast90 <= 3 ? 80 : irLast90 <= 7 ? 60 : 40;
    score += irRate * 0.3;
    const capRate = capsOpen === 0 ? 100 : capsOpen <= 3 ? 85 : 70;
    score += capRate * 0.2;
    const grvRate = grievancesOpen === 0 ? 100 : grievancesOpen <= 2 ? 80 : 60;
    score += grvRate * 0.1;
    return Math.round(score);
  }

  const resilience = resilScore();
  const resGrade = resilience >= 90 ? 'A' : resilience >= 80 ? 'B' : resilience >= 70 ? 'C' : resilience >= 60 ? 'D' : 'F';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </Link>
        <PrintButton />
      </div>

      {/* ─── REPORT BODY ──────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-8 space-y-8 print:border-0 print:p-2">

        {/* Header */}
        <div className="border-b-2 border-teal-600 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">NyxCitadel - Compliance Intelligence</span>
              </div>
              <h1 className="text-3xl font-black text-foreground">Board Compliance Report</h1>
              <p className="text-slate-500 mt-1 text-sm">
                {facility?.name} · {facility?.city}, {facility?.state} ·{' '}
                {facility?.licenseNumber ? `Lic. #${facility.licenseNumber} · ` : ''}
                {facility?.bedCount ? `${facility.bedCount} beds` : ''}
              </p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p className="font-semibold text-foreground/80">Reporting Period</p>
              <p>{formatDate(since90)} - {reportDate}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">CONFIDENTIAL - BOARD USE ONLY</p>
            </div>
          </div>
        </div>

        {/* Resilience Score */}
        <div className="bg-gradient-to-r from-teal-950/40 to-blue-950/30 border border-teal-500/20 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Facility Resilience Score</p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black text-teal-300">{resGrade}</span>
              <span className="text-3xl font-bold text-teal-500 mb-1">{resilience}/100</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Training {trainingPct}% · IR (90d): {irLast90} · Open CAPs: {capsOpen} · Open Grievances: {grievancesOpen}
            </p>
          </div>
          <div className="text-right space-y-2">
            <ScorePill label="Training" pct={trainingPct} />
            <ScorePill label="IR Rate" pct={irLast90 === 0 ? 100 : Math.max(20, 100 - irLast90 * 8)} />
            <ScorePill label="Open CAPs" pct={capsOpen === 0 ? 100 : Math.max(40, 100 - capsOpen * 8)} />
          </div>
        </div>

        {/* ── Section 1: Incident Overview ─────────────────── */}
        <ReportSection icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} title="Section 1 - Incident Overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatBox label="Total Incidents (90d)"  value={irLast90}               />
            <StatBox label="Critical / High"        value={criticalIR.length}      highlight={criticalIR.length > 0} />
            <StatBox label="Open Grievances"        value={grievancesOpen}         highlight={grievancesOpen > 2} />
            <StatBox label="New Grievances (90d)"   value={grievancesLast90}       />
          </div>

          {criticalIR.length > 0 ? (
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="py-1.5 text-left">IR #</th>
                  <th className="py-1.5 text-left">Date</th>
                  <th className="py-1.5 text-left">Type</th>
                  <th className="py-1.5 text-left">Unit</th>
                  <th className="py-1.5 text-center">Severity</th>
                  <th className="py-1.5 text-center">RCA Triggered</th>
                  <th className="py-1.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {criticalIR.map((ir) => (
                  <tr key={ir.irNumber} className="border-b border-slate-100">
                    <td className="py-1.5 font-mono text-xs">{ir.irNumber}</td>
                    <td className="py-1.5 text-xs text-slate-500">{formatDate(ir.incidentDate)}</td>
                    <td className="py-1.5 text-xs">{ir.incidentType.replace(/_/g, ' ')}</td>
                    <td className="py-1.5 text-xs">{ir.unitName ?? '-'}</td>
                    <td className="py-1.5 text-center">
                      <SeverityBadge s={ir.aiTriageSeverity} />
                    </td>
                    <td className="py-1.5 text-center text-xs">
                      {ir.aiCascadeTriggered ? (
                        <span className="text-emerald-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-muted-foreground/70">No</span>
                      )}
                    </td>
                    <td className="py-1.5 text-xs text-slate-600">{ir.status.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> No critical or high-severity incidents in the reporting period.
            </p>
          )}
        </ReportSection>

        {/* ── Section 2: RCA & QI Intervention ─────────────── */}
        <ReportSection icon={<ClipboardList className="w-4 h-4 text-teal-500" />} title="Section 2 - Root Cause Analysis & QI Intervention">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatBox label="Approved RCAs"    value={rcaApproved} />
            <StatBox label="CAPs Completed"   value={capsCompleted} />
            <StatBox label="Open CAPs"        value={capsOpen} highlight={capsOpen > 3} />
          </div>

          {recentCaps.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Priority Open CAPs</p>
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="py-1.5 text-left">CAP #</th>
                    <th className="py-1.5 text-left">Title</th>
                    <th className="py-1.5 text-left">Priority</th>
                    <th className="py-1.5 text-left">Status</th>
                    <th className="py-1.5 text-left">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCaps.map((c) => (
                    <tr key={c.capNumber} className="border-b border-slate-100">
                      <td className="py-1.5 font-mono text-xs">{c.capNumber}</td>
                      <td className="py-1.5 text-xs">{c.title}</td>
                      <td className="py-1.5 text-xs">{c.priority}</td>
                      <td className="py-1.5 text-xs">{c.status.replace(/_/g, ' ')}</td>
                      <td className={`py-1.5 text-xs ${c.targetDate < now ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                        {formatDate(c.targetDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportSection>

        {/* ── Section 3: Emergency Management ──────────────── */}
        <ReportSection icon={<Siren className="w-4 h-4 text-red-500" />} title="Section 3 - Emergency Preparedness">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <StatBox label="Drills Scheduled (90d)" value={drillsLast90.length} />
            <StatBox label="Drills Completed"        value={drillsCompleted} />
            <StatBox label="AARs Generated"          value={aarCompleted} highlight={aarCompleted < drillsCompleted} />
          </div>
          {drillsLast90.length > 0 && (
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="py-1.5 text-left">Drill</th>
                  <th className="py-1.5 text-left">Type</th>
                  <th className="py-1.5 text-left">Date</th>
                  <th className="py-1.5 text-center">Status</th>
                  <th className="py-1.5 text-center">Grade</th>
                  <th className="py-1.5 text-center">AAR</th>
                </tr>
              </thead>
              <tbody>
                {drillsLast90.map((d, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 text-xs font-medium">
                      <a href={`/emergency/drills/${d.id}`} className="hover:text-teal-600 hover:underline">{d.drillName}</a>
                    </td>
                    <td className="py-1.5 text-xs text-slate-500">{d.drillType.replace(/_/g, ' ')}</td>
                    <td className="py-1.5 text-xs text-slate-500">{formatDate(d.scheduledDate)}</td>
                    <td className="py-1.5 text-center">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${d.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-1.5 text-center">
                      {d.resilienceGrade ? (
                        <span className={`text-sm font-black ${
                          d.resilienceGrade.startsWith('A') ? 'text-emerald-600' :
                          d.resilienceGrade.startsWith('B') ? 'text-blue-600' :
                          d.resilienceGrade.startsWith('C') ? 'text-yellow-600' : 'text-red-600'
                        }`}>{d.resilienceGrade}</span>
                      ) : (
                        <span className="text-muted-foreground/70 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-1.5 text-center text-xs">
                      {d.aarGeneratedAt ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground/70">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ReportSection>

        {/* ── Section 4: Training Compliance ───────────────── */}
        <ReportSection icon={<GraduationCap className="w-4 h-4 text-blue-500" />} title="Section 4 - Staff Training & Competency">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="Required Training Records" value={trainingAll} />
            <StatBox label="Completed"                 value={trainingCompleted} />
            <StatBox
              label="Compliance Rate"
              value={`${trainingPct}%`}
              highlight={trainingPct < 80}
            />
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500">Overall Completion</span>
              <span className={`text-xs font-semibold ${trainingPct >= 80 ? 'text-emerald-600' : 'text-red-600'}`}>{trainingPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${trainingPct >= 80 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${trainingPct}%` }}
              />
            </div>
            {trainingPct < 80 && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Below JC 80% threshold - cascading emergency readiness risk flagged.
              </p>
            )}
          </div>
        </ReportSection>

        {/* ── Section 5: QAPI Metrics ───────────────────────── */}
        {qapiMetrics.length > 0 && (
          <ReportSection icon={<Activity className="w-4 h-4 text-teal-500" />} title="Section 5 - QAPI Quality Metrics">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="py-1.5 text-left">Metric</th>
                  <th className="py-1.5 text-right">Value</th>
                  <th className="py-1.5 text-right">Target</th>
                  <th className="py-1.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {qapiMetrics.map((m) => {
                  const onTarget = m.target == null || m.value <= m.target;
                  return (
                    <tr key={m.metricName} className="border-b border-slate-100">
                      <td className="py-1.5 text-xs font-medium">{m.metricName}</td>
                      <td className="py-1.5 text-right text-xs">{m.value}{m.unit ? ` ${m.unit}` : ''}</td>
                      <td className="py-1.5 text-right text-xs text-muted-foreground/70">{m.target ?? '-'}{m.unit && m.target ? ` ${m.unit}` : ''}</td>
                      <td className="py-1.5 text-center">
                        {onTarget ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ReportSection>
        )}

        {/* ── Section 6: Survey Activity ────────────────────── */}
        {surveys.length > 0 && (
          <ReportSection icon={<FileBarChart className="w-4 h-4 text-slate-500" />} title="Section 6 - Survey & Inspection Activity">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="py-1.5 text-left">Type</th>
                  <th className="py-1.5 text-left">Body</th>
                  <th className="py-1.5 text-left">Date</th>
                  <th className="py-1.5 text-left">Outcome</th>
                  <th className="py-1.5 text-center">Deficiencies</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 text-xs font-medium">{s.surveyType?.replace(/_/g, ' ') ?? '-'}</td>
                    <td className="py-1.5 text-xs text-slate-500">{s.regulatoryBody?.replace(/_/g, ' ') ?? '-'}</td>
                    <td className="py-1.5 text-xs text-slate-500">{formatDate(s.conductedDate)}</td>
                    <td className="py-1.5 text-xs">{s.outcome ?? '-'}</td>
                    <td className={`py-1.5 text-center text-xs font-semibold ${(s.findingCount ?? 0) > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {s.findingCount ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportSection>
        )}

        {/* ── Section 7: Credentialing ───────────────────── */}
        <ReportSection icon={<Shield className="w-4 h-4 text-teal-500" />} title="Section 7 - Credentialing &amp; Licensure">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBox label="Licenses Expiring (90d)" value={expiringLicenses90} highlight={expiringLicenses90 > 0} />
          </div>
          {expiringLicenses90 > 0 && (
            <p className="text-xs text-amber-700 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {expiringLicenses90} provider license(s) expire within 90 days. Initiate renewal to maintain compliance with TJC MS.06 and CMS CoP requirements.
            </p>
          )}
          {expiringLicenses90 === 0 && (
            <p className="text-sm text-emerald-700 mt-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> No licenses expiring within 90 days.</p>
          )}
        </ReportSection>

        {/* ── Section 8: Patient Safety ─────────────────────── */}
        <ReportSection icon={<AlertTriangle className="w-4 h-4 text-red-500" />} title="Section 8 - Patient Safety Indicators">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="CS Discrepancies Open"      value={csDiscrepanciesOpen}  highlight={csDiscrepanciesOpen > 0} />
            <StatBox label="Open HIPAA Breaches"        value={openHipaaBreaches}    highlight={openHipaaBreaches > 0} />
            <StatBox label="Active Involuntary Holds"   value={activeHolds}          highlight={activeHolds > 0} />
            <StatBox label="Restraint Deaths YTD"       value={restraintDeathsYtd}   highlight={restraintDeathsYtd > 0} />
          </div>
          {(csDiscrepanciesOpen > 0 || openHipaaBreaches > 0 || restraintDeathsYtd > 0) && (
            <div className="mt-3 space-y-1">
              {csDiscrepanciesOpen > 0 && <p className="text-xs text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {csDiscrepanciesOpen} controlled substance discrepanc{csDiscrepanciesOpen > 1 ? 'ies' : 'y'} unresolved - DEA-auditable, immediate investigation required.</p>}
              {openHipaaBreaches > 0 && <p className="text-xs text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {openHipaaBreaches} open HIPAA breach(es) - OCR notification deadlines apply.</p>}
              {restraintDeathsYtd > 0 && <p className="text-xs text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {restraintDeathsYtd} death(s) in restraint/seclusion YTD - CMS 24-hour reporting obligation.</p>}
            </div>
          )}
        </ReportSection>

        {/* Closing Statement */}
        <div className="bg-slate-50 border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground/80 mb-2">Closing Statement</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {facility?.name} presents this compliance report for the period ending {reportDate}.
            The facility&apos;s overall Resilience Grade is <strong>{resGrade} ({resilience}/100)</strong>.{' '}
            {criticalIR.length > 0
              ? `${criticalIR.length} critical/high-severity incident${criticalIR.length > 1 ? 's require' : ' requires'} ongoing review. `
              : 'No critical incidents were identified in this period. '}
            {capsOpen > 0
              ? `${capsOpen} corrective action plan${capsOpen > 1 ? 's remain' : ' remains'} open and are actively managed. `
              : 'All corrective action plans have been resolved. '}
            Training compliance stands at {trainingPct}%{trainingPct < 80 ? ', which falls below the recommended 80% threshold and requires immediate attention' : ', meeting organizational standards'}.
            The Board is requested to review and accept this report as part of the facility&apos;s ongoing Quality Assurance and Performance Improvement (QAPI) obligations.
          </p>
        </div>

        {/* Attestation */}
        <div className="border-t border-slate-200 pt-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Board Attestation</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {['Quality/Compliance Officer', 'Chief Executive Officer', 'Board Chair'].map((role) => (
              <div key={role} className="space-y-4">
                <div className="border-b border-slate-300 h-8" />
                <p className="text-xs text-slate-500">Signature - {role}</p>
                <div className="border-b border-slate-300 h-8" />
                <p className="text-xs text-slate-500">Date</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground/70 border-t border-slate-100 pt-3 flex justify-between">
          <span>NyxCitadel · {facility?.name} · {reportDate}</span>
          <span>Confidential - Generated automatically from compliance data</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReportSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wide border-b-2 border-slate-200 pb-1 mb-3">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'bg-orange-950/20 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
      <p className={`text-2xl font-bold ${highlight ? 'text-orange-700' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function ScorePill({ label, pct }: { label: string; pct: number }) {
  const color = pct >= 80 ? 'bg-emerald-100 text-emerald-700' : pct >= 65 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return (
    <div className={`text-xs font-medium px-3 py-1 rounded-full ${color}`}>
      {label}: {pct}%
    </div>
  );
}

function SeverityBadge({ s }: { s: string | null }) {
  const styles: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH:     'bg-orange-100 text-orange-700',
    MODERATE: 'bg-yellow-100 text-yellow-700',
    LOW:      'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${styles[s ?? ''] ?? 'bg-slate-100 text-slate-500'}`}>
      {s ?? '-'}
    </span>
  );
}
