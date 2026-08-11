'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, PlayCircle, BookOpen, X, ChevronRight, Rocket } from 'lucide-react';
import { startGeniusTour } from '@/components/onboarding/GeniusWalkthrough';

export function DemoModeBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const active = window.localStorage.getItem('nyxcitadel:demo-mode:v1') === 'true';
    setIsDemo(active);

    const handleDemoChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      setIsDemo(customEvent.detail?.enabled ?? false);
      setDismissed(false);
    };

    window.addEventListener('nyx:demo-mode-changed', handleDemoChange);
    return () => window.removeEventListener('nyx:demo-mode-changed', handleDemoChange);
  }, []);

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
          <span className="font-bold text-amber-300">Demo Mode Active:</span>{' '}
          <span className="text-slate-300">Exploring pre-populated hospital data for Destiny Springs Healthcare.</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => startGeniusTour('master')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-sm"
        >
          <Rocket className="w-3.5 h-3.5" />
          Start Guided Master Tour
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
