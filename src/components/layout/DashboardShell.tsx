'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    department?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="print:hidden">
        <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
      <div className="flex-1 lg:ml-64 print:ml-0 flex flex-col min-w-0">
        <div className="print:hidden">
          <TopBar user={user} onMenuClick={() => setMobileOpen(true)} />
        </div>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
