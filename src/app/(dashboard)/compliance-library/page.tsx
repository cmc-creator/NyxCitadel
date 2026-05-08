import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import RegLibraryClient, { LibraryStats, RegEntry } from '@/components/compliance/RegLibraryClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Regulatory Reference Library | NyxCitadel',
  description:
    'Searchable, annotatable library of all regulations, laws, and accreditation standards ' +
    'applicable to the facility.',
};

// ─────────────────────────────────────────────────────────────────────────────

export default async function ComplianceLibraryPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const facilityId = session.user.facilityId as string | null | undefined;

  // Fetch built-in (global) entries + this facility's custom entries
  const rawItems = await prisma.regulatoryReference.findMany({
    where: {
      OR: [
        { facilityId: null },
        ...(facilityId ? [{ facilityId }] : []),
      ],
    },
    orderBy: [
      { regulatoryBody: 'asc' },
      { standardRef: 'asc' },
    ],
  });

  // Serialize dates (Next.js server → client boundary)
  const items: RegEntry[] = rawItems.map(r => ({
    ...r,
    lastVerified: r.lastVerified?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  // Build stats
  const byBody: Record<string, number> = {};
  let critical = 0;
  for (const item of items) {
    byBody[item.regulatoryBody] = (byBody[item.regulatoryBody] ?? 0) + 1;
    if (item.priority === 'CRITICAL') critical++;
  }
  const stats: LibraryStats = { total: items.length, critical, byBody };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Regulatory Reference Library
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All regulations, laws, accreditation standards, and internal requirements in one
            searchable, annotatable reference.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70 bg-muted/30 rounded-lg
                        border border-border px-3 py-2">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Built-in entries are managed via the compliance library files.
            Use <code className="font-mono">npx tsx prisma/seed-reg-library.ts</code> to sync
            after a library update.
          </span>
        </div>
      </div>

      {/* ── Main client component ───────────────────────────────────────── */}
      <RegLibraryClient
        initialData={items}
        stats={stats}
        userRole={session.user.role ?? ''}
      />
    </div>
  );
}
