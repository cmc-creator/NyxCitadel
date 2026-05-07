'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';

interface LayoutShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    department?: string | null;
  };
  children: React.ReactNode;
}

export function LayoutShell({ user, children }: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <TopBar user={user} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
