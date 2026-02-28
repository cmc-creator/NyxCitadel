import { auth } from '@/lib/auth';
import Link from 'next/link';
import {
  Shield, AlertTriangle, BarChart3, CheckCircle, ArrowRight, Activity,
  Lock, Star, Zap, ChevronRight, ClipboardList, TrendingUp, Bell, Users,
  Radio, BookOpen, Newspaper, RefreshCw, Award, Target, HeartPulse,
  FileCheck, Siren, BrainCircuit, Sparkles, Globe, BadgeCheck,
} from 'lucide-react';

const features = [
  {
    icon: Radio,
    title: 'Live Regulatory Intelligence',
    description:
      'NyxCitadel monitors CMS, Joint Commission, AHCA, OSHA, and State DOH rule changes in real time — and instantly alerts your team before a deadline hits.',
    color: 'from-rose-500 to-pink-500',
    badge: 'Always Current',
  },
  {
    icon: Shield,
    title: 'Compliance Command Center',
    description:
      'Policies, procedures, audit calendars, and compliance obligations all in one place. Know your status across every regulatory domain at a glance — 24/7.',
    color: 'from-blue-500 to-cyan-500',
    badge: '360° Coverage',
  },
  {
    icon: AlertTriangle,
    title: 'Enterprise Risk Management',
    description:
      'Quantify, prioritize, and track every risk across every department. Automated scoring matrices surface your highest-threat vulnerabilities before they escalate.',
    color: 'from-orange-500 to-amber-500',
    badge: 'Proactive',
  },
  {
    icon: ClipboardList,
    title: 'Survey & Plan of Correction',
    description:
      'From first citation to final closure. Track every deficiency, assign CAPs, manage POCs, and generate CMS-ready response documents in minutes.',
    color: 'from-purple-500 to-violet-500',
    badge: 'Survey Ready',
  },
  {
    icon: Activity,
    title: 'QAPI & Performance Improvement',
    description:
      'Transform raw outcomes data into actionable PIPs. Built-in QAPI framework supports CMS-required quality assurance with dashboards leadership will love.',
    color: 'from-green-500 to-emerald-500',
    badge: 'Data Driven',
  },
  {
    icon: HeartPulse,
    title: 'Incident & Root Cause Analysis',
    description:
      'Capture incidents, drive thorough RCAs, and close the loop with corrective action plans — turning every adverse event into a lasting quality improvement.',
    color: 'from-red-500 to-rose-500',
    badge: 'Zero Miss',
  },
  {
    icon: Users,
    title: 'Staff Training & Competency',
    description:
      'Track every required training, competency validation, and credential expiry. Auto-alerts fire before someone falls out of compliance — no spreadsheets needed.',
    color: 'from-pink-500 to-rose-500',
    badge: 'HR Integrated',
  },
  {
    icon: BarChart3,
    title: 'Executive & Board Reporting',
    description:
      'Auto-generated board-level dashboards pull live data from every module. Impress surveyors and leadership with a unified compliance scorecard.',
    color: 'from-indigo-500 to-blue-500',
    badge: 'One Click',
  },
  {
    icon: Siren,
    title: 'Emergency Preparedness',
    description:
      'HVAs, emergency plans, drill scheduling, and after-action reviews — all documented, tracked, and NIMS/HICS-compliant for any survey.',
    color: 'from-yellow-500 to-orange-500',
    badge: 'Always Ready',
  },
];

const regulatoryFeeds = [
  { agency: 'CMS', text: 'New F-Tag interpretive guidance update detected — F0600 revised', time: 'Just now', color: 'text-red-400', dot: 'bg-red-400' },
  { agency: 'OSHA', text: 'Bloodborne pathogen standard training window reminder — 30 days', time: '1h ago', color: 'text-orange-400', dot: 'bg-orange-400' },
  { agency: 'Joint Commission', text: 'NPSG.07.01 hand hygiene compliance threshold updated', time: '3h ago', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { agency: 'State DOH', text: 'State survey protocol for infection control revised statewide', time: '1d ago', color: 'text-blue-400', dot: 'bg-blue-400' },
  { agency: 'AHCA', text: 'PDPM billing guidance clarification memo published', time: '2d ago', color: 'text-purple-400', dot: 'bg-purple-400' },
];

const stats = [
  { value: '100%', label: 'HIPAA Compliant', sub: 'End-to-end encrypted' },
  { value: '40+', label: 'Regulatory Agencies', sub: 'Monitored continuously' },
  { value: '< 2min', label: 'Board Report', sub: 'From zero to delivered' },
  { value: 'Real-Time', label: 'Regulatory Alerts', sub: 'Before deadlines hit' },
];

const painPoints = [
  {
    icon: Newspaper,
    title: 'Standards Change. We Track Them.',
    body: "CMS rewrites F-Tags. The Joint Commission revises NPSGs. OSHA updates HAZMAT rules. State DOH shifts infection protocols overnight. Most facilities find out from surveyors — NyxCitadel tells you first, with context and action steps built in.",
  },
  {
    icon: BrainCircuit,
    title: 'Turn Complexity Into Clarity.',
    body: "Healthcare compliance isn't one regulation — it's hundreds, overlapping, constantly evolving. NyxCitadel maps every obligation to every department, every deadline to every owner, and every gap to an automated alert.",
  },
  {
    icon: Target,
    title: "Quality Isn't Optional. Neither Is Proof.",
    body: "QAPI isn't a checkbox — it's the engine of patient safety. NyxCitadel gives your Quality team real data, real PIPs, and real evidence that your facility is not just meeting standards but exceeding them.",
  },
];

export default async function RootPage() {
  const session     = await auth();
  const isLoggedIn  = !!session;
  const portalHref  = isLoggedIn ? '/dashboard' : '/login';
  const portalLabel = isLoggedIn ? 'Go to Dashboard' : 'Platform Login';

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── Multi-layer background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[900px] h-[900px] bg-purple-700/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-80 w-[700px] h-[700px] bg-blue-700/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-700/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-700/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-20 border-b border-white/5 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">NyxCitadel</span>
              <span className="hidden sm:inline text-slate-600 text-xs ml-2">Healthcare Compliance Platform</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#intel" className="hover:text-white transition-colors">Reg. Intelligence</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#quality" className="hover:text-white transition-colors">Quality &amp; Risk</a>
            <a href="#compliance" className="hover:text-white transition-colors">Standards</a>
          </nav>
          <Link
            href={portalHref}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-900/40"
          >
            {portalLabel} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              The Only Healthcare Compliance Platform That Never Sleeps
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
              Stop Chasing{' '}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                Regulations.
              </span>
              <br />
              Let NyxCitadel{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Chase Them For You.
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-3 max-w-xl">
              Every CMS update. Every Joint Commission revision. Every OSHA rule change.
              Every State DOH memo.{' '}
              <strong className="text-white">
                NyxCitadel tracks them all — automatically — and tells your team exactly what
                to do before a surveyor ever walks through your door.
              </strong>
            </p>
            <p className="text-base text-slate-400 leading-relaxed mb-8 max-w-xl">
              Built from the ground up for long-term care, skilled nursing, and healthcare
              facilities that refuse to be caught off guard.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={portalHref}
                className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl font-bold text-lg transition-all shadow-xl shadow-purple-900/40 hover:shadow-purple-700/40 hover:-translate-y-0.5"
              >
                Access Your Portal <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#intel"
                className="flex items-center gap-2 px-7 py-3.5 border border-white/10 hover:border-purple-500/50 rounded-xl font-semibold text-slate-300 hover:text-white transition-all hover:-translate-y-0.5"
              >
                See Regulatory Intelligence
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-10 pt-8 border-t border-white/5">
              {[
                { icon: Lock,        label: 'HIPAA Encrypted' },
                { icon: CheckCircle, label: 'SOC 2 Ready' },
                { icon: Star,        label: 'CMS Aligned' },
                { icon: BadgeCheck,  label: 'Joint Commission Ready' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Icon className="w-4 h-4 text-green-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — live dashboard mockup */}
          <div className="hidden lg:block relative mt-4">
            <div className="relative bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-bold text-white">Compliance Command Center</span>
                <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Open Findings',   value: '3',   color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                  { label: 'Policies Due',    value: '7',   color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                  { label: 'Training Comp.',  value: '96%', color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20'  },
                  { label: 'Compliance Score',value: '97',  color: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/20' },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl p-3 border ${item.bg}`}>
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Regulatory Feed</p>
                {regulatoryFeeds.slice(0, 3).map(item => (
                  <div key={item.text} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/3 border border-white/5 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${item.dot}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`font-bold ${item.color}`}>{item.agency} · </span>
                      <span className="text-slate-300">{item.text}</span>
                    </div>
                    <span className="text-slate-600 flex-shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-7 -right-4 bg-red-500/10 border border-red-500/30 backdrop-blur-sm rounded-xl p-3 shadow-2xl max-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-bold text-red-300">Reg Alert</span>
              </div>
              <p className="text-[11px] text-slate-300">CMS updated F0880 infection control requirements</p>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm rounded-xl p-3.5 shadow-2xl">
              <p className="text-xs text-slate-500 mb-0.5">Facility Risk Level</p>
              <p className="text-3xl font-extrabold text-violet-300">Low <span className="text-base font-normal text-slate-500">Risk</span></p>
              <p className="text-[11px] text-green-400 mt-0.5">↓ Improved this quarter</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS BAR
      ══════════════════════════════ */}
      <section className="relative z-10 border-y border-white/5 bg-gradient-to-r from-slate-900/80 via-purple-950/30 to-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center px-2">
              <p className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent mb-1">
                {s.value}
              </p>
              <p className="text-sm font-semibold text-slate-300">{s.label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          REGULATORY INTELLIGENCE
      ══════════════════════════════ */}
      <section id="intel" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-semibold mb-6">
              <Radio className="w-3.5 h-3.5" />
              Live Regulatory Intelligence Engine
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
              The rules change{' '}
              <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                constantly.
              </span>
              <br />We track every single one.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Healthcare regulations don&apos;t sit still. CMS rewrites interpretive guidelines.
              The Joint Commission shifts National Patient Safety Goals. OSHA updates exposure
              standards. State surveyors change what they&apos;re looking for — sometimes overnight.
            </p>
            <p className="text-base text-slate-400 leading-relaxed mb-8">
              <strong className="text-white">
                NyxCitadel&apos;s regulatory intelligence engine monitors every major governing body
                and delivers actionable change notifications directly to your compliance team
              </strong>{' '}
              — complete with impact assessments, affected policies, and recommended response deadlines.
            </p>
            <div className="space-y-3">
              {[
                'Automatic alerts when CMS F-Tags are revised or reinterpreted',
                'Joint Commission NPSG & standard change tracking',
                'OSHA, EPA, and federal healthcare rule monitoring',
                'State DOH survey protocol and licensing updates',
                'HIPAA, HITECH, and privacy regulation change notices',
                'AHCA/NCAL guidance memos and industry bulletins',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">Regulatory Change Feed</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Monitoring 40+ agencies
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {regulatoryFeeds.map(item => (
                <div key={item.text} className="px-5 py-4 hover:bg-white/2 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${item.color}`}>
                      {item.agency}
                    </span>
                    <span className="text-xs text-slate-600">{item.time}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-snug">{item.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-purple-400 cursor-pointer hover:text-purple-300">View affected policies →</span>
                    <span className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">Create action item →</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-purple-500/5 border-t border-purple-500/10 text-center">
              <span className="text-xs text-purple-400 font-medium">+ 847 historical regulatory changes tracked this year</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          WHY NYXCITADEL
      ══════════════════════════════ */}
      <section id="quality" className="relative z-10 border-y border-white/5 bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-6">
              <BrainCircuit className="w-3.5 h-3.5" />
              Built for Quality &amp; Risk Professionals
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-5">
              The unfair advantage{' '}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                your facility deserves
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Healthcare compliance is a team sport — and right now, most facilities are playing it
              with spreadsheets, sticky notes, and crossed fingers. NyxCitadel changes that entirely.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {painPoints.map(p => (
              <div key={p.title} className="relative bg-slate-900/60 border border-white/8 rounded-2xl p-8 hover:border-purple-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center mb-5">
                  <p.icon className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                <p className="text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURES GRID
      ══════════════════════════════ */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-5">
            Every tool your compliance team needs.{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Unified.
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Nine fully-integrated modules covering every corner of healthcare compliance —
            from the exam room to the boardroom.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div
              key={f.title}
              className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/15 transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                  {f.badge}
                </span>
              </div>
              <h3 className="font-bold text-white mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          QUALITY + RISK SPOTLIGHT
      ══════════════════════════════ */}
      <section className="relative z-10 border-y border-white/5 bg-gradient-to-r from-green-950/20 via-emerald-950/10 to-blue-950/20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-semibold mb-6">
                <HeartPulse className="w-3.5 h-3.5" />
                QAPI &amp; Risk Management
              </div>
              <h2 className="text-4xl font-extrabold leading-tight mb-5">
                Quality isn&apos;t a report.{' '}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  It&apos;s a culture.
                </span>{' '}
                We help you build it.
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                NyxCitadel&apos;s QAPI module isn&apos;t a form — it&apos;s a full continuous quality improvement
                engine. Identify root causes. Launch targeted PIPs. Measure outcomes. Close the loop.
                Repeat. Every quarter, your metrics improve — and you have the data to prove it.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                On the risk side, our enterprise risk management module gives you a living, breathing
                risk register — with automated likelihood/severity scoring, mitigation tracking, and
                real-time risk posture across every department. Stop finding out about risks from
                incidents. Start eliminating them before they happen.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Activity,   label: 'Live QAPI Dashboard',    desc: 'PIPs, outcomes, and QMs in one view' },
                  { icon: Target,     label: 'Risk Scoring Matrix',     desc: 'Quantified, prioritized, tracked' },
                  { icon: RefreshCw,  label: 'Continuous Improvement',  desc: 'PDSA cycle built in' },
                  { icon: Award,      label: 'Outcome Benchmarking',    desc: 'Compare against industry peers' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="bg-white/3 border border-white/5 rounded-xl p-4">
                    <Icon className="w-4 h-4 text-green-400 mb-2" />
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-green-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">QAPI Performance Indicators</span>
                  <span className="text-xs text-green-400">Q1 2026</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Pressure Injury Rate',     value: '1.2%',  trend: '↓ 0.4%', good: true,  bar: 'w-[12%]' },
                    { label: 'Rehospitalization Rate',   value: '9.8%',  trend: '↓ 1.1%', good: true,  bar: 'w-[40%]' },
                    { label: 'Fall w/ Injury Rate',      value: '2.1%',  trend: '↔ 0.0%', good: false, bar: 'w-[21%]' },
                    { label: 'Infection Control Comp.',  value: '98.7%', trend: '↑ 2.3%', good: true,  bar: 'w-[98%]' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">{m.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{m.value}</span>
                          <span className={`font-medium ${m.good ? 'text-green-400' : 'text-yellow-400'}`}>{m.trend}</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className={`${m.bar} h-1.5 rounded-full ${m.good ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-yellow-500 to-amber-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/80 border border-orange-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">Enterprise Risk Register</span>
                  <span className="text-xs text-orange-400">3 High-Priority</span>
                </div>
                <div className="space-y-2">
                  {[
                    { risk: 'Medication reconciliation gaps',         score: 'HIGH', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
                    { risk: 'Staff competency documentation lag',     score: 'MED',  color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
                    { risk: 'Elopement prevention protocol review',   score: 'HIGH', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
                    { risk: 'Emergency generator test overdue',       score: 'LOW',  color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                  ].map(r => (
                    <div key={r.risk} className="flex items-center justify-between p-2.5 bg-white/3 rounded-lg">
                      <span className="text-xs text-slate-300">{r.risk}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.color}`}>{r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STANDARDS SECTION
      ══════════════════════════════ */}
      <section id="compliance" className="relative z-10 bg-gradient-to-r from-blue-950/30 via-violet-950/30 to-purple-950/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-6">
            <Lock className="w-3.5 h-3.5" />
            Deep Regulatory Alignment
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
            Every standard. Every agency.
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Every time.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12 text-lg">
            NyxCitadel isn&apos;t built around one regulation — it&apos;s built around the entire
            regulatory universe your facility operates within. If it affects your survey
            readiness, we cover it.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-12">
            {[
              'CMS Conditions of Participation',
              'CMS F-Tag Interpretive Guidelines',
              'The Joint Commission Standards',
              'AHCA/NCAL Requirements',
              'HIPAA Security & Privacy Rule',
              'OSHA Healthcare Standards',
              'NIMS/HICS Emergency Protocols',
              'State DOH Survey Protocols',
              'CDC Infection Control Guidance',
              'PDPM & Billing Compliance',
              'QAPI Federal Requirements',
              'ADA & Civil Rights Standards',
            ].map(standard => (
              <div
                key={standard}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/8 bg-white/3 text-xs text-slate-300 font-medium text-left hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                {standard}
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <RefreshCw className="w-4 h-4" />
            All standards monitored for updates automatically — no manual tracking required
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FINAL CTA
      ══════════════════════════════ */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-28 text-center">
        <div className="relative bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-blue-900/60 border border-white/10 rounded-3xl p-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-5">
              Your next survey is coming.{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Are you ready?
              </span>
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-4 text-lg leading-relaxed">
              Surveyors don&apos;t telegraph their visits. Regulations don&apos;t wait for a convenient time.
              Incidents don&apos;t schedule themselves. But with NyxCitadel, your facility is always
              prepared — because preparation is built into every single day.
            </p>
            <p className="text-slate-400 max-w-xl mx-auto mb-10">
              Join the healthcare facilities that have turned compliance from a crisis response
              into a competitive advantage.
            </p>
            <Link
              href={portalHref}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-2xl font-bold text-xl transition-all shadow-2xl shadow-purple-900/50 hover:shadow-purple-700/50 hover:-translate-y-1"
            >
              {isLoggedIn ? 'Go to Your Dashboard' : 'Sign In & Take Command'} <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-8 border-t border-white/10">
              {[
                { icon: Lock,       label: 'HIPAA Encrypted' },
                { icon: CheckCircle,label: 'Audit-Ready 24/7' },
                { icon: Zap,        label: 'Real-Time Alerts' },
                { icon: TrendingUp, label: 'Continuous Improvement' },
                { icon: Award,      label: 'Survey Confidence' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                  <Icon className="w-4 h-4 text-green-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-400">NyxCitadel</span>
              <span className="text-slate-700 ml-2 hidden sm:inline">· Healthcare Compliance &amp; Risk Management Platform</span>
            </div>
          </div>
          <p>© {new Date().getFullYear()} NyxCitadel · HIPAA-compliant · Survey-ready · Always current</p>
          <Link href={portalHref} className="text-slate-500 hover:text-white transition-colors font-medium">
            {portalLabel} →
          </Link>
        </div>
      </footer>
    </div>
  );
}

