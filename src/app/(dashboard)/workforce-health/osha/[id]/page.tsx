import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, HardHat , Pencil } from 'lucide-react';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const OUTCOME_COLOR: Record<string, string> = {
  INJURY_ILLNESS: 'bg-yellow-100 text-yellow-800',
  DAYS_AWAY: 'bg-orange-100 text-orange-800',
  JOB_TRANSFER_RESTRICTION: 'bg-blue-100 text-blue-800',
  MEDICAL_TREATMENT_ONLY: 'bg-green-100 text-green-800',
  FATALITY: 'bg-red-600 text-white',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 mt-0.5">{value}</dd>
    </div>
  );
}

export default async function OshaLogDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const log = await prisma.oshaLog.findUnique({ where: { id: params.id } });

  if (!log || log.facilityId !== session.user.facilityId) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/workforce-health/osha" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to OSHA 300 Log
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/workforce-health/osha/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <HardHat className="w-5 h-5 text-yellow-600" />
              <span className="text-xs font-mono text-slate-400">{log.caseNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${OUTCOME_COLOR[log.outcome] ?? 'bg-slate-100 text-slate-600'}`}>
                {log.outcome.replace(/_/g, ' ')}
              </span>
              {!log.recordable && (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600">Not Recordable</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{log.injuryType.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {log.employeeName} &middot; {log.jobTitle} &middot; {log.department}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Incident Description">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.description}</p>
          </Section>

          {log.rootCause && (
            <Section title="Root Cause">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.rootCause}</p>
            </Section>
          )}

          {log.correctiveAction && (
            <Section title="Corrective Action">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.correctiveAction}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Case Details">
            <dl className="space-y-3">
              <Field label="Case Number" value={log.caseNumber} />
              <Field label="Case Year" value={log.caseYear.toString()} />
              <Field label="Injury Date" value={formatDate(log.injuryDate)} />
              <Field label="Injury Type" value={log.injuryType.replace(/_/g, ' ')} />
              <Field label="Body Part" value={log.bodyPart} />
              <div>
                <dt className="text-xs text-slate-400">Days Away from Work</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">{log.daysAway}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Days Restricted</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">{log.daysRestriction}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Recordable</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${log.recordable ? 'text-orange-600' : 'text-green-600'}`}>
                  {log.recordable ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Privacy Case</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${log.privacyCase ? 'text-blue-600' : 'text-slate-500'}`}>
                  {log.privacyCase ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
