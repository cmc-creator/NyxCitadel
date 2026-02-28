import { auth } from '@/lib/auth';
import Link from 'next/link';
import {
  Shield, AlertTriangle, BarChart3,
  CheckCircle, ArrowRight, Activity,
  Lock, Star, Zap, ChevronRight,
  ClipboardList, TrendingUp, Bell, Users,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Compliance Tracking',
    description: 'Real-time regulatory compliance monitoring with automated alerts for upcoming deadlines and policy reviews.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Management',
    description: 'Proactive risk identification, assessment scoring, and mitigation tracking across every department.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: ClipboardList,
    title: 'Survey & POC',
    description: 'Manage regulatory surveys, plans of correction, and deficiency tracking from citation to resolution.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Activity,
    title: 'QAPI & Quality',
    description: 'Data-driven quality assurance programs, performance improvement projects, and outcome tracking.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Staff & Training',
    description: 'Competency tracking, training compliance, and HR documentation all in one secure location.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Board Reporting',
    description: 'Auto-generated executive dashboards and board reports with the metrics leadership needs at a glance.',
    color: 'from-indigo-500 to-blue-500',
  },
];

const stats = [
  { value: '100%', label: 'HIPAA Compliant' },
  { value: '< 2min', label: 'Avg. Report Generation' },
  { value: '360°', label: 'Compliance Coverage' },
  { value: '24/7', label: 'Audit-Ready Data' },
];

export default async function RootPage() {
  const session = await auth();
  const isLoggedIn  = !!session;
  const portalHref  = isLoggedIn ? '/dashboard' : '/login';
  const portalLabel = isLoggedIn ? 'Go to Dashboard' : 'Platform Login';

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── Animated background glows ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-60 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">NyxCitadel</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#compliance" className="hover:text-white transition-colors">Compliance</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </nav>
          <Link
            href={portalHref}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition-colors"
          >
            {portalLabel} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Built for Long-Term Care &amp; Healthcare Facilities
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Compliance that{' '}
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                protects
              </span>{' '}
              your patients &amp; staff
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              NyxCitadel unifies regulatory compliance, risk management, QAPI,
              emergency preparedness, and survey readiness into a single
              audit-ready platform.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={portalHref}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                Access Your Portal <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 rounded-xl font-medium text-slate-300 hover:text-white transition-all"
              >
                See Features
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/5">
              {[
                { icon: Lock, label: 'HIPAA Secure' },
                { icon: CheckCircle, label: 'SOC 2 Ready' },
                { icon: Star, label: 'CMS Aligned' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Icon className="w-4 h-4 text-green-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative dashboard mockup */}
          <div className="hidden lg:block relative">
            <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-2xl">
              {/* Fake header bar */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-200">Compliance Overview</span>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">● Live</span>
              </div>
              {/* Fake stat cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Open Findings', value: '3', color: 'text-orange-400' },
                  { label: 'Policies Due', value: '7', color: 'text-yellow-400' },
                  { label: 'Training Comp.', value: '94%', color: 'text-green-400' },
                  { label: 'Risk Score', value: 'Low', color: 'text-blue-400' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              {/* Fake recent activity */}
              <div className="space-y-2">
                {[
                  { text: 'Policy POL-2025-0041 approved', time: '2m ago', dot: 'bg-green-400' },
                  { text: 'RCA linked to CAP-2025-0012', time: '1h ago', dot: 'bg-blue-400' },
                  { text: 'Survey Finding #F-0678 resolved', time: '3h ago', dot: 'bg-purple-400' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/3 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                    <span className="text-slate-300 truncate flex-1">{item.text}</span>
                    <span className="text-slate-600 flex-shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating notification card */}
            <div className="absolute -top-6 -right-6 bg-green-500/10 border border-green-500/30 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 text-xs text-green-300 shadow-xl">
              <Bell className="w-3.5 h-3.5" />
              <span className="font-medium">Board report ready</span>
            </div>
            {/* Floating score badge */}
            <div className="absolute -bottom-5 -left-5 bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm rounded-xl p-3 text-xs text-purple-300 shadow-xl">
              <p className="text-slate-400 mb-0.5">Compliance Score</p>
              <p className="text-2xl font-bold text-purple-300">97<span className="text-sm font-normal">/100</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 border-y border-white/5 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything your facility needs,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              unified
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            From daily compliance tasks to executive reporting — one platform,
            zero compliance gaps.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div
              key={f.title}
              className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Compliance Standards Banner ── */}
      <section id="compliance" className="relative z-10 bg-gradient-to-r from-purple-900/40 via-violet-900/40 to-blue-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
            <Lock className="w-3.5 h-3.5" />
            Regulatory Alignment
          </div>
          <h2 className="text-3xl font-bold mb-4">Built for the standards that matter</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-10">
            NyxCitadel is architected around CMS, Joint Commission, and AHCA requirements,
            so your facility is always survey-ready.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['CMS F-Tags', 'The Joint Commission', 'AHCA/NCAL', 'HIPAA Security Rule', 'OSHA', 'State DOH'].map(standard => (
              <div
                key={standard}
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm text-slate-300 font-medium"
              >
                {standard}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-purple-900/50 via-violet-900/50 to-blue-900/50 border border-white/10 rounded-3xl p-12">
          <TrendingUp className="w-10 h-10 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to elevate your compliance program?</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg">
            Sign in to your facility's NyxCitadel portal and take command of compliance.
          </p>
          <Link
            href={portalHref}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-purple-500/30"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Sign In to Your Portal'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-400">NyxCitadel</span>
          </div>
          <p>© {new Date().getFullYear()} NyxCitadel · HIPAA-compliant healthcare compliance platform</p>
          <Link href={portalHref} className="text-slate-400 hover:text-white transition-colors">
            {portalLabel} →
          </Link>
        </div>
      </footer>
    </div>
  );
}

