'use client';

import { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

export function SentinelEventCountdownWidget() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-red-500/40 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              AZ ADHS R9-10 Mandatory 24h Reporting Countdown
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30">
              ACTIVE TIMER
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Incident <span className="font-mono font-bold text-amber-300">INC-2026-003</span> (Q15 Observation Delay) requires state filing.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-base font-extrabold text-red-400 bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-500/30">
          <span>{String(timeLeft.hours).padStart(2, '0')}h</span> :
          <span>{String(timeLeft.minutes).padStart(2, '0')}m</span> :
          <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>

        <Link
          href="/trackers/incidents/INC-2026-003"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md"
        >
          <FileText className="w-3.5 h-3.5" />
          Review ADHS Draft <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
