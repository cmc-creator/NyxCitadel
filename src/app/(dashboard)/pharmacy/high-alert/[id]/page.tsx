import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

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

function BoolCheck({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>
      {value ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400" />
      )}
    </div>
  );
}

export default async function HighAlertMedAuditDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const audit = await prisma.highAlertMedAudit.findUnique({ where: { id: params.id } });

  if (!audit || audit.facilityId !== session.user.facilityId) notFound();

  const actionNeeded = !!audit.actionRequired && !audit.actionTaken;
  const allPassed = audit.storageCorrect && audit.labelingCorrect && audit.doubleCheckDone;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/pharmacy/high-alert" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to High-Alert Medications
        </Link>
        <PrintButton />
      </div>

      {actionNeeded && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-300 text-orange-800 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Action Required</p>
            <p className="text-sm mt-0.5">This audit identified findings that require action. No action has been documented yet.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {allPassed ? (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">All Checks Passed</span>
              ) : (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700">Findings Noted</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{audit.medication}</h1>
            <p className="text-sm text-slate-500 mt-1">{audit.unit} &middot; Auditor: {audit.auditor} &middot; {formatDate(audit.auditDate)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Compliance Checks">
            <BoolCheck label="Storage Correct" value={audit.storageCorrect} />
            <BoolCheck label="Labeling Correct" value={audit.labelingCorrect} />
            <BoolCheck label="Double-Check Completed" value={audit.doubleCheckDone} />
          </Section>

          {audit.auditFindings && (
            <Section title="Audit Findings">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{audit.auditFindings}</p>
            </Section>
          )}

          {audit.actionRequired && (
            <Section title="Action Required">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{audit.actionRequired}</p>
            </Section>
          )}

          {audit.actionTaken && (
            <Section title="Action Taken">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{audit.actionTaken}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Audit Details">
            <dl className="space-y-3">
              <Field label="Audit Date" value={formatDate(audit.auditDate)} />
              <Field label="Medication" value={audit.medication} />
              <Field label="Unit" value={audit.unit} />
              <Field label="Auditor" value={audit.auditor} />
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
