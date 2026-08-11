'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  ShieldAlert,
  GraduationCap,
  Biohazard,
  HardHat,
  BarChart2,
  PlayCircle,
  ChevronRight,
  Sparkles,
  FileSearch,
  ShieldCheck,
  Building2,
  TrendingUp,
  Rocket,
  Compass,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { startGeniusTour, PERSONA_TOURS } from '@/components/onboarding/GeniusWalkthrough';
import { HospitalROICalculator } from '@/components/marketing/HospitalROICalculator';

const personaCards = [
  {
    key: 'master' as const,
    title: 'Complete Platform Masterclass',
    icon: Rocket,
    badge: '7-Step Tour',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-300',
    btnBg: 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500',
    description: 'The definitive end-to-end guided tour: Dashboard -> Calendar -> Incidents -> Surveys -> Training -> Board Deck -> Sentry AI.',
  },
  {
    key: 'executive' as const,
    title: 'Executive Pitch & Board Report',
    icon: BarChart2,
    badge: '60-Sec Tour',
    color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-300',
    btnBg: 'bg-teal-600 hover:bg-teal-500',
    description: 'High-level compliance index, risk signals, and auto-generated board reports for hospital CEOs & Board Members.',
  },
  {
    key: 'surveyor' as const,
    title: 'Surveyor & TJC/ADHS Audit Readiness',
    icon: FileSearch,
    badge: 'Audit Mode',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300',
    btnBg: 'bg-purple-600 hover:bg-purple-500',
    description: 'Unannounced tracer readiness, regulatory compliance calendar, mock surveys, and document evidence vault.',
  },
  {
    key: 'risk_manager' as const,
    title: 'Risk Manager Daily Workflow',
    icon: ShieldCheck,
    badge: 'Daily Ops',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    btnBg: 'bg-amber-600 hover:bg-amber-500',
    description: 'Incident logging, ADHS sentinel event classification, Root Cause Analyses (RCAs), and CAP closure.',
  },
  {
    key: 'staff' as const,
    title: 'Staff Competency & Environment Safety',
    icon: Building2,
    badge: 'Gatekeeper',
    color: 'from-blue-500/20 to-teal-500/10 border-blue-500/30 text-blue-300',
    btnBg: 'bg-blue-600 hover:bg-blue-500',
    description: 'Mandatory training matrix, automated access gatekeeper, EOC rounding, and emergency preparedness.',
  },
];

const startSteps = [
  {
    step: '01',
    title: 'Check Daily Priorities on Dashboard',
    route: '/dashboard',
    routeLabel: 'Open Dashboard',
    description: 'View the live facility Health Index (94.2%), open Corrective Action Plans (CAPs), and urgent alerts in your Attention Feed.',
  },
  {
    step: '02',
    title: 'Explore Regulatory Deadlines',
    route: '/calendar',
    routeLabel: 'View Calendar',
    description: 'Check pre-mapped compliance windows for Joint Commission, CMS Conditions of Participation, and Arizona ADHS R9-10.',
  },
  {
    step: '03',
    title: 'Log an Incident & Trigger RCA',
    route: '/trackers/incidents',
    routeLabel: 'Test Incident Log',
    description: 'Log a test incident or review sample data to see automated severity classification and ADHS sentinel event flagging in action.',
  },
  {
    step: '04',
    title: 'Run a Mock Survey & Export Board Deck',
    route: '/surveys',
    routeLabel: 'Open Survey Command',
    description: 'Simulate unannounced surveyor tracer rounds, then jump to Board Reports to auto-generate a 1-click executive PDF deck.',
  },
];

const modules = [
  {
    title: 'Daily Operations',
    icon: LayoutDashboard,
    color: 'teal',
    description: 'The core of your daily compliance workflow.',
    bullets: [
      'Dashboard gives you overdue items, open CAPs, and risk signals at a glance',
      'Compliance Calendar tracks every CMS, TJC, ADHS, and QAPI deadline',
      'Log incidents and near-misses, launch RCAs, and close CAPs from one place',
      'QAPI Dashboard and quality metrics for continuous improvement',
    ],
    href: '/dashboard',
    hrefLabel: 'Go to Dashboard',
  },
  {
    title: 'Compliance & Regulatory',
    icon: CalendarDays,
    color: 'purple',
    description: 'Stay ahead of every regulatory requirement.',
    bullets: [
      'Compliance items organized by regulation - CMS CoP, TJC, ADHS',
      'Full reporting suite: HBIPS/ORYX, NHSN, ADHS IR/IAD, JC Sentinel, HCAHPS',
      'Survey management for mock and actual inspections',
      'Regulatory updates feed so you never miss a rule change',
    ],
    href: '/calendar',
    hrefLabel: 'Go to Calendar',
  },
  {
    title: 'Clinical Safety',
    icon: Biohazard,
    color: 'red',
    description: 'Patient safety and clinical compliance in one place.',
    bullets: [
      'Infection control: ICRA, HAI surveillance, outbreak tracking, hand hygiene',
      'Restraint & seclusion log with CMS compliance tracking',
      'HIPAA breach log and Business Associate Agreement tracker',
      'Patient rights: consents, advance directives, involuntary holds (Title 36)',
      'Pharmacy: controlled substances, high-alert meds, PDMP check log',
    ],
    href: '/infection-control',
    hrefLabel: 'Go to Infection Control',
  },
  {
    title: 'Environment & Safety',
    icon: HardHat,
    color: 'amber',
    description: 'Physical environment and emergency preparedness.',
    bullets: [
      'EOC: ligature risk assessments, safety rounds, deficiencies, equipment PM',
      'Emergency management: HVA, drills, EM plans, facility map',
      'Workforce health and OSHA 300 log',
    ],
    href: '/eoc',
    hrefLabel: 'Go to Environment of Care',
  },
  {
    title: 'People & Competency',
    icon: GraduationCap,
    color: 'blue',
    description: 'Staff competency, credentials, and governance.',
    bullets: [
      'Training matrix and competency tracking for all staff',
      'Compliance Gatekeeper: auto-restricts access for overdue mandatory training',
      'Credentialing: provider directory, license tracker, OPPE/FPPE',
      'Governance: committee management and governance documentation',
    ],
    href: '/trackers/training',
    hrefLabel: 'Go to Training',
  },
  {
    title: 'Intelligence & AI',
    icon: BarChart2,
    color: 'emerald',
    description: 'Data-driven insights and executive reporting.',
    bullets: [
      'Board Report auto-generates from live data across the system',
      'Resilience Scorecard and Department Scorecards for leadership review',
      'Sentry AI: ask compliance questions, draft policies, work through CAPs',
    ],
    href: '/board-report',
    hrefLabel: 'Go to Board Report',
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; icon: string }> = {
  teal:    { border: 'border-teal-500/25',    bg: 'bg-teal-500/10',    text: 'text-teal-300',    icon: 'text-teal-400' },
  purple:  { border: 'border-purple-500/25',  bg: 'bg-purple-500/10',  text: 'text-purple-300',  icon: 'text-purple-400' },
  red:     { border: 'border-red-500/25',     bg: 'bg-red-500/10',     text: 'text-red-300',     icon: 'text-red-400' },
  amber:   { border: 'border-amber-500/25',   bg: 'bg-amber-500/10',   text: 'text-amber-300',   icon: 'text-amber-400' },
  blue:    { border: 'border-blue-500/25',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    icon: 'text-blue-400' },
  emerald: { border: 'border-emerald-500/25', bg: 'bg-emerald-500/10', text: 'text-emerald-300', icon: 'text-emerald-400' },
};

export default function WalkthroughPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 py-2">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-cyan-950/80 border border-teal-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Where To Start In NyxCitadel
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Master Interactive Walkthrough & Demo Guide
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              New to NyxCitadel or exploring in Demo Mode? Follow our 4-step quick roadmap below or launch a guided interactive tour with live target highlighting and smart prompts.
            </p>
          </div>

          <button
            onClick={() => startGeniusTour('master')}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm font-extrabold transition-all shadow-xl shadow-teal-900/40 border border-teal-400/30 flex-shrink-0"
          >
            <Rocket className="w-5 h-5 animate-bounce" />
            Launch 7-Step Master Tour
          </button>
        </div>
      </div>

      {/* Recommended Demo Mode Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              Where To Start First (Quick Demo Roadmap)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              The recommended 4-step flow for any hospital risk manager, executive, or surveyor exploring the platform.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {startSteps.map((item) => (
            <div
              key={item.step}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-teal-500/40 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    STEP {item.step}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground/40 group-hover:text-teal-400 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-teal-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              <Link
                href={item.route}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors mt-2"
              >
                {item.routeLabel} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Based Genius Tour Launchers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" /> Choose Persona Guided Tour
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personaCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`bg-card/95 border ${card.color} rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-lg hover:border-teal-500/50 transition-all group`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-teal-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <button
                  onClick={() => startGeniusTour(card.key)}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${card.btnBg} text-white text-xs font-bold transition-all shadow-md mt-2`}
                >
                  <PlayCircle className="w-4 h-4" /> Start {card.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospital ROI Calculator Component */}
      <HospitalROICalculator />

      {/* Module Overview Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-foreground">Explore Platform Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const c = colorMap[mod.color];
            return (
              <div
                key={mod.title}
                className={`bg-card border ${c.border} rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${c.icon}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${c.text}`}>{mod.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{mod.description}</p>
                  </div>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {mod.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${c.icon.replace('text-', 'bg-')}`} />
                      {b}
                    </li>
                  ))}
                </ul>

                <Link
                  href={mod.href}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${c.text} hover:opacity-80 transition-opacity mt-auto`}
                >
                  {mod.hrefLabel} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Nudge */}
      <div className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Ready to experience the AI compliance co-pilot? Press <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">Ctrl+K</kbd> anywhere or open <span className="text-teal-400 font-semibold">Sentry AI</span> in the sidebar.
        </p>
      </div>
    </div>
  );
}
