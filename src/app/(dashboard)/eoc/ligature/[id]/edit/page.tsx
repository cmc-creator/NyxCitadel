import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { LigatureEditForm } from './LigatureEditForm';

export const dynamic = 'force-dynamic';

export default async function EditLigaturePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const item = await prisma.ligatureRiskItem.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
  });
  if (!item) notFound();

  const serialized = {
    ...item,
    identifiedDate: item.identifiedDate.toISOString(),
    targetDate:     item.targetDate?.toISOString() ?? null,
    resolvedDate:   item.resolvedDate?.toISOString() ?? null,
    createdAt:      item.createdAt.toISOString(),
    updatedAt:      item.updatedAt.toISOString(),
  };

  return <LigatureEditForm item={serialized} />;
}
