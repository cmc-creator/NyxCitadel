import Link from 'next/link';
import { PlayCircle, LayoutDashboard, CalendarDays, ClipboardList, Sparkles, Newspaper, FileBarChart, ChevronRight } from 'lucide-react';

export const metadata = { title: 'Feature Walkthrough' };

const stops = [
  {
    title: '1. Dashboard: what matters now',
    body: 'Start here every morning. This is your pressure gauge for overdue obligations, open corrective work, training gaps, and compliance heat.',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '2. Calendar: what is coming next',
    body: 'The calendar translates regulations into dated work. If your team uses one operational clock, it should be this view.',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    title: '3. Trackers: where the work gets done',
    body: 'Incidents, CAPs, grievances, RCA, risk, policies, and training live here. This is the engine room of the app.',
    href: '/trackers/compliance',
    icon: ClipboardList,
  },
  {
    title: '4. Sentry: where drafting gets faster',
    body: 'Use the assistant to explain standards, pressure-test your thinking, or draft language. Treat it as a strong analyst, not an unsupervised operator.',
    href: '/assistant',
    icon: Sparkles,
  },
  {
    title: '5. Regulatory Updates: where external change enters',
    body: 'This is the intake stream for outside regulatory movement. It supports awareness and prioritization, but human review still matters.',
    href: '/regulatory-updates',
    icon: Newspaper,
  },
  {
    title: '6. Board Report: where leadership sees the story',
    body: 'This translates operational complexity into executive language. Use it to align the board around exposure, progress, and readiness.',
    href: '/board-report',
    icon: FileBarChart,
  },
];

export default function WalkthroughPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 mb-6">
            <PlayCircle className="w-3.5 h-3.5" />
            Show-and-Tell Walkthrough
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">A fast tour of what matters</h1>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            This walkthrough is ordered the way an experienced compliance leader would explore the platform, not by module list.
          </p>
        </div>

        <div className="mt-12 grid gap-5">
          {stops.map(({ title, body, href, icon: Icon }) => (
            <Link key={title} href={href} className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
              <div className="grid md:grid-cols-[auto_1fr_auto] gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-3xl">{body}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 group-hover:text-white transition">
                  Open
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}