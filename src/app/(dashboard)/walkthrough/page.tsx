import type { Metadata } from 'next';
import Link from 'next/link';
import { PlayCircle, LayoutDashboard, CalendarDays, ClipboardList, Sparkles, Newspaper, FileBarChart, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Feature Walkthrough | NyxCitadel',
  description: 'A fast tour of NyxCitadel ordered the way an experienced compliance leader would explore the platform.',
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
    accent: 'border-purple-500/25 bg-purple-500/6',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-300',
    num: 'bg-purple-500/20 text-purple-300',
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
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 mb-4">
          <PlayCircle className="w-3.5 h-3.5" />
          Show-and-Tell Walkthrough
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">A fast tour of what matters</h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          Ordered the way an experienced compliance leader would explore the platform &mdash; not by module list.
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
    </div>
  );
}
