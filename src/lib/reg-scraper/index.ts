/**
 * Regulatory Intelligence Scraper — Main Orchestrator
 *
 * Pulls live regulatory updates from:
 *   1. Federal Register JSON API (CMS, OSHA, DEA, HHS-OCR, HRSA, SAMHSA)
 *   2. CMS Newsroom RSS
 *   3. AZ ADHS RSS
 *   4. Joint Commission news feed
 *
 * All results are upserted into the `regulatory_updates` table using
 * (source, sourceId) as the unique key — safe to run repeatedly.
 *
 * Usage:
 *   import { runScrape } from '@/lib/reg-scraper';
 *   const result = await runScrape();
 */

import { prisma } from '@/lib/prisma';
import { fetchFederalRegister } from './federal-register';
import { fetchAllRss } from './rss-sources';

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

  // 3. Insert new items, skipping any already in the DB (unique on source+sourceId)
  let newCount = 0;
  try {
    const result = await prisma.regulatoryUpdate.createMany({
      data: allUpdates.map(u => ({
        source:      u.source,
        sourceId:    u.sourceId,
        title:       u.title.slice(0, 500), // guard against oversized titles
        summary:     u.summary,
        url:         u.url,
        publishedAt: u.publishedAt,
        agency:      u.agency,
        docType:     u.docType,
        impactLevel: u.impactLevel,
        isRead:      false,
        isGlobal:    true,
      })),
      skipDuplicates: true,
    });
    newCount = result.count;
  } catch (err) {
    errors.push(`DB write: ${err instanceof Error ? err.message : String(err)}`);
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
 * Get a count of unread updates (for notification badges).
 */
export async function getUnreadCount(): Promise<number> {
  return prisma.regulatoryUpdate.count({ where: { isRead: false } });
}

/**
 * Mark a single update as read.
 */
export async function markRead(id: string): Promise<void> {
  await prisma.regulatoryUpdate.update({ where: { id }, data: { isRead: true } });
}

/**
 * Mark all updates as read.
 */
export async function markAllRead(): Promise<void> {
  await prisma.regulatoryUpdate.updateMany({ where: { isRead: false }, data: { isRead: true } });
}
