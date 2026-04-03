import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DeficienciesClient } from '@/components/eoc/deficiencies-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'EOC Deficiencies' };

export default async function DeficienciesPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const rows = await prisma.eocDeficiency.findMany({
    where: { facilityId },
    include: { round: { select: { roundNumber: true, roundType: true } } },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
  });

  const items = rows.map(d => ({
    id: d.id,
    defNumber: d.defNumber,
    location: d.location,
    unit: d.unit ?? null,
    description: d.description,
    category: String(d.category),
    severity: String(d.severity),
    status: String(d.status),
    assignedTo: d.assignedTo ?? null,
    dueDate: d.dueDate
      ? d.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    resolvedDate: d.resolvedDate
      ? d.resolvedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    resolvedBy: d.resolvedBy ?? null,
    notes: d.notes ?? null,
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-muted-foreground/70 hover:text-slate-300">Environment of Care</Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Deficiencies</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Deficiency Tracker</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">All environment-of-care findings from rounds, surveys, and ad-hoc observations</p>
        </div>
        <Link href="/eoc/deficiencies/new" className="px-3 py-1.5 text-sm rounded-md bg-red-700 hover:bg-red-600 text-white font-medium transition-colors">
          + Log Deficiency
        </Link>
      </div>

      <DeficienciesClient items={items} />
    </div>
  );
}

