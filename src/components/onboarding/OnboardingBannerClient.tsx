'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronRight, CheckCircle2, Building2, Sparkles, Users } from 'lucide-react';

export interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

export function OnboardingBannerClient({ steps }: { steps: OnboardingStep[] }) {
  const [dismissed, setDismissed] = useState(false);

  async function dismiss() {
    setDismissed(true);
    await fetch('/api/onboarding/dismiss', { method: 'POST' }).catch(() => {});
  }

  if (dismissed) return null;

  const doneCount = steps.filter(s => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);
  const allDone = doneCount === steps.length;

  const ICONS: Record<string, React.ElementType> = {
    facility:  Building2,
    templates: Sparkles,
    team:      Users,
  };

  return (
    <div className="bg-teal-950/30 border border-teal-700/30 rounded-xl p-5 space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
            {allDone ? (
              <><CheckCircle2 className="w-4 h-4 text-green-400" /> Setup complete!</>
            ) : (
              <>
                <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {doneCount}/{steps.length}
                </span>
                Finish setting up NyxCitadel
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {allDone
              ? 'Your facility is fully configured. These prompts will disappear shortly.'
              : 'A few quick steps and your compliance platform is ready to use.'}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5"
          aria-label="Dismiss setup banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid sm:grid-cols-3 gap-2">
        {steps.map(step => {
          const Icon = ICONS[step.id] ?? CheckCircle2;
          return (
            <Link
              key={step.id}
              href={step.done ? '#' : step.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                step.done
                  ? 'border-green-700/25 bg-green-950/20 text-muted-foreground cursor-default'
                  : 'border-teal-700/25 bg-teal-950/20 hover:bg-teal-950/40 text-teal-300'
              }`}
              onClick={e => step.done && e.preventDefault()}
            >
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <Icon className="w-4 h-4 flex-shrink-0" />
              )}
              <span className={`flex-1 text-xs font-medium ${step.done ? 'line-through text-muted-foreground/60' : ''}`}>
                {step.label}
              </span>
              {!step.done && <ChevronRight className="w-3 h-3 opacity-50 flex-shrink-0" />}
            </Link>
          );
        })}
      </div>

      {/* Full wizard link */}
      {!allDone && (
        <div className="text-right">
          <Link
            href="/onboarding"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            Open setup wizard →
          </Link>
        </div>
      )}
    </div>
  );
}
