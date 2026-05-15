import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, ArrowRight, ChevronRight, Play,
  LayoutDashboard, ShieldCheck, AlertTriangle, GraduationCap,
  FileText, BarChart3, Siren, ClipboardList, Sparkles,
  CheckCircle, Radio, Target, HeartPulse, Lock,
} from 'lucide-react';

export const metadata = {
  title: 'Platform Walkthrough | NyxCitadel',
  description: 'See every module in NyxCitadel — compliance command center, incident management, training tracker, QAPI, emergency preparedness, and Sentry AI.',
  openGraph: {
    title: 'NyxCitadel Platform Walkthrough',
    description: 'A guided tour of the full NyxCitadel compliance platform for healthcare organizations.',
    type: 'website',
  },
};

const modules = [
  {
    step: '01',
    icon: LayoutDashboard,
    title: 'Compliance Command Center',
    subtitle: 'Your entire compliance posture at a\u00a0glance',
    color: 'from-teal-500 to-cyan-500',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/8',
    points: [
      'Live compliance score updated in real time across all modules',
      'Attention feed showing overdue items, upcoming deadlines, and open incidents',
      'Regulatory alert banner for CMS, Joint Commission, OSHA, and State DOH changes',
      'Department-level compliance heatmap for leadership',
    ],
  },
  {
    step: '02',
    icon: Radio,
    title: 'Regulatory Intelligence Feed',
    subtitle: 'Know about rule changes before your surveyors\u00a0do',
    color: 'from-rose-500 to-pink-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/8',
    points: [
      'Continuous monitoring of 40+ federal and state agencies',
      'Plain-language summaries of every change with impact severity ratings',
      'One-click linkage to affected policies and procedures in your library',
      'Alert digest emails sent to your compliance team on your schedule',
    ],
  },
  {
    step: '03',
    icon: AlertTriangle,
    title: 'Incident & Occurrence Management',
    subtitle: 'From first report to closed\u00a0finding',
    color: 'from-orange-500 to-amber-500',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/8',
    points: [
      'Structured incident intake form with automatic ADHS/CMS reportability triage',
      'Linked root cause analysis (RCA) workflow with contributing factors',
      'Auto-generated Corrective Action Plan (CAP) with assignees and due dates',
      'State-reportable incidents flagged automatically with submission tracking',
    ],
  },
  {
    step: '04',
    icon: ShieldCheck,
    title: 'Compliance Requirements Tracker',
    subtitle: 'Never miss a regulatory\u00a0obligation',
    color: 'from-blue-500 to-indigo-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/8',
    points: [
      'Full inventory of ADHS, CMS, Joint Commission, OSHA, and State DOH obligations',
      'Due-date tracking with color-coded status (compliant, pending review, non-compliant)',
      'Automated email alerts 30/14/7 days before each deadline',
      'Audit trail of every status change for survey readiness',
    ],
  },
  {
    step: '05',
    icon: FileText,
    title: 'Policy & Procedure Library',
    subtitle: 'Living, version-controlled policy\u00a0management',
    color: 'from-violet-500 to-purple-500',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/8',
    points: [
      'Centralized policy library with version history and change logs',
      'Review cycle tracking — get alerted before a policy expires or goes out of date',
      'Bulk import from CSV or upload existing PDFs',
      'Regulatory body tagging (CMS, ADHS, Joint Commission) for fast survey prep',
    ],
  },
  {
    step: '06',
    icon: GraduationCap,
    title: 'Staff Training & Competency',
    subtitle: 'Full compliance workforce\u00a0visibility',
    color: 'from-green-500 to-emerald-500',
    border: 'border-green-500/30',
    bg: 'bg-green-500/8',
    points: [
      'Training records for every staff member across every required course',
      'Credential and certification expiry tracking with pre-expiry alerts',
      'Bulk CSV import for existing training records',
      'Compliance percentage by department — identify gaps before survey day',
    ],
  },
  {
    step: '07',
    icon: HeartPulse,
    title: 'QAPI & Performance Improvement',
    subtitle: 'Data-driven quality your board will\u00a0trust',
    color: 'from-pink-500 to-rose-500',
    border: 'border-pink-500/30',
    bg: 'bg-pink-500/8',
    points: [
      'CMS-aligned QAPI framework with committee meeting documentation',
      'Performance Improvement Projects (PIPs) with goal tracking and outcome data',
      'Auto-generated board-ready quality dashboards',
      'Trend charts showing improvement over rolling 90-day windows',
    ],
  },
  {
    step: '08',
    icon: Siren,
    title: 'Emergency Preparedness Suite',
    subtitle: 'NIMS/HICS-compliant, always\u00a0audit-ready',
    color: 'from-yellow-500 to-orange-500',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/8',
    points: [
      'Hazard Vulnerability Assessment (HVA) builder with risk scoring',
      'Emergency plan library with version control and annual review tracking',
      'Drill scheduling, completion tracking, and after-action report capture',
      'NIMS/HICS documentation for any survey-level review',
    ],
  },
  {
    step: '09',
    icon: Target,
    title: 'Survey & Plan of Correction',
    subtitle: 'From citation to closure \u2014\u00a0documented',
    color: 'from-cyan-500 to-teal-500',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/8',
    points: [
      'Survey deficiency log with CMS tag, scope, and severity tracking',
      'Plan of Correction (POC) builder with CMS-ready formatted output',
      'Milestone tracking for each POC item with responsible party assignment',
      'Survey history archive for trend analysis across survey cycles',
    ],
  },
  {
    step: '10',
    icon: Sparkles,
    title: 'Sentry™ AI Assistant',
    subtitle: 'Your compliance expert, always\u00a0available',
    color: 'from-teal-400 to-cyan-400',
    border: 'border-teal-400/40',
    bg: 'bg-teal-400/8',
    points: [
      'Ask plain-language questions about CMS, ADHS, Joint Commission standards',
      'Draft CAP language, RCA summaries, and policy update recommendations',
      'Interpret survey citations and suggest corrective actions',
      'Available 24/7 — no more waiting for a consultant to call back',
    ],
  },
  {
    step: '11',
    icon: BarChart3,
    title: 'Executive & Board Reporting',
    subtitle: 'One-click reports that impress surveyors and boards\u00a0alike',
    color: 'from-indigo-500 to-blue-500',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/8',
    points: [
      'Auto-generated compliance scorecards across every regulatory domain',
      'Board-ready dashboards with trends, open findings, and QI highlights',
      'Exportable PDF and CSV reports for any time range',
      'Resilience scoring — a single number that tells leadership how survey-ready you are',
    ],
  },
  {
    step: '12',
    icon: ClipboardList,
    title: 'Grievance & Quality of Care Logs',
    subtitle: 'Patient rights tracked\u00a0end-to-end',
    color: 'from-slate-400 to-slate-500',
    border: 'border-slate-400/30',
    bg: 'bg-slate-400/8',
    points: [
      'Structured grievance intake with required CMS timeframe tracking',
      'Quality of Care (QOC) and Loss of Independence (LOI) event documentation',
      'IR/IAD adverse event log with ADHS submission workflow',
      'Resolution documentation with acknowledgement letter generation',
    ],
  },
];

export default function WalkthroughPage() {
  return (
    <div className="min-h-screen bg-[#060b16] text-white overflow-x-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-teal-700/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-blue-800/12 rounded-full blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.016]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 border-b border-white/6 bg-[#060b16]/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/citadellogo-clean.png"
              alt="NyxCitadel"
              width={36}
              height={36}
              unoptimized
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.includes('/logo-white.svg')) img.src = '/logo-white.svg';
              }}
              className="h-9 w-auto rounded-lg"
            />
            <span className="font-bold text-white text-sm hidden sm:block">NyxCitadel<sup className="text-[9px] font-normal align-super ml-0.5 text-teal-400">™</sup></span>
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)', boxShadow: '0 4px 16px rgba(13,115,119,0.35)' }}
          >
            Request Demo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-300 text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(13,115,119,0.25)]">
            <Play className="w-3.5 h-3.5" />
            Full Platform Tour · 12 Modules
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Everything you need to run{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              a survey-ready facility
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
            Walk through every module in NyxCitadel — from the compliance command center to Sentry AI. See exactly how teams go from scattered spreadsheets to a single source of truth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)', boxShadow: '0 8px 30px rgba(13,115,119,0.4)' }}
            >
              Request a Personalized Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 border border-white/10 hover:border-teal-500/50 rounded-xl font-semibold text-slate-300 hover:text-white transition-all"
            >
              Sign in to your account
            </Link>
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-8 pt-6 border-t border-white/5">
            {[
              { icon: Lock, label: 'HIPAA Encrypted' },
              { icon: ShieldCheck, label: 'BAA Included' },
              { icon: CheckCircle, label: 'CMS Aligned' },
              { icon: CheckCircle, label: 'Joint Commission Ready' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Icon className="w-4 h-4 text-green-400" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-24 space-y-6">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            const isEven = i % 2 === 0;
            return (
              <div
                key={mod.step}
                className={`rounded-2xl border ${mod.border} ${mod.bg} p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start`}
              >
                {/* Step + Icon */}
                <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${mod.color} shadow-lg flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 sm:pl-1">Step {mod.step}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">{mod.title}</h2>
                  <p className="text-sm text-slate-400 mb-4">{mod.subtitle}</p>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {mod.points.map(point => (
                      <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-white/6 bg-gradient-to-b from-transparent to-slate-900/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Ready to see it live with your data?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              Request a personalized{'\u00a0'}demo
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mb-8">
              We'll walk you through every module with real data from facilities like yours — no scripts, no slides. Just the platform doing what it does.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)', boxShadow: '0 8px 30px rgba(13,115,119,0.4)' }}
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 rounded-xl font-semibold text-slate-300 hover:text-white transition-all"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
