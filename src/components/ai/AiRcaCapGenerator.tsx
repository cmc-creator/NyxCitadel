'use client';

import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, ArrowRight, ShieldAlert, FileText, Target } from 'lucide-react';

interface AiRcaCapGeneratorProps {
  initialText?: string;
  onApply?: (result: { rcaText: string; capAction: string; measureOfSuccess: string }) => void;
}

export function AiRcaCapGenerator({ initialText = '', onApply }: AiRcaCapGeneratorProps) {
  const [description, setDescription] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    fiveWhys: string[];
    category: string;
    smartCap: string;
    measureOfSuccess: string;
    regulatoryCitation: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);

    // Simulate AI generation with detailed psychiatric inpatient domain knowledge
    setTimeout(() => {
      setResult({
        category: 'Process & Nursing Workflow',
        regulatoryCitation: 'Joint Commission CAMH NPSG.15.01.01 & AZ ADHS A.A.C. R9-10-202',
        fiveWhys: [
          '1. Why did the incident occur? The 15-minute Q15 observation check was logged 8 minutes late.',
          '2. Why was the check late? The assigned floor nurse was delayed managing an acute patient de-escalation in Unit 2.',
          '3. Why was no backup nurse coverage assigned? Staff handover during shift change did not explicitly assign float coverage for high-acuity observations.',
          '4. Why was float coverage missing? The shift assignment sheet lacked a designated secondary observer role for high-acuity rooms.',
          '5. Root Cause: Lack of secondary redundancy in the patient observation policy during peak shift-change transitions.',
        ],
        smartCap:
          'Update shift assignment protocol to mandate a designated secondary observer for all Q15 high-acuity patients during shift transitions. Conduct mandatory huddle retraining for clinical staff within 14 days.',
        measureOfSuccess:
          'Audit 100% of Q15 observation logs weekly for 60 consecutive days. Target threshold: >= 98% timely compliance with secondary observer sign-off.',
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-card border border-teal-500/30 rounded-2xl p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              Sentry AI RCA & SMART CAP Auto-Generator
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                5-Second Assist
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">Auto-generate 5-Why analysis and CMS/TJC compliant corrective action plans.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground block">
          Incident / Deficiency Summary
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. During shift change at 07:15, a Q15 patient safety check was logged 8 minutes late on Unit 2..."
          className="w-full text-xs p-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing CMS/TJC Rules & Generating RCA...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Auto-Draft 5-Why RCA & SMART CAP
          </>
        )}
      </button>

      {/* Generated Result */}
      {result && (
        <div className="space-y-4 pt-2 border-t border-border/60 animate-in fade-in duration-300">
          <div className="bg-teal-950/20 border border-teal-700/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-300">Contributing Category: {result.category}</span>
              <span className="text-[10px] text-teal-400 font-mono">{result.regulatoryCitation}</span>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-foreground">5-Why Analysis Breakdown:</p>
              {result.fiveWhys.map((why, idx) => (
                <p key={idx} className="text-xs text-muted-foreground pl-2 border-l-2 border-teal-500/40">
                  {why}
                </p>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-400" /> Recommended SMART Corrective Action Plan:
              </p>
              <p className="text-xs text-teal-200 leading-relaxed bg-teal-950/40 p-2.5 rounded-lg border border-teal-500/20">
                {result.smartCap}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">Measure of Success (Audit Metric):</p>
              <p className="text-xs text-muted-foreground">{result.measureOfSuccess}</p>
            </div>
          </div>

          {onApply && (
            <button
              type="button"
              onClick={() =>
                onApply({
                  rcaText: result.fiveWhys.join('\n'),
                  capAction: result.smartCap,
                  measureOfSuccess: result.measureOfSuccess,
                })
              }
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-500 text-teal-950 text-xs font-bold hover:bg-teal-400 transition-all shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" /> Apply Generated RCA & CAP to Form
            </button>
          )}
        </div>
      )}
    </div>
  );
}
