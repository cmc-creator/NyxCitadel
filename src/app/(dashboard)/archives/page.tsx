import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Archive,
  FileWarning,
  MessageSquareWarning,
  Scale,
  ClipboardList,
  Search,
  GraduationCap,
  FileText,
  Siren,
  Activity,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Printer,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Compliance Archive' };

async function getArchiveData(facilityId: string, year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year + 1, 0, 1);

  const [
    // IR / IAD
    irTotal, irSentinel, irAdhsReportable, irAdhsReported, irClosed,
    // Grievances
    grievTotal, grievClosed, grievResolved, grievOverdueAck, grievOverdueRes,
    // QOC / LOI
    qocTotal, qocClosed, qocSubstantiated, qocIJ,
    // CAPs
    capsTotal, capsCompleted,
    // RCA
    rcaTotal, rcaApproved,
    // Training
    trainingCompleted, trainingRequired,
    // Policies - reviewed during year
    policiesReviewed,
    // Drills
    drillsScheduled, drillsCompleted,
    // QAPI - months with data
    qapiMonths,
    // HVA
    hvaAssessment,
  ] = await Promise.all([
    // IR / IAD
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: yearStart, lt: yearEnd } } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: yearStart, lt: yearEnd }, severity: 'SENTINEL' } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: yearStart, lt: yearEnd }, adhsReportable: true } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: yearStart, lt: yearEnd }, adhsReportable: true, adhsReported: true } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: yearStart, lt: yearEnd }, status: 'CLOSED' } }),
    // Grievances
    prisma.grievanceRecord.count({ where: { facilityId, dateReceived: { gte: yearStart, lt: yearEnd } } }),
    prisma.grievanceRecord.count({ where: { facilityId, dateReceived: { gte: yearStart, lt: yearEnd }, status: 'CLOSED' } }),
    prisma.grievanceRecord.count({ where: { facilityId, dateReceived: { gte: yearStart, lt: yearEnd }, status: 'RESOLVED' } }),
    prisma.grievanceRecord.count({ where: {
      facilityId, dateReceived: { gte: yearStart, lt: yearEnd },
      acknowledgmentDate: null,
      acknowledgmentDueDate: { lt: yearEnd },
      status: { notIn: ['CLOSED', 'RESOLVED'] },
    }}),
    prisma.grievanceRecord.count({ where: {
      facilityId, dateReceived: { gte: yearStart, lt: yearEnd },
      resolutionDate: null,
      resolutionDueDate: { lt: yearEnd },
      status: { notIn: ['CLOSED', 'RESOLVED'] },
    }}),
    // QOC
    prisma.qocComplaint.count({ where: { facilityId, dateReceived: { gte: yearStart, lt: yearEnd } } }),
    prisma.qocComplaint.count({ where: { facilityId, dateReceived: { gte: yearStart, lt: yearEnd }, status: 'CLOSED' } }),
    prisma.qocComplaint.count({ where: { facilityId, dateReceived: { gte: yearStart, lt: yearEnd }, status: 'SUBSTANTIATED' } }),
    prisma.qocComplaint.count({ where: { facilityId, dateReceived: { gte: yearStart, lt: yearEnd }, investigationType: 'IMMEDIATE_JEOPARDY' } }),
    // CAPs
    prisma.correctiveActionPlan.count({ where: { facilityId, createdAt: { gte: yearStart, lt: yearEnd } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, createdAt: { gte: yearStart, lt: yearEnd }, status: { in: ['COMPLETED', 'VERIFIED'] } } }),
    // RCA
    prisma.rootCauseAnalysis.count({ where: { facilityId, eventDate: { gte: yearStart, lt: yearEnd } } }),
    prisma.rootCauseAnalysis.count({ where: { facilityId, eventDate: { gte: yearStart, lt: yearEnd }, status: { in: ['APPROVED', 'SUBMITTED_TO_JC', 'CLOSED'] } } }),
    // Training
    prisma.trainingRecord.count({ where: { facilityId, completedDate: { gte: yearStart, lt: yearEnd }, isRequired: true } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: { not: 'EXEMPT' } } }),
    // Policies reviewed (nextReviewDate in year = they were reviewed that year)
    prisma.policy.count({ where: { facilityId, nextReviewDate: { gte: yearStart, lt: yearEnd } } }),
    // Drills
    prisma.drill.count({ where: { facilityId, scheduledDate: { gte: yearStart, lt: yearEnd } } }),
    prisma.drill.count({ where: { facilityId, scheduledDate: { gte: yearStart, lt: yearEnd }, status: 'COMPLETED' } }),
    // QAPI - distinct months with data
    prisma.qapiMetric.findMany({
      where: { facilityId, year },
      select: { month: true },
      distinct: ['month'],
    }),
    // HVA for year
    prisma.hvaAssessment.findFirst({
      where: { facilityId, assessmentYear: year },
      select: { id: true, status: true, hazards: { select: { riskScore: true, hazardName: true }, orderBy: { riskScore: 'desc' }, take: 3 } },
    }),
  ]);

  return {
    ir: {
      total: irTotal, sentinel: irSentinel, adhsReportable: irAdhsReportable,
      adhsReported: irAdhsReported, closed: irClosed,
    },
    grievances: {
      total: grievTotal, closed: grievClosed, resolved: grievResolved,
      overdueAck: grievOverdueAck, overdueRes: grievOverdueRes,
    },
    qoc: { total: qocTotal, closed: qocClosed, substantiated: qocSubstantiated, ij: qocIJ },
    caps: { total: capsTotal, completed: capsCompleted },
    rca:  { total: rcaTotal, approved: rcaApproved },
    training: { completed: trainingCompleted, required: trainingRequired },
    policies: { reviewed: policiesReviewed },
    drills: { scheduled: drillsScheduled, completed: drillsCompleted },
    qapi: { months: qapiMonths.length },
    hva: hvaAssessment,
  };
}

type StatusLevel = 'good' | 'warn' | 'flag' | 'none';

function statusIcon(level: StatusLevel) {
  if (level === 'good')  return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
  if (level === 'warn')  return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
  if (level === 'flag')  return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-300" />;
}

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams.year ?? String(currentYear - 1), 10);
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const isCurrent = year === currentYear;

  const [d, facility] = await Promise.all([
    getArchiveData(facilityId, year),
    prisma.facility.findUnique({ where: { id: facilityId }, select: { name: true } }),
  ]);
  const facilityName = facility?.name ?? 'Your Facility';

  // Compute readiness signals
  const irAdhs      = d.ir.adhsReportable === 0 ? 'none' : d.ir.adhsReported === d.ir.adhsReportable ? 'good' : 'flag';
  const grievComp   = d.grievances.total === 0 ? 'none' : d.grievances.overdueAck === 0 && d.grievances.overdueRes === 0 ? 'good' : 'flag';
  const qocSign     = d.qoc.total === 0 ? 'none' : d.qoc.ij > 0 ? 'flag' : 'good';
  const capSign     = d.caps.total === 0 ? 'none' : d.caps.completed / Math.max(d.caps.total, 1) >= 0.8 ? 'good' : 'warn';
  const rcaSign     = d.rca.total === 0 ? 'none' : d.rca.approved === d.rca.total ? 'good' : 'warn';
  const trainSign: StatusLevel = d.training.required === 0 ? 'none' : d.training.completed / Math.max(d.training.required, 1) >= 0.9 ? 'good' : d.training.completed / Math.max(d.training.required, 1) >= 0.7 ? 'warn' : 'flag';
  const drillSign: StatusLevel = d.drills.completed >= 12 ? 'good' : d.drills.completed >= 6 ? 'warn' : d.drills.completed > 0 ? 'flag' : 'none';
  const qapiSign: StatusLevel  = d.qapi.months >= 12 ? 'good' : d.qapi.months >= 6 ? 'warn' : d.qapi.months > 0 ? 'flag' : 'none';
  const hvaSign: StatusLevel   = d.hva ? (d.hva.status === 'APPROVED' || d.hva.status === 'COMPLETED' ? 'good' : 'warn') : 'flag';

  const flags = [irAdhs, grievComp, qocSign, capSign, rcaSign, trainSign, drillSign, qapiSign, hvaSign].filter(s => s === 'flag').length;
  const warns = [irAdhs, grievComp, qocSign, capSign, rcaSign, trainSign, drillSign, qapiSign, hvaSign].filter(s => s === 'warn').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Archive className="w-6 h-6 text-muted-foreground/70" />
            Compliance Archive
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Annual compliance record for regulatory &amp; provider audits · {facilityName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/archives?year=${year}`}
            onClick={(e) => { e.preventDefault(); window.print(); }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/70 border border-border bg-card hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Export
          </a>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex flex-wrap gap-1.5">
        {availableYears.map((y) => (
          <Link
            key={y}
            href={`/archives?year=${y}`}
            className={`text-sm font-semibold px-4 py-1.5 rounded-lg border transition-colors ${
              y === year
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-card text-muted-foreground/70 border-border hover:bg-white/5'
            }`}
          >
            {y}
            {y === currentYear && <span className="ml-1 text-xs font-normal opacity-75">YTD</span>}
          </Link>
        ))}
      </div>

      {/* Audit readiness banner */}
      <div className={`rounded-xl border px-5 py-4 flex items-start gap-3 ${
        flags > 0 ? 'bg-red-950/30 border-red-700/40' :
        warns > 0 ? 'bg-amber-950/30 border-amber-700/40' :
                    'bg-green-950/30 border-green-700/40'
      }`}>
        {flags > 0
          ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          : warns > 0
          ? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          : <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        }
        <div>
          <p className={`text-sm font-bold ${flags > 0 ? 'text-red-300' : warns > 0 ? 'text-amber-300' : 'text-green-300'}`}>
            {year} Audit Readiness:{' '}
            {flags > 0 ? `${flags} area${flags > 1 ? 's' : ''} require attention` :
             warns > 0 ? `${warns} area${warns > 1 ? 's' : ''} incomplete` :
             'All domains complete'}
            {isCurrent && ' (year in progress)'}
          </p>
          <p className={`text-xs mt-0.5 ${flags > 0 ? 'text-red-400' : warns > 0 ? 'text-amber-400' : 'text-green-400'}`}>
            Review flagged sections below before presenting to regulators or insurance reviewers.
          </p>
        </div>
      </div>

      {/* Domain grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* IR / IAD */}
        <DomainCard
          title="Incident Reports (IR / IAD)"
          icon={FileWarning}
          color="red"
          status={irAdhs}
          href={`/trackers/ir-iad?year=${year}`}
          rows={[
            { label: 'Total reported',               value: d.ir.total },
            { label: 'Sentinel events',              value: d.ir.sentinel,       highlight: d.ir.sentinel > 0 ? 'red' : undefined },
            { label: 'ADHS reportable',              value: d.ir.adhsReportable },
            { label: 'ADHS submitted',               value: `${d.ir.adhsReported} / ${d.ir.adhsReportable}`, highlight: d.ir.adhsReported < d.ir.adhsReportable ? 'red' : 'green' },
            { label: 'Closed',                       value: `${d.ir.closed} / ${d.ir.total}` },
          ]}
          note="ARS 36-2402 · AHCCCS ACOM · JC Sentinel Event Policy"
        />

        {/* Grievances */}
        <DomainCard
          title="Patient Grievances"
          icon={MessageSquareWarning}
          color="orange"
          status={grievComp}
          href={`/trackers/grievances?year=${year}`}
          rows={[
            { label: 'Total received',               value: d.grievances.total },
            { label: 'Resolved / Closed',            value: d.grievances.resolved + d.grievances.closed },
            { label: 'Ack. deadline missed',         value: d.grievances.overdueAck, highlight: d.grievances.overdueAck > 0 ? 'red' : 'green' },
            { label: 'Resolution deadline missed',   value: d.grievances.overdueRes, highlight: d.grievances.overdueRes > 0 ? 'red' : 'green' },
          ]}
          note="CMS CoP 482.13(e) · 7-day ack, 30-day resolution"
        />

        {/* QOC / LOI */}
        <DomainCard
          title="QOC / LOI Complaints"
          icon={Scale}
          color="teal"
          status={qocSign}
          href={`/trackers/qoc?year=${year}`}
          rows={[
            { label: 'Total complaints',             value: d.qoc.total },
            { label: 'Immediate Jeopardy',           value: d.qoc.ij, highlight: d.qoc.ij > 0 ? 'red' : undefined },
            { label: 'Substantiated',                value: d.qoc.substantiated, highlight: d.qoc.substantiated > 0 ? 'red' : undefined },
            { label: 'Closed',                       value: d.qoc.closed },
          ]}
          note="CMS State Operations Manual · AHCCCS surveyor complaints"
        />

        {/* CAPs */}
        <DomainCard
          title="Corrective Action Plans"
          icon={ClipboardList}
          color="blue"
          status={capSign}
          href={`/trackers/caps?year=${year}`}
          rows={[
            { label: 'CAPs opened',                  value: d.caps.total },
            { label: 'Completed / Verified',         value: d.caps.completed, highlight: d.caps.completed === d.caps.total && d.caps.total > 0 ? 'green' : undefined },
            { label: 'Completion rate',              value: d.caps.total > 0 ? `${Math.round(d.caps.completed / d.caps.total * 100)}%` : '-', highlight: d.caps.total > 0 && d.caps.completed / d.caps.total >= 0.8 ? 'green' : d.caps.total > 0 ? 'red' : undefined },
          ]}
          note="JC LD.03.06.01 · CMS plans of correction"
        />

        {/* RCA */}
        <DomainCard
          title="Root Cause Analyses"
          icon={Search}
          color="teal"
          status={rcaSign}
          href={`/trackers/rca?year=${year}`}
          rows={[
            { label: 'RCAs initiated',               value: d.rca.total },
            { label: 'Approved / Submitted',         value: d.rca.approved },
            { label: 'Pending review',               value: d.rca.total - d.rca.approved, highlight: d.rca.total - d.rca.approved > 0 ? 'warn' : undefined },
          ]}
          note="JC LD.04.04.05 · Required for all sentinel events"
        />

        {/* Training */}
        <DomainCard
          title="Staff Training &amp; Competency"
          icon={GraduationCap}
          color="teal"
          status={trainSign}
          href={`/trackers/training?year=${year}`}
          rows={[
            { label: 'Required completions (on file)', value: d.training.required },
            { label: `Completed in ${year}`,          value: d.training.completed },
            { label: 'Compliance rate',               value: d.training.required > 0 ? `${Math.round(d.training.completed / d.training.required * 100)}%` : '-', highlight: d.training.required > 0 && d.training.completed / d.training.required >= 0.9 ? 'green' : 'warn' },
          ]}
          note="JC HR.01.05.03 · ADHS Title 36 · OSHA 29 CFR 1910.1030"
        />

        {/* Policies */}
        <DomainCard
          title="Policy Reviews"
          icon={FileText}
          color="slate"
          status={d.policies.reviewed > 0 ? 'good' : 'warn'}
          href={`/trackers/policies?year=${year}`}
          rows={[
            { label: `Policies due for review in ${year}`, value: d.policies.reviewed },
          ]}
          note="JC IC.01.01.01 · CMS CoP 482 · annual review cycle"
        />

        {/* Drills */}
        <DomainCard
          title="Emergency Drills"
          icon={Siren}
          color="blue"
          status={drillSign}
          href={`/emergency/drills?year=${year}`}
          rows={[
            { label: 'Drills scheduled',             value: d.drills.scheduled },
            { label: 'Drills completed',             value: d.drills.completed },
            { label: 'Fire evac (target: 12/yr)',    value: d.drills.completed, highlight: d.drills.completed >= 12 ? 'green' : d.drills.completed >= 6 ? 'warn' : 'red' },
          ]}
          note="JC EM.03.01.03 · 12 fire drills + 2 community exercises/year"
        />

        {/* QAPI */}
        <DomainCard
          title="QAPI Metrics"
          icon={Activity}
          color="teal"
          status={qapiSign}
          href={`/quality/metrics?year=${year}`}
          rows={[
            { label: 'Months with data',             value: `${d.qapi.months} / 12`, highlight: d.qapi.months >= 12 ? 'green' : d.qapi.months >= 6 ? 'warn' : 'red' },
          ]}
          note="CMS CoP 482.21 · JC PI.01.01.01 · monthly reporting required"
        />

        {/* HVA */}
        <DomainCard
          title="HVA Assessment"
          icon={ShieldAlert}
          color="amber"
          status={hvaSign}
          href={`/emergency/hva`}
          rows={[
            { label: `${year} HVA completed`,        value: d.hva ? (d.hva.status === 'APPROVED' || d.hva.status === 'COMPLETED' ? 'Yes ✓' : d.hva.status) : 'Not started', highlight: d.hva?.status === 'APPROVED' || d.hva?.status === 'COMPLETED' ? 'green' : 'warn' },
            ...(d.hva?.hazards.slice(0, 2).map(h => ({
              label: `Top risk: ${h.hazardName}`,
              value: `${(h.riskScore * 100).toFixed(0)}%`,
              highlight: h.riskScore >= 0.7 ? 'red' as const : h.riskScore >= 0.4 ? 'warn' as const : undefined,
            })) ?? []),
          ]}
          note="JC EM.01.01.01 · Kaiser Permanente HVA methodology"
        />

      </div>

      {/* Audit notes footer */}
      <div className="bg-card border border-border rounded-xl p-4 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-300">Audit Documentation Notes</p>
        <p>• All records are stored in NyxCitadel and retrievable by regulators on request. Use the "View Full Records →" links above to navigate to each domain&apos;s complete record set.</p>
        <p>• For regulatory surveys (ADHS, AHCCCS, CMS), printed or exported records from each tracker page include all required fields, dates, and chain-of-custody information.</p>
        <p>• For insurance / provider audits (UHC, BCBS, Aetna, etc.), combine this summary with the CAPs and Training records for credentialing submissions.</p>
        <p>• Sentinel events require: original IR, completed RCA (within 45 days per JC), and linked CAP. Use the IR&nbsp;→&nbsp;RCA&nbsp;→&nbsp;CAP links in each tracker to verify completeness.</p>
      </div>
    </div>
  );
}

// ─── Domain Card Component ───────────────────────────────────────────────────

type RowHighlight = 'red' | 'green' | 'warn' | undefined;

function DomainCard({
  title,
  icon: Icon,
  color,
  status,
  href,
  rows,
  note,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  status: StatusLevel;
  href: string;
  rows: { label: string; value: string | number; highlight?: RowHighlight }[];
  note?: string;
}) {
  const colorMap: Record<string, string> = {
    red:    'text-red-400 bg-red-950/40',
    orange: 'text-orange-400 bg-orange-950/40',
    purple: 'text-teal-400 bg-teal-950/40',
    blue:   'text-blue-400 bg-blue-950/40',
    indigo: 'text-teal-400 bg-teal-950/40',
    teal:   'text-teal-400 bg-teal-950/40',
    slate:  'text-muted-foreground/70 bg-slate-800/50',
    amber:  'text-amber-400 bg-amber-950/40',
    green:  'text-green-400 bg-green-950/40',
    yellow: 'text-yellow-400 bg-yellow-950/40',
  };
  const highlightColor: Record<string, string> = {
    red:  'text-red-400 font-semibold',
    green:'text-green-400 font-semibold',
    warn: 'text-amber-400 font-semibold',
  };
  const iconClass = colorMap[color] ?? 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground flex-1" dangerouslySetInnerHTML={{ __html: title }} />
        <div className="flex-shrink-0">{statusIcon(status)}</div>
      </div>
      <div className="px-4 py-3 space-y-2 flex-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{row.label}</span>
            <span className={row.highlight ? highlightColor[row.highlight] : 'text-foreground font-medium'}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 pt-1 flex items-end justify-between gap-2">
        {note && <p className="text-xs text-slate-500 leading-snug">{note}</p>}
        <Link
          href={href}
          className="text-xs text-teal-400 hover:text-teal-300 font-medium whitespace-nowrap shrink-0 ml-auto"
        >
          View records →
        </Link>
      </div>
    </div>
  );
}
