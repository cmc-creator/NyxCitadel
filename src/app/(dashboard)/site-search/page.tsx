'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, FileSearch, ExternalLink } from 'lucide-react';

type SearchItem = {
  id: string;
  href: string;
  title: string;
  meta: string;
};

type SearchGroup = {
  label: string;
  icon: string;
  items: SearchItem[];
};

type SearchResponse = {
  results: SearchGroup[];
  query: string;
  total: number;
};

export default function SiteSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get('q') ?? '').trim();

  const [query, setQuery] = useState(q);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse>({ results: [], query: q, total: 0 });

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    const currentQ = q.trim();

    if (currentQ.length < 2) {
      setData({ results: [], query: currentQ, total: 0 });
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(currentQ)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Search failed');
        }
        const json = (await res.json()) as SearchResponse;
        if (!active) return;
        setData(json);
      } catch (e) {
        if (!active || (e instanceof Error && e.name === 'AbortError')) return;
        setError('Could not load search results. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [q]);

  const totalGroups = useMemo(() => data.results.length, [data.results.length]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/site-search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileSearch className="w-6 h-6 text-purple-600" />
          Site Search
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Search records across compliance modules, trackers, governance, and operations.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents, CAPs, policies, training, surveys..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </form>

      {q.length < 2 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-sm text-slate-500 text-center">
          Enter at least 2 characters to search.
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-sm text-slate-500 text-center">
          Searching for “{q}”...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      ) : data.total === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-sm text-slate-500 text-center">
          No results for “{q}”.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-slate-500">
            {data.total} result{data.total === 1 ? '' : 's'} in {totalGroups} group{totalGroups === 1 ? '' : 's'} for “{q}”
          </div>

          {data.results.map((group) => (
            <div key={group.label} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-sm font-semibold text-slate-700">{group.label}</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <li key={`${group.label}-${item.id}`}>
                    <Link href={item.href} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.meta}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
