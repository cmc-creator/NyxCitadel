'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Printer, AlertTriangle, CheckCircle2, Minus } from 'lucide-react';

interface ReportData {
  generatedAt: string;
  facilityName: string;
  reportYear: number;
  overview: { overdueEvents: number; upcomingEvents30: number; openCaps: number; overdueCaps: number };
  grievances: { open: number; overdueAck: number; overdueRes: number };
  incidents: { open: number; sentinelOpen: number; adhsOverdue: number };
  qoc: { open: number; immediateJeopardy: number };
  policies: { overdue: number };
  training: { pct: number | null; expiring30: number; expired: number };
  workforce: { licensesExpiring90: number; csDiscrepancies: number; openHipaaBreaches: number };
  safety: { restraintDeathsYtd: number; eocOpenDeficiencies: number; eocOverdueDeficiencies: number };
  drills: { fire: number; tabletop: number; functional: number };
  recentSentinels: { irNumber: string; incidentType: string; incidentDate: string; status: string }[];
  overdueCAPList: { capNumber: string; title: string; targetDate: string; priority: string }[];
}

function StatusDot({ bad }: { bad: boolean }) {
  return bad
    ? <AlertTriangle className="w-4 h-4 text-red-600 inline mr-1.5 flex-shrink-0" />
    : <CheckCircle2 className="w-4 h-4 text-green-600 inline mr-1.5 flex-shrink-0" />;
}

function Row({ label, value, alert }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 w-52 flex-shrink-0 text-sm">{label}</span>
      <span className={`font-semibold text-sm flex-1 ${alert ? 'text-red-600' : 'text-gray-900'}`}>
        {alert && value !== 0 && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-red-500" />}
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-3">
      {title}
    </h2>
  );
}

export default function ExecutiveReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/export/board-report')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load report data.'));
  }, []);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-gray-400">Loading report&hellip;</div>;

  const hasUrgent =
    data.incidents.sentinelOpen > 0 ||
    data.incidents.adhsOverdue > 0 ||
    data.workforce.csDiscrepancies > 0 ||
    data.safety.restraintDeathsYtd > 0 ||
    data.qoc.immediateJeopardy > 0 ||
    data.grievances.overdueAck > 0;

  const drillOk = data.drills.fire >= 12 && data.drills.tabletop >= 1 && data.drills.functional >= 1;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8 max-w-[900px] mx-auto print:p-4">

      {/* Print button */}
      <div className="flex justify-end mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Report Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compliance Status Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">Executive Board Summary &mdash; {data.reportYear}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold">{data.facilityName}</p>
            <p>Generated: {format(new Date(data.generatedAt), 'MMMM d, yyyy h:mm a')}</p>
          </div>
        </div>
      </div>

      {/* Executive Summary Banner */}
      {hasUrgent && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm">Items Requiring Immediate Board Attention</p>
            <ul className="mt-1 space-y-0.5 text-sm text-red-700 list-disc list-inside">
              {data.incidents.sentinelOpen > 0 && <li>{data.incidents.sentinelOpen} open sentinel event(s) &mdash; RCA required within 45 days (JC)</li>}
              {data.workforce.csDiscrepancies > 0 && <li>{data.workforce.csDiscrepancies} unresolved controlled substance discrepanc{data.workforce.csDiscrepancies > 1 ? 'ies' : 'y'} (DEA)</li>}
              {data.safety.restraintDeathsYtd > 0 && <li>{data.safety.restraintDeathsYtd} restraint/seclusion death{data.safety.restraintDeathsYtd > 1 ? 's' : ''} YTD &mdash; CMS 24-hr reporting required</li>}
              {data.qoc.immediateJeopardy > 0 && <li>{data.qoc.immediateJeopardy} Immediate Jeopardy QOC complaint{data.qoc.immediateJeopardy > 1 ? 's' : ''} open (CMS)</li>}
              {data.incidents.adhsOverdue > 0 && <li>{data.incidents.adhsOverdue} ADHS incident report{data.incidents.adhsOverdue > 1 ? 's' : ''} past filing deadline (ARS 36-2402)</li>}
              {data.grievances.overdueAck > 0 && <li>{data.grievances.overdueAck} grievance{data.grievances.overdueAck > 1 ? 's' : ''} past 7-day acknowledgment deadline (CMS 482.13(e))</li>}
            </ul>
          </div>
        </div>
      )}

      {!hasUrgent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 font-medium">No critical compliance violations requiring immediate board attention.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Patient Rights & Grievances */}
        <section>
          <SectionHeader title="Patient Rights &amp; Grievances (CMS 482.13)" />
          <Row label="Open Grievances" value={data.grievances.open} />
          <Row label="Overdue Acknowledgments (7-day)" value={data.grievances.overdueAck} alert={data.grievances.overdueAck > 0} />
          <Row label="Overdue Resolutions (30-day)" value={data.grievances.overdueRes} alert={data.grievances.overdueRes > 0} />
        </section>

        {/* Incident Reports */}
        <section>
          <SectionHeader title="Incident Reporting (ARS 36-2402 / JC)" />
          <Row label="Open IR/IAD Reports" value={data.incidents.open} />
          <Row label="Open Sentinel Events" value={data.incidents.sentinelOpen} alert={data.incidents.sentinelOpen > 0} />
          <Row label="Overdue ADHS Reports" value={data.incidents.adhsOverdue} alert={data.incidents.adhsOverdue > 0} />
        </section>

        {/* Corrective Actions */}
        <section>
          <SectionHeader title="Corrective Action Plans" />
          <Row label="Total Open CAPs" value={data.overview.openCaps} />
          <Row label="CAPs Past Target Date" value={data.overview.overdueCaps} alert={data.overview.overdueCaps > 0} />
          {data.overdueCAPList.length > 0 && (
            <table className="w-full text-xs mt-2 border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-2 py-1 border border-gray-200 font-semibold text-gray-600">CAP #</th>
                  <th className="text-left px-2 py-1 border border-gray-200 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-2 py-1 border border-gray-200 font-semibold text-gray-600">Due</th>
                  <th className="text-left px-2 py-1 border border-gray-200 font-semibold text-gray-600">Priority</th>
                </tr>
              </thead>
              <tbody>
                {data.overdueCAPList.map((cap, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="px-2 py-1 border border-gray-200 font-mono">{cap.capNumber}</td>
                    <td className="px-2 py-1 border border-gray-200">{cap.title.slice(0, 50)}{cap.title.length > 50 ? '\u2026' : ''}</td>
                    <td className="px-2 py-1 border border-gray-200 text-red-600 whitespace-nowrap">{format(new Date(cap.targetDate), 'MM/dd/yyyy')}</td>
                    <td className="px-2 py-1 border border-gray-200">{cap.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* QOC / CMS Complaints */}
        <section>
          <SectionHeader title="QOC / CMS Complaints" />
          <Row label="Open QOC Complaints" value={data.qoc.open} />
          <Row label="Immediate Jeopardy Open" value={data.qoc.immediateJeopardy} alert={data.qoc.immediateJeopardy > 0} />
        </section>

        {/* Staff Training */}
        <section>
          <SectionHeader title="Staff Training Compliance" />
          <Row label="Overall Completion Rate" value={data.training.pct !== null ? `${data.training.pct}%` : 'N/A'} alert={(data.training.pct ?? 100) < 90} />
          <Row label="Expiring Within 30 Days" value={data.training.expiring30} />
          <Row label="Expired (not exempt)" value={data.training.expired} alert={data.training.expired > 0} />
        </section>

        {/* Policies */}
        <section>
          <SectionHeader title="Policy Management" />
          <Row label="Active Policies Overdue Review" value={data.policies.overdue} alert={data.policies.overdue > 0} />
          <Row label="Overdue Calendar Events" value={data.overview.overdueEvents} alert={data.overview.overdueEvents > 0} />
          <Row label="Upcoming Events (30 days)" value={data.overview.upcomingEvents30} />
        </section>

        {/* Emergency Drills */}
        <section>
          <SectionHeader title={`Emergency Preparedness Drills (${data.reportYear})`} />
          <Row label="Fire Evacuation Drills" value={`${data.drills.fire} / 12 required`} alert={data.drills.fire < 12} />
          <Row label="Tabletop Exercises" value={`${data.drills.tabletop} / 1 required`} alert={data.drills.tabletop < 1} />
          <Row label="Functional / Full-Scale" value={`${data.drills.functional} / 1 required`} alert={data.drills.functional < 1} />
          <div className="mt-2 flex items-center gap-2 text-sm font-medium">
            {drillOk
              ? <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-green-700">JC EM drill requirements met</span></>
              : <><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-red-600">JC EM drill requirements not yet met</span></>
            }
          </div>
        </section>

        {/* Safety & Environment */}
        <section>
          <SectionHeader title="Safety &amp; Workforce" />
          <Row label="Restraint/Seclusion Deaths YTD" value={data.safety.restraintDeathsYtd} alert={data.safety.restraintDeathsYtd > 0} />
          <Row label="EOC Open Deficiencies" value={data.safety.eocOpenDeficiencies} alert={data.safety.eocOpenDeficiencies > 0} />
          <Row label="EOC Deficiencies Past Due" value={data.safety.eocOverdueDeficiencies} alert={data.safety.eocOverdueDeficiencies > 0} />
          <Row label="Open HIPAA Breaches" value={data.workforce.openHipaaBreaches} alert={data.workforce.openHipaaBreaches > 0} />
          <Row label="CS Discrepancies Open" value={data.workforce.csDiscrepancies} alert={data.workforce.csDiscrepancies > 0} />
          <Row label="Provider Licenses Expiring (90d)" value={data.workforce.licensesExpiring90} />
        </section>

      </div>

      {/* Sentinel Events Table */}
      {data.recentSentinels.length > 0 && (
        <section className="mt-6">
          <SectionHeader title="Sentinel Events (Recent)" />
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-600">IR #</th>
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-600">Type</th>
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-600">Date</th>
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSentinels.map((s, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="px-3 py-2 border border-gray-200 font-mono">{s.irNumber}</td>
                  <td className="px-3 py-2 border border-gray-200">{s.incidentType.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 border border-gray-200 whitespace-nowrap">{format(new Date(s.incidentDate), 'MM/dd/yyyy')}</td>
                  <td className="px-3 py-2 border border-gray-200">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Signature Block */}
      <section className="mt-8 pt-4 border-t border-gray-300">
        <div className="grid grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-semibold mb-6">Chief Compliance Officer:</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-gray-400 text-xs">Signature &amp; Date</p>
          </div>
          <div>
            <p className="font-semibold mb-6">Chief Executive Officer:</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-gray-400 text-xs">Signature &amp; Date</p>
          </div>
          <div>
            <p className="font-semibold mb-6">Board Chair / Designee:</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-gray-400 text-xs">Signature &amp; Date</p>
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-400 mt-6 text-center print:block hidden">
        Confidential &mdash; Prepared by NyxCitadel Compliance Platform &mdash; {data.facilityName} &mdash; {format(new Date(data.generatedAt), 'MMMM d, yyyy')}
      </p>
    </div>
  );
}
