'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, PartyPopper, Rocket, Bot, BookOpen, PlayCircle, X, ShieldAlert, Calendar, AlertTriangle, ClipboardCheck, Lock, FileBarChart, ArrowRight } from 'lucide-react';
import { startGeniusTour } from '@/components/onboarding/GeniusWalkthrough';

const STORAGE_KEY = 'nyxcitadel:onboarding-seen:v1';

const PLATFORM_CAPABILITIES = [
  {
    id: 'executive',
    title: '1. Executive Command Center & Lobby Dossier',
    desc: 'Real-time Health Index (94.2%), active risk signals, and 1-click "🚨 Surveyor in Lobby" readiness dossier.',
    icon: ShieldAlert,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'calendar',
    title: '2. Unified Regulatory Compliance Calendar',
    desc: 'Pre-mapped Joint Commission, CMS, and NFPA 101 fire drill deadlines with 14-day lead alerts.',
    icon: Calendar,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  },
  {
    id: 'incidents',
    title: '3. Incident & 5-Why RCA Tracker (AZ ADHS 24h Countdown)',
    desc: 'Automated severity classification, 24-hour state reporting countdown clock, and SMART CAP generation.',
    icon: AlertTriangle,
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
  {
    id: 'surveys',
    title: '4. Survey War Room & Mobile Tracer Mode',
    desc: 'On-floor mobile tracer checklists, deficit tagging, and Joint Commission score calculation (96.4%).',
    icon: ClipboardCheck,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'training',
    title: '5. Workforce Competency Shift Lockout Gatekeeper',
    desc: 'Automated shift lockout triggers blocking staff scheduling for expiring CPI crisis de-escalation certs.',
    icon: Lock,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'board',
    title: '6. C-Suite Board Deck Generator & Sentry AI Co-Pilot',
    desc: '1-click 14-slide PDF compilation saving 22+ hours of manual report prep, plus 24/7 AI regulatory guidance.',
    icon: FileBarChart,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
];

export function WelcomeOnboarding({ userName }: { userName?: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = window.localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    window.localStorage.setItem(STORAGE_KEY, 'true');
    window.dispatchEvent(new Event('nyx:welcome-done'));
  }, []);

  const confettiPieces = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      id: i,
      variant: i % 9,
    })),
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 p-4 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className={`confetti-piece confetti-${piece.variant}`}
          />
        ))}
      </div>

      <div className="relative w-full max-w-5xl rounded-3xl border border-teal-500/30 bg-slate-950 text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-amber-950 p-6 border-b border-teal-500/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse text-teal-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300">
                <PartyPopper className="w-3.5 h-3.5" />
                Welcome to NyxCitadel Platform Masterclass
              </div>
              <h2 className="text-xl font-bold text-white">
                {userName ? `Welcome, ${userName}` : 'Welcome to NyxCitadel'} · Inpatient Psychiatric Compliance Suite
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close welcome"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          <div className="bg-teal-950/30 border border-teal-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-teal-200 text-sm">Interactive 7-Step Show-and-Tell Masterclass</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Explore live interactive target rings, concrete hospital data examples (Destiny Springs Healthcare), and automated regulatory workflows.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                startGeniusTour('master');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-teal-950/50"
            >
              <PlayCircle className="w-4 h-4" />
              Launch 7-Step Interactive Tour <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Capability Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              What NyxCitadel Does For Hospital Leadership & Staff:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {PLATFORM_CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={cap.id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 transition-all space-y-2 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cap.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h5 className="font-bold text-white text-xs group-hover:text-teal-300 transition-colors">
                        {cap.title}
                      </h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-10">
                      {cap.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Pre-populated Destiny Springs Healthcare sample dataset loaded</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Skip to Executive Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                handleClose();
                startGeniusTour('master');
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md"
            >
              <Rocket className="w-4 h-4" />
              Start Masterclass Tour Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
