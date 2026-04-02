import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Wrench , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'UPCOMING', label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
  { value: 'DUE_SOON', label: 'Due Soon', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
];

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

export default async function EquipmentPmDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const eq = await prisma.equipmentPm.findUnique({ where: { id: params.id } });

  if (!eq || eq.facilityId !== session.user.facilityId) notFound();

  const isOverdue = eq.status === 'OVERDUE' || new Date(eq.nextServiceDate) < new Date();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/eoc/equipment" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Equipment PM
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/eoc/equipment/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Wrench className="w-5 h-5 text-teal-600" />
              {eq.equipmentId && <span className="text-xs font-mono text-muted-foreground/70">{eq.equipmentId}</span>}
              {isOverdue && (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">Overdue</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">{eq.equipmentName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {eq.category.replace(/_/g, ' ')} &middot; {eq.location}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/eoc/equipment/${eq.id}`} currentStatus={eq.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Equipment Details">
          <dl className="space-y-3">
            <Field label="Equipment Name" value={eq.equipmentName} />
            <Field label="Asset / Serial #" value={eq.equipmentId} />
            <Field label="Location" value={eq.location} />
            <Field label="Category" value={eq.category.replace(/_/g, ' ')} />
            <Field label="PM Frequency" value={eq.frequency.replace(/_/g, ' ')} />
          </dl>
        </Section>

        <Section title="Service Schedule">
          <dl className="space-y-3">
            {eq.lastServiceDate && <Field label="Last Serviced" value={formatDate(eq.lastServiceDate)} />}
            <div>
              <dt className="text-xs text-muted-foreground/70">Next Service Due</dt>
              <dd className={`text-sm font-semibold mt-0.5 ${isOverdue ? 'text-red-600' : 'text-foreground'}`}>
                {formatDate(eq.nextServiceDate)}
              </dd>
            </div>
            <Field label="Vendor" value={eq.vendor} />
            <Field label="Vendor Phone" value={eq.contactPhone} />
          </dl>
        </Section>
      </div>

      {eq.notes && (
        <Section title="Notes">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{eq.notes}</p>
        </Section>
      )}
    </div>
  );
}
