import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, ArrowRight, ChevronRight,
  LayoutDashboard, ShieldCheck, AlertTriangle, GraduationCap,
  FileText, BarChart3, Siren, ClipboardList, Sparkles,
  CheckCircle, Radio, Target, HeartPulse, Settings, Users,
  BookOpen, Zap, MessageSquare, HelpCircle,
} from 'lucide-react';

export const metadata = {
  title: 'User Guide | NyxCitadel',
  description: 'Step-by-step guide to getting started with NyxCitadel — setup, daily workflows, module overviews, and compliance best practices for healthcare facilities.',
  openGraph: {
    title: 'NyxCitadel User Guide',
    description: 'Everything you need to get up and running with NyxCitadel compliance management.',
    type: 'website',
  },
};

const quickStartSteps = [
  {
    n: 1,
    title: 'Request access & get onboarded',
    body: 'Submit your facility information via the signup page. Your NyxCitadel implementation specialist will contact you within 1 business day to configure your account, set up your facility profile, and import any existing data.',
    cta: { label: 'Request access', href: '/signup' },
  },
  {
    n: 2,
    title: 'Configure your facility profile',
    body: 'From Settings → Facility, fill in your licensing information, bed count, facility type, and regulatory bodies (ADHS, CMS, Joint Commission, OSHA). This unlocks the correct regulatory requirements for your organization.',
    cta: null,
  },
  {
    n: 3,
    title: 'Invite your compliance team',
    body: 'Go to Settings → Team to add staff. Assign roles — Compliance Officer, Quality Director, Department Lead, or Viewer. Role-based access controls what each person can see and edit.',
    cta: null,
  },
  {
    n: 4,
    title: 'Load your requirements',
    body: 'The Compliance Requirements Tracker comes pre-loaded with your applicable regulatory obligations. Review them, assign owners, and set due dates. Add facility-specific requirements from the + New Requirement button.',
    cta: null,
  },
  {
    n: 5,
    title: 'Import policies and training records',
    body: 'Upload existing policies as PDFs or paste text directly into the Policy Library. Import staff training records via CSV. Both modules support bulk operations so onboarding doesn\'t mean hours of data entry.',
    cta: null,
  },
  {
    n: 6,
    title: 'Start your first incident report',
    body: 'When a reportable event occurs, click + New Incident from the Incidents tracker or from the dashboard. The form guides you through classification, ADHS reportability determination, and auto-drafts the initial CAP.',
    cta: null,
  },
];

const modules = [
  {
    icon: LayoutDashboard,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    title: 'Compliance Command Center',
    href: '#command-center',
    summary: 'Your daily starting point. Live compliance score, upcoming deadlines, open incidents, and the attention feed.',
  },
  {
    icon: Radio,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    title: 'Regulatory Intelligence',
    href: '#regulatory-intelligence',
    summary: 'Real-time monitoring of CMS, ADHS, Joint Commission, OSHA, and state DOH. Plain-language change alerts.',
  },
  {
    icon: AlertTriangle,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    title: 'Incident Management',
    href: '#incidents',
    summary: 'Structured incident intake, ADHS reportability triage, linked RCA and CAP workflows, state submission tracking.',
  },
  {
    icon: ShieldCheck,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    title: 'Compliance Tracker',
    href: '#compliance-tracker',
    summary: 'Full inventory of regulatory obligations with status tracking, due-date alerts, and audit trail.',
  },
  {
    icon: FileText,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    title: 'Policy Library',
    href: '#policies',
    summary: 'Version-controlled policies with review cycle tracking, regulatory tagging, and bulk import.',
  },
  {
    icon: GraduationCap,
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
    title: 'Training & Competency',
    href: '#training',
    summary: 'Staff training records, credential expiry tracking, compliance percentages by department.',
  },
  {
    icon: HeartPulse,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    title: 'QAPI',
    href: '#qapi',
    summary: 'CMS-aligned quality assurance and performance improvement with board-ready dashboards.',
  },
  {
    icon: Siren,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    title: 'Emergency Preparedness',
    href: '#emergency',
    summary: 'HVA builder, emergency plan library, drill scheduling, and NIMS/HICS documentation.',
  },
  {
    icon: Target,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    title: 'Survey Management',
    href: '#surveys',
    summary: 'Deficiency log, Plan of Correction builder, POC milestone tracking, and survey history archive.',
  },
  {
    icon: ClipboardList,
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    title: 'Grievances & QOC/LOI',
    href: '#grievances',
    summary: 'Patient rights documentation, grievance resolution tracking, and IR/IAD adverse event log.',
  },
  {
    icon: BarChart3,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    title: 'Executive Reporting',
    href: '#reports',
    summary: 'One-click scorecards, board dashboards, exportable PDFs, and the Resilience Score.',
  },
  {
    icon: Sparkles,
    color: 'text-teal-300 bg-teal-400/10 border-teal-400/20',
    title: 'Sentry™ AI Assistant',
    href: '#sentry',
    summary: 'Plain-language answers to regulatory questions, CAP drafts, citation interpretation, 24/7.',
  },
];

const roles = [
  {
    name: 'Administrator',
    badge: 'bg-red-500/15 text-red-300 border-red-500/30',
    permissions: [
      'Full access to all modules and settings',
      'Can invite, edit, and remove users',
      'Manages facility profile and integration settings',
      'Access to audit logs and security settings',
    ],
  },
  {
    name: 'Compliance Officer',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    permissions: [
      'Create, edit, and close incidents, CAPs, and compliance items',
      'Manage policies, training, and survey documentation',
      'Generate and export all reports',
      'Cannot manage user accounts or billing',
    ],
  },
  {
    name: 'Department Lead',
    badge: 'bg-green-500/15 text-green-300 border-green-500/30',
    permissions: [
      'View and update items assigned to their department',
      'File new incident reports',
      'View training compliance for their department',
      'Cannot access other departments or export facility-wide reports',
    ],
  },
  {
    name: 'Viewer',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    permissions: [
      'Read-only access to all permitted modules',
      'Cannot create, edit, or delete any records',
      'Ideal for board members, auditors, and consultants',
    ],
  },
];

const faqs = [
  {
    q: 'Can I import data from my existing spreadsheets?',
    a: 'Yes. The Policy Library, Training Tracker, and Compliance Requirements Tracker all support bulk CSV import. Your implementation specialist can assist with formatting templates.',
  },
  {
    q: 'Is a Business Associate Agreement (BAA) included?',
    a: 'Yes. A signed BAA is included on all plans at no extra cost. You can review and download it from the Priority Partner Portal.',
  },
  {
    q: 'How does ADHS reportability determination work?',
    a: 'When you create an incident, the form asks structured questions about the event type, patient outcome, and timeline. The system applies Arizona ADHS criteria and CMS reportability rules and tells you whether a state report is required, how long you have to file, and generates a pre-filled submission form.',
  },
  {
    q: 'Can multiple facilities share one account?',
    a: 'Yes. The Professional plan supports 3 facilities and the Enterprise plan is unlimited. Each facility has its own compliance profile, requirements, and reporting — but administrators can view cross-facility dashboards.',
  },
  {
    q: 'How current is the Regulatory Intelligence feed?',
    a: 'The feed monitors 40+ federal and state sources continuously. Changes are typically reflected within 24 hours of publication, with impact summaries written by our compliance team.',
  },
  {
    q: 'What happens if the AI assistant gives wrong information?',
    a: 'Sentry always cites the regulatory source for every answer and recommends verification before acting. It is a drafting and research aid, not a substitute for qualified compliance counsel.',
  },
  {
    q: 'How do I add a new staff member?',
    a: 'Go to Settings → Team → Invite User. Enter their email and assign a role. They\'ll receive an invite email with instructions to create a password. If you need to assign them to a specific department, you can do that from the same settings page.',
  },
  {
    q: 'Where do I find support?',
    a: 'In-app: click the Sentry assistant for platform questions. For billing or account issues, use the Contact page. Priority Partners have a dedicated support channel with a named specialist.',
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#060b16] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[700px] h-[700px] bg-teal-700/12 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-800/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
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
        <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-14 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-300 text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(13,115,119,0.25)]">
            <BookOpen className="w-3.5 h-3.5" />
            User Guide &amp; Documentation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Get up and running{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              in under a day
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
            Everything you need to know about NyxCitadel — from first login to running your first board report. Follow the quick-start steps, then explore each module at your own pace.
          </p>
          {/* Jump links */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {[
              { label: 'Quick Start', href: '#quick-start' },
              { label: 'Modules', href: '#modules' },
              { label: 'Roles & Permissions', href: '#roles' },
              { label: 'FAQ', href: '#faq' },
            ].map(l => (
              <a key={l.label} href={l.href} className="px-3 py-1.5 rounded-lg border border-white/8 hover:border-teal-500/40 text-slate-400 hover:text-teal-300 bg-slate-900/40 hover:bg-teal-500/8 transition-all">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section id="quick-start" className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quick Start</h2>
              <p className="text-sm text-slate-500">Get from zero to compliant in your first session</p>
            </div>
          </div>

          <div className="space-y-4">
            {quickStartSteps.map((step) => (
              <div key={step.n} className="flex gap-5 p-5 sm:p-6 rounded-2xl border border-white/6 bg-slate-900/40">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center font-bold text-sm text-white flex-shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                  {step.cta && (
                    <Link
                      href={step.cta.href}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      {step.cta.label} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modules overview */}
        <section id="modules" className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Platform Modules</h2>
              <p className="text-sm text-slate-500">Every module, what it does, and when to use it</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.title} className={`rounded-xl border p-4 flex items-start gap-3 ${mod.color}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${mod.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm mb-0.5">{mod.title}</p>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{mod.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-5 rounded-2xl border border-teal-500/20 bg-teal-500/6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Sparkles className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-0.5">Want to see every module in action?</p>
              <p className="text-xs text-slate-400">The platform walkthrough walks you through all 12 modules with full feature detail and use cases.</p>
            </div>
            <Link
              href="/walkthrough"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)', boxShadow: '0 4px 16px rgba(13,115,119,0.3)' }}
            >
              View Walkthrough <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Roles &amp; Permissions</h2>
              <p className="text-sm text-slate-500">Who can see and do what in NyxCitadel</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.name} className="rounded-2xl border border-white/6 bg-slate-900/40 p-5">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border mb-4 ${role.badge}`}>
                  {role.name}
                </div>
                <ul className="space-y-2">
                  {role.permissions.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Workflow Tips */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Daily Compliance Workflow</h2>
              <p className="text-sm text-slate-500">Best practices from the field</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Start at the dashboard', body: 'Every morning, open the Compliance Command Center. The attention feed shows what\'s overdue, what\'s due today, and any open incidents requiring action.' },
              { title: 'File incidents same-day', body: 'ADHS and CMS both have strict reportability windows. File incident reports on the day they occur — the system will tell you the exact submission deadline.' },
              { title: 'Use Sentry for citations', body: 'When you receive a deficiency citation, paste it into Sentry. It will identify the standard, explain the scope, and suggest corrective language for your Plan of Correction.' },
              { title: 'Set review cycles in policies', body: 'Every policy should have a review cycle (annual for most, 6-month for high-risk). NyxCitadel will alert you 30 days before a policy is due for review.' },
              { title: 'Update training before surveys', body: 'Run the Training Compliance report by department before any scheduled survey. Get every department above 90% before the surveyor arrives.' },
              { title: 'Export your Resilience Score monthly', body: 'Share the monthly Resilience Score report with your board or governing body. It shows trend over time and is a credible indicator of compliance culture.' },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-xl border border-white/6 bg-slate-900/30 p-5">
                <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-sm text-slate-500">Common questions from compliance teams</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-white/6 bg-slate-900/40 p-5 sm:p-6">
                <h3 className="font-semibold text-white text-sm mb-2 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  {q}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed pl-6">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-white/6 bg-gradient-to-b from-transparent to-slate-900/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              Still have questions?
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mb-8">
              Our implementation team is happy to walk you through anything. Request a demo and we&apos;ll answer every question live with your data.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)', boxShadow: '0 8px 30px rgba(13,115,119,0.4)' }}
              >
                Request a Demo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 rounded-xl font-semibold text-slate-300 hover:text-white transition-all"
              >
                Contact support
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
