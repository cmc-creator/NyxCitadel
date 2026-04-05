import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, CalendarDays, ClipboardList, ShieldCheck, GraduationCap, Siren, Sparkles, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';

export const metadata = { title: 'User Guide | NyxCitadel' };

const sections = [
  {
    title: '1. Daily Operating Rhythm',
    color: 'border-teal-500/20 bg-teal-500/5',
    dot: 'bg-teal-400',
    items: [
      'Open the Dashboard first and clear overdue items before doing any documentation work.',
      'Review the Compliance Calendar for deadlines due in the next 7, 30, and 90 days.',
      'Check incidents, CAPs, training expirations, and regulatory updates every day.',
    ],
  },
  {
    title: '2. Where Work Lives',
    color: 'border-blue-500/20 bg-blue-500/5',
    dot: 'bg-blue-400',
    items: [
      'Trackers hold active operational work: incidents, CAPs, training, grievances, risk, and RCA.',
      'Quality / QAPI is where leadership-level performance improvement work should be monitored and reported.',
      'Emergency, EOC, HIPAA, Credentialing, Infection Control, and Governance are domain-specific modules with evidence and attachments.',
    ],
  },
  {
    title: '3. Evidence Discipline',
    color: 'border-amber-500/20 bg-amber-500/5',
    dot: 'bg-amber-400',
    items: [
      'Attach evidence at the record level whenever possible so surveyors and leaders can trace the proof back to the source work item.',
      'Use clear file titles, dates, and descriptions. A vague upload is only slightly better than no upload.',
      'Prefer PDFs and screenshots for survey-ready evidence packages; use images and video when visual proof matters.',
    ],
  },
  {
    title: '4. Using Sentry Well',
    color: 'border-emerald-500/20 bg-emerald-500/5',
    dot: 'bg-emerald-400',
    items: [
      'Sentry is good at explaining standards, drafting CAP language, reframing policy text, and suggesting operational next steps.',
      'Sentry is not yet an autonomous editor of your records. It advises; your team still approves and enters the changes.',
      'Always verify important regulatory guidance against official source publications before acting on it.',
    ],
  },
  {
    title: '5. Leadership Workflow',
    color: 'border-purple-500/20 bg-purple-500/5',
    dot: 'bg-purple-400',
    items: [
      'Use the Board Report and Resilience views to translate operational data into executive language.',
      'Export CSV when you need raw data; use Print / Save PDF when you need polished readouts for leaders or survey prep binders.',
      'Review open CAPs, overdue reviews, high-risk incidents, and expiring training as standing agenda items.',
    ],
  },
];

const quickLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: ShieldCheck },
  { href: '/calendar', label: 'Compliance Calendar', icon: CalendarDays },
  { href: '/trackers/compliance', label: 'Trackers', icon: ClipboardList },
  { href: '/trackers/training', label: 'Training', icon: GraduationCap },
  { href: '/emergency/drills', label: 'Emergency Drills', icon: Siren },
  { href: '/assistant', label: 'Sentry Assistant 🤖', icon: Sparkles },
];

export default function GuidePage() {
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
            <BookOpen className="w-3.5 h-3.5" />
            Operator Guide
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5">How to run NyxCitadel well</h1>
          <p className="text-slate-300 leading-relaxed text-lg">
            Written for real operators: compliance officers, quality leaders, EM coordinators, educators, and executives who need a practical rhythm, not marketing copy.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          {/* Sections */}
          <div className="space-y-5">
            {sections.map((section) => (
              <section key={section.title} className={`rounded-2xl border p-6 ${section.color}`}>
                <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${section.dot}`} />
                      <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <section className="rounded-2xl border border-white/8 bg-slate-900/50 p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Open These First</h2>
              <div className="space-y-1.5">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 hover:bg-white/7 hover:border-teal-500/25 transition-all group">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-teal-400" />
                      <span className="text-sm font-medium text-slate-200">{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Survey-Proof Habit</h2>
              </div>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                If a task does not have evidence, ownership, due date, and visible status — assume it will hurt you during survey or board review.
              </p>
            </section>

            <section className="rounded-2xl border border-teal-500/20 bg-teal-500/8 p-6">
              <h2 className="text-sm font-bold text-white mb-2">Next Step</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                After the guide, open the show-and-tell walkthrough for the fastest way to understand how the pieces connect.
              </p>
              <Link
                href="/walkthrough"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)' }}
              >
                Open Walkthrough <ChevronRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
