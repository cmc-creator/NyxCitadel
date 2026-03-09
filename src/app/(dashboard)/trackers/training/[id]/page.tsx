import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { GraduationCap, ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isPast, differenceInCalendarDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Training Record' };

const STATUS_COLOR: Record<string, string> = {
  PENDING:     'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED:   'bg-green-100 text-green-700',
  EXPIRED:     'bg-red-100 text-red-700',
  OVERDUE:     'bg-red-200 text-red-800',
  EXEMPT:      'bg-gray-100 text-gray-500',
};

const CATEGORY_LABELS: Record<string, string> = {
  ORIENTATION:         'Orientation',
  ANNUAL_MANDATORY:    'Annual Mandatory',
  EMERGENCY_MANAGEMENT:'Emergency Management',
  FIRE_SAFETY:         'Fire Safety',
  INFECTION_CONTROL:   'Infection Control',
  CPR_BLS:             'CPR / BLS',
  CPI_DE_ESCALATION:   'CPI / De-escalation',
  SUICIDE_RISK:        'Suicide Risk',
  RESTRAINT_SECLUSION: 'Restraint & Seclusion',
  MEDICATION_MANAGEMENT:'Medication Management',
  HIPAA_PRIVACY:       'HIPAA / Privacy',
  CLINICAL_COMPETENCY: 'Clinical Competency',
  LEADERSHIP:          'Leadership',
  HAZMAT:              'Hazmat',
  OTHER:               'Other',
};

export default async function TrainingDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const record = await prisma.trainingRecord.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
  });
  if (!record) notFound();

  const isExpired = record.expiryDate && isPast(record.expiryDate);
  const daysUntilExpiry = record.expiryDate
    ? differenceInCalendarDays(record.expiryDate, new Date())
    : null;
  const expiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  const passed = record.score != null && record.passingScore != null
    ? record.score >= record.passingScore
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/trackers/training" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Training Tracker
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[record.status] ?? 'bg-slate-100'}`}>
            {record.status}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {CATEGORY_LABELS[record.category] ?? record.category}
          </span>
          {record.isRequired && (
            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">Required</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          {record.trainingName}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{record.staffName}{record.jobTitle ? ` · ${record.jobTitle}` : ''}{record.department ? ` · ${record.department}` : ''}</p>
      </div>

      {/* Expiry alerts */}
      {isExpired && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>This training record has <strong>expired</strong> on {formatDate(record.expiryDate!)}. Renewal required.</span>
        </div>
      )}
      {expiringSoon && !isExpired && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Training expires in <strong>{daysUntilExpiry} days</strong> on {formatDate(record.expiryDate!)}.</span>
        </div>
      )}

      {/* Staff Info */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Information</h2>
        </div>
        <dl className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-xs text-slate-400">Full Name</dt><dd className="text-slate-800 font-medium">{record.staffName}</dd></div>
          {record.staffId && <div><dt className="text-xs text-slate-400">Employee ID</dt><dd className="text-slate-800 font-mono">{record.staffId}</dd></div>}
          {record.jobTitle && <div><dt className="text-xs text-slate-400">Job Title</dt><dd className="text-slate-800">{record.jobTitle}</dd></div>}
          {record.department && <div><dt className="text-xs text-slate-400">Department</dt><dd className="text-slate-800">{record.department}</dd></div>}
        </dl>
      </div>

      {/* Training Details */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Training Details</h2>
        </div>
        <dl className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="col-span-2"><dt className="text-xs text-slate-400">Training Name</dt><dd className="text-slate-800 font-medium">{record.trainingName}</dd></div>
          <div><dt className="text-xs text-slate-400">Category</dt><dd className="text-slate-800">{CATEGORY_LABELS[record.category] ?? record.category}</dd></div>
          <div><dt className="text-xs text-slate-400">Status</dt>
            <dd><span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[record.status] ?? 'bg-slate-100'}`}>{record.status}</span></dd>
          </div>
          {record.completedDate && <div><dt className="text-xs text-slate-400">Completed</dt><dd className="text-slate-800">{formatDate(record.completedDate)}</dd></div>}
          {record.expiryDate && (
            <div>
              <dt className="text-xs text-slate-400">Expiry Date</dt>
              <dd className={isExpired ? 'text-red-600 font-medium' : expiringSoon ? 'text-amber-600 font-medium' : 'text-slate-800'}>
                {formatDate(record.expiryDate)}
              </dd>
            </div>
          )}
          {record.provider && <div className="col-span-2"><dt className="text-xs text-slate-400">Provider / Vendor</dt><dd className="text-slate-800">{record.provider}</dd></div>}
          {record.regulatoryBody && <div><dt className="text-xs text-slate-400">Regulatory Body</dt><dd className="text-slate-800">{record.regulatoryBody.replace(/_/g, ' ')}</dd></div>}
        </dl>
      </div>

      {/* Score */}
      {(record.score != null || record.passingScore != null) && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assessment Score</h2>
          <div className="flex items-center gap-6">
            {record.score != null && (
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{record.score}%</div>
                <div className="text-xs text-slate-400 mt-0.5">Score Achieved</div>
              </div>
            )}
            {record.passingScore != null && (
              <div className="text-center">
                <div className="text-xl font-semibold text-slate-500">{record.passingScore}%</div>
                <div className="text-xs text-slate-400 mt-0.5">Passing Score</div>
              </div>
            )}
            {passed !== null && (
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {passed ? 'Passed' : 'Failed'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificate */}
      {record.certificateUrl && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Certificate</h2>
          <a href={record.certificateUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline">
            <GraduationCap className="w-3.5 h-3.5" /> View Certificate
          </a>
        </div>
      )}

      {/* Notes */}
      {record.notes && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{record.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/trackers/training/new" className="btn-secondary text-sm">
          Log Another Training
        </Link>
      </div>
    </div>
  );
}
