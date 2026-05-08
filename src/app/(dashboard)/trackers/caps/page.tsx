import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ClipboardList, Plus, AlertTriangle, Download } from 'lucide-react';
import Link from 'next/link';
import { isPast } from 'date-fns';
import { PrintButton } from '@/components/ui/PrintButton';
import { CapsListClient } from '@/components/trackers/CapsListClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Corrective Action Plans' };

export default async function CapsPage({
  searchParams,
}: {
  searchParams: { status?: string; year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const yearStart = year ? new Date(year, 0, 1) : null;
  const yearEnd   = year ? new Date(year + 1, 0, 1) : null;

  const caps = await prisma.correctiveActionPlan.findMany({
    where: {
      facilityId,
      ...(searchParams.status ? { status: searchParams.status as never } : {}),
      ...(yearStart && yearEnd ? { createdAt: { gte: yearStart, lt: yearEnd } } : {}),
    },
    orderBy: [{ status: 'asc' }, { targetDate: 'asc' }],
    include: {
      assignee: { select: { name: true, email: true } },
    },
  });

  const overdueCount = caps.filter(
    (c) =>
      isPast(c.targetDate) &&
      !['COMPLETED', 'VERIFIED'].includes(c.status)
  ).length;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-teal-600" />
            Corrective Action Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {caps.length} total · {overdueCount} overdue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/api/export/caps"
            className="inline-flex items-center gap-1.5 text-sm bg-card border border-border hover:bg-accent/50 text-foreground/80 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Link>
          <PrintButton />
          <Link
            href="/trackers/caps/new"
            className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New CAP
          </Link>
        </div>
      </div>

      {/* Archive year banner */}
      {year && (
        <div className="bg-amber-950/20 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> - showing CAPs created within {year}.
          </p>
          <Link href="/trackers/caps" className="text-xs text-amber-700 underline">Return to live view</Link>
        </div>
      )}

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-bold">{overdueCount} corrective action plans</span> are past their target completion date.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { href: '/trackers/caps', label: `All (${caps.length})`, active: !searchParams.status },
          { href: '/trackers/caps?status=OPEN', label: 'Open', active: searchParams.status === 'OPEN' },
          { href: '/trackers/caps?status=IN_PROGRESS', label: 'In Progress', active: searchParams.status === 'IN_PROGRESS' },
          { href: '/trackers/caps?status=OVERDUE', label: `Overdue (${overdueCount})`, active: searchParams.status === 'OVERDUE' },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              tab.active
                ? 'bg-teal-600 text-white'
                : 'bg-card border border-border text-muted-foreground hover:bg-accent/50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Cards grid for CAPs */}
      <CapsListClient caps={caps} />
    </div>
  );
}
