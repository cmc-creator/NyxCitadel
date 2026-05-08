'use client';

import { useState, useMemo } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { standardsLibrary, type Standard } from '@/lib/standards-library';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['All', 'CMS', 'JC', 'OSHA', 'ADHS'] as const;

const CATEGORY_STYLES: Record<string, string> = {
  CMS: 'bg-blue-100 text-blue-800',
  JC: 'bg-purple-100 text-purple-800',
  OSHA: 'bg-orange-100 text-orange-800',
  ADHS: 'bg-teal-100 text-teal-800',
};

const CATEGORY_LABELS: Record<string, string> = {
  CMS: 'CMS CoP',
  JC: 'Joint Commission',
  OSHA: 'OSHA',
  ADHS: 'AZ ADHS',
};

function StandardRow({ standard }: { standard: Standard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        className="w-full text-left px-5 py-4 hover:bg-muted/20 transition-colors flex items-start gap-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_STYLES[standard.category] ?? 'bg-muted/30 text-muted-foreground'}`}>
              {CATEGORY_LABELS[standard.category] ?? standard.category}
            </span>
            <span className="font-mono text-xs text-muted-foreground font-semibold">{standard.standard}</span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">{standard.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{standard.description}</p>
        </div>
        <div className="shrink-0 mt-1 text-slate-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Requirement Summary</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{standard.description}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              What Surveyors Look For
            </h4>
            <p className="text-sm text-amber-900 leading-relaxed">{standard.surveyorTips}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StandardsLibraryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return standardsLibrary.filter((s) => {
      const matchesCat = category === 'All' || s.category === category;
      const matchesQuery =
        !q ||
        s.standard.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keywords.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, category]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: standardsLibrary.length };
    for (const cat of ['CMS', 'JC', 'OSHA', 'ADHS'] as const) {
      result[cat] = standardsLibrary.filter((s) => s.category === cat).length;
    }
    return result;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            Standards Library
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Key CMS, Joint Commission, OSHA, and Arizona ADHS standards with surveyor guidance
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold text-foreground">{filtered.length}</div>
          <div className="text-xs text-muted-foreground">{filtered.length === standardsLibrary.length ? 'standards' : `of ${standardsLibrary.length} standards`}</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by standard number, keyword, or topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                category === cat
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted/20'
              }`}
            >
              {cat === 'All' ? `All (${counts.All})` : `${CATEGORY_LABELS[cat]} (${counts[cat]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No standards match your search</p>
          <button onClick={() => { setQuery(''); setCategory('All'); }} className="mt-3 text-sm text-teal-600 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-3 bg-muted/20 border-b border-border flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {filtered.length} standard{filtered.length !== 1 ? 's' : ''} — click any row to expand surveyor guidance
            </span>
          </div>
          <div>
            {filtered.map((standard) => (
              <StandardRow key={standard.id} standard={standard} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
