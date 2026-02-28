'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NotificationBell } from '@/components/layout/NotificationBell';

interface TopBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Mobile logo — hidden on desktop (sidebar shows it there) */}
      <div className="lg:hidden flex-shrink-0">
        <Image
          src="/logo.svg"
          alt="Destiny Springs Healthcare"
          width={160}
          height={36}
          className="h-9 w-auto"
        />
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search compliance items, policies, events..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Date */}
        <span className="text-xs text-slate-500 hidden sm:block">
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
            <p className="text-sm font-medium text-slate-700 leading-none">
              {user.name ?? user.email}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{user.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
