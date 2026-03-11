import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ClipboardList , Pencil } from 'lucide-react';
import { PrintButton } from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';
import StatusUpdater from '@/components/trackers/StatusUpdater';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-blue-100 text-blue-700',
  UPDATED: 'bg-yellow-100 text-yellow-700',
  DISCHARGED: 'bg-green-100 text-green-700',
  TRANSFERRED: 'bg-purple-100 text-purple-700',
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'blue' },
  { value: 'UPDATED', label: 'Updated', color: 'yellow' },
  { value: 'DISCHARGED', label: 'Discharged', color: 'green' },
  { value: 'TRANSFERRED', label: 'Transferred', color: 'purple' },
];

type Goal = { goalText: string; targetDate?: string; progress?: string };

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

export default async function TreatmentPlanDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const plan = await prisma.treatmentPlan.findUnique({
    where: { id: params.id },
    include: {
      reviews: { orderBy: { reviewDate: 'desc' } },
    },
  });

  if (!plan || plan.facilityId !== session.user.facilityId) notFound();

  const goals = (plan.goals ?? []) as Goal[];
  const treatmentTeam = (plan.treatmentTeam ?? []) as string[];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/treatment-plans" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Treatment Plans
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/treatment-plans/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/treatment-plans/${params.id}`} redirectPath="/treatment-plans" label="treatment plan" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-mono text-slate-400">{plan.patientMrn}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[plan.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {plan.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Treatment Plan — {plan.patientInitials}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {plan.unit} &middot; Admitted: {formatDate(plan.admitDate)} &middot; Dx: {plan.primaryDx}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/treatment-plans/${plan.id}`} currentStatus={plan.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {goals.length > 0 && (
            <Section title={`Treatment Goals (${goals.length})`}>
              <div className="space-y-3">
                {goals.map((g, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-800">{g.goalText}</p>
                    <div className="flex gap-4 mt-1 flex-wrap">
                      {g.targetDate && <span className="text-xs text-slate-400">Target: {formatDate(new Date(g.targetDate))}</span>}
                      {g.progress && <span className="text-xs text-slate-500">{g.progress}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {plan.dischargeGoal && (
            <Section title="Discharge Goal">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.dischargeGoal}</p>
            </Section>
          )}

          <Section title="Patient Participation">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-400">Participated in Plan Creation</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${plan.patientParticipated ? 'text-green-600' : 'text-slate-500'}`}>
                  {plan.patientParticipated ? 'Yes' : 'No / Unable'}
                </dd>
              </div>
              {plan.participationNotes && (
                <div>
                  <dt className="text-xs text-slate-400">Participation Notes</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{plan.participationNotes}</dd>
                </div>
              )}
            </dl>
          </Section>

          {plan.reviews.length > 0 && (
            <Section title={`Plan Reviews (${plan.reviews.length})`}>
              <div className="space-y-4">
                {plan.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-100 p-3 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-semibold text-slate-800">{formatDate(r.reviewDate)}</span>
                      <span className="text-xs text-slate-400">Reviewed by: {r.reviewedBy}</span>
                    </div>
                    {r.attendees && (r.attendees as string[]).length > 0 && (
                      <p className="text-xs text-slate-500">Attendees: {(r.attendees as string[]).join(', ')}</p>
                    )}
                    {r.progressSummary && (
                      <p className="text-sm text-slate-700">{r.progressSummary}</p>
                    )}
                    <div className="flex gap-4 flex-wrap text-xs">
                      {r.dischargeTarget && <span className="text-slate-500">Discharge target: {formatDate(r.dischargeTarget)}</span>}
                      {r.goalsUpdated && <span className="text-blue-600 font-medium">Goals Updated</span>}
                      {r.signature && <span className="text-slate-400">Signed: {r.signature}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Plan Details">
            <dl className="space-y-3">
              <Field label="Admit Date" value={formatDate(plan.admitDate)} />
              <Field label="Unit" value={plan.unit} />
              <Field label="Primary Diagnosis" value={plan.primaryDx} />
              <Field label="Plan Created" value={formatDate(plan.planCreatedDate)} />
              <Field label="Created By" value={plan.planCreatedBy} />
              {plan.estimatedLos !== null && plan.estimatedLos !== undefined && (
                <div>
                  <dt className="text-xs text-slate-400">Estimated LOS (days)</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-0.5">{plan.estimatedLos}</dd>
                </div>
              )}
              {plan.dischargedDate && <Field label="Discharged" value={formatDate(plan.dischargedDate)} />}
            </dl>
          </Section>

          {treatmentTeam.length > 0 && (
            <Section title="Treatment Team">
              <ul className="space-y-1">
                {treatmentTeam.map((m, i) => (
                  <li key={i} className="text-sm text-slate-700">{m}</li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
