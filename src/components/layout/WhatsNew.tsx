'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X, Sparkles, Zap, Lightbulb } from 'lucide-react';

const STORAGE_KEY = 'nyxcitadel:whatsnew-seen:v1';

export function WhatsNew() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = window.localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setOpen(true);
      window.localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-teal-500/30 shadow-2xl max-w-lg w-full p-6 space-y-6">
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-400" />
            What's New
          </h2>
          <p className="text-sm text-slate-300">
            Recent improvements to Citadel's compliance workflow
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-3">
          {/* Feature 1: Sentry rename */}
          <div className="bg-white/5 border border-slate-700/50 rounded-lg p-4 hover:bg-white/10 transition">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">Meet Sentry 🤖</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your AI compliance assistant has a new name and identity. Say hello to Sentry.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2: Safe draft actions */}
          <div className="bg-white/5 border border-slate-700/50 rounded-lg p-4 hover:bg-white/10 transition">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">Draft CAPs & Incidents</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ask Sentry to draft CAPs, incident reports, or calendar events. Review and edit before creating.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3: Editable fields */}
          <div className="bg-white/5 border border-slate-700/50 rounded-lg p-4 hover:bg-white/10 transition">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">Edit Before Creating</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sentry shows you a preview. Make changes directly in the confirmation card before saving.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links to guide/walkthrough */}
        <div className="border-t border-slate-700/50 pt-4 space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Learn More</p>
          <div className="flex gap-2">
            <Link
              href="/guide"
              onClick={() => setOpen(false)}
              className="flex-1 px-3 py-2 text-center text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              User Guide
            </Link>
            <Link
              href="/walkthrough"
              onClick={() => setOpen(false)}
              className="flex-1 px-3 py-2 text-center text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition"
            >
              Feature Tour
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
