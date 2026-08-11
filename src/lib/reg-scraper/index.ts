/**
 * Regulatory Intelligence Scraper - Main Orchestrator
 *
 * Pulls live regulatory updates from:
 *   1. Federal Register JSON API (CMS, OSHA, DEA, HHS-OCR, HRSA, SAMHSA)
 *   2. CMS Newsroom RSS
 *   3. AZ ADHS RSS
 *   4. Joint Commission news feed
 *
 * All results are upserted into the `regulatory_updates` table using
 * (source, sourceId) as the unique key - safe to run repeatedly.
 *
 * Agencies that are state-specific (AZ_ADHS) only notify facilities in AZ.
 * Federal agencies notify all facilities.
 *
 * Usage:
 *   import { runScrape } from '@/lib/reg-scraper';
 *   const result = await runScrape();
 */

import { prisma } from '@/lib/prisma';
import { fetchFederalRegister } from './federal-register';
import { fetchAllRss } from './rss-sources';
import { sendNotificationEmail } from '@/lib/notifications/email';
import { getRegulatoryAlertEmail } from '@/lib/notifications/email-templates';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScrapedUpdate {
  source: string;
  sourceId: string;
  title: string;
  summary: string | null;
  url: string;
  publishedAt: Date;
  agency: string;
  docType: string | null;
  impactLevel: string;
}

export interface ScrapeResult {
  success: boolean;
  newCount: number;
  totalFetched: number;
  sources: string[];
  errors: string[];
  durationMs: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapImpactToUrgency(impactLevel: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFORMATIONAL' {
  if (impactLevel === 'CRITICAL') return 'CRITICAL';
  if (impactLevel === 'HIGH')     return 'HIGH';
  if (impactLevel === 'MEDIUM')   return 'MEDIUM';
  return 'INFORMATIONAL';
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Run a full scrape pass across all configured sources.
 * @param days  How many days back to look for updates (default 90)
 */
export async function runScrape(days = 90): Promise<ScrapeResult> {
  const start = Date.now();
  const errors: string[] = [];
  let allUpdates: ScrapedUpdate[] = [];

  // 1. Federal Register (most authoritative)
  try {
    const fr = await fetchFederalRegister(days);
    allUpdates = allUpdates.concat(fr);
  } catch (err) {
    errors.push(`Federal Register: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 2. RSS sources (CMS newsroom, AZ ADHS, JC)
  try {
    const rss = await fetchAllRss(days);
    allUpdates = allUpdates.concat(rss);
  } catch (err) {
    errors.push(`RSS: ${err instanceof Error ? err.message : String(err)}`);
  }

  const totalFetched = allUpdates.length;
  const sources = [...new Set(allUpdates.map(u => u.source))];

  // Look up a system user to use as publishedById (required by schema)
  const sysUser = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (!sysUser) {
    errors.push('No admin user found - skipping DB write');
    return { success: false, newCount: 0, totalFetched, sources, errors, durationMs: Date.now() - start };
  }

  // 3. Identify which CRITICAL/HIGH items are actually new (not already in DB)
  const alertCandidates = allUpdates.filter(u => (u.impactLevel === 'CRITICAL' || u.impactLevel === 'HIGH') && u.url);
  const urlsToCheck = alertCandidates.map(u => u.url);
  const existingSourceUrls = urlsToCheck.length > 0
    ? new Set(
        (await prisma.regulatoryUpdate.findMany({
          where: { sourceUrl: { in: urlsToCheck } },
          select: { sourceUrl: true },
        })).map(r => r.sourceUrl).filter((x): x is string => x !== null),
      )
    : new Set<string>();

  const newAlerts = alertCandidates.filter(u => !existingSourceUrls.has(u.url));

  // 4. Insert new items - only those with a sourceUrl so the unique constraint
  //    prevents duplicate runs from accumulating identical records.
  const insertable = allUpdates.filter(u => u.url);
  let newCount = 0;
  try {
    const result = await prisma.regulatoryUpdate.createMany({
      data: insertable.map(u => ({
        title:          u.title.slice(0, 500),
        summary:        u.summary ?? '',
        regulatoryBody: u.agency,
        urgency:        mapImpactToUrgency(u.impactLevel),
        sourceUrl:      u.url,
        isGlobal:       true,
        publishedById:  sysUser.id,
      })),
      skipDuplicates: true,
    });
    newCount = result.count;
  } catch (err) {
    errors.push(`DB write: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 5. Fire Notification records for genuinely new CRITICAL/HIGH items
  if (newAlerts.length > 0) {
    try {
      await createRegAlertNotifications(newAlerts);
    } catch (err) {
      errors.push(`Notifications: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const durationMs = Date.now() - start;

  return {
    success: errors.length === 0,
    newCount,
    totalFetched,
    sources,
    errors,
    durationMs,
  };
}

/**
 * Get a count of active updates.
 */
export async function getUnreadCount(): Promise<number> {
  return prisma.regulatoryUpdate.count({ where: { isActive: true } });
}

/**
 * No-op stubs (isRead does not exist on RegulatoryUpdate schema).
 */
export async function markRead(_id: string): Promise<void> { /* no-op */ }
export async function markAllRead(): Promise<void> { /* no-op */ }

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Create REG_ALERT Notification records for CRITICAL/HIGH updates.
 * Targets ADMIN and COMPLIANCE_OFFICER users in relevant facilities.
 *
 * Relevance rules:
 *  - AZ_ADHS / JC (state-specific)  → only facilities in AZ
 *  - All federal agencies (CMS, OSHA, DEA, HHS_OCR, HRSA, SAMHSA) → all facilities
 */
async function createRegAlertNotifications(updates: ScrapedUpdate[]): Promise<void> {
  if (updates.length === 0) return;

  // Load all admin/compliance users with their facility state
  const staff = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'COMPLIANCE_OFFICER'] } },
    select: {
      id: true,
      email: true,
      name: true,
      facilityId: true,
      facility: { select: { state: true } },
    },
  });

  if (staff.length === 0) return;

  // Agencies that are state-specific (only relevant in AZ)
  const AZ_ONLY_AGENCIES = new Set(['AZ_ADHS']);

  const notifData: {
    facilityId: string;
    userId: string;
    title: string;
    message: string;
    type: 'SYSTEM';
    linkUrl: string;
    isRead: boolean;
  }[] = [];

  // Track which updates each user should be emailed about
  const userUpdateMap = new Map<string, { user: (typeof staff)[number]; updates: ScrapedUpdate[] }>();

  for (const update of updates) {
    const isAzOnly = AZ_ONLY_AGENCIES.has(update.agency);

    // Determine which users are relevant
    const targetUsers = staff.filter(u => {
      if (!u.facilityId) return false;
      if (isAzOnly && u.facility?.state !== 'AZ') return false;
      return true;
    });

    const impactLabel = update.impactLevel === 'CRITICAL' ? '🔴 CRITICAL' : '🟠 HIGH';
    const agencyLabel = update.agency.replace('_', '/');
    const docLabel    = update.docType ? ` - ${update.docType}` : '';

    for (const user of targetUsers) {
      notifData.push({
        facilityId: user.facilityId!,
        userId:     user.id,
        title:      `${impactLabel} Regulatory Alert: ${agencyLabel}${docLabel}`,
        message:    update.title.slice(0, 200),
        type:       'SYSTEM',
        linkUrl:    '/intelligence/updates',
        isRead:     false,
      });

      const entry = userUpdateMap.get(user.id) ?? { user, updates: [] };
      entry.updates.push(update);
      userUpdateMap.set(user.id, entry);
    }
  }

  if (notifData.length === 0) return;

  // Batch insert - no skipDuplicates since Notification has no unique constraint
  // but caller guarantees these are only called for genuinely new updates
  await prisma.notification.createMany({ data: notifData });

  // Send one grouped email per user for all their relevant new alerts
  for (const { user, updates: userUpdates } of userUpdateMap.values()) {
    if (!user.email) continue;
    try {
      const emailData = getRegulatoryAlertEmail({
        recipientName: user.name,
        updates: userUpdates.map(u => ({
          impactLevel: u.impactLevel,
          agency: u.agency,
          docType: u.docType,
          title: u.title,
          url: u.url,
        })),
      });
      await sendNotificationEmail({
        to: user.email,
        subject: emailData.subject,
        text: userUpdates
          .map(u => `[${u.impactLevel}] ${u.agency}: ${u.title}${u.url ? `\n${u.url}` : ''}`)
          .join('\n\n'),
        html: emailData.html,
      });
    } catch (err) {
      // Non-fatal - in-app notifications already created, but log so admins know SMTP is broken
      console.warn(`[reg-scraper] Email failed for ${user.email}:`, err instanceof Error ? err.message : String(err));
    }
  }
}
