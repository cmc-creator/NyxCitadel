import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, LogOut , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-blue-100 text-blue-800' },
  { value: 'UPDATED', label: 'Updated', color: 'bg-purple-100 text-purple-800' },
  { value: 'DISCHARGED', label: 'Discharged', color: 'bg-green-100 text-green-800' },
  { value: 'TRANSFERRED', label: 'Transferred', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'AMA', label: 'AMA', color: 'bg-orange-100 text-orange-800' },
];

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

export default async function DischargePlanDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const plan = await prisma.dischargePlan.findUnique({ where: { id: params.id } });

  if (!plan || plan.facilityId !== session.user.facilityId) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/discharge-planning" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Discharge Planning
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/discharge-planning/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/discharge-planning/${params.id}`} redirectPath="/discharge-planning" label="discharge plan" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <LogOut className="w-5 h-5 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Patient {plan.patientInitials}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {plan.unit} &middot; Admitted: <strong>{formatDate(plan.admitDate)}</strong>
              {plan.patientMrn && <> &middot; MRN: <strong>{plan.patientMrn}</strong></>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/discharge-planning/${plan.id}`} currentStatus={plan.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {plan.barrierNotes && (
            <Section title="Discharge Barriers">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.barrierNotes}</p>
            </Section>
          )}

          <Section title="Post-Discharge Follow-Up">
            <dl className="space-y-4">
              {plan.followUpCall1Date && (
                <div>
                  <dt className="text-xs text-slate-400">Call 1 — {formatDate(plan.followUpCall1Date)}</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-0.5">{plan.followUpCall1By}</dd>
                  {plan.followUpCall1Notes && <p className="text-xs text-slate-500 mt-1">{plan.followUpCall1Notes}</p>}
                </div>
              )}
              {plan.followUpCall2Date && (
                <div>
                  <dt className="text-xs text-slate-400">Call 2 — {formatDate(plan.followUpCall2Date)}</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-0.5">{plan.followUpCall2By}</dd>
                </div>
              )}
              {plan.followUpResult && <Field label="Follow-Up Result" value={plan.followUpResult} />}
            </dl>
          </Section>

          {plan.referralsSent.length > 0 && (
            <Section title="Referrals Sent">
              <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
                {plan.referralsSent.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Plan Details">
            <dl className="space-y-3">
              <Field label="Primary Dx" value={plan.primaryDx} />
              <Field label="Unit" value={plan.unit} />
              <Field label="Assessment Started" value={formatDate(plan.assessmentStartDate)} />
              <Field label="Assessed By" value={plan.assessmentBy} />
              <Field label="Care Coordinator" value={plan.careCoordinator} />
              <Field label="Insurance Auth" value={plan.insuranceAuth} />
              <Field label="Expected Disposition" value={plan.expectedDisposition.replace(/_/g, ' ')} />
              {plan.estimatedDischargeDate && <Field label="Est. Discharge" value={formatDate(plan.estimatedDischargeDate)} />}
            </dl>
          </Section>

          <Section title="Discharge Outcome">
            <dl className="space-y-3">
              {plan.actualDischargeDate && <Field label="Actual Discharge" value={formatDate(plan.actualDischargeDate)} />}
              {plan.actualDisposition && <Field label="Actual Disposition" value={plan.actualDisposition.replace(/_/g, ' ')} />}
              <div>
                <dt className="text-xs text-slate-400">Family Involved</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${plan.familyInvolved ? 'text-green-600' : 'text-slate-500'}`}>
                  {plan.familyInvolved ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Transition Care Note</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${plan.transitionCareNote ? 'text-green-600' : 'text-yellow-600'}`}>
                  {plan.transitionCareNote ? 'Completed' : 'Pending'}
                </dd>
              </div>
              {plan.moonRequired && (
                <div>
                  <dt className="text-xs text-slate-400">MOON Notice Issued</dt>
                  <dd className={`text-sm font-semibold mt-0.5 ${plan.moonIssuedDate ? 'text-green-600' : 'text-red-600'}`}>
                    {plan.moonIssuedDate ? formatDate(plan.moonIssuedDate) : 'Not Issued'}
                  </dd>
                </div>
              )}
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
