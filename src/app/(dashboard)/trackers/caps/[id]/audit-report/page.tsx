import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

const RESULT_LABEL: Record<string, string> = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  NEEDS_IMPROVEMENT: 'NEEDS IMPROVEMENT',
};

export default async function CapAuditReportPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const [cap, auditEntries, attachments] = await Promise.all([
    prisma.correctiveActionPlan.findUnique({
      where: { id: params.id },
      include: {
        facility: { select: { name: true } },
        assignee: { select: { name: true, title: true, email: true } },
        incidents: { select: { incidentNumber: true, incidentType: true, dateOccurred: true } },
      },
    }),
    prisma.capAuditEntry.findMany({
      where: { capId: params.id },
      include: { auditor: { select: { name: true, email: true } } },
      orderBy: { auditDate: 'asc' },
    }),
    prisma.attachment.findMany({
      where: { facilityId: session.user.facilityId, sourceType: 'CORRECTIVE_ACTION_PLAN', sourceId: params.id },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  if (!cap || cap.facilityId !== session.user.facilityId) notFound();

  const approvalHistory = (cap.approvalHistory ?? []) as { actorName: string; action: string; timestamp: string; note?: string }[];

  return (
    <div className="min-h-screen bg-white text-black font-sans p-8 max-w-4xl mx-auto print:p-0">
      {/* Print button — hidden in print */}
      <div className="flex justify-end mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Corrective Action Plan</h1>
            <p className="text-sm text-gray-600 mt-0.5">Effectiveness Audit Report</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold">{cap.facility.name}</p>
            <p>Generated: {format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* CAP Summary */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">CAP Summary</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <Row label="CAP Number" value={cap.capNumber} />
          <Row label="Priority" value={cap.priority} />
          <Row label="Source" value={cap.source.replace(/_/g, ' ')} />
          <Row label="Regulatory Body" value={cap.regulatoryBody?.replace(/_/g, ' ') ?? 'N/A'} />
          <Row label="Status" value={cap.status.replace(/_/g, ' ')} />
          <Row label="Target Date" value={formatDate(cap.targetDate)} />
          {cap.completedDate && <Row label="Completed Date" value={formatDate(cap.completedDate)} />}
          {cap.assignee && <Row label="Assignee" value={`${cap.assignee.name}${cap.assignee.title ? ` — ${cap.assignee.title}` : ''}`} />}
          {cap.sourceRef && <Row label="Source Reference" value={cap.sourceRef} />}
          {cap.regulatoryBody && <Row label="Regulatory Body" value={cap.regulatoryBody.replace(/_/g, ' ')} />}
        </div>
        <div className="mt-3 text-sm">
          <p className="font-semibold text-gray-700 mb-1">Title</p>
          <p className="text-gray-900">{cap.title}</p>
        </div>
      </section>

      {/* Problem & Plan */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">Problem &amp; Corrective Plan</h2>
        <div className="space-y-3 text-sm">
          <Block label="Problem Description" value={cap.description} />
          {cap.rootCause && <Block label="Root Cause" value={cap.rootCause} />}
          <Block label="Correction Plan" value={cap.correctionPlan} />
          {cap.measureOfSuccess && <Block label="Measure of Success" value={cap.measureOfSuccess} />}
        </div>
      </section>

      {/* PDSA */}
      {cap.isPdsa && (cap.pdsaPlan || cap.pdsaDo || cap.pdsaStudy || cap.pdsaAct) && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">PDSA Cycle</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {cap.pdsaPlan && <Block label="PLAN" value={cap.pdsaPlan} />}
            {cap.pdsaDo && <Block label="DO" value={cap.pdsaDo} />}
            {cap.pdsaStudy && <Block label="STUDY" value={cap.pdsaStudy} />}
            {cap.pdsaAct && <Block label="ACT" value={cap.pdsaAct} />}
          </div>
        </section>
      )}

      {/* Vigilance */}
      {cap.vigilanceDays && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">Vigilance Monitoring</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Row label="Vigilance Period" value={`${cap.vigilanceDays} days`} />
            {cap.vigilanceEndDate && <Row label="Vigilance End Date" value={formatDate(cap.vigilanceEndDate)} />}
            <Row label="Vigilance Status" value={cap.vigilanceStatus ?? 'PENDING'} />
            <Row label="Total Breaches" value={String(cap.vigilanceBreaches ?? 0)} />
          </div>
        </section>
      )}

      {/* Effectiveness Audit Log */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">
          Effectiveness Audit Log ({auditEntries.length} {auditEntries.length === 1 ? 'entry' : 'entries'})
        </h2>
        {auditEntries.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No effectiveness audits have been logged.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Date</th>
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Result</th>
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Auditor</th>
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Findings</th>
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Next Audit</th>
              </tr>
            </thead>
            <tbody>
              {auditEntries.map(entry => (
                <tr key={entry.id} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">{format(new Date(entry.auditDate), 'MM/dd/yyyy')}</td>
                  <td className="border border-gray-300 px-3 py-2 font-semibold">{RESULT_LABEL[entry.result]}</td>
                  <td className="border border-gray-300 px-3 py-2">{entry.auditor.name ?? entry.auditor.email}</td>
                  <td className="border border-gray-300 px-3 py-2">{entry.notes ?? '—'}</td>
                  <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">{entry.nextAuditDate ? format(new Date(entry.nextAuditDate), 'MM/dd/yyyy') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Approval History */}
      {approvalHistory.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">Approval History</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Date</th>
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Action</th>
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">By</th>
                <th className="border border-gray-300 px-3 py-2 font-semibold text-gray-700">Note</th>
              </tr>
            </thead>
            <tbody>
              {approvalHistory.map((h, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">{format(new Date(h.timestamp), 'MM/dd/yyyy')}</td>
                  <td className="border border-gray-300 px-3 py-2 font-semibold">{h.action}</td>
                  <td className="border border-gray-300 px-3 py-2">{h.actorName}</td>
                  <td className="border border-gray-300 px-3 py-2">{h.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Linked incidents */}
      {cap.incidents.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">Linked Incidents</h2>
          <ul className="text-sm space-y-1">
            {cap.incidents.map((inc, i) => (
              <li key={i}>{inc.incidentNumber} &mdash; {inc.incidentType.replace(/_/g, ' ')} &mdash; {formatDate(inc.dateOccurred)}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Evidence attachments */}
      {attachments.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">Supporting Evidence ({attachments.length})</h2>
          <ul className="text-sm space-y-1">
            {attachments.map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-gray-500">{i + 1}.</span>
                <span>{a.fileName}</span>
                <span className="text-gray-400 text-xs">— {format(new Date(a.createdAt), 'MM/dd/yyyy')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Signature block */}
      <section className="mt-8 pt-4 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="font-semibold mb-6">Prepared by:</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-gray-500 text-xs">Signature &amp; Date</p>
          </div>
          <div>
            <p className="font-semibold mb-6">Reviewed / Approved by:</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-gray-500 text-xs">Signature &amp; Date</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-36 flex-shrink-0">{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}
