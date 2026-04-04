import Link from 'next/link';
import { BookOpen, CalendarDays, ClipboardList, ShieldCheck, GraduationCap, Siren, Sparkles, ChevronRight } from 'lucide-react';

export const metadata = { title: 'User Guide' };

const sections = [
  {
    title: '1. Daily Operating Rhythm',
    items: [
      'Open the Dashboard first and clear overdue items before doing any documentation work.',
      'Review the Compliance Calendar for deadlines due in the next 7, 30, and 90 days.',
      'Check incidents, CAPs, training expirations, and regulatory updates every day.',
    ],
  },
  {
    title: '2. Where Work Lives',
    items: [
      'Trackers hold active operational work: incidents, CAPs, training, grievances, risk, and RCA.',
      'Quality / QAPI is where leadership-level performance improvement work should be monitored and reported.',
      'Emergency, EOC, HIPAA, Credentialing, Infection Control, and Governance are domain-specific modules with evidence and attachments.',
    ],
  },
  {
    title: '3. Evidence Discipline',
    items: [
      'Attach evidence at the record level whenever possible so surveyors and leaders can trace the proof back to the source work item.',
      'Use clear file titles, dates, and descriptions. A vague upload is only slightly better than no upload.',
      'Prefer PDFs and screenshots for survey-ready evidence packages; use images and video when visual proof matters.',
    ],
  },
  {
    title: '4. Using Sentry Well',
    items: [
      'Sentry is good at explaining standards, drafting CAP language, reframing policy text, and suggesting operational next steps.',
      'Sentry is not yet an autonomous editor of your records. It advises; your team still approves and enters the changes.',
      'Always verify important regulatory guidance against official source publications before acting on it.',
    ],
  },
  {
    title: '5. Leadership Workflow',
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-200 mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Strong User Guide
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">How to run NyxCitadel well</h1>
          <p className="mt-4 text-slate-300 leading-relaxed text-lg">
            This guide is written for real operators: compliance officers, quality leaders, EM coordinators, educators, and executives who need a practical rhythm, not marketing copy.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 mt-12">
          <div className="space-y-5">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                      <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Open These First</h2>
              <div className="space-y-2">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-teal-300" />
                      <span className="text-sm font-medium text-slate-100">{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <h2 className="text-lg font-bold text-white mb-3">Survey-Proof Habit</h2>
              <p className="text-sm text-emerald-100 leading-relaxed">
                If a task does not have evidence, ownership, due date, and visible status, assume it will hurt you during survey or board review.
              </p>
            </section>

            <section className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-6">
              <h2 className="text-lg font-bold text-white mb-3">Next Step</h2>
              <p className="text-sm text-sky-100 leading-relaxed mb-4">
                After the guide, open the show-and-tell walkthrough for the fastest way to understand how the pieces fit together.
              </p>
              <Link href="/walkthrough" className="inline-flex items-center gap-2 rounded-xl bg-white text-foreground px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 transition">
                Open Walkthrough
                <ChevronRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
