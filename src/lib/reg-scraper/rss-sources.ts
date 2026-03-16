/**
 * RSS-based regulatory scrapers
 * Covers: CMS Newsroom, AZ ADHS, and The Joint Commission.
 *
 * All use parseFeed() which calls our zero-dependency rss-parser.
 */

import { parseRss, stripHtml } from './rss-parser';
import type { ScrapedUpdate } from './index';

// ─── Source definitions ───────────────────────────────────────────────────────

interface RssSource {
  id: string;
  agency: string;
  feedUrl: string;
  docType: string;
  defaultImpact: string;
  highKeywords?: string[];
  criticalKeywords?: string[];
}

const RSS_SOURCES: RssSource[] = [
  {
    id: 'cms-news',
    agency: 'CMS',
    feedUrl: 'https://www.cms.gov/newsroom/rss/all-news',
    docType: 'Press Release',
    defaultImpact: 'INFO',
    highKeywords: [
      'final rule', 'interpretive guidance', 'ftag', 'f-tag', 'conditions of participation',
      'compliance', 'enforcement', 'psychiatric', 'behavioral health', 'hospital',
    ],
    criticalKeywords: ['immediate jeopardy', 'emergency', 'penalty', 'termination'],
  },
  {
    id: 'az-adhs',
    agency: 'AZ_ADHS',
    feedUrl: 'https://www.azdhs.gov/rss/index.php',
    docType: 'Notice',
    defaultImpact: 'MEDIUM',
    highKeywords: ['behavioral health', 'survey', 'license', 'inspection', 'rule', 'requirement'],
    criticalKeywords: ['immediate jeopardy', 'emergency', 'penalty', 'revocation'],
  },
  {
    id: 'jc-news',
    agency: 'JC',
    feedUrl: 'https://www.jointcommission.org/en/news-feed/',
    docType: 'Notice',
    defaultImpact: 'MEDIUM',
    highKeywords: [
      'standards', 'national patient safety goal', 'npsg', 'sentinel event',
      'accreditation', 'requirement', 'update', 'effective',
    ],
    criticalKeywords: ['sentinel event alert', 'immediate threat', 'emergency'],
  },
];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

function classifyImpact(source: RssSource, title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (source.criticalKeywords?.some(k => text.includes(k))) return 'CRITICAL';
  if (source.highKeywords?.some(k => text.includes(k))) return 'HIGH';
  return source.defaultImpact;
}

async function fetchRssSource(src: RssSource, since: Date): Promise<ScrapedUpdate[]> {
  const res = await fetch(src.feedUrl, {
    headers: {
      'User-Agent': 'NyxCitadel-RegIntel/1.0 (Healthcare Compliance; contact@nyxcitadel.com)',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${src.feedUrl}`);
  const xml = await res.text();
  const items = parseRss(xml);

  return items
    .filter(item => {
      if (!item.link) return false;
      if (item.pubDate && item.pubDate < since) return false;
      return true;
    })
    .map(item => ({
      source: 'RSS_' + src.id.toUpperCase().replace(/-/g, '_'),
      sourceId: item.guid || item.link,
      title: item.title || '(untitled)',
      summary: item.description ? stripHtml(item.description).slice(0, 1000) : null,
      url: item.link,
      publishedAt: item.pubDate ?? new Date(),
      agency: src.agency,
      docType: src.docType,
      impactLevel: classifyImpact(src, item.title, item.description),
    }));
}

/** Fetch last `days` days from all RSS sources. Errors per-source are swallowed. */
export async function fetchAllRss(days = 90): Promise<ScrapedUpdate[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const results: ScrapedUpdate[] = [];

  await Promise.allSettled(
    RSS_SOURCES.map(async src => {
      try {
        const items = await fetchRssSource(src, since);
        results.push(...items);
      } catch {
        // Silently skip - network/parse errors shouldn't abort the whole run
      }
    }),
  );

  return results;
}
