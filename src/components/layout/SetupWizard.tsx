'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, CheckCircle, Building2, Users, Calendar, Zap, ChevronRight, Loader2, Sparkles, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

// Only set when ALL steps complete AND user explicitly closes - never on simple dismiss.
const WIZARD_DONE_KEY  = 'nyxcitadel:setup-wizard-done:v1';
// Per-step completion tracking (preserved across sessions)
const WIZARD_STEPS_KEY = 'nyxcitadel:setup-wizard-completed:v1:completed';
// WelcomeOnboarding sets this when user explicitly dismisses that modal
const WELCOME_SEEN_KEY = 'nyxcitadel:onboarding-seen:v1';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action: {
    label: string;
    href?: string;
    apiEndpoint?: string;
    method?: string;
  };
}

const setupSteps: SetupStep[] = [
  {
    id: 'quick-start',
    title: 'Load Quick-Start Templates',
    description: 'Populate your calendar, policies, and a sample CAP with best-practice compliance templates - ready to customize in minutes.',
    icon: Sparkles,
    action: { label: 'Apply Templates', apiEndpoint: '/api/quick-start', method: 'POST' },
  },
  {
    id: 'facility-info',
    title: 'Complete Facility Profile',
    description: 'Add your facility name, type, and location so Sentry provides compliance guidance specific to your facility type.',
    icon: Building2,
    action: { label: 'Go to Settings', href: '/settings/facility' },
  },
  {
    id: 'team-setup',
    title: 'Invite Your Team',
    description: 'Add team members with roles (Admin, Compliance Officer, Quality Lead) so everyone has the right access level.',
    icon: Users,
    action: { label: 'Manage Users', href: '/settings/users' },
  },
  {
    id: 'compliance-calendar',
    title: 'Build Your Compliance Calendar',
    description: 'Quick-start templates pre-loaded key regulatory events. Customize dates to match your actual survey and review cycle.',
    icon: Calendar,
    action: { label: 'Open Calendar', href: '/calendar' },
  },
  {
    id: 'sentry-intro',
    title: 'Meet Sentry 🤖',
    description: "Ask Sentry to explain a compliance standard or draft a CAP. It learns your facility's context the more you use it.",
    icon: Zap,
    action: { label: 'Open Sentry', href: '/assistant' },
  },
];

export function SetupWizard() {
  const [isOpen, setIsOpen]                 = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loadingStep, setLoadingStep]       = useState<string | null>(null);
  const [stepMessage, setStepMessage]       = useState<{ id: string; text: string; ok: boolean } | null>(null);

  /** Open wizard only if not permanently dismissed. */
  const tryOpen = useCallback(() => {
    if (!window.localStorage.getItem(WIZARD_DONE_KEY)) setIsOpen(true);
  }, []);

  /* ── Initial mount ── */
  useEffect(() => {
    // Load persisted step completions
    try {
      const saved = window.localStorage.getItem(WIZARD_STEPS_KEY);
      if (saved) setCompletedSteps(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }

    // Permanently done? Stop here - don't show wizard.
    if (window.localStorage.getItem(WIZARD_DONE_KEY)) return;

    // Open immediately if WelcomeOnboarding was already dismissed in a prior session
    if (window.localStorage.getItem(WELCOME_SEEN_KEY)) {
      setIsOpen(true);
    } else {
      // First-ever session: WelcomeOnboarding is showing now - wait for it to close first
      const handler = () => setIsOpen(true);
      window.addEventListener('nyx:welcome-done', handler);
      return () => window.removeEventListener('nyx:welcome-done', handler);
    }
  }, []);

  /* ── Allow TopBar "Setup Guide" button to reopen the wizard ── */
  useEffect(() => {
    window.addEventListener('nyx:open-setup-wizard', tryOpen);
    return () => window.removeEventListener('nyx:open-setup-wizard', tryOpen);
  }, [tryOpen]);

  /* ── Step helpers ── */
  const markCompleted = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(stepId);
      window.localStorage.setItem(WIZARD_STEPS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const handleApiStep = useCallback(async (step: SetupStep) => {
    if (!step.action.apiEndpoint || loadingStep) return;
    setLoadingStep(step.id);
    setStepMessage(null);
    try {
      const res  = await fetch(step.action.apiEndpoint, { method: step.action.method ?? 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const msg = data.calendarEventsCreated !== undefined
          ? `Loaded ${data.calendarEventsCreated} calendar events, ${data.policiesCreated} policies, and ${data.capsCreated} CAP - ready to customize.`
          : 'Templates applied successfully.';
        setStepMessage({ id: step.id, text: msg, ok: true });
        markCompleted(step.id);
      } else {
        setStepMessage({ id: step.id, text: data.error ?? 'Something went wrong - try again.', ok: false });
      }
    } catch {
      setStepMessage({ id: step.id, text: 'Network error - check your connection and try again.', ok: false });
    }
    setLoadingStep(null);
  }, [loadingStep, markCompleted]);

  /* ── Dismiss helpers ── */
  /** Close for this session only. Wizard reopens on next page load until all steps done. */
  const closeForSession  = () => setIsOpen(false);
  /** Permanently dismiss. Only called when all steps are complete. */
  const closePermanently = () => {
    setIsOpen(false);
    window.localStorage.setItem(WIZARD_DONE_KEY, 'true');
    window.dispatchEvent(new Event('nyx:setup-wizard-done'));
  };

  const allDone = completedSteps.size >= setupSteps.length;
  const pct     = Math.round((completedSteps.size / setupSteps.length) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* X = session-only dismiss. Wizard reopens next page load if steps remain. */}
        <button
          onClick={closeForSession}
          aria-label="Close setup guide for now"
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">

          {/* ── Header ── */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                allDone
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-teal-500/20 border border-teal-500/30'
              }`}>
                {allDone
                  ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                  : <Zap className="w-6 h-6 text-teal-400" />
                }
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {allDone ? '🎉 Setup Complete!' : 'Quick Setup Guide'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {allDone
                    ? 'Your facility is configured and ready. This guide will not show again.'
                    : `${completedSteps.size} of ${setupSteps.length} steps complete - click any step to continue.`}
                </p>
              </div>
            </div>

            {!allDone && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Setup progress</span>
                  <span className="font-medium text-slate-400">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-600 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Steps ── */}
          {!allDone ? (
            <div className="space-y-2 mb-6">
              {setupSteps.map((step, index) => {
                const done      = completedSteps.has(step.id);
                const isLoading = loadingStep === step.id;
                const isApiStep = !!step.action.apiEndpoint;
                const Icon      = step.icon;

                const cardClass = [
                  'w-full text-left block p-4 rounded-xl border transition-all duration-200 group',
                  done
                    ? 'bg-emerald-500/8 border-emerald-500/25 cursor-default opacity-70'
                    : isLoading
                    ? 'bg-teal-500/8 border-teal-500/30 cursor-wait'
                    : 'bg-white/4 border-slate-700/50 hover:bg-white/8 hover:border-slate-600 cursor-pointer',
                ].join(' ');

                const inner = (
                  <div className="flex items-start gap-4">
                    {/* Step number / checkmark */}
                    <div className="flex-shrink-0 mt-0.5">
                      {done ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${done ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className={`text-sm font-semibold leading-tight ${done ? 'text-emerald-400' : 'text-white'}`}>
                          {step.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                      {stepMessage?.id === step.id && (
                        <p className={`text-xs mt-1.5 font-medium ${stepMessage.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stepMessage.ok ? '✓ ' : '⚠ '}{stepMessage.text}
                        </p>
                      )}
                    </div>

                    {/* Right icon */}
                    <div className="flex-shrink-0 self-center ml-1">
                      {isLoading
                        ? <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                        : <ChevronRight className={`w-4 h-4 transition-colors ${
                            done ? 'text-emerald-600/30' : 'text-slate-600 group-hover:text-slate-400'
                          }`} />
                      }
                    </div>
                  </div>
                );

                if (isApiStep) {
                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={isLoading || done}
                      onClick={() => handleApiStep(step)}
                      className={cardClass}
                    >
                      {inner}
                    </button>
                  );
                }

                return (
                  <Link
                    key={step.id}
                    href={step.action.href!}
                    onClick={() => { markCompleted(step.id); closeForSession(); }}
                    className={cardClass}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-6 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 text-sm font-medium">Facility configured and ready for your team.</p>
              <p className="text-slate-400 text-xs mt-1">Settings and templates can be updated anytime from the sidebar.</p>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex gap-3">
            {allDone ? (
              <button
                onClick={closePermanently}
                className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all"
              >
                Got it - go to dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={closeForSession}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Dismiss for now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = setupSteps.find(s => !completedSteps.has(s.id));
                    if (!next) return;
                    if (next.action.apiEndpoint) {
                      handleApiStep(next);
                    } else {
                      markCompleted(next.id);
                      closeForSession();
                      window.location.href = next.action.href!;
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Continue setup <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
