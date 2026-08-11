'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';
import { GeniusWalkthrough } from '@/components/onboarding/GeniusWalkthrough';
import { FloatingAiCoPilot } from '@/components/ai/FloatingAiCoPilot';
import { DemoModeBanner } from '@/components/shared/DemoModeBanner';
import { DemoScenarioShortcuts } from '@/components/shared/DemoScenarioShortcuts';
import { RegulatoryTickerBanner } from '@/components/shared/RegulatoryTickerBanner';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <GeniusWalkthrough />
      <FloatingAiCoPilot />
      <DemoScenarioShortcuts />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 transition-all duration-300 flex flex-col min-w-0 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <TopBar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <RegulatoryTickerBanner />
        <DemoModeBanner />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}


