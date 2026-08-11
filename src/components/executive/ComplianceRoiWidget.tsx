'use client';

import { TrendingUp, Clock, ShieldCheck, DollarSign, Award } from 'lucide-react';

export function ComplianceRoiWidget() {
  return (
    <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-cyan-950/40 border border-teal-500/30 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              Executive Compliance ROI & Penalty Risk Prevention
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Annual Impact
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">Quantified time savings and fine exposure reduction for Destiny Springs Healthcare.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Staff Time Saved:</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-teal-300 font-mono">1,240 Hours</p>
          <p className="text-[11px] text-slate-400">Automated audit binder prep & board reporting</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>ADHS Fine Exposure Avoided:</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-300 font-mono">$180,000</p>
          <p className="text-[11px] text-slate-400">Zero missed 24h state sentinel event reporting deadlines</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Audit Defense Readiness:</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-300 font-mono">100%</p>
          <p className="text-[11px] text-slate-400">All 90 beds mapped to TJC & CMS standards</p>
        </div>
      </div>
    </div>
  );
}
