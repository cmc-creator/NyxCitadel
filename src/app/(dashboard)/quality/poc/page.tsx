import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ClipboardCheck, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Plans of Correction' };

const STATUS_COLORS: Record<string, string> = {
  DRAFT:              'bg-slate-100 text-slate-600',
  UNDER_REVIEW:       'bg-yellow-100 text-yellow-700',
  SUBMITTED:          'bg-blue-100 text-blue-700',
  ACCEPTED:           'bg-green-100 text-green-700',
  REJECTED:           'bg-red-100 text-red-700',
  RESUBMIT_REQUIRED:  'bg-orange-100 text-orange-700',
  CLOSED:             'bg-purple-100 text-purple-700',
};

const BODY_LABELS: Record<string, string> = {
  CMS:     'CMS',
  JC:      'Joint Commission',
  ADHS:    'AZ ADHS',
  OSHA:    'OSHA',
  OTHER:   'Other',
};

export default async function PocPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const pocs = await prisma.planOfCorrection.findMany({
    where: { facilityId },
    include: { findings: true },
    orderBy: { createdAt: 'desc' },
  });

  const open = pocs.filter(p => p.status !== 'CLOSED' && p.status !== 'ACCEPTED');
  const overdue = pocs.filter(p =>
    p.responseDeadline && p.responseDeadline < new Date() &&
    p.status !== 'SUBMITTED' && p.status !== 'ACCEPTED' && p.status !== 'CLOSED'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            Plans of Correction
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Survey deficiency responses for CMS, Joint Commission, AZ ADHS, and other regulatory bodies.
          </p>
        </div>
        <Link
          href="/quality/poc/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New POC
        </Link>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{overdue.length} POC{overdue.length > 1 ? 's' : ''}</strong> past the response deadline.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{open.length}</div>
          <div className="text-sm text-slate-500">Open POCs</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdue.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${overdue.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>{overdue.length}</div>
          <div className="text-sm text-slate-500">Past Deadline</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {pocs.filter(p => p.status === 'ACCEPTED' || p.status === 'CLOSED').length}
          </div>
          <div className="text-sm text-slate-500">Accepted / Closed</div>
        </div>
      </div>

      {/* List */}
      {pocs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No plans of correction logged yet</p>
          <Link
            href="/quality/poc/new"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Create POC
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pocs.map(poc => (
            <div key={poc.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-500">{poc.pocNumber}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {BODY_LABELS[poc.regulatoryBody] ?? poc.regulatoryBody}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[poc.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {poc.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 mt-1">{poc.title}</div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    {poc.surveyDate && <span>Survey: {formatDate(poc.surveyDate)}</span>}
                    {poc.responseDeadline && (
                      <span className={poc.responseDeadline < new Date() && poc.status !== 'SUBMITTED' && poc.status !== 'ACCEPTED' ? 'text-red-600 font-semibold' : ''}>
                        Deadline: {formatDate(poc.responseDeadline)}
                      </span>
                    )}
                    <span>{poc.findings.length} finding{poc.findings.length !== 1 ? 's' : ''}</span>
                    <span>
                      {poc.findings.filter(f => f.status === 'VERIFIED' || f.status === 'COMPLETED').length} / {poc.findings.length} resolved
                    </span>
                  </div>
                </div>
                <Link
                  href={`/quality/poc/${poc.id}`}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium shrink-0"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
