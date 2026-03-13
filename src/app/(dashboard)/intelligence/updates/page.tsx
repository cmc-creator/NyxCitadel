import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import RegUpdatesClient, { type RegUpdate } from '@/components/intelligence/RegUpdatesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Regulatory Intelligence Feed | NyxCitadel',
  description: 'Live regulatory updates from CMS, OSHA, DEA, HHS/OCR, AZ ADHS, and The Joint Commission.',
};

export default async function RegUpdatesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [updates, unreadCount] = await Promise.all([
    prisma.regulatoryUpdate.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 200,
    }),
    prisma.regulatoryUpdate.count({ where: { isRead: false } }),
  ]);

  // Serialize dates for client component
  const serialized: RegUpdate[] = updates.map(u => ({
    ...u,
    publishedAt: u.publishedAt.toISOString(),
    createdAt:   u.createdAt.toISOString(),
    facilityId:  u.facilityId ?? null,
  }));

  return (
    <RegUpdatesClient
      updates={serialized}
      unreadCount={unreadCount}
      userRole={session.user.role}
    />
  );
}
