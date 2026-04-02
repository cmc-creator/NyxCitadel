'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, Building2, Users, Calendar, Zap, ChevronRight, Sparkles, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'nyxcitadel:setup-wizard-completed:v1';

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
  completed?: boolean;
}

const setupSteps: SetupStep[] = [
  {
    id: 'quick-start',
    title: 'Load Quick-Start Templates',
    description: 'Instantly populate your calendar, policies, and a sample CAP with best-practice compliance templates — ready to customize.',
    icon: Sparkles,
    action: { label: 'Apply Templates', apiEndpoint: '/api/quick-start', method: 'POST' },
  },
  {
    id: 'facility-info',
    title: 'Complete Facility Profile',
    description: 'Add your facility name, type, and location so Sentry can provide contextual compliance guidance.',
    icon: Building2,
    action: { label: 'Go to Settings', href: '/settings/facility' },
  },
  {
    id: 'team-setup',
    title: 'Invite Your Team',
    description: 'Add team members with appropriate roles (Admin, Compliance Officer, Quality Lead, etc.) so everyone has access.',
    icon: Users,
    action: { label: 'Manage Users', href: '/settings/users' },
  },
  {
    id: 'compliance-calendar',
    title: 'Build Your Compliance Calendar',
    description: 'Create a baseline calendar with regulatory deadlines, audit schedules, and review cycles specific to your facility type.',
    icon: Calendar,
    action: { label: 'Open Calendar', href: '/dashboard/calendar' },
  },
  {
    id: 'sentry-intro',
    title: 'Meet Sentry 🤖',
    description: 'Try asking Sentry to draft a CAP or explain a compliance standard. Watch how it learns your facility\'s context.',
    icon: Zap,
    action: { label: 'Open Sentry', href: '/dashboard/assistant' },
  },
];

export function SetupWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  useEffect(() => {
    const hasSeen = window.localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setIsOpen(true);
    }
    
    // Load completed steps from localStorage
    const completed = window.localStorage.getItem(STORAGE_KEY + ':completed');
    if (completed) {
      try {
        setCompletedSteps(new Set(JSON.parse(completed)));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const markCompleted = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    window.localStorage.setItem(STORAGE_KEY + ':completed', JSON.stringify(Array.from(newCompleted)));
  };

  const handleStepClick = (stepId: string) => markCompleted(stepId);

  const handleApiStep = async (step: SetupStep) => {
    if (!step.action.apiEndpoint || loadingStep) return;
    setLoadingStep(step.id);
    try {
      await fetch(step.action.apiEndpoint, { method: step.action.method ?? 'POST' });
    } catch {
      // Best-effort — mark as done regardless
    }
    setLoadingStep(null);
    markCompleted(step.id);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    window.localStorage.setItem(STORAGE_KEY, 'true');
  };

  const progressPercentage = Math.round((completedSteps.size / setupSteps.length) * 100);
  const allStepsCompleted = completedSteps.size === setupSteps.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground/70 hover:text-white hover:bg-white/10 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                allStepsCompleted 
                  ? 'bg-emerald-500/20 border border-emerald-500/30' 
                  : 'bg-teal-500/20 border border-teal-500/30'
              }`}>
                {allStepsCompleted ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Zap className="w-6 h-6 text-teal-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {allStepsCompleted ? '🎉 Setup Complete!' : 'Quick Setup Guide'}
                </h2>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  {allStepsCompleted 
                    ? 'Your facility is ready. Dismiss to visit the dashboard.' 
                    : 'Get your compliance command center up and running in minutes.'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {!allStepsCompleted && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground/70 mb-1">
                  <span>Setup Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Steps */}
          {!allStepsCompleted ? (
            <div className="space-y-3 mb-8">
              {setupSteps.map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                const isLoading = loadingStep === step.id;
                const Icon = step.icon;
                const isApiStep = !!step.action.apiEndpoint;

                const inner = (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-muted-foreground/70">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-muted-foreground/70'}`} />
                        <h3 className={`font-semibold ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground/70 mt-1">{step.description}</p>
                    </div>

                    <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${isLoading ? 'animate-spin text-teal-400' : 'text-slate-500 group-hover:text-muted-foreground/70'}`} />
                  </div>
                );

                const sharedClass = `block p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
                    : 'bg-white/5 border-slate-700/50 hover:bg-white/10 hover:border-slate-600'
                }`;

                if (isApiStep) {
                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleApiStep(step)}
                      className={`w-full text-left ${sharedClass}`}
                    >
                      {inner}
                    </button>
                  );
                }

                return (
                  <Link
                    key={step.id}
                    href={step.action.href!}
                    onClick={() => handleStepClick(step.id)}
                    className={sharedClass}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-8 text-center">
              <p className="text-emerald-400 text-sm leading-relaxed">
                ✓ Your facility profile is now complete and ready for your team. You can always update settings or re-run onboarding steps as your team grows.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 font-medium transition-all"
            >
              {allStepsCompleted ? 'Go to Dashboard' : 'Dismiss for Now'}
            </button>
            {!allStepsCompleted && (
              <button
                type="button"
                onClick={() => {
                  const first = setupSteps.find(s => !completedSteps.has(s.id));
                  if (!first) return;
                  if (first.action.apiEndpoint) {
                    handleApiStep(first);
                  } else if (first.action.href) {
                    handleStepClick(first.id);
                    window.location.href = first.action.href;
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                Start Setup <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
