import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ShieldCheck , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  SUPERSEDED: 'bg-gray-100 text-gray-600',
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

export default async function IcraDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const icra = await prisma.icRiskAssessment.findUnique({ where: { id: params.id } });

  if (!icra || icra.facilityId !== session.user.facilityId) notFound();

  const riskAreas = (icra.riskAreas ?? []) as Array<{ area: string; risk: string; rating: string; mitigationGoal: string }>;
  const goals = (icra.goals ?? []) as Array<{ goal: string; metric?: string; target?: string }>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/infection-control/icra" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to ICRA
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/infection-control/icra/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[icra.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
                {icra.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">IC Risk Assessment - {icra.assessmentYear}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Conducted: <strong>{formatDate(icra.conductedDate)}</strong>
              &middot; By: <strong>{icra.conductedBy}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {riskAreas.length > 0 && (
            <Section title={`Risk Areas (${riskAreas.length})`}>
              <div className="space-y-3">
                {riskAreas.map((ra, i) => (
                  <div key={i} className="border border-border/30 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{ra.area}</p>
                      <span className="shrink-0 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">{ra.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ra.risk}</p>
                    {ra.mitigationGoal && <p className="text-xs text-muted-foreground/70 mt-1 italic">{ra.mitigationGoal}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {goals.length > 0 && (
            <Section title="Annual IC Goals">
              <ul className="space-y-2">
                {goals.map((g, i) => (
                  <li key={i} className="text-sm text-foreground/80">
                    <span className="font-medium">{g.goal}</span>
                    {g.metric && <span className="text-muted-foreground/70"> - {g.metric}</span>}
                    {g.target && <span className="text-muted-foreground/70"> (Target: {g.target})</span>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {icra.notes && (
            <Section title="Notes">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{icra.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Assessment Details">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-muted-foreground/70">Assessment Year</dt>
                <dd className="text-sm font-medium text-foreground mt-0.5">{icra.assessmentYear}</dd>
              </div>
              <Field label="Conducted Date" value={formatDate(icra.conductedDate)} />
              <Field label="Conducted By" value={icra.conductedBy} />
              {icra.reviewedBy && <Field label="Reviewed By" value={icra.reviewedBy} />}
              {icra.approvedDate && <Field label="Approved Date" value={formatDate(icra.approvedDate)} />}
              {icra.approvedBy && <Field label="Approved By" value={icra.approvedBy} />}
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
