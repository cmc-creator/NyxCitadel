import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, ClipboardList, FileText, AlertTriangle, 
  Flame, CheckSquare, BookOpen, ArrowRight, Sparkles 
} from 'lucide-react';

export const metadata = { title: 'Dashboard | NyxCitadel' };

const QUICK_START = [
  {
    icon: AlertTriangle,
    title: 'Log Incidents',
    desc: 'Report safety incidents and track corrective actions',
    href: '/trackers/incidents',
    color: 'from-red-500 to-orange-500',
    badge: 'Daily',
  },
  {
    icon: ClipboardList,
    title: 'QOC/LOI Tracking',
    desc: 'Manage complaints and generate AI-powered responses',
    href: '/trackers/qoc',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Urgent',
  },
  {
    icon: FileText,
    title: 'Policies',
    desc: 'Edit policies, track reviews, categorize by department',
    href: '/trackers/policies',
    color: 'from-purple-500 to-pink-500',
    badge: 'Review',
  },
  {
    icon: Flame,
    title: 'Fire Safety',
    desc: 'Track compliance score, drills, inspections',
    href: '/fire-safety',
    color: 'from-orange-500 to-red-500',
    badge: 'NFPA',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Assessments',
    desc: 'Document risks with attachments and evidence',
    href: '/trackers/risk-assessments',
    color: 'from-amber-500 to-orange-500',
    badge: 'Evidence',
  },
  {
    icon: CheckSquare,
    title: 'Infection Control',
    desc: 'ICRA, HAI tracking, outbreaks, hand hygiene audits',
    href: '/infection-control',
    color: 'from-teal-500 to-green-500',
    badge: 'IC',
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="space-y-8 pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {session.user.name || 'there'}!</h1>
          <p className="text-slate-300 text-lg">Start with the most important compliance tasks below, or use the sidebar to explore all modules.</p>
        </div>
      </div>

      {/* Quick Start Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-teal-500" />
          <h2 className="text-2xl font-bold text-foreground">Quick Start</h2>
          <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full font-medium">Most Important</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_START.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`group relative overflow-hidden rounded-xl border border-border bg-card hover:border-teal-500 transition-all hover:shadow-lg cursor-pointer h-full p-5 flex flex-col`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">{item.badge}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{item.desc}</p>
                    <div className="flex items-center gap-1 text-teal-600 font-medium text-sm group-hover:gap-2 transition-all">
                      Go <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4">
        <BookOpen className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Need a tour?</h3>
          <p className="text-sm text-muted-foreground mb-3">Click the walkthrough button in the sidebar to get an interactive guided tour of the app.</p>
          <Link href="/walkthrough" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition">
            Start Interactive Walkthrough <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
