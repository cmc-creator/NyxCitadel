'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search, CalendarDays, FileText, GraduationCap, AlertTriangle,
  ClipboardList, MessageSquareWarning, FileSearch, FileWarning,
  SearchX, Loader2, ShieldAlert, Scale, ChevronRight, File,
} from 'lucide-react';
import Link from 'next/link';

interface SearchItem {
  id: string;
  href: string;
  title: string;
  meta: string;
}

interface ResultGroup {
  label: string;
  icon: string;
  items: SearchItem[];
}

interface SearchResponse {
  results: ResultGroup[];
  query: string;
  total: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  calendar: CalendarDays,
  policy:   FileText,
  training: GraduationCap,
  incident: AlertTriangle,
  cap:      ClipboardList,
  grievance: MessageSquareWarning,
  survey:   FileSearch,
  iriad:    FileWarning,
  rca:      SearchX,
  qoc:      Scale,
  risk:     ShieldAlert,
  doc:      File,
};

const GROUP_COLORS: Record<string, string> = {
  calendar: 'text-purple-600 bg-purple-50',
  policy:   'text-blue-600   bg-blue-50',
  training: 'text-green-600  bg-green-50',
  incident: 'text-red-600    bg-red-50',
  cap:      'text-orange-600 bg-orange-50',
  grievance:'text-pink-600   bg-pink-50',
  survey:   'text-teal-600   bg-teal-50',
  iriad:    'text-rose-600   bg-rose-50',
  rca:      'text-indigo-600 bg-indigo-50',
  qoc:      'text-violet-600 bg-violet-50',
  risk:     'text-amber-600  bg-amber-50',
  doc:      'text-slate-600  bg-slate-100',
};

function SearchContent() {
  const params    = useSearchParams();
  const router    = useRouter();
  const initial   = params.get('q') ?? '';

  const [query,   setQuery]   = useState(initial);
  const [results, setResults] = useState<ResultGroup[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); setTotal(0); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json() as SearchResponse;
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search on mount if initial query
  useEffect(() => {
    if (initial) void doSearch(initial);
  }, [initial, doSearch]);

  // Debounce as user types
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== initial) {
        const url = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
        router.replace(url, { scroll: false });
        void doSearch(query);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, initial, router, doSearch]);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-purple-600" />
          Global Search
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Search across all compliance modules — policies, incidents, CAPs, training, surveys, and more.</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by keyword, number, name, or description…"
          className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Results */}
      {!loading && searched && total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <SearchX className="w-12 h-12 opacity-40" />
          <p className="text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-slate-400">Try a different keyword, incident number, or staff name.</p>
        </div>
      )}

      {!loading && total > 0 && (
        <>
          <p className="text-xs text-slate-500">
            {total} result{total !== 1 ? 's' : ''} across {results.length} module{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          <div className="space-y-5">
            {results.map(group => {
              const Icon  = ICON_MAP[group.icon] ?? File;
              const color = GROUP_COLORS[group.icon] ?? 'text-slate-600 bg-slate-100';
              const [iconColor, bgColor] = color.split(' ');
              return (
                <section key={group.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-1.5 rounded-lg ${bgColor}`}>
                      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    </span>
                    <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{group.label}</h2>
                    <span className="text-xs text-slate-400 ml-1">({group.items.length})</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-50">
                    {group.items.map(item => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 group-hover:text-purple-700 truncate">{item.title}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{item.meta}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state hint */}
      {!searched && !query && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Start typing to search</p>
          <p className="text-xs text-slate-400 mt-1">Searches across 12 modules including policies, incidents, CAPs, surveys, grievances, and more.</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['CAP-2026', 'restraint', 'fire drill', 'HIPAA', 'John Doe', 'JC mock survey'].map(hint => (
              <button
                key={hint}
                onClick={() => setQuery(hint)}
                className="text-xs bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700 px-3 py-1.5 rounded-full transition"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center gap-2 text-slate-400 text-sm py-10"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
