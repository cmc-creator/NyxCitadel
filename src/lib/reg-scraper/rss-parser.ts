/**
 * Lightweight RSS 2.0 / Atom parser - no external dependencies.
 * Parses raw XML text and returns a normalized array of feed items.
 */

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date | null;
  guid: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the text content of the first occurrence of a tag. */
function extractTag(xml: string, tag: string): string {
  // Handle CDATA: <tag><![CDATA[...]]></tag>
  const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle plain text: <tag>...</tag>
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const plainMatch = xml.match(plainRe);
  if (plainMatch) return plainMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();

  return '';
}

/** Parse a date string - handles RFC 822 (RSS) and ISO formats. */
function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/** Strip HTML tags from a string. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parse an RSS 2.0 or Atom XML string into an array of normalized items.
 */
export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];

  // Split on <item> or Atom <entry> tags
  const itemPattern = /<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi;
  const matches = xml.match(itemPattern);
  if (!matches) return items;

  for (const block of matches) {
    // For Atom feeds: link is in <link href="..."/> or <link>...</link>
    const atomHrefMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i);
    const link = atomHrefMatch?.[1] ?? extractTag(block, 'link');

    // For Atom: use <id> as GUID
    const guid = extractTag(block, 'guid') || extractTag(block, 'id') || link;

    // For Atom: use <updated> or <published> as pubDate
    const pubDateRaw = extractTag(block, 'pubDate') || extractTag(block, 'updated') || extractTag(block, 'published');

    items.push({
      title: stripHtml(extractTag(block, 'title')),
      link,
      description: stripHtml(extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content')),
      pubDate: parseDate(pubDateRaw),
      guid,
    });
  }

  return items;
}
