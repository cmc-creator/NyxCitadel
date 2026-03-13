import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ShieldOff, AlertTriangle , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open (In Progress)', color: 'bg-red-100 text-red-800' },
  { value: 'MONITORING', label: 'Monitoring', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DEBRIEFED', label: 'Debriefed', color: 'bg-blue-100 text-blue-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-800' },
  { value: 'REPORTED', label: 'Reported to CMS', color: 'bg-purple-100 text-purple-800' },
];

const RS_TYPE_LABEL: Record<string, string> = {
  PHYSICAL_RESTRAINT: 'Physical Restraint',
  MECHANICAL_RESTRAINT: 'Mechanical Restraint',
  CHEMICAL_RESTRAINT: 'Chemical Restraint',
  SECLUSION: 'Seclusion',
  PHYSICAL_HOLD: 'Physical Hold (< 15 min)',
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

export default async function RestraintDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const event = await prisma.restraintEvent.findUnique({ where: { id: params.id } });

  if (!event || event.facilityId !== session.user.facilityId) notFound();

  const monitoringLogs = (event.monitoringLogs ?? []) as Array<{ time: string; staff: string; assessment: string; vitals?: string }>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/restraint-seclusion" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Restraint & Seclusion
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/restraint-seclusion/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/restraint-seclusion/${params.id}`} redirectPath="/restraint-seclusion" label="restraint/seclusion event" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ShieldOff className="w-5 h-5 text-red-600" />
              <span className="text-xs font-mono text-slate-400">{event.eventNumber}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{RS_TYPE_LABEL[event.rsType] ?? event.rsType}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Patient: <strong>{event.patientInitials}</strong>
              {event.patientMrn && <> &middot; MRN: <strong>{event.patientMrn}</strong></>}
              &middot; Unit: <strong>{event.unit}</strong>
            </p>
          </div>
          <StatusUpdater apiPath={`/api/restraint-seclusion/${event.id}`} currentStatus={event.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {event.deathOccurred && !event.deathReportedToCms && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">DEATH OCCURRED — CMS Report Required</p>
            <p className="text-sm text-red-700 mt-1">Patient death during/within 24 hours of restraint must be reported to CMS immediately.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Clinical Justification">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.clinicalJustification}</p>
          </Section>

          <Section title="Precipitating Behaviors">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.behaviors}</p>
          </Section>

          <Section title="Less Restrictive Measures Tried">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.lessRestrictiveTried}</p>
          </Section>

          {monitoringLogs.length > 0 && (
            <Section title={`Monitoring Logs (${monitoringLogs.length})`}>
              <div className="divide-y divide-slate-100">
                {monitoringLogs.map((log, i) => (
                  <div key={i} className="py-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                      <span>{log.time}</span>
                      <span>{log.staff}</span>
                    </div>
                    <p className="text-sm text-slate-700">{log.assessment}</p>
                    {log.vitals && <p className="text-xs text-slate-400 mt-0.5">Vitals: {log.vitals}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {event.debriefNotes && (
            <Section title="Debrief Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.debriefNotes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Event Details">
            <dl className="space-y-3">
              <Field label="Event Date" value={formatDate(event.eventDate)} />
              <Field label="Event Time" value={event.eventTime} />
              <Field label="Type" value={RS_TYPE_LABEL[event.rsType]} />
              <Field label="Unit" value={event.unit} />
              <Field label="Ordering Provider" value={event.orderingProvider} />
              <Field label="Initiated By" value={event.initiatedBy} />
              {event.releasedAt && <Field label="Released At" value={formatDate(event.releasedAt)} />}
              {event.durationMinutes != null && (
                <div>
                  <dt className="text-xs text-slate-400">Duration</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-0.5">{event.durationMinutes} minutes</dd>
                </div>
              )}
            </dl>
          </Section>

          <Section title="Physician Face-to-Face">
            <dl className="space-y-2">
              {event.faceToFaceTime ? (
                <>
                  <Field label="Completed At" value={formatDate(event.faceToFaceTime)} />
                  <Field label="Completed By" value={event.faceToFaceBy} />
                </>
              ) : (
                <p className="text-sm text-red-600 font-medium">Pending — Required within 1 hour</p>
              )}
            </dl>
          </Section>

          <Section title="Post-Event">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-400">Debrief Completed</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${event.debrief ? 'text-green-600' : 'text-yellow-600'}`}>
                  {event.debrief ? `Yes — ${event.debriefDate ? formatDate(event.debriefDate) : ''}` : 'Pending'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Injury Occurred</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${event.injuryOccurred ? 'text-red-600' : 'text-green-600'}`}>
                  {event.injuryOccurred ? 'Yes' : 'No'}
                </dd>
              </div>
              {event.injuryDescription && <Field label="Injury Description" value={event.injuryDescription} />}
              <div>
                <dt className="text-xs text-slate-400">Death Occurred</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${event.deathOccurred ? 'text-red-700 font-bold' : 'text-green-600'}`}>
                  {event.deathOccurred ? 'YES' : 'No'}
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
