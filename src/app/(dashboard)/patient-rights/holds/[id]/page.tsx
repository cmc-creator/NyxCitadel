import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Scale, AlertTriangle , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-red-100 text-red-800' },
  { value: 'EXTENDED', label: 'Extended', color: 'bg-orange-100 text-orange-800' },
  { value: 'DISCHARGED', label: 'Discharged', color: 'bg-green-100 text-green-800' },
  { value: 'CONVERTED_VOLUNTARY', label: 'Converted to Voluntary', color: 'bg-blue-100 text-blue-800' },
  { value: 'COURT_ORDERED_CONTINUED', label: 'Court Ordered – Continued', color: 'bg-purple-100 text-purple-800' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground/70">{label}</dt>
      <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
    </div>
  );
}

export default async function HoldDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const hold = await prisma.involuntaryHoldLog.findUnique({ where: { id: params.id } });

  if (!hold || hold.facilityId !== session.user.facilityId) notFound();

  const isExpired = new Date(hold.holdExpiryDate) < new Date();
  const hoursRemaining = Math.ceil((new Date(hold.holdExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/patient-rights/holds" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Involuntary Holds
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/patient-rights/holds/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Patient {hold.patientInitials} - {hold.holdType}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Started: <strong>{formatDate(hold.holdStartDate)}</strong>
              &middot; Expires: <strong>{formatDate(hold.holdExpiryDate)}</strong>
              {hold.patientMrn && <> &middot; MRN: <strong>{hold.patientMrn}</strong></>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/patient-rights/holds/${hold.id}`} currentStatus={hold.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {hold.status === 'ACTIVE' && !isExpired && hoursRemaining <= 8 && (
        <div className="flex items-start gap-3 bg-orange-950/20 border border-orange-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold text-orange-800">Hold expires in {hoursRemaining} hour{hoursRemaining !== 1 ? 's' : ''}. Review required.</p>
        </div>
      )}

      {hold.status === 'ACTIVE' && isExpired && (
        <div className="flex items-start gap-3 bg-red-950/20 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm font-bold text-red-800">Hold has EXPIRED. Update status immediately.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Hold Details">
          <dl className="space-y-3">
            <Field label="Hold Type" value={hold.holdType} />
            <Field label="Hold Start" value={formatDate(hold.holdStartDate)} />
            <Field label="Hold Expiry" value={formatDate(hold.holdExpiryDate)} />
            <Field label="Ordering Physician" value={hold.orderingPhysician} />
            {hold.petitionerName && <Field label="Petitioner" value={hold.petitionerName} />}
          </dl>
        </Section>

        <Section title="Legal & Outcome">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground/70">Legal Counsel Notified</dt>
              <dd className={`text-sm font-semibold mt-0.5 ${hold.legalCounselNotified ? 'text-green-600' : 'text-yellow-600'}`}>
                {hold.legalCounselNotified ? 'Yes' : 'Pending'}
              </dd>
            </div>
            {hold.courtHearingDate && <Field label="Court Hearing Date" value={formatDate(hold.courtHearingDate)} />}
            {hold.outcome && <Field label="Outcome" value={hold.outcome} />}
          </dl>
        </Section>
      </div>

      {hold.notes && (
        <Section title="Notes">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{hold.notes}</p>
        </Section>
      )}
    </div>
  );
}
