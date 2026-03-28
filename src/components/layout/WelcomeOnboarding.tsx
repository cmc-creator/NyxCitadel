'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Sparkles, PartyPopper, Rocket, Bot, BookOpen, PlayCircle, X } from 'lucide-react';

const STORAGE_KEY = 'nyxcitadel:onboarding-seen:v1';

const steps = [
  {
    title: 'Start on the Dashboard',
    body: 'Review overdue events, open CAPs, expiring training, and active risk signals before doing anything else.',
    icon: Rocket,
  },
  {
    title: 'Use Sentry Carefully',
    body: 'Sentry is strong at drafting, explaining standards, and helping you think through compliance work. It does not directly edit records for you.',
    icon: Bot,
  },
  {
    title: 'Run a Daily Operating Rhythm',
    body: 'Calendar, incidents, CAPs, training, and regulatory updates are the five screens your team should touch every day.',
    icon: Sparkles,
  },
];

export function WelcomeOnboarding({ userName }: { userName?: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = window.localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setOpen(true);
      window.localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  const confettiPieces = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({
      id: i,
      variant: i % 11,
    })),
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className={`confetti-piece confetti-${piece.variant}`}
          />
        ))}
      </div>

      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Close welcome"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 lg:p-10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_36%)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1.5 text-xs font-semibold text-purple-200 mb-5">
              <PartyPopper className="w-3.5 h-3.5" />
              Welcome to NyxCitadel
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {userName ? `Glad you're here, ${userName}.` : 'Glad you are here.'}
              <br />
              Your compliance command center is ready.
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed max-w-2xl">
              This platform is built to help your team see risk early, stay survey-ready, and produce defensible documentation fast.
              Start with the walkthrough, then keep the guide open while your team learns the operating rhythm.
            </p>

            <div className="mt-8 grid gap-3">
              {steps.map(({ title, body, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-purple-200" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-sm text-slate-300 mt-1 leading-relaxed">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 lg:p-10 bg-white text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">What To Open First</p>
            <div className="space-y-3 mb-8">
              {[
                'Dashboard for live priorities',
                'Compliance Calendar for deadlines',
                'Trackers for incidents, CAPs, and training',
                'Regulatory Updates for external changes',
                'Sentry 🤖 for drafting and guidance',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3">
              <Link
                href="/walkthrough"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition"
              >
                <PlayCircle className="w-4 h-4" />
                Start Show-and-Tell Walkthrough
              </Link>
              <Link
                href="/guide"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition"
              >
                <BookOpen className="w-4 h-4" />
                Open User Guide
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition"
              >
                Go straight to the dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
