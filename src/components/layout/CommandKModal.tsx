'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  CalendarDays,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  BarChart2,
  FileSearch,
  Palette,
  PlayCircle,
  TrendingUp,
  X,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { startGeniusTour } from '@/components/onboarding/GeniusWalkthrough';

export function CommandKModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Listen for Ctrl+K or Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Listen for open custom event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('nyx:open-command-palette', handleOpen);
    return () => window.removeEventListener('nyx:open-command-palette', handleOpen);
  }, []);

  const COMMAND_ITEMS = [
    {
      label: 'Go to Dashboard',
      category: 'Pages',
      icon: LayoutDashboard,
      action: () => router.push('/dashboard'),
    },
    {
      label: 'Compliance Calendar (CMS / TJC / ADHS)',
      category: 'Pages',
      icon: CalendarDays,
      action: () => router.push('/calendar'),
    },
    {
      label: 'Log Incident or Adverse Event',
      category: 'Actions',
      icon: ShieldAlert,
      action: () => router.push('/trackers/incidents'),
    },
    {
      label: 'Ask Sentry AI Compliance Assistant',
      category: 'Actions',
      icon: Sparkles,
      action: () => router.push('/assistant'),
    },
    {
      label: 'Auto-Generate Board Executive Report',
      category: 'Reports',
      icon: BarChart2,
      action: () => router.push('/board-report'),
    },
    {
      label: 'Start Interactive Genius Tour',
      category: 'Tours',
      icon: PlayCircle,
      action: () => {
        setIsOpen(false);
        startGeniusTour('executive');
      },
    },
    {
      label: 'Open Hospital ROI & Savings Calculator',
      category: 'Sales',
      icon: TrendingUp,
      action: () => router.push('/walkthrough'),
    },
  ];

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-teal-500/30 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Search input header */}
        <div className="flex items-center px-4 border-b border-border/60 bg-muted/30">
          <Search className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or regulation (e.g. 'ADHS R9-10' or 'Board Report')..."
            className="w-full py-4 px-3 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded border border-border"
          >
            ESC
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              No matching commands or pages found.
            </p>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setIsOpen(false);
                    item.action();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-teal-950/30 hover:border-teal-500/30 border border-transparent text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-teal-300 transition-colors">
                        {item.label}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-teal-400 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Press <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">↑</kbd>{' '}
            <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">↓</kbd> to navigate
          </span>
          <span className="text-teal-400 font-medium">NyxCitadel Command Palette</span>
        </div>
      </div>
    </div>
  );
}
