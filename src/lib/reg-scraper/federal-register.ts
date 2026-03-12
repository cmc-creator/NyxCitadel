/**
 * Federal Register JSON API scraper
 * https://www.federalregister.gov/developer/api/v1/
 *
 * Completely free, no API key, covers CMS / OSHA / DEA / HHS-OCR.
 * Returns new rules, proposed rules, and notices affecting healthcare.
 */

import type { ScrapedUpdate } from '../index';

const FR_API = 'https://www.federalregister.gov/api/v1/articles.json';

// Federal Register agency slugs we care about
const AGENCIES: { slug: string; label: string }[] = [
  { slug: 'centers-for-medicare-medicaid-services',      label: 'CMS' },
  { slug: 'occupational-safety-and-health-administration', label: 'OSHA' },
  { slug: 'drug-enforcement-administration',              label: 'DEA' },
  { slug: 'office-for-civil-rights',                      label: 'HHS_OCR' },
  { slug: 'health-resources-and-services-administration', label: 'HRSA' },
  { slug: 'substance-abuse-and-mental-health-services-administration', label: 'SAMHSA' },
];

// Only show these document types
const INCLUDE_TYPES = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document'];

/** Classify impact level based on FR document type and title keywords. */
function classifyImpact(docType: string, title: string, abstract: string): string {
  const text = `${title} ${abstract}`.toLowerCase();

  const criticalKeywords = [
    'immediate jeopardy', 'emergency', 'civil money penalty', 'termination',
    'exclude', 'exclusion', 'mandatory training', 'effective immediately',
  ];
  const highKeywords = [
    'final rule', 'conditions of participation', 'conditions for coverage',
    'f-tag', 'ftag', 'interpretive guidelines', 'compliance date',
    'enforcement', 'penalty', 'psychiatric hospital', 'behavioral health',
  ];
  const lowKeywords = ['proposed rule', 'request for information', 'advance notice'];

  if (criticalKeywords.some(k => text.includes(k))) return 'CRITICAL';
  if (docType === 'Rule' || highKeywords.some(k => text.includes(k))) return 'HIGH';
  if (lowKeywords.some(k => text.includes(k))) return 'LOW';
  return 'MEDIUM';
}

interface FrArticle {
  document_number: string;
  title: string;
  abstract: string;
  html_url: string;
  publication_date: string; // "2025-03-01"
  type: string;             // "Rule", "Proposed Rule", "Notice", etc.
  agencies: { name: string }[];
}

interface FrResponse {
  results: FrArticle[];
  count: number;
}

/** Fetch the last `days` days of FR entries for all target agencies. */
export async function fetchFederalRegister(days = 90): Promise<ScrapedUpdate[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceStr = since.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const updates: ScrapedUpdate[] = [];

  for (const { slug, label } of AGENCIES) {
    try {
      const params = new URLSearchParams({
        'conditions[agencies][]': slug,
        'conditions[publication_date][gte]': sinceStr,
        'per_page': '20',
        'order': 'newest',
        'fields[]': 'document_number,title,abstract,html_url,publication_date,type,agencies',
      });

      const res = await fetch(`${FR_API}?${params}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 0 },
      });

      if (!res.ok) continue;
      const data: FrResponse = await res.json();

      for (const article of data.results ?? []) {
        if (!INCLUDE_TYPES.includes(article.type)) continue;

        updates.push({
          source: 'FEDERAL_REGISTER',
          sourceId: article.document_number,
          title: article.title,
          summary: article.abstract ?? null,
          url: article.html_url,
          publishedAt: new Date(article.publication_date),
          agency: label,
          docType: article.type,
          impactLevel: classifyImpact(article.type, article.title, article.abstract ?? ''),
        });
      }
    } catch {
      // Skip this agency on network error; don't fail the whole scrape
    }
  }

  return updates;
}
