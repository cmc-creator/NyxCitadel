'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

interface TopBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/site-search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Mobile logo - hidden on desktop (sidebar shows it there) */}
      <div className="lg:hidden flex-shrink-0 flex items-center gap-2">
        <Image
          src="/citadellogo-v2.png"
          alt="NyxCitadel"
          width={32}
          height={32}
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

        {/* Notifications */}
        <NotificationBell />

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user.name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-foreground leading-none">
              {user.name ?? user.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

