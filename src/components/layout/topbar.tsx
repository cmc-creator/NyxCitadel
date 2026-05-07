'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Zap, Menu } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NotificationBell } from '@/components/layout/NotificationBell';
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
  onMenuToggle?: () => void;
}

export function TopBar({ user, onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

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

  return (
    <header className="h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3 sticky top-0 z-20">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-foreground"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile logo - hidden on desktop (sidebar shows it there) */}
      <div className="lg:hidden flex-shrink-0 flex items-center gap-2">
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

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search compliance items, policies, events..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-card text-foreground placeholder:text-muted-foreground transition"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 ml-auto">
        {/* Date */}
        <span className="text-xs text-muted-foreground hidden sm:block">
          {formatDate(new Date(), 'EEEE, MMMM d, yyyy')}
        </span>

        {/* Setup Guide pill — visible until all wizard steps complete */}
        {showSetupButton && (
          <button
            onClick={() => window.dispatchEvent(new Event('nyx:open-setup-wizard'))}
            title="Reopen setup guide"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-all"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
            </span>
            <Zap className="w-3 h-3" />
            Setup Guide
          </button>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* User avatar — links to profile */}
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
  );
}

