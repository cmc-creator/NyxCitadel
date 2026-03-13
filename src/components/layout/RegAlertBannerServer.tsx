import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import RegAlertBannerClient, { type AlertItem } from './RegAlertBanner';

/**
 * Server component — fetches unread CRITICAL and HIGH regulatory updates
 * and passes them to the interactive client banner.
 * Returns null when there's nothing to show.
 */
export async function RegAlertBannerServer() {
  const session = await auth();
  if (!session?.user) return null;

  const [criticalItems, highCount] = await Promise.all([
    prisma.regulatoryUpdate.findMany({
      where:   { isRead: false, impactLevel: 'CRITICAL' },
      orderBy: { publishedAt: 'desc' },
      take:    5,
      select: {
        id: true, title: true, agency: true, docType: true,
        impactLevel: true, url: true, publishedAt: true,
      },
    }),
    prisma.regulatoryUpdate.count({
      where: { isRead: false, impactLevel: 'HIGH' },
    }),
  ]);

  if (criticalItems.length === 0 && highCount === 0) return null;

  const serialized: AlertItem[] = criticalItems.map(u => ({
    ...u,
    publishedAt: u.publishedAt.toISOString(),
  }));

  return <RegAlertBannerClient critical={serialized} highCount={highCount} />;
}
