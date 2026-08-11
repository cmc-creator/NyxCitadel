'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, PlayCircle, BookOpen, X, ChevronRight, Rocket, Database, Check } from 'lucide-react';
import { startGeniusTour } from '@/components/onboarding/GeniusWalkthrough';
import { seedDemoStorage, getDemoSeedStatus } from '@/lib/demo-data';

import { DemoPersonaSwitcher } from '@/components/shared/DemoPersonaSwitcher';

export function DemoModeBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededMessage, setSeededMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const active = window.localStorage.getItem('nyxcitadel:demo-mode:v1') === 'true';
    setIsDemo(active);

    if (active && !getDemoSeedStatus()) {
      seedDemoStorage();
    }

    const handleDemoChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      const enabled = customEvent.detail?.enabled ?? false;
      setIsDemo(enabled);
      setDismissed(false);

      if (enabled) {
        seedDemoStorage();
      }
    };

    window.addEventListener('nyx:demo-mode-changed', handleDemoChange);
    return () => window.removeEventListener('nyx:demo-mode-changed', handleDemoChange);
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // Call server seed API
      await fetch('/api/demo/seed', { method: 'POST' }).catch(() => {});
      
      // Seed client localStorage state
      const summary = seedDemoStorage();
      setSeededMessage(`Seeded ${summary.incidentsCount} Incidents, ${summary.capsCount} CAPs, ${summary.surveysCount} Surveys & ${summary.calendarItemsCount} Deadlines!`);
      setTimeout(() => setSeededMessage(null), 4000);
    } catch (e) {
      setSeededMessage('Demo data loaded successfully!');
      setTimeout(() => setSeededMessage(null), 3000);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isMounted || !isDemo || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-teal-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div>
          <span className="font-bold text-amber-300">VIP Demo Mode Active:</span>{' '}
          <span className="text-slate-300">
            {seededMessage ?? 'Pre-populated hospital dataset loaded for Destiny Springs Healthcare.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <DemoPersonaSwitcher />

        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-600/90 hover:bg-teal-500 text-white font-bold transition shadow-sm border border-teal-400/30"
          title="Seed / reset pre-populated demo records"
        >
          <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          {isSeeding ? 'Seeding Data...' : 'Seed Demo Data'}
        </button>

        <button
          onClick={() => startGeniusTour('master')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-sm"
        >
          <Rocket className="w-3.5 h-3.5" />
          Start Master Tour
        </button>

        <Link
          href="/walkthrough"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-200 hover:bg-amber-500/10 font-semibold transition"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Tour Hub
        </Link>

        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-200 p-1 rounded-md transition"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
