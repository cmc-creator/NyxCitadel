import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, LayoutDashboard, CalendarDays, ClipboardList, Sparkles, Newspaper, FileBarChart, ChevronRight, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Feature Walkthrough | NyxCitadel',
  description: 'A fast tour of NyxCitadel ordered the way an experienced compliance leader would explore the platform. Dashboard, Calendar, Trackers, Sentry AI, Regulatory Updates, and Board Report.',
  openGraph: {
    title: 'NyxCitadel Feature Walkthrough',
    description: 'A fast tour of NyxCitadel — ordered the way an experienced compliance leader would explore the platform.',
    type: 'article',
  },
  twitter: { card: 'summary_large_image', title: 'NyxCitadel Feature Walkthrough' },
};

const stops = [
  {
    title: '1. Dashboard: what matters now',
    body: 'Start here every morning. This is your pressure gauge for overdue obligations, open corrective work, training gaps, and compliance heat.',
    href: '/dashboard',
    icon: LayoutDashboard,
    accent: 'border-teal-500/25 bg-teal-500/6',
    iconBg: 'bg-teal-500/15',
    iconColor: 'text-teal-300',
    num: 'bg-teal-500/20 text-teal-300',
  },
  {
    title: '2. Calendar: what is coming next',
    body: 'The calendar translates regulations into dated work. If your team uses one operational clock, it should be this view.',
    href: '/calendar',
    icon: CalendarDays,
    accent: 'border-blue-500/25 bg-blue-500/6',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-300',
    num: 'bg-blue-500/20 text-blue-300',
  },
  {
    title: '3. Trackers: where the work gets done',
    body: 'Incidents, CAPs, grievances, RCA, risk, policies, and training live here. This is the engine room of the app.',
    href: '/trackers/compliance',
    icon: ClipboardList,
    accent: 'border-amber-500/25 bg-amber-500/6',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-300',
    num: 'bg-amber-500/20 text-amber-300',
  },
  {
    title: '4. Sentry: where drafting gets faster',
    body: 'Use the assistant to explain standards, pressure-test your thinking, or draft language. Treat it as a strong analyst, not an unsupervised operator.',
    href: '/assistant',
    icon: Sparkles,
    accent: 'border-teal-500/25 bg-teal-500/6',
    iconBg: 'bg-teal-500/15',
    iconColor: 'text-teal-300',
    num: 'bg-teal-500/20 text-teal-300',
  },
  {
    title: '5. Regulatory Updates: where external change enters',
    body: 'This is the intake stream for outside regulatory movement. It supports awareness and prioritization, but human review still matters.',
    href: '/regulatory-updates',
    icon: Newspaper,
    accent: 'border-emerald-500/25 bg-emerald-500/6',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-300',
    num: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    title: '6. Board Report: where leadership sees the story',
    body: 'This translates operational complexity into executive language. Use it to align the board around exposure, progress, and readiness.',
    href: '/board-report',
    icon: FileBarChart,
    accent: 'border-sky-500/25 bg-sky-500/6',
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-300',
    num: 'bg-sky-500/20 text-sky-300',
  },
];

export default function WalkthroughPage() {
  return (
    <div className="min-h-screen bg-[#060b16] text-white">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-700/14 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-800/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/citadellogo-clean.png"
            alt="NyxCitadel"
            width={40}
            height={40}
            unoptimized
            className="h-10 w-auto rounded-lg flex-shrink-0 drop-shadow-[0_0_12px_rgba(13,115,119,0.45)]"
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm text-white">NyxCitadel<sup className="text-[9px] font-normal text-teal-400">™</sup></span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Healthcare Compliance</span>
          </div>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-white/8 hover:border-white/15 px-3.5 py-2 rounded-xl transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to site
        </Link>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16">
        {/* Hero */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 mb-6">
            <PlayCircle className="w-3.5 h-3.5" />
            Show-and-Tell Walkthrough
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5">A fast tour of what matters</h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            This walkthrough is ordered the way an experienced compliance leader would explore the platform — not by module list.
          </p>
        </div>

        {/* Stop cards */}
        <div className="grid gap-4">
          {stops.map(({ title, body, href, icon: Icon, accent, iconBg, iconColor, num }, index) => (
            <Link key={title} href={href} className={`group rounded-2xl border p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all ${accent}`}>
              <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${num}`}>
                    {index + 1}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1.5">{title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
                </div>
                <div className={`hidden md:flex items-center gap-1.5 text-sm font-semibold ${iconColor} group-hover:text-white transition-colors`}>
                  Open <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA footer */}
        <div className="mt-16 rounded-2xl border border-white/6 bg-slate-900/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Ready to go live?</h2>
            <p className="text-sm text-slate-400">Start your account and your compliance team is operational within the hour.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="text-sm text-slate-400 hover:text-white border border-white/8 hover:border-white/15 px-4 py-2.5 rounded-xl transition-all">
              Back to site
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)' }}
            >
              Request Access <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}