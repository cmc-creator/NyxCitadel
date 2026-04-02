import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, AlertTriangle , Pencil } from 'lucide-react';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
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

export default async function PdmpCheckDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const check = await prisma.pdmpCheck.findUnique({ where: { id: params.id } });

  if (!check || check.facilityId !== session.user.facilityId) notFound();

  const findingUnresolved = check.significantFinding && !check.actionTaken;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/pharmacy/pdmp" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to PDMP Checks
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/pharmacy/pdmp/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      {findingUnresolved && (
        <div className="flex items-start gap-3 bg-red-950/20 border border-red-300 text-red-800 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Significant Finding - Action Required</p>
            <p className="text-sm mt-0.5">
              This PDMP check returned a significant finding. Document the action taken before closing.
            </p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {check.significantFinding ? (
            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700">Significant Finding</span>
          ) : (
            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">No Significant Finding</span>
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground">PDMP Check - {check.prescriptionType}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Patient: {check.patientInitials} &middot; DOB: {formatDate(check.patientDob)} &middot; {formatDate(check.checkDate)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {check.findingNotes && (
            <Section title="Finding Notes">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{check.findingNotes}</p>
            </Section>
          )}

          {check.actionTaken && (
            <Section title="Action Taken">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{check.actionTaken}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Check Details">
            <dl className="space-y-3">
              <Field label="Check Date" value={formatDate(check.checkDate)} />
              <Field label="Patient Initials" value={check.patientInitials} />
              <Field label="Patient DOB" value={formatDate(check.patientDob)} />
              <Field label="Prescriber ID" value={check.prescriberId} />
              <Field label="Prescription Type" value={check.prescriptionType} />
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
