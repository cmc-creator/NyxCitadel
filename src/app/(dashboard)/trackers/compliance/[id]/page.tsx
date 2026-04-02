import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ShieldCheck , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-blue-100 text-blue-700' },
  { value: 'COMPLIANT', label: 'Compliant', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant', color: 'bg-red-100 text-red-700' },
  { value: 'PENDING_REVIEW', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'WAIVED', label: 'Waived', color: 'bg-slate-100 text-slate-500' },
  { value: 'NA', label: 'N/A', color: 'bg-slate-100 text-muted-foreground/70' },
];

export default async function ComplianceItemDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const item = await prisma.complianceItem.findUnique({ where: { id: params.id } });
  if (!item || item.facilityId !== session.user.facilityId) notFound();

  const now = new Date();
  const isOverdue = !!(item.nextDueDate && item.nextDueDate < now && item.status !== 'WAIVED' && item.status !== 'NA');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/compliance" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Compliance Requirements
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/compliance/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              {item.standardRef && <span className="text-xs font-mono text-muted-foreground/70">{item.standardRef}</span>}
              <span className="text-xs bg-blue-950/20 text-blue-700 rounded-full px-2.5 py-0.5 font-medium">
                {item.regulatoryBody.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{item.title}</h1>
            <p className="text-xs text-slate-500 mt-1">{item.category.replace(/_/g, ' ')} &middot; {item.frequency.replace(/_/g, ' ')}</p>
          </div>
          <StatusUpdater apiPath={`/api/compliance/${item.id}`} currentStatus={item.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {item.description && (
            <Section title="Description">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{item.description}</p>
            </Section>
          )}
          {item.notes && (
            <Section title="Notes">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{item.notes}</p>
            </Section>
          )}
          {item.evidenceUrl && (
            <Section title="Evidence">
              <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-700 hover:underline break-all">
                {item.evidenceUrl}
              </a>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Requirement Details">
            <dl className="space-y-2">
              <Row label="Regulatory Body" value={item.regulatoryBody.replace(/_/g, ' ')} />
              {item.standardRef && <Row label="Standard Ref" value={item.standardRef} />}
              <Row label="Category" value={item.category.replace(/_/g, ' ')} />
              <Row label="Frequency" value={item.frequency.replace(/_/g, ' ')} />
              <Row label="Required" value={item.isRequired ? 'Yes' : 'No'} />
              {item.responsibleRole && <Row label="Responsible Role" value={item.responsibleRole.replace(/_/g, ' ')} />}
            </dl>
          </Section>

          <Section title="Compliance Timeline">
            <dl className="space-y-2">
              {item.lastDoneDate && <Row label="Last Completed" value={formatDate(item.lastDoneDate)} />}
              {item.nextDueDate && <Row label="Next Due" value={formatDate(item.nextDueDate)} highlight={isOverdue} />}
              <Row label="Status" value={item.status.replace(/_/g, ' ')} highlight={item.status === 'NON_COMPLIANT'} />
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
      <dd className={`text-xs font-medium text-right ${highlight ? 'text-red-600 font-bold' : 'text-foreground'}`}>{value}</dd>
    </div>
  );
}
