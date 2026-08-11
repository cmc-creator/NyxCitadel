'use client';

import { useState } from 'react';
import { Crown, Sparkles, CheckCircle2, AlertCircle, ShieldAlert, FileBarChart, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function ExecutiveBoardSummaryWidget() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadDeck = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.open('/board-report', '_blank');
    }, 1000);
  };

  return (
    <div className="bg-card border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-5">
      {/* Glow highlight */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              C-Suite Executive Board Briefing
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Q1 2026 Ready
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Automated 3-bullet executive briefing for CEO, CNO & Board of Directors.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadDeck}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition shadow-md disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Preparing PDF...' : '1-Click Board Deck PDF'}
        </button>
      </div>

      {/* 3 Executive Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bullet 1: Green / Compliant */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🟢 Compliant (Green)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-foreground">Facility Health Index: 94.2%</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            100% of Q15 observation logs audited with zero gaps. All 90 clinical nurse credentials fully current.
          </p>
        </div>

        {/* Bullet 2: Yellow / Attention Needed */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              🟡 Attention Needed (Yellow)
            </span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs font-bold text-foreground">2 CAPs Due in 14 Days</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ligature safety audit complete; CAP-2026-002 requires final CNO sign-off before TJC submission window closes.
          </p>
        </div>

        {/* Bullet 3: Red / Board Action */}
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              🔴 Board Action (Red)
            </span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xs font-bold text-foreground">1 ADHS Reportable Incident</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inc-2026-003 logged under AZ R9-10; mandatory state notification submitted within 18 hours (under 24h limit).
          </p>
        </div>
      </div>

      {/* Bottom Link */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Citation Mapped to TJC CAMH & CMS CoPs
        </span>
        <Link
          href="/board-report"
          className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
        >
          Open Interactive Board Deck <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
