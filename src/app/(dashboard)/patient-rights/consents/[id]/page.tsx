import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ClipboardSignature , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  SIGNED: 'bg-green-100 text-green-800',
  VERBAL: 'bg-blue-100 text-blue-800',
  REFUSED: 'bg-red-100 text-red-800',
  REVOKED: 'bg-orange-100 text-orange-800',
  UNABLE_CAPACITY: 'bg-yellow-100 text-yellow-800',
};

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

export default async function ConsentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const consent = await prisma.consentRecord.findUnique({ where: { id: params.id } });

  if (!consent || consent.facilityId !== session.user.facilityId) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/patient-rights/consents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Consent Records
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/patient-rights/consents/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ClipboardSignature className="w-5 h-5 text-teal-600" />
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[consent.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
                {consent.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{consent.consentType.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: <strong>{consent.patientInitials}</strong>
              {consent.patientMrn && <> &middot; MRN: <strong>{consent.patientMrn}</strong></>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Consent Details">
          <dl className="space-y-3">
            <Field label="Consent Type" value={consent.consentType.replace(/_/g, ' ')} />
            <Field label="Consent Date" value={formatDate(consent.consentDate)} />
            <Field label="Obtained By" value={consent.obtainedBy} />
            <Field label="Witness" value={consent.witnessName} />
            {consent.admitDate && <Field label="Admit Date" value={formatDate(consent.admitDate)} />}
          </dl>
        </Section>

        <Section title="Capacity & Representation">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground/70">Patient Capacity Determined</dt>
              <dd className={`text-sm font-semibold mt-0.5 ${consent.patientCapacityDetermined ? 'text-green-600' : 'text-yellow-600'}`}>
                {consent.patientCapacityDetermined ? 'Yes - Patient has capacity' : 'No - Capacity not established'}
              </dd>
            </div>
            {consent.legalRepresentative && (
              <Field label="Legal Representative" value={consent.legalRepresentative} />
            )}
            {consent.status === 'REVOKED' && consent.revokedDate && (
              <Field label="Revoked Date" value={formatDate(consent.revokedDate)} />
            )}
          </dl>
        </Section>
      </div>

      {consent.notes && (
        <Section title="Notes">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{consent.notes}</p>
        </Section>
      )}
    </div>
  );
}
