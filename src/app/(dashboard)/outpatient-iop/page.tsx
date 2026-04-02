import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  BookOpen,
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
  Info,
  Newspaper,
  ExternalLink,
  ShieldCheck,
  FileText,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { addDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'IOP Outpatient Dashboard' };

// Agencies most relevant to outpatient / IOP behavioral health
const IOP_AGENCIES = ['CMS', 'SAMHSA', 'DEA', 'HHS_OCR', 'OSHA', 'AZ_ADHS'];

// Keywords that indicate IOP / outpatient relevance
const IOP_KEYWORDS = [
  'outpatient', 'intensive outpatient', 'iop', 'partial hospitalization', 'php',
  'behavioral health', 'substance use', 'mental health', 'opioid', 'suboxone',
  'buprenorphine', 'methadone', 'medication assisted', 'mat ', 'recovery',
  'telehealth', 'telemedicine', 'billing', 'medicare', 'medicaid', 'prior auth',
  'credentialing', 'hipaa', 'privacy', 'counseling', 'group therapy',
  'cpt code', 'h0015', 'h2019', 'h0020', 'samhsa', 'dea', 'controlled substance',
];

const IMPACT_CONFIG: Record<string, { badge: string; icon: React.ElementType; bar: string; label: string }> = {
  CRITICAL: { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',     icon: AlertTriangle,  bar: 'bg-red-500',    label: 'Critical' },
  HIGH:     { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30', icon: ArrowUpCircle,  bar: 'bg-orange-500', label: 'High' },
  MEDIUM:   { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',    icon: Info,           bar: 'bg-amber-500',  label: 'Medium' },
  INFORMATIONAL: { badge: 'bg-slate-500/15 text-muted-foreground/70 border border-slate-500/20', icon: CheckCircle2, bar: 'bg-slate-500', label: 'Info' },
};

const AGENCY_COLORS: Record<string, string> = {
  CMS:     'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  SAMHSA:  'bg-teal-500/15 text-teal-400 border border-teal-500/30',
  DEA:     'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  HHS_OCR: 'bg-teal-500/15 text-indigo-400 border border-teal-500/30',
  OSHA:    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  AZ_ADHS: 'bg-green-500/15 text-green-400 border border-green-500/30',
};

// Static IOP regulatory reference items - key rules every IOP must know
const IOP_REFERENCE: {
  id: string;
  title: string;
  body: string;
  ref: string;
  summary: string;
  url: string;
}[] = [
  {
    id: 'cms-iop-1',
    title: 'IOP Medicare Coverage Criteria (H0015)',
    body: 'CMS',
    ref: '42 CFR 410.43 / LCD L38073',
    summary: 'IOP services require a treatment plan, physician involvement, group therapy of at least 9 hours/week (3x/week x 3 hrs), and individualized treatment.',
    url: 'https://www.cms.gov/medicare-coverage-database',
  },
  {
    id: 'cms-php-1',
    title: 'Partial Hospitalization Program (PHP) Requirements',
    body: 'CMS',
    ref: '42 CFR 410.43 / CMS IOM Pub. 100-02 Ch. 6',
    summary: 'PHP requires at least 20 hours/week of active treatment, physician supervision, and a qualifying diagnosis. Must demonstrate hospital-level intensity without 24-hour inpatient care.',
    url: 'https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/downloads/bp102c06.pdf',
  },
  {
    id: 'samhsa-otp-1',
    title: 'Opioid Treatment Program (OTP) Federal Certification',
    body: 'SAMHSA',
    ref: '42 CFR Part 8',
    summary: 'OTPs must be accredited by a SAMHSA-approved body and certified by SAMHSA before dispensing opioid agonist medications. Annual re-certification required.',
    url: 'https://www.samhsa.gov/medication-assisted-treatment/become-accredited-opioid-treatment-program',
  },
  {
    id: 'dea-schedule-1',
    title: 'DEA Schedule II-V Controlled Substance Registration',
    body: 'DEA',
    ref: '21 CFR 1301',
    summary: 'Prescribers and dispensing locations must maintain active DEA registration. Buprenorphine prescribers must complete 8-hour waiver training and notify SAMHSA.',
    url: 'https://www.deadiversion.usdoj.gov/drugreg/',
  },
  {
    id: 'hipaa-tele-1',
    title: 'HIPAA Telehealth & Virtual IOP Compliance',
    body: 'HHS_OCR',
    ref: '45 CFR 164 / OCR Guidance 2023',
    summary: 'Telehealth platforms must meet HIPAA Business Associate Agreement requirements. Audio-video sessions require encrypted, HIPAA-compliant technology. Screen recordings of sessions require explicit consent.',
    url: 'https://www.hhs.gov/hipaa/for-professionals/special-topics/telehealth/index.html',
  },
  {
    id: 'cms-ncd-1',
    title: 'Mental Health Parity & Addiction Equity Act (MHPAEA)',
    body: 'CMS',
    ref: 'MHPAEA / 29 CFR 2590.712',
    summary: 'Insurers must not impose more restrictive limitations on MH/SUD benefits than medical/surgical benefits. IOP prior authorization requirements must be parity-compliant.',
    url: 'https://www.cms.gov/cciio/programs-and-initiatives/other-insurance-protections/mhpaea_factsheet',
  },
  {
    id: 'adhs-bh-1',
    title: 'AZ ADHS Outpatient BH Licensure Requirements',
    body: 'AZ_ADHS',
    ref: 'A.A.C. R9-20 / R9-10-1201',
    summary: 'Arizona outpatient behavioral health agencies must be licensed by ADHS. Requirements include qualified clinical staff, individualized treatment plans, discharge planning, and incident reporting within 24 hours.',
    url: 'https://www.azdhs.gov/licensing/behavioral-health-facilities/',
  },
  {
    id: 'cms-billing-1',
    title: 'IOP / PHP Billing & Documentation Requirements',
    body: 'CMS',
    ref: 'CMS IOM Pub. 100-08 Ch. 13 / MLN Matters',
    summary: 'Each IOP/PHP day of service must be documented with treatment plan, duration, services rendered, and physician review. Underdocumented claims are subject to ADR and recoupment.',
    url: 'https://www.cms.gov/outreach-and-education/medicare-learning-network-mln/mlnmattersarticles',
  },
];

function ImpactBadge({ level }: { level: string }) {
  const cfg = IMPACT_CONFIG[level] ?? IMPACT_CONFIG.INFORMATIONAL;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function AgencyBadge({ agency }: { agency: string }) {
  const cls = AGENCY_COLORS[agency] ?? 'bg-slate-500/15 text-muted-foreground/70 border border-slate-500/20';
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {agency.replace('_', ' ')}
    </span>
  );
}

export default async function IopDashboardPage() {
  const session = await auth();
  if (!session?.user?.facilityId) return null;
  const { facilityId } = session.user;

  const now = new Date();
  const in30Days = addDays(now, 30);
  const since90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Fetch: all regulatory updates + facility-level compliance items relevant to IOP
  const [allUpdates, upcomingTraining, overduePolicies, openCaps, upcomingEvents] = await Promise.all([
    prisma.regulatoryUpdate.findMany({
      where: { isGlobal: true },
      orderBy: [{ createdAt: 'desc' }],
      take: 200,
    }),
    prisma.trainingRecord.count({
      where: { facilityId, expiryDate: { gte: now, lte: in30Days }, status: { not: 'EXEMPT' } },
    }),
    prisma.policy.count({
      where: { facilityId, nextReviewDate: { lt: now }, status: 'ACTIVE' },
    }),
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.calendarEvent.findMany({
      where: { facilityId, dueDate: { gte: now, lte: in30Days }, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
  ]);

  // Filter updates relevant to IOP - by regulatoryBody or keyword match in title/summary
  const iopUpdates = allUpdates.filter(u => {
    const isRelevantAgency = IOP_AGENCIES.includes(u.regulatoryBody);
    const text = `${u.title} ${u.summary ?? ''}`.toLowerCase();
    const hasKeyword = IOP_KEYWORDS.some(k => text.includes(k));
    return isRelevantAgency || hasKeyword;
  });

  // Sort by urgency then date (schema urgency: CRITICAL > HIGH > MEDIUM > INFORMATIONAL)
  const IMPACT_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'INFORMATIONAL'];
  const sorted = [...iopUpdates].sort((a, b) => {
    const ai = IMPACT_ORDER.indexOf(a.urgency);
    const bi = IMPACT_ORDER.indexOf(b.urgency);
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const critical = sorted.filter(u => u.urgency === 'CRITICAL');
  const recentOther = sorted.filter(u => u.urgency !== 'CRITICAL').slice(0, 12);

  // New since 90 days
  const newCount = iopUpdates.filter(u => new Date(u.createdAt) >= since90Days).length;

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-400" />
            IOP Outpatient Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Regulatory updates, compliance actions, and reference requirements for your Intensive Outpatient Program.
          </p>
        </div>
        <Link
          href="/regulatory-updates"
          className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          All facility updates <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'IOP-Relevant Updates',
            value: iopUpdates.length,
            sub: `${newCount} new in last 90 days`,
            icon: Newspaper,
            color: 'text-teal-400',
            ring: 'ring-teal-500/20',
          },
          {
            label: 'Critical Alerts',
            value: critical.length,
            sub: critical.length > 0 ? 'Action required' : 'None active',
            icon: AlertTriangle,
            color: critical.length > 0 ? 'text-red-400' : 'text-green-400',
            ring: critical.length > 0 ? 'ring-red-500/20' : 'ring-green-500/20',
          },
          {
            label: 'Policies Overdue',
            value: overduePolicies,
            sub: overduePolicies > 0 ? 'Needs review' : 'All current',
            icon: FileText,
            color: overduePolicies > 0 ? 'text-amber-400' : 'text-green-400',
            ring: overduePolicies > 0 ? 'ring-amber-500/20' : 'ring-green-500/20',
          },
          {
            label: 'Open CAPs',
            value: openCaps,
            sub: openCaps > 0 ? 'Pending completion' : 'None open',
            icon: ClipboardList,
            color: openCaps > 0 ? 'text-orange-400' : 'text-green-400',
            ring: openCaps > 0 ? 'ring-orange-500/20' : 'ring-green-500/20',
          },
        ].map(card => (
          <div key={card.label} className={`bg-card border border-border rounded-xl p-4 ring-1 ${card.ring}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Critical alerts */}
      {critical.length > 0 && (
        <div className="bg-red-950/30 border border-red-700/40 rounded-xl p-5 space-y-3">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {critical.length} Critical Update{critical.length !== 1 ? 's' : ''} - Immediate Action Required
          </p>
          {critical.map(u => (
            <a
              key={u.id}
              href={u.sourceUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 bg-red-950/40 hover:bg-red-950/60 border border-red-700/30 rounded-lg px-4 py-3 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-300 group-hover:text-red-200">{u.title}</p>
                {u.summary && (
                  <p className="text-xs text-red-400/80 mt-0.5 line-clamp-2">{u.summary}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <AgencyBadge agency={u.regulatoryBody} />
                  <span className="text-xs text-red-500/60">{formatDate(u.createdAt, 'MMM d, yyyy')}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-red-500/60 flex-shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      )}

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left - Recent regulatory updates (3/5) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-teal-400" />
              Recent IOP-Relevant Updates
            </h2>
            <span className="text-xs text-muted-foreground">{iopUpdates.length} total</span>
          </div>

          {recentOther.length === 0 && critical.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No new regulatory updates at this time.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOther.map(u => {
                const cfg = IMPACT_CONFIG[u.urgency] ?? IMPACT_CONFIG.INFORMATIONAL;
                return (
                  <a
                    key={u.id}
                    href={u.sourceUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 bg-card hover:bg-card/80 border border-border rounded-xl px-4 py-3 transition-colors group"
                  >
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${cfg.bar}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-teal-300 transition-colors line-clamp-2">
                        {u.title}
                      </p>
                      {u.summary && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{u.summary}</p>
                      )}
                      <div className="flex items-center flex-wrap gap-2 mt-1.5">
                        <ImpactBadge level={u.urgency} />
                        <AgencyBadge agency={u.regulatoryBody} />
                        <span className="text-xs text-muted-foreground">{formatDate(u.createdAt, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1" />
                  </a>
                );
              })}
            </div>
          )}

          {iopUpdates.length > 12 && (
            <Link
              href="/regulatory-updates"
              className="block text-center text-sm text-teal-400 hover:text-teal-300 py-2 transition-colors"
            >
              View all {iopUpdates.length} updates <ChevronRight className="w-3.5 h-3.5 inline" />
            </Link>
          )}
        </div>

        {/* Right column - upcoming items + quick links (2/5) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Upcoming compliance events */}
          {upcomingEvents.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                Upcoming (Next 30 Days)
              </h3>
              <div className="space-y-2">
                {upcomingEvents.map(ev => {
                  const { label, className } = getDueDateStatus(ev.dueDate);
                  return (
                    <div key={ev.id} className="flex items-start justify-between gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/calendar/${ev.id}`}
                          className="text-sm text-foreground hover:text-teal-300 transition-colors line-clamp-1"
                        >
                          {ev.title}
                        </Link>
                        <p className={`text-xs mt-0.5 ${className}`}>{label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/calendar"
                className="block text-xs text-teal-400 hover:text-teal-300 mt-3 transition-colors"
              >
                Full calendar <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </div>
          )}

          {/* Training expiring */}
          {upcomingTraining > 0 && (
            <div className="bg-amber-950/20 border border-amber-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-amber-300">
                  {upcomingTraining} training record{upcomingTraining !== 1 ? 's' : ''} expiring within 30 days
                </p>
              </div>
              <Link
                href="/trackers/training"
                className="text-xs text-amber-400/80 hover:text-amber-300 mt-1 block transition-colors"
              >
                Review training records <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              IOP Quick Links
            </h3>
            <div className="space-y-1">
              {[
                { href: '/regulatory-updates', label: 'All Regulatory Updates', icon: Newspaper },
                { href: '/trackers/policies', label: 'Policies & Procedures', icon: FileText },
                { href: '/trackers/training', label: 'Training Records', icon: GraduationCap },
                { href: '/trackers/caps', label: 'Corrective Action Plans', icon: ClipboardList },
                { href: '/calendar', label: 'Compliance Calendar', icon: CalendarDays },
                { href: '/compliance-library', label: 'Regulation Library', icon: BookOpen },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <link.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IOP Regulatory Reference */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            IOP Regulatory Reference
          </h2>
          <span className="text-xs text-muted-foreground">Key rules for outpatient / IOP operations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IOP_REFERENCE.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground leading-snug flex-1">{item.title}</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-teal-400 transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Open source"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <AgencyBadge agency={item.body} />
                <span className="text-xs text-muted-foreground font-mono">{item.ref}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        Regulatory updates are sourced from the Federal Register API, CMS RSS feeds, and AZ ADHS. Reference items reflect requirements current as of early 2026 - always verify against primary sources before implementation.
      </p>
    </div>
  );
}

function getDueDateStatus(date: Date | string): { label: string; className: string } {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)} days overdue`, className: 'text-red-400' };
  if (diff <= 7) return { label: `Due in ${diff} day${diff !== 1 ? 's' : ''}`, className: 'text-amber-400' };
  return { label: `Due ${formatDate(d, 'MMM d')}`, className: 'text-muted-foreground' };
}
