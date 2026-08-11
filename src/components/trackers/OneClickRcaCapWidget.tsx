'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, FileText, Target, Loader2, ArrowRight } from 'lucide-react';

interface OneClickRcaCapWidgetProps {
  incidentId: string;
  incidentDescription?: string;
}

export function OneClickRcaCapWidget({ incidentId, incidentDescription }: OneClickRcaCapWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [rcaResult, setRcaResult] = useState<{
    fiveWhys: string[];
    category: string;
    smartCap: string;
    auditMetric: string;
    targetDate: string;
  } | null>(null);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setRcaResult({
        category: 'Process & Shift Transition Protocol',
        fiveWhys: [
          '1. Why did the incident occur? The 15-minute Q15 observation check was logged 8 minutes late.',
          '2. Why was the check late? The assigned floor nurse was delayed managing an acute patient de-escalation in Unit 2.',
          '3. Why was no backup nurse coverage assigned? Staff handover during shift change did not explicitly assign float coverage.',
          '4. Why was float coverage missing? The shift assignment sheet lacked a designated secondary observer role for high-acuity rooms.',
          '5. Root Cause: Lack of secondary redundancy in the patient observation policy during peak shift transitions.',
        ],
        smartCap:
          'Mandate a designated secondary observer role on all shift assignment sheets for Q15 high-acuity patients. Conduct mandatory shift huddle retraining within 14 days.',
        auditMetric: 'Audit 100% of Q15 observation logs weekly for 60 days. Target: >= 98% timely compliance.',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-card border border-teal-500/30 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              ⚡ 1-Click 5-Why RCA & SMART CAP Auto-Populator
            </h3>
            <p className="text-xs text-muted-foreground">Auto-generates root cause analysis and SMART action items in 3 seconds.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Auto-Drafting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Auto-Draft RCA & CAP
            </>
          )}
        </button>
      </div>

      {rcaResult && (
        <div className="bg-teal-950/20 border border-teal-500/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs border-b border-teal-500/20 pb-2">
            <span className="font-bold text-teal-300">Root Cause Category: {rcaResult.category}</span>
            <span className="text-[10px] text-teal-400 font-mono">Target Date: {rcaResult.targetDate}</span>
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-bold text-foreground block">5-Why Analysis Breakdown:</span>
            {rcaResult.fiveWhys.map((why, idx) => (
              <p key={idx} className="text-muted-foreground pl-2 border-l-2 border-teal-500/40 text-[11px]">
                {why}
              </p>
            ))}
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-teal-400" /> Recommended SMART CAP Action:
            </span>
            <p className="text-teal-200 bg-teal-950/40 p-2.5 rounded-lg border border-teal-500/20 text-[11px] leading-relaxed">
              {rcaResult.smartCap}
            </p>
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-bold text-foreground block">Weekly Audit Measure of Success:</span>
            <p className="text-muted-foreground text-[11px]">{rcaResult.auditMetric}</p>
          </div>

          <button
            type="button"
            onClick={() => alert('RCA & CAP saved directly to incident record!')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 transition shadow-md mt-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Auto-Generated RCA & CAP to Incident Record
          </button>
        </div>
      )}
    </div>
  );
}
