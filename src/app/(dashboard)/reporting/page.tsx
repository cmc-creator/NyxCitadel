import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BarChart3, AlertTriangle, CheckCircle2, Clock, ChevronRight, Download, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Regulatory Reporting' };

const SUBMISSION_TYPES = [
  {
    type: 'ORYX_HBIPS',
    label: 'HBIPS / ORYX',
    description: 'Joint Commission HBIPS core measures (monthly)',
    href: '/reporting/oryx',
    color: 'text-teal-400',
  },
  {
    type: 'NHSN_HAI',
    label: 'NHSN Healthcare-Associated Infections',
    description: 'CDC NHSN HAI surveillance data (monthly)',
    href: '/reporting/nhsn',
    color: 'text-blue-400',
  },
  {
    type: 'ADHS_IR_IAD',
    label: 'ADHS Incident / IAD Reporting',
    description: 'Arizona ADHS reportable incidents & Immediate Adverse Determinations',
    href: '/reporting/adhs',
    color: 'text-orange-400',
  },
  {
    type: 'JC_SENTINEL_EVENT',
    label: 'JC Sentinel Event Disclosure',
    description: 'Joint Commission sentinel event self-report package',
    href: '/reporting/jc-sentinel',
    color: 'text-red-400',
  },
  {
    type: 'CMS_HCAHPS',
    label: 'CMS HCAHPS Patient Satisfaction',
    description: 'Patient satisfaction survey composite scores (quarterly)',
    href: '/reporting/hcahps',
    color: 'text-violet-400',
  },
  {
    type: 'CMS_CONDITION_OF_PARTICIPATION',
    label: 'CMS Conditions of Participation',
    description: 'Psychiatric hospital CoP self-assessment and compliance tracking',
    href: '/reporting/cop',
    color: 'text-indigo-400',
  },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT:        { label: 'Draft',        cls: 'bg-slate-800 text-slate-400' },
  READY:        { label: 'Ready',        cls: 'bg-teal-900/40 text-teal-300' },
  SUBMITTED:    { label: 'Submitted',    cls: 'bg-blue-900/40 text-blue-300' },
  ACKNOWLEDGED: { label: 'Acknowledged', cls: 'bg-green-900/40 text-green-300' },
  REJECTED:     { label: 'Rejected',     cls: 'bg-red-900/40 text-red-300' },
  OVERDUE:      { label: 'Overdue',      cls: 'bg-orange-900/40 text-orange-300' },
};

const TYPE_LABELS: Record<string, string> = {
  ORYX_HBIPS:            'HBIPS/ORYX',
  NHSN_HAI:              'NHSN HAI',
  CMS_HCAHPS:            'CMS HCAHPS',
  ADHS_IR_IAD:           'ADHS IR/IAD',
  CMS_RESTRAINT_DEATH:   'CMS Restraint Death',
  JC_SENTINEL_EVENT:     'JC Sentinel',
  CMS_CONDITION_OF_PARTICIPATION: 'CMS CoP',
};

export default async function ReportingPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const submissions = await prisma.regulatorySubmission.findMany({
    where: { facilityId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const overdue   = submissions.filter(s => s.status === 'OVERDUE').length;
  const ready     = submissions.filter(s => s.status === 'READY').length;
  const submitted = submissions.filter(s => ['SUBMITTED', 'ACKNOWLEDGED'].includes(s.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-400" />
          Regulatory Reporting
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Prepare and export formatted submission files for CMS, Joint Commission, ADHS, and NHSN portals.
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-xs text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-foreground">{overdue}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-teal-400" />
          <div>
            <p className="text-xs text-slate-500">Ready to Submit</p>
            <p className="text-2xl font-bold text-foreground">{ready}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xs text-slate-500">Submitted</p>
            <p className="text-2xl font-bold text-foreground">{submitted}</p>
          </div>
        </div>
      </div>

      {/* Reporting modules */}
      <div className="grid grid-cols-2 gap-4">
        {SUBMISSION_TYPES.map(st => (
          <Link
            key={st.type}
            href={st.href}
            className="bg-card border border-border rounded-xl p-5 hover:border-teal-700 hover:bg-slate-800/40 transition-all group flex items-start justify-between"
          >
            <div>
              <div className={`font-semibold text-sm mb-1 ${st.color}`}>{st.label}</div>
              <p className="text-xs text-slate-500">{st.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent submissions */}
      {submissions.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Submissions</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-900/40">
                <th className="text-left p-3 text-slate-400 font-medium">Type</th>
                <th className="text-left p-3 text-slate-400 font-medium">Period</th>
                <th className="text-left p-3 text-slate-400 font-medium">Due</th>
                <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => {
                const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.DRAFT;
                return (
                  <tr key={s.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-slate-900/20' : ''}`}>
                    <td className="p-3 font-medium text-foreground">{TYPE_LABELS[s.submissionType] ?? s.submissionType}</td>
                    <td className="p-3 text-slate-400">{s.reportingPeriod}</td>
                    <td className="p-3 text-slate-400">{s.dueDate ? formatDate(s.dueDate) : '—'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {s.exportFileUrl && (
                        <a href={s.exportFileUrl} className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {submissions.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No submissions yet</p>
          <p className="text-slate-500 text-sm mt-1">Use the modules above to begin building your first export file.</p>
        </div>
      )}
    </div>
  );
}
