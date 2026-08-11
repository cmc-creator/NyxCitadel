'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Zap, Menu, Palette, PlayCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { DemoModeToggle } from '@/components/shared/DemoModeToggle';
import { LiveBrandSwitcherModal } from '@/components/settings/LiveBrandSwitcher';
import { CommandKModal } from '@/components/layout/CommandKModal';
import { startGeniusTour } from '@/components/onboarding/GeniusWalkthrough';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';

interface TopBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    department?: string | null;
  };
  onMenuClick?: () => void;
}

export function TopBar({ user, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Show a "Setup Guide" pill in the topbar until setup is permanently complete.
  const [showSetupButton, setShowSetupButton] = useState(false);
  useEffect(() => {
    const check = () => {
      const done     = !!window.localStorage.getItem('nyxcitadel:setup-wizard-done:v1');
      const welcomed = !!window.localStorage.getItem('nyxcitadel:onboarding-seen:v1');
      setShowSetupButton(!done && welcomed);
    };
    check();
    window.addEventListener('nyx:setup-wizard-done', check);
    window.addEventListener('nyx:welcome-done', check);
    return () => {
      window.removeEventListener('nyx:setup-wizard-done', check);
      window.removeEventListener('nyx:welcome-done', check);
    };
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/site-search?q=${encodeURIComponent(q)}`);
  }

  function openCommandPalette() {
    window.dispatchEvent(new Event('nyx:open-command-palette'));
  }

  return (
    <>
      <CommandKModal />
      <LiveBrandSwitcherModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} />

      <header className="h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-4 md:px-6 gap-3 sticky top-0 z-20">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo - shown alongside hamburger */}
        <div className="md:hidden flex-shrink-0 flex items-center">
          <Image
            src="/citadellogo-clean.png"
            alt="NyxCitadel"
            width={32}
            height={32}
            unoptimized
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.src.includes('/logo-white.svg')) {
                img.src = '/logo-white.svg';
              }
            }}
            className="h-8 w-8"
          />
        </div>

        {/* Command K Search bar trigger */}
        <div className="flex-1 max-w-md">
          <button
            onClick={openCommandPalette}
            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 text-sm bg-muted border border-border/40 rounded-lg text-muted-foreground hover:border-teal-500/40 hover:bg-card transition group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-teal-400 transition-colors" />
              <span className="text-xs">Search items or press <kbd className="font-mono bg-background/80 px-1.5 py-0.5 rounded text-[10px]">Ctrl+K</kbd>...</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Sales Demo Mode Toggle */}
          <DemoModeToggle />

          {/* White-Label Brand Switcher */}
          <button
            onClick={() => setIsBrandModalOpen(true)}
            title="Switch Facility White-Label Brand"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 hover:bg-muted border border-border/60 text-muted-foreground hover:text-foreground transition-all"
          >
            <Palette className="w-3.5 h-3.5 text-teal-400" />
            Brand Theme
          </button>

          {/* Genius Tour Button */}
          <button
            onClick={() => startGeniusTour('executive')}
            title="Start Interactive Guided Tour"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-all"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Genius Tour
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User avatar - links to profile */}
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted/60 transition-colors group"
            title="My Profile"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 group-hover:ring-2 group-hover:ring-teal-500/50 transition-all">
              {user.name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground leading-none group-hover:text-teal-400 transition-colors">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.department ?? user.role?.replace(/_/g, ' ')}
              </p>
            </div>
          </Link>
        </div>
      </header>
    </>
  );
}


