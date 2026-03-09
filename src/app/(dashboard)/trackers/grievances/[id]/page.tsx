import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquareWarning,
  ChevronLeft,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Grievance ${params.id.slice(0, 8).toUpperCase()}` };
}

const STATUS_STYLES: Record<string, string> = {
  OPEN:                 'bg-blue-100 text-blue-800',
  UNDER_REVIEW:         'bg-yellow-100 text-yellow-800',
  ACKNOWLEDGMENT_SENT:  'bg-indigo-100 text-indigo-800',
  PENDING_RESOLUTION:   'bg-orange-100 text-orange-800',
  RESOLVED:             'bg-emerald-100 text-emerald-800',
  ESCALATED:            'bg-red-100 text-red-800',
  CLOSED:               'bg-slate-100 text-slate-600',
};

const SEVERITY_STYLES: Record<string, string> = {
  STANDARD:   'bg-slate-100 text-slate-700',
  EXPEDITED:  'bg-yellow-100 text-yellow-800',
  REGULATORY: 'bg-orange-100 text-orange-800',
  SENTINEL:   'bg-red-600 text-white',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

function DeadlineRow({ label, due, done, doneBy }: { label: string; due: Date; done?: Date | null; doneBy?: string | null }) {
  const overdue = !done && new Date() > due;
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-xs font-medium text-slate-700">{label}</p>
        <p className={`text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
          Due: {formatDate(due)}{overdue ? ' — OVERDUE' : ''}
        </p>
      </div>
      <div className="text-right">
        {done
          ? <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 justify-end">
              <CheckCircle2 className="w-3 h-3" /> {formatDate(done)}{doneBy ? ` by ${doneBy}` : ''}
            </span>
          : <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-amber-600'}`}>Pending</span>
        }
      </div>
    </div>
  );
}

export default async function GrievanceDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const grievance = await prisma.grievanceRecord.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
  });
  if (!grievance) notFound();

  const isOverdue = grievance.status !== 'CLOSED' && grievance.status !== 'RESOLVED' &&
                    new Date() > grievance.resolutionDueDate;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/trackers/grievances" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600">
        <ChevronLeft className="w-4 h-4" /> Back to Grievances
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-orange-500" />
            {grievance.grievanceNumber}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {grievance.category.replace(/_/g, ' ')} · Received {formatDate(grievance.dateReceived)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${SEVERITY_STYLES[grievance.severity] ?? 'bg-slate-100 text-slate-600'}`}>
            {grievance.severity}
          </span>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[grievance.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {grievance.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {isOverdue && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <strong>Overdue:</strong> Resolution was due {formatDate(grievance.resolutionDueDate)}. CMS requires resolution within 30 days (42 CFR 482.13(e)).
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Complainant */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Complainant
            </h2>
            <dl className="space-y-3">
              <Field label="Name"  value={grievance.complainantName} />
              <Field label="Type"  value={grievance.complainantType.replace(/_/g, ' ')} />
              <Field label="Phone" value={grievance.complainantPhone} />
              <Field label="Email" value={grievance.complainantEmail} />
            </dl>
          </div>

          {/* Patient */}
          {grievance.patientName && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Patient
              </h2>
              <dl className="space-y-3">
                <Field label="Name"     value={grievance.patientName} />
                <Field label="MRN"      value={grievance.patientMRN} />
                <Field label="DOB"      value={grievance.patientDOB ? formatDate(grievance.patientDOB) : null} />
                <Field label="Admitted" value={grievance.admissionDate ? formatDate(grievance.admissionDate) : null} />
                <Field label="Discharged" value={grievance.dischargeDate ? formatDate(grievance.dischargeDate) : null} />
              </dl>
            </div>
          )}

          {/* CMS Deadlines */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" /> CMS Deadlines
            </h2>
            <DeadlineRow
              label="Acknowledgment (7 days)"
              due={grievance.acknowledgmentDueDate}
              done={grievance.acknowledgmentDate}
              doneBy={grievance.acknowledgmentSentBy}
            />
            <DeadlineRow
              label="Resolution (30 days)"
              due={grievance.resolutionDueDate}
              done={grievance.resolutionDate}
              doneBy={grievance.resolutionSentBy}
            />
          </div>

          {/* Regulatory */}
          {(grievance.reportableToAdhs) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-red-500" /> ADHS Reporting
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Reported to ADHS</p>
                {grievance.reportedToAdhs
                  ? <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {grievance.adshReportDate ? formatDate(grievance.adshReportDate) : 'Yes'}
                    </span>
                  : <span className="text-xs text-red-600 font-medium">Pending</span>
                }
              </div>
            </div>
          )}

          {/* Assignment */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <Field label="Assigned To" value={grievance.assignedTo ?? 'Unassigned'} />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-400" /> Grievance Summary
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{grievance.summary}</p>
          </div>

          {grievance.resolution && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolution
              </h2>
              {grievance.outcomeCategory && (
                <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Outcome: {grievance.outcomeCategory}
                </p>
              )}
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{grievance.resolution}</p>
            </div>
          )}

          {grievance.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Internal Notes</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{grievance.notes}</p>
            </div>
          )}

          {/* Generate response link */}
          <div className="flex gap-3">
            <Link
              href={`/quality/responses/new?templateId=&sourceType=GRIEVANCE&sourceId=${grievance.id}&sourceRef=${grievance.grievanceNumber}&patient=${encodeURIComponent(grievance.patientName ?? '')}`}
              className="text-xs font-medium bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              + Generate Grievance Response
            </Link>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Received {formatDate(grievance.dateReceived)}</span>
            <span>Last updated {formatDate(grievance.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
