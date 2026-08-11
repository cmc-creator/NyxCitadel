'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileSearch,
  Activity,
  ArrowRight,
  Compass,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
  id: string;
  target: string;
  route: string;
  title: string;
  persona: 'master' | 'executive' | 'surveyor' | 'risk_manager' | 'staff';
  badge?: string;
  description: string;
  actionHint?: string;
  highlightText?: string;
}

export const PERSONA_TOURS = {
  master: {
    id: 'master',
    title: 'Platform Masterclass & Guided Tour',
    subtitle: '7-step complete tour: Dashboard -> Calendar -> Incidents -> Surveys -> Training -> Board Deck -> Sentry AI.',
    icon: Rocket,
    color: 'from-teal-500 to-emerald-500',
    steps: [
      {
        id: 'master-1',
        target: '[data-tour="dashboard"]',
        route: '/dashboard',
        title: '1. Executive Command Center',
        persona: 'master',
        badge: 'Start Here',
        description: 'Welcome to NyxCitadel! The Dashboard gives you immediate visibility into overall facility compliance health. Pay close attention to the live Risk Score, overdue regulatory deadlines, open CAPs, and active alert feeds.',
        actionHint: 'Check the top stats cards and the Attention Feed on the right for urgent priorities.',
      },
      {
        id: 'master-2',
        target: '[data-tour="calendar"]',
        route: '/calendar',
        title: '2. Unified Regulatory Compliance Calendar',
        persona: 'master',
        badge: 'ADHS / CMS / TJC',
        description: 'Never miss a regulatory deadline again. All recurring mandates for Joint Commission, CMS Conditions of Participation, Arizona ADHS R9-10, NFPA 101, and OSHA are pre-mapped into this calendar.',
        actionHint: 'Filter deadlines by regulator (e.g. Joint Commission vs. ADHS) to see active compliance windows.',
      },
      {
        id: 'master-3',
        target: '[data-tour="incidents"]',
        route: '/trackers/incidents',
        title: '3. Risk & Incident Management Engine',
        persona: 'master',
        badge: 'Auto-Sentinel',
        description: 'Log patient safety events, medication errors, and behavioral incidents. System auto-flags ADHS reportable sentinel events and launches mandatory Root Cause Analyses (RCAs) and Corrective Action Plans (CAPs).',
        actionHint: 'Click "Log Incident" or view an open incident to test the automated severity classifier.',
      },
      {
        id: 'master-4',
        target: '[data-tour="surveys"]',
        route: '/surveys',
        title: '4. Survey & Inspection Command (Tracer Mode)',
        persona: 'master',
        badge: 'Zero-Finding Prep',
        description: 'Maintain continuous audit readiness. Track unannounced surveyor visits, conduct internal Mock Surveys with tracer worksheets, and organize evidence documents by TJC standard.',
        actionHint: 'Open "Mock Surveys" to test live surveyor tracer simulations.',
      },
      {
        id: 'master-5',
        target: '[data-tour="training"]',
        route: '/trackers/training',
        title: '5. Workforce Competency & Compliance Gatekeeper',
        persona: 'master',
        badge: 'Automated Lockout',
        description: 'Track mandatory staff training, CPR/CPI certs, and medical licenses. The automated Compliance Gatekeeper flags non-compliant personnel before shift scheduling.',
        actionHint: 'Check the Compliance Gatekeeper tab to see staff with expiring certs.',
      },
      {
        id: 'master-6',
        target: '[data-tour="board-report"]',
        route: '/board-report',
        title: '6. Automated Executive Board Report Deck',
        persona: 'master',
        badge: '1-Click Export',
        description: 'Save 20+ hours of manual board deck preparation. NyxCitadel aggregates real-time metrics into a clean, executive-ready PDF report for hospital leadership and board meetings.',
        actionHint: 'Click "Export Report" to generate a live PDF or share the executive portal link.',
      },
      {
        id: 'master-7',
        target: '[data-tour="sentry"]',
        route: '/assistant',
        title: '7. Sentry AI Compliance Co-Pilot',
        persona: 'master',
        badge: 'AI Co-Pilot',
        description: 'Your 24/7 regulatory intelligence co-pilot. Ask Sentry AI questions like "Summarize our top 3 Joint Commission vulnerabilities" or "Draft a Plan of Correction for CMS 482.13(e)".',
        actionHint: 'Type any question or click a suggested prompt to see Sentry draft policies and CAPs in seconds.',
      },
    ],
  },
  executive: {
    id: 'executive',
    title: '60-Second Executive Pitch',
    subtitle: 'High-level compliance index, risk signals, and board-ready metrics.',
    icon: Activity,
    color: 'from-teal-500 to-cyan-500',
    steps: [
      {
        id: 'exec-1',
        target: '[data-tour="dashboard"]',
        route: '/dashboard',
        title: 'Real-Time Compliance Command Center',
        persona: 'executive',
        badge: 'Executive View',
        description: 'See facility compliance health instantly. Track open Corrective Action Plans (CAPs), overdue regulatory deadlines, and active risk signals in one central dashboard.',
        actionHint: 'Notice the live risk score breakdown and facility health index.',
      },
      {
        id: 'exec-2',
        target: '[data-tour="board-report"]',
        route: '/board-report',
        title: 'Auto-Generated Executive Board Report',
        persona: 'executive',
        badge: '1-Click Export',
        description: 'Never spend 20 hours preparing quarterly board decks manually. NyxCitadel aggregates real-time data across incidents, quality metrics, and training into a board-ready report.',
        actionHint: 'Export directly to PDF or share live executive link with leadership.',
      },
      {
        id: 'exec-3',
        target: '[data-tour="sentry"]',
        route: '/assistant',
        title: 'Sentry AI Executive Assistant',
        persona: 'executive',
        badge: 'AI Powered',
        description: 'Ask Sentry AI high-level risk questions like "Summarize our top 3 Joint Commission vulnerabilities this quarter" and receive instant, cited regulatory insights.',
        actionHint: 'Type or click any suggested prompt to see Sentry in action.',
      },
    ],
  },
  surveyor: {
    id: 'surveyor',
    title: 'Surveyor & TJC/ADHS Audit Readiness',
    subtitle: 'Demonstrate zero-finding audit preparedness to state and national surveyors.',
    icon: FileSearch,
    color: 'from-purple-500 to-indigo-500',
    steps: [
      {
        id: 'surv-1',
        target: '[data-tour="calendar"]',
        route: '/calendar',
        title: 'Unified Regulatory Compliance Calendar',
        persona: 'surveyor',
        badge: 'ADHS / CMS / TJC',
        description: 'Every recurring deadline pre-mapped for Joint Commission, CMS CoPs, ADHS R9-10, NFPA 101, and OSHA. Color-coded by regulatory standard and urgency.',
        actionHint: 'Filter by Joint Commission or Arizona ADHS with one click.',
      },
      {
        id: 'surv-2',
        target: '[data-tour="surveys"]',
        route: '/surveys',
        title: 'Mock Surveys & Inspection Command',
        persona: 'surveyor',
        badge: 'Tracer Ready',
        description: 'Log mock surveys, track surveyor citations from past visits, and maintain complete audit trails with attached evidence documents ready for immediate presentation.',
        actionHint: 'Open Mock Survey Tracer Mode to simulate an actual unannounced survey.',
      },
      {
        id: 'surv-3',
        target: '[data-tour="sentry"]',
        route: '/assistant',
        title: 'Instant Regulatory Standards Lookup',
        persona: 'surveyor',
        badge: 'AI Reference',
        description: 'Use Sentry AI to cross-reference TJC standards against ADHS R9-10 and CMS CoPs instantly during survey tracer rounds.',
        actionHint: 'Ask Sentry to look up any specific tag code like CMS 482.13(e).',
      },
    ],
  },
  risk_manager: {
    id: 'risk_manager',
    title: 'Risk Manager Daily Workflow',
    subtitle: 'From incident filing to Root Cause Analysis (RCA) and CAP closure.',
    icon: ShieldCheck,
    color: 'from-amber-500 to-orange-500',
    steps: [
      {
        id: 'risk-1',
        target: '[data-tour="incidents"]',
        route: '/trackers/incidents',
        title: 'Incident & Adverse Event Tracking',
        persona: 'risk_manager',
        badge: 'AZ ADHS Sentinel',
        description: 'Log patient safety incidents, restraint/seclusion events, or medication errors. Auto-flags state-reportable sentinel events according to Arizona ADHS rules.',
        actionHint: 'Click "Log Incident" to test the automated severity classifier.',
      },
      {
        id: 'risk-2',
        target: '[data-tour="eoc"]',
        route: '/eoc',
        title: 'Environment of Care & Ligature Risk',
        persona: 'risk_manager',
        badge: 'Facility Safety',
        description: 'Track ligature risk assessments, safety rounds, and equipment preventative maintenance to meet TJC EC standards.',
        actionHint: 'Inspect open ligature risk items and mitigation timelines.',
      },
      {
        id: 'risk-3',
        target: '[data-tour="board-report"]',
        route: '/board-report',
        title: 'Root Cause Analysis & CAP Tracking',
        persona: 'risk_manager',
        badge: 'Accountability',
        description: 'Assign corrective action items to department owners with mandatory due dates, escalation paths, and verification sign-offs before closure.',
        actionHint: 'Filter CAPs by open status to view items needing immediate sign-off.',
      },
    ],
  },
  staff: {
    id: 'staff',
    title: 'Staff Competency & Environment of Care',
    subtitle: 'Workforce compliance gatekeeper and physical facility safety.',
    icon: Building2,
    color: 'from-blue-500 to-teal-500',
    steps: [
      {
        id: 'staff-1',
        target: '[data-tour="training"]',
        route: '/trackers/training',
        title: 'Workforce Training & Compliance Gatekeeper',
        persona: 'staff',
        badge: 'Automated Lockout',
        description: 'Track annual mandatory training, CPR/CPI certs, and license renewals. The compliance gatekeeper automatically flags non-compliant personnel before shift start.',
        actionHint: 'View department completion rates across clinical and administrative staff.',
      },
      {
        id: 'staff-2',
        target: '[data-tour="infection-control"]',
        route: '/infection-control',
        title: 'Infection Prevention & Surveillance',
        persona: 'staff',
        badge: 'CMS / CDC',
        description: 'Monitor ICRA risk assessments, hand hygiene observations, and outbreak tracking across patient units.',
        actionHint: 'Check recent hand hygiene compliance percentages.',
      },
    ],
  },
};

export function startGeniusTour(persona: keyof typeof PERSONA_TOURS = 'master') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nyx:start-genius-tour', { detail: { persona } })
    );
  }
}

export function GeniusWalkthrough() {
  const router = useRouter();
  const pathname = usePathname();

  const [activePersona, setActivePersona] = useState<keyof typeof PERSONA_TOURS | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Listen for start event
  useEffect(() => {
    const handleStart = (e: Event) => {
      const customEvent = e as CustomEvent<{ persona?: keyof typeof PERSONA_TOURS }>;
      const personaKey = customEvent.detail?.persona || 'master';
      setActivePersona(personaKey);
      setStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('nyx:start-genius-tour', handleStart);
    return () => window.removeEventListener('nyx:start-genius-tour', handleStart);
  }, []);

  const tour = activePersona ? PERSONA_TOURS[activePersona] : null;
  const currentStep = tour ? tour.steps[stepIndex] : null;

  // Handle step change & page routing
  const navigateToStep = useCallback((step: TourStep) => {
    if (pathname !== step.route) {
      router.push(step.route);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Route check
    if (pathname !== currentStep.route) {
      navigateToStep(currentStep);
    }

    // Find target element with retries
    let attempts = 0;
    const updatePosition = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        setHighlightRect(el.getBoundingClientRect());
      } else if (attempts < 10) {
        attempts++;
        setTimeout(updatePosition, 150);
      } else {
        setHighlightRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, currentStep, pathname, navigateToStep]);

  if (!isOpen || !tour || !currentStep) return null;

  const totalSteps = tour.steps.length;
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  const handleNext = () => {
    if (isLast) {
      setIsOpen(false);
    } else {
      const nextStep = tour.steps[stepIndex + 1];
      setStepIndex((prev) => prev + 1);
      navigateToStep(nextStep);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      const prevStep = tour.steps[stepIndex - 1];
      setStepIndex((prev) => prev - 1);
      navigateToStep(prevStep);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-4 md:p-8">
      {/* Background Dim */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" />

      {/* Target Highlight Overlay */}
      {highlightRect && (
        <div
          className="fixed pointer-events-none ring-4 ring-teal-400 ring-offset-2 ring-offset-background rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.5)] z-50"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
          }}
        />
      )}

      {/* Floating Guided Card */}
      <div className="relative z-50 max-w-xl mx-auto w-full bg-card/95 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-6 duration-300">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  {tour.title}
                </span>
                {currentStep.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {currentStep.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Step {stepIndex + 1} of {totalSteps}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
            title="Exit tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            {currentStep.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStep.description}
          </p>

          {currentStep.actionHint && (
            <div className="flex items-start gap-2 bg-teal-950/30 border border-teal-700/30 rounded-xl p-3 text-xs text-teal-300">
              <Compass className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>{currentStep.actionHint}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={isFirst}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              isFirst
                ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
                : 'border-border hover:bg-muted text-foreground'
            )}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-900/30"
            >
              {isLast ? 'Complete Tour' : 'Next Stop'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
