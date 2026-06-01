import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen, CalendarDays, ClipboardList, ShieldCheck,
  Siren, Sparkles, ChevronRight, AlertTriangle, BarChart2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'User Guide | NyxCitadel',
  description: 'Module reference and operational guide for compliance officers, quality leaders, and healthcare executives using NyxCitadel.',
};

const sections = [
  {
    title: '1. Module Map',
    color: 'border-teal-500/20 bg-teal-500/5',
    dot: 'bg-teal-400',
    items: [
      'Trackers -- operational compliance work: incidents, CAPs, risk assessments, QOC/LOI, RCA investigations, grievances, and training records.',
      'Quality / QAPI -- performance improvement: PI projects, indicator monitoring, QAPI committee documentation, and trend analysis.',
      'Infection Control -- ICRA assessments, HAI surveillance, outbreak tracking, and hand hygiene audit logs.',
      'Emergency Management -- HVA, EOC meeting minutes, all-hazards drills, tabletop exercises, and after-action reports.',
      'Intelligence -- live KPI dashboard, resilience scorecard, board compliance report, and regulatory updates feed.',
      'Governance -- policy library with version control, credentialing records, and board-ready compliance packets.',
    ],
  },
  {
    title: '2. Survey & Audit Readiness',
    color: 'border-blue-500/20 bg-blue-500/5',
    dot: 'bg-blue-400',
    items: [
      'Run the Survey Readiness Pack export (Policies + Training + Drills + CAPs + Incidents) 30-90 days before any scheduled or anticipated survey.',
      'For each open CAP: verify the original citation is attached, corrective action is documented, and proof of implementation is uploaded.',
      'Cross-check training compliance before survey entry. The Scheduling Lockouts export shows blocked staff at a glance.',
      'During a survey: filter Trackers by department to pull real-time evidence per tracer. Create new records after survey, not during -- document findings in post-survey CAPs.',
    ],
  },
  {
    title: '3. Evidence & Documentation Standards',
    color: 'border-amber-500/20 bg-amber-500/5',
    dot: 'bg-amber-400',
    items: [
      'Attach evidence at the record level, not at the module level. A note in a CAP without the supporting document attached is not complete evidence.',
      'File naming: [Module]-[Type]-[Date] -- e.g. CAP-POC-2024-03-15.pdf or IC-ICRA-BuildingB-2024-04.pdf. Consistency matters when pulling evidence packages under time pressure.',
      'Preferred formats: PDF for regulatory documents, signed forms, and policies; JPEG/PNG for photographic evidence; Excel/CSV for data exports and risk matrices.',
      'Do not delete records under active investigation or litigation hold. Mark as closed with documentation notes instead.',
    ],
  },
  {
    title: '4. Sentry AI -- Appropriate Use',
    color: 'border-emerald-500/20 bg-emerald-500/5',
    dot: 'bg-emerald-400',
    items: [
      'Sentry drafts effectively: CAP corrective action language, QOC/LOI response letters, policy gap analysis, regulatory interpretation, and staff education outlines.',
      'Verify before use: Sentry output on specific CMS, Joint Commission, or state citations should be validated against current published guidance. Standards change; AI training data has a cutoff.',
      'Prompt effectively: provide the citation text, your facility type and patient population, and the format you need (letter, bullet list, action plan). Specificity yields better output.',
      'Sentry advises; your team approves. It is not a substitute for legal review of formal LOI responses or final clinical judgment.',
    ],
  },
  {
    title: '5. Reporting & Leadership Cadence',
    color: 'border-purple-500/20 bg-purple-500/5',
    dot: 'bg-purple-400',
    items: [
      'Daily: Check the Intelligence KPI strip for open incidents, active/overdue CAPs, critical risks, and open grievances.',
      'Monthly: Review the Resilience Scorecard with leadership -- letter grades and trend data across all compliance domains.',
      'Quarterly: Pull the Board Compliance Report -- 90-day rollup, print-ready for governance packets.',
      'Pre-survey: Use the Export Center Survey Readiness Pack for the bundled evidence package. Individual module exports are available for regulatory submissions, HR audits, and committee reporting.',
    ],
  },
];

const quickLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: ShieldCheck },
  { href: '/intelligence', label: 'Intelligence / KPIs', icon: BarChart2 },
  { href: '/calendar', label: 'Compliance Calendar', icon: CalendarDays },
  { href: '/trackers/compliance', label: 'Trackers', icon: ClipboardList },
  { href: '/emergency/drills', label: 'Emergency Drills', icon: Siren },
  { href: '/assistant', label: 'Sentry Assistant', icon: Sparkles },
];

const redFlags = [
  'CAPs without supporting evidence attached',
  'Staff with expired training still on schedule',
  'Incidents closed without investigation notes',
  'Policies overdue for annual review',
  'QOC/LOI responses past deadline with no extension documented',
];

export default function GuidePage() {
  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          Reference Guide
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          NyxCitadel Reference
        </h1>
        <p className="text-slate-300 leading-relaxed">
          Module map, documentation standards, survey prep workflow, and reporting cadence for compliance officers, quality leaders, and EM coordinators.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
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

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/8 bg-slate-900/50 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Quick Navigation</h2>
            <div className="space-y-1.5">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 hover:bg-white/7 hover:border-teal-500/25 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span className="text-sm font-medium text-slate-200">{label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-white">Survey Red Flags</h2>
            </div>
            <div className="space-y-2">
              {redFlags.map((flag) => (
                <div key={flag} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-100/80">{flag}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-teal-500/20 bg-teal-500/8 p-6">
            <h2 className="text-sm font-bold text-white mb-2">Interactive Walkthrough</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Step-by-step tour of every module with context on how the pieces connect.
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
  );
}
