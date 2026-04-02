import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LigatureClient } from '@/components/eoc/ligature-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ligature Risk Assessment' };

export default async function LigaturePage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const items = await prisma.ligatureRiskItem.findMany({
    where: { facilityId },
    orderBy: [{ riskLevel: 'asc' }, { identifiedDate: 'desc' }],
  });

  // Serialize dates for client
  const serialized = items.map(i => ({
    ...i,
    identifiedDate: i.identifiedDate.toISOString(),
    targetDate:     i.targetDate?.toISOString() ?? null,
    resolvedDate:   i.resolvedDate?.toISOString() ?? null,
    createdAt:      i.createdAt.toISOString(),
    updatedAt:      i.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl space-y-6">
      <LigatureClient items={serialized} />
    </div>
  );
}

