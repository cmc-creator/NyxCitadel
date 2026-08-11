'use client';

import { useState, useEffect } from 'react';
import { PlayCircle, Sparkles, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DemoModeToggle() {
  const [isDemo, setIsDemo] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const active = window.localStorage.getItem('nyxcitadel:demo-mode:v1') === 'true';
    setIsDemo(active);
  }, []);

  const toggleDemo = () => {
    const nextState = !isDemo;
    setIsDemo(nextState);
    window.localStorage.setItem('nyxcitadel:demo-mode:v1', String(nextState));
    window.dispatchEvent(new CustomEvent('nyx:demo-mode-changed', { detail: { enabled: nextState } }));
  };

  if (!isMounted) return null;

  return (
    <button
      onClick={toggleDemo}
      title={isDemo ? 'Disable Demo Data' : 'Enable Sales Demo Mode'}
      className={cn(
        'hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border shadow-sm',
        isDemo
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          : 'bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted'
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            isDemo ? 'bg-amber-400' : 'bg-teal-400'
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            isDemo ? 'bg-amber-500' : 'bg-teal-500'
          )}
        />
      </span>
      <Sparkles className="w-3.5 h-3.5" />
      {isDemo ? 'Demo Mode: Active' : 'Sales Demo Mode'}
    </button>
  );
}
