'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  ShieldAlert,
  GraduationCap,
  Biohazard,
  HardHat,
  UserCheck,
  BarChart2,
  PlayCircle,
  ChevronRight,
} from 'lucide-react';
import { startFeatureTour } from '@/components/onboarding/FeatureTour';

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
      'Compliance items organized by regulation — CMS CoP, TJC, ADHS',
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
    title: 'People',
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
    title: 'Intelligence',
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

const colorMap: Record<string, { border: string; bg: string; text: string; icon: string; btn: string }> = {
  teal:    { border: 'border-teal-500/25',    bg: 'bg-teal-500/10',    text: 'text-teal-300',    icon: 'text-teal-400',    btn: 'bg-teal-600 hover:bg-teal-500' },
  purple:  { border: 'border-purple-500/25',  bg: 'bg-purple-500/10',  text: 'text-purple-300',  icon: 'text-purple-400',  btn: 'bg-purple-600 hover:bg-purple-500' },
  red:     { border: 'border-red-500/25',     bg: 'bg-red-500/10',     text: 'text-red-300',     icon: 'text-red-400',     btn: 'bg-red-700 hover:bg-red-600' },
  amber:   { border: 'border-amber-500/25',   bg: 'bg-amber-500/10',   text: 'text-amber-300',   icon: 'text-amber-400',   btn: 'bg-amber-600 hover:bg-amber-500' },
  blue:    { border: 'border-blue-500/25',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    icon: 'text-blue-400',    btn: 'bg-blue-600 hover:bg-blue-500' },
  emerald: { border: 'border-emerald-500/25', bg: 'bg-emerald-500/10', text: 'text-emerald-300', icon: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500' },
};

export default function WalkthroughPage() {
  useEffect(() => {
    const t = setTimeout(() => startFeatureTour(), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feature Walkthrough</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A guided tour of every module in your compliance command center.
          </p>
        </div>
        <button
          onClick={startFeatureTour}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-sm font-semibold transition-all shadow-lg shadow-teal-900/30 flex-shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          Start Interactive Tour
        </button>
      </div>

      {/* Module cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const c = colorMap[mod.color];
          return (
            <div
              key={mod.title}
              className={`bg-card border ${c.border} rounded-2xl p-6 flex flex-col gap-4`}
            >
              {/* Card header */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                  <h2 className={`text-base font-bold ${c.text}`}>{mod.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-1.5 flex-1">
                {mod.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 ${c.icon.replace('text-', 'bg-')}`} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Go-to link */}
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

      {/* Footer nudge */}
      <p className="text-center text-xs text-muted-foreground/50 pb-4">
        Need help? Open <span className="text-teal-400 font-medium">Sentry AI</span> in the sidebar and ask anything.
      </p>
    </div>
  );
}
