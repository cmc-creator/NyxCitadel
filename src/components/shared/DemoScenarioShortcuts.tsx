'use client';

import { useState } from 'react';
import { Zap, ShieldAlert, Siren, Lock, FileBarChart, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { startGeniusTour } from '@/components/onboarding/GeniusWalkthrough';

export function DemoScenarioShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const router = useRouter();

  const triggerScenario = (name: string, route: string, message: string) => {
    setActiveNotification(message);
    setIsOpen(false);
    router.push(route);

    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start pointer-events-none">
      {/* Toast Notification */}
      {activeNotification && (
        <div className="bg-slate-900 border border-teal-500/50 text-white text-xs px-4 py-3 rounded-xl shadow-2xl mb-3 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto max-w-md">
          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Popover Menu */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-md border border-amber-500/40 rounded-2xl w-80 shadow-2xl overflow-hidden mb-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-gradient-to-r from-amber-950 to-slate-900 p-3.5 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-xs">VIP Demo Scenario Shortcuts</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-amber-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            <button
              onClick={() =>
                triggerScenario(
                  'ADHS Sentinel Alert',
                  '/trackers/incidents',
                  '⚡ Simulated AZ ADHS 24h Sentinel Event Alert (INC-2026-004 Logged)'
                )
              }
              className="w-full text-left p-2.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-xs font-semibold text-red-200 transition flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Simulate ADHS 24h Sentinel Event</p>
                <p className="text-[10px] text-red-300/80">Auto-flags state reportable incident & launches RCA</p>
              </div>
            </button>

            <button
              onClick={() =>
                triggerScenario(
                  'Staff Gatekeeper Lockout',
                  '/trackers/training/compliance',
                  '⚡ Simulated Compliance Gatekeeper Lockout Triggered for 3 RNs'
                )
              }
              className="w-full text-left p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-xs font-semibold text-amber-200 transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Simulate Staff Shift Lockout</p>
                <p className="text-[10px] text-amber-300/80">Blocks shift scheduling for unrenewed CPI certs</p>
              </div>
            </button>

            <button
              onClick={() =>
                triggerScenario(
                  'Board Report Export',
                  '/board-report',
                  '⚡ Prepared 1-Click Executive Quality & Compliance Board Deck'
                )
              }
              className="w-full text-left p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-xs font-semibold text-emerald-200 transition flex items-center gap-2"
            >
              <FileBarChart className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Generate Executive Board Deck</p>
                <p className="text-[10px] text-emerald-300/80">Compiles 14-slide PDF from live metrics</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-xl hover:bg-slate-800"
      >
        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
        <span>VIP Demo Shortcuts</span>
      </button>
    </div>
  );
}
