import Link from 'next/link';
import { Rss, Globe, Shield, Building2, FileText, Bell, ArrowRight, Info, RefreshCw } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { RunScrapeButton } from '@/components/settings/RunScrapeButton';

export const metadata = { title: 'Regulatory Update Alerts \u2014 Settings' };

const SOURCES = [
  {
    name: 'Federal Register (CMS)',
    description: 'Centers for Medicare & Medicaid Services — Conditions of Participation, final rules, proposed rules, and guidance documents.',
    icon: FileText,
    tag: 'Federal',
    frequency: 'Daily (06:00 UTC)',
  },
  {
    name: 'Federal Register (OSHA)',
    description: 'Occupational Safety and Health Administration — workplace safety standards and enforcement updates.',
    icon: Shield,
    tag: 'Federal',
    frequency: 'Daily (06:00 UTC)',
  },
  {
    name: 'Federal Register (HHS-OCR / DEA / HRSA / SAMHSA)',
    description: 'HHS Office for Civil Rights (HIPAA), Drug Enforcement Administration, Health Resources & Services Administration, and SAMHSA behavioral health guidance.',
    icon: Globe,
    tag: 'Federal',
    frequency: 'Daily (06:00 UTC)',
  },
  {
    name: 'CMS Newsroom RSS',
    description: 'CMS press releases, survey & certification memos (S&C), and quality improvement announcements.',
    icon: Rss,
    tag: 'Federal',
    frequency: 'Daily (06:00 UTC)',
  },
  {
    name: 'AZ ADHS RSS',
    description: 'Arizona Department of Health Services — behavioral health licensing updates, survey findings, and state-specific regulatory changes.',
    icon: Building2,
    tag: 'AZ State',
    frequency: 'Daily (06:00 UTC)',
  },
  {
    name: 'The Joint Commission News',
    description: 'Joint Commission National Patient Safety Goals, standards updates, Sentinel Event Alerts, and accreditation bulletins.',
    icon: Shield,
    tag: 'Accreditation',
    frequency: 'Daily (06:00 UTC)',
  },
];

const TAG_COLORS: Record<string, string> = {
  Federal: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'AZ State': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Accreditation: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
};

export default async function RegulatoryUpdateSettingsPage() {
  const lastUpdate = await prisma.regulatoryUpdate.findFirst({
    where: { isGlobal: true },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  const lastRunLabel = lastUpdate
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      }).format(new Date(lastUpdate.createdAt))
    : 'Never';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          <span>/</span>
          <span>Regulatory Update Alerts</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Rss className="w-6 h-6 text-teal-400" />
          Regulatory Update Alerts
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          NyxCitadel monitors these sources daily and surfaces new updates in the{' '}
          <Link href="/regulatory-updates" className="text-teal-500 hover:underline">Regulatory Updates</Link>{' '}
          module. High or Critical items also trigger email alerts based on your notification preferences.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          The scraper runs automatically every day at <span className="font-medium text-foreground">06:00 UTC</span>.
          Federal sources notify all facilities; AZ ADHS updates are Arizona-specific.
          New updates are deduplicated by source ID — re-running the scraper is always safe.
        </p>
      </div>

      {/* Sources list */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Monitored Sources</h2>
        <div className="space-y-2">
          {SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <div
                key={source.name}
                className="rounded-xl border border-border bg-card px-4 py-3.5 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{source.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TAG_COLORS[source.tag]}`}>
                      {source.tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{source.description}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Frequency: {source.frequency}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual trigger */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Manual Scrape</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last run: <span className="text-foreground font-medium">{lastRunLabel}</span>
            </p>
          </div>
        </div>
        <RunScrapeButton />
      </div>

      {/* Alert preferences link */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Alert Preferences</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure which urgency levels trigger email notifications in Notification Preferences.
            </p>
          </div>
        </div>
        <Link
          href="/settings/notifications"
          className="flex items-center gap-1 text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors shrink-0 ml-4"
        >
          Configure <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
