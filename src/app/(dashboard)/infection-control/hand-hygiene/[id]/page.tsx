import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, HandMetal , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

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

export default async function HandHygieneDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const audit = await prisma.handHygieneAudit.findUnique({ where: { id: params.id } });

  if (!audit || audit.facilityId !== session.user.facilityId) notFound();

  const rate = audit.complianceRate;
  const rateColor = rate >= 90 ? 'text-green-600' : rate >= 80 ? 'text-yellow-600' : 'text-red-600';
  const rateLabel = rate >= 90 ? 'Acceptable' : rate >= 80 ? 'Needs Improvement' : 'Below Target';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/infection-control/hand-hygiene" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Hand Hygiene Audits
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/infection-control/hand-hygiene/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HandMetal className="w-5 h-5 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Hand Hygiene Audit - {audit.unit}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(audit.auditDate)} &middot; Auditor: <strong>{audit.auditor}</strong>
              {audit.staffType && <> &middot; Staff: <strong>{audit.staffType}</strong></>}
            </p>
          </div>
          <div className="text-center bg-muted/20 rounded-xl px-5 py-3 shrink-0">
            <p className={`text-3xl font-bold ${rateColor}`}>{rate.toFixed(1)}%</p>
            <p className={`text-xs font-semibold mt-0.5 ${rateColor}`}>{rateLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Audit Results">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground/70">Total Opportunities</dt>
              <dd className="text-sm font-medium text-foreground mt-0.5">{audit.opportunities}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground/70">Compliant</dt>
              <dd className="text-sm font-medium text-green-600 mt-0.5">{audit.compliant}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground/70">Non-Compliant</dt>
              <dd className="text-sm font-medium text-red-600 mt-0.5">{audit.opportunities - audit.compliant}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground/70">Compliance Rate</dt>
              <dd className={`text-lg font-bold mt-0.5 ${rateColor}`}>{rate.toFixed(1)}%</dd>
            </div>
          </dl>
        </Section>

        <Section title="Audit Info">
          <dl className="space-y-3">
            <Field label="Date" value={formatDate(audit.auditDate)} />
            <Field label="Unit" value={audit.unit} />
            <Field label="Auditor" value={audit.auditor} />
            {audit.staffType && <Field label="Staff Type" value={audit.staffType} />}
          </dl>
        </Section>
      </div>

      {audit.notes && (
        <Section title="Notes">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{audit.notes}</p>
        </Section>
      )}
    </div>
  );
}
