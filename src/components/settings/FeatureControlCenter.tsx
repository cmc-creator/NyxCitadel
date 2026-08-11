'use client';

import { useState, useEffect } from 'react';
import { Sliders, Sparkles, ShieldAlert, Building2, Radio, Clock, TrendingUp, Check, RefreshCw } from 'lucide-react';
import { getFeatureFlags, setFeatureFlags, FeatureFlags } from '@/lib/feature-flags';

const FEATURE_DEFINITIONS: {
  key: keyof FeatureFlags;
  title: string;
  desc: string;
  icon: any;
  category: string;
}[] = [
  {
    key: 'sentryAi',
    title: 'Sentry AI Co-Pilot & Floating Assistant',
    desc: 'Enable 24/7 AI regulatory Q&A, 5-Why RCA generator, and SMART CAP drafting assistance.',
    icon: Sparkles,
    category: 'AI & Intelligence',
  },
  {
    key: 'vipDemoMode',
    title: 'VIP Demo Mode & Role Switcher',
    desc: 'Enable VIP Demo banner, pre-populated Destiny Springs Healthcare data, and hospital persona switcher.',
    icon: Sliders,
    category: 'Demo & Presentation',
  },
  {
    key: 'surveyorDossier',
    title: '🚨 Surveyor in Lobby (1-Click Readiness Dossier)',
    desc: 'Enable instant unannounced audit dossier generator and printable surveyor entry packet.',
    icon: ShieldAlert,
    category: 'Executive & Audit',
  },
  {
    key: 'hospitalFloorplan',
    title: '🏥 Hospital Unit & Ligature Risk Heatmap',
    desc: 'Enable visual interactive floorplan (Unit 1, Unit 2, High Acuity) with room risk heatmaps.',
    icon: Building2,
    category: 'Environment of Care',
  },
  {
    key: 'regulatoryTicker',
    title: '📢 Arizona ADHS & TJC Regulatory News Ticker',
    desc: 'Enable real-time 2026 regulatory rule update banner with AI impact analysis.',
    icon: Radio,
    category: 'Compliance Updates',
  },
  {
    key: 'sentinelCountdown',
    title: '⏰ AZ ADHS 24h Mandatory State Reporting Countdown',
    desc: 'Enable live 24-hour countdown clock for active state-reportable incidents.',
    icon: Clock,
    category: 'Risk & Reporting',
  },
  {
    key: 'complianceRoi',
    title: '📊 Executive Compliance ROI & Fine Prevention Calculator',
    desc: 'Display estimated annual compliance hours saved and ADHS fine exposure avoided.',
    icon: TrendingUp,
    category: 'Executive Analytics',
  },
];

export function FeatureControlCenter() {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setFlags(getFeatureFlags());
  }, []);

  const toggleFlag = (key: keyof FeatureFlags) => {
    const next = !flags[key];
    const updated = setFeatureFlags({ [key]: next });
    setFlags(updated);

    setSavedMessage(`Updated ${FEATURE_DEFINITIONS.find((f) => f.key === key)?.title}`);
    setTimeout(() => setSavedMessage(null), 2500);
  };

  const resetAll = () => {
    const updated = setFeatureFlags({
      sentryAi: true,
      vipDemoMode: true,
      surveyorDossier: true,
      hospitalFloorplan: true,
      regulatoryTicker: true,
      sentinelCountdown: true,
      complianceRoi: true,
    });
    setFlags(updated);
    setSavedMessage('All features enabled!');
    setTimeout(() => setSavedMessage(null), 2500);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              Feature & Module Control Center
              {savedMessage && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-in fade-in duration-200">
                  ✓ Saved
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              Enable or disable specific platform capabilities for your facility's operational workflow.
            </p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset All to Enabled
        </button>
      </div>

      <div className="space-y-4">
        {FEATURE_DEFINITIONS.map((def) => {
          const Icon = def.icon;
          const enabled = flags[def.key];

          return (
            <div
              key={def.key}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                enabled
                  ? 'bg-muted/40 border-teal-500/30'
                  : 'bg-muted/10 border-border/40 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    enabled
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-foreground">{def.title}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {def.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{def.desc}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => toggleFlag(def.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabled ? 'bg-teal-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
