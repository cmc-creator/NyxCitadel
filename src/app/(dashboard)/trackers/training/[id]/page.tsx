import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, GraduationCap, AlertTriangle, ExternalLink , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-slate-100 text-slate-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'EXPIRED', label: 'Expired', color: 'bg-red-100 text-red-700' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-orange-100 text-orange-700' },
  { value: 'EXEMPT', label: 'Exempt', color: 'bg-slate-100 text-slate-400' },
];

export default async function TrainingDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const record = await prisma.trainingRecord.findUnique({ where: { id: params.id } });
  if (!record || record.facilityId !== session.user.facilityId) notFound();

  const now = new Date();
  const isExpired = record.expiryDate && record.expiryDate < now;
  const daysToExpiry = record.expiryDate ? Math.ceil((record.expiryDate.getTime() - now.getTime()) / 86400000) : null;
  const passed = record.score !== null && record.passingScore !== null ? record.score >= record.passingScore : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/training" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Training Records
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/training/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/training/${params.id}`} redirectPath="/trackers/training" label="training record" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <GraduationCap className="w-5 h-5 text-teal-600" />
              <span className="text-xs bg-teal-50 text-teal-700 rounded-full px-2.5 py-0.5">{record.category.replace(/_/g, ' ')}</span>
              {record.isRequired && <span className="text-xs bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 font-medium">Required</span>}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{record.trainingName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              <strong>{record.staffName}</strong>
              {record.jobTitle && <> &middot; {record.jobTitle}</>}
              {record.department && <> &middot; {record.department}</>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/training/${record.id}`} currentStatus={record.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Training Expired</strong> &mdash; expired on {formatDate(record.expiryDate!)}.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Score Card */}
          {record.score !== null && (
            <Section title="Score">
              <div className="flex items-end gap-3">
                <span className={`text-4xl font-bold ${passed === true ? 'text-green-600' : passed === false ? 'text-red-600' : 'text-slate-700'}`}>
                  {record.score}%
                </span>
                {record.passingScore !== null && (
                  <span className="text-sm text-slate-400 mb-1">Passing: {record.passingScore}%</span>
                )}
              </div>
              <p className={`text-xs mt-1 font-medium ${passed === true ? 'text-green-700' : passed === false ? 'text-red-700' : 'text-slate-500'}`}>
                {passed === true ? '&#x2713; Passed' : passed === false ? '&#x2717; Did Not Pass' : ''}
              </p>
            </Section>
          )}

          {record.certificateUrl && (
            <Section title="Certificate">
              <a href={record.certificateUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-900 transition">
                <ExternalLink className="w-4 h-4" />
                View Certificate
              </a>
            </Section>
          )}

          {record.notes && (
            <Section title="Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{record.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Training Details">
            <dl className="space-y-2">
              <Row label="Training Name" value={record.trainingName} />
              <Row label="Category" value={record.category.replace(/_/g, ' ')} />
              {record.provider && <Row label="Provider" value={record.provider} />}
              {record.completedDate && <Row label="Completed" value={formatDate(record.completedDate)} />}
              {record.expiryDate && <Row label="Expires" value={formatDate(record.expiryDate)} highlight={!!isExpired} />}
              <Row label="Required" value={record.isRequired ? 'Yes' : 'No'} />
              {record.regulatoryBody && <Row label="Regulatory Body" value={record.regulatoryBody.replace(/_/g, ' ')} />}
            </dl>
          </Section>

          <Section title="Staff Details">
            <dl className="space-y-2">
              <Row label="Name" value={record.staffName} />
              {record.staffId && <Row label="Staff ID" value={record.staffId} />}
              {record.department && <Row label="Department" value={record.department} />}
              {record.jobTitle && <Row label="Job Title" value={record.jobTitle} />}
            </dl>
          </Section>

          {daysToExpiry !== null && !isExpired && (
            <Section title="Expiry Countdown">
              <p className={`text-2xl font-bold text-center ${daysToExpiry <= 30 ? 'text-orange-600' : 'text-slate-800'}`}>{daysToExpiry}</p>
              <p className="text-xs text-slate-400 text-center mt-0.5">days until expiry</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
      <dd className={`text-xs font-medium text-right ${highlight ? 'text-red-600 font-bold' : 'text-slate-800'}`}>{value}</dd>
    </div>
  );
}
