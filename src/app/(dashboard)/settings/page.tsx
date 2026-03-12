import { Settings, Radio, Inbox } from 'lucide-react';
import { auth } from '@/lib/auth';
import ScrapeButton from '@/components/intelligence/ScrapeButton';
import Link from 'next/link';

export const metadata = { title: 'Settings' };

const sections: { href: string; title: string; description: string; soon?: boolean }[] = [
  {
    href: '/settings/facility',
    title: 'Facility Configuration',
    description: 'Name, address, NPI, Medicare/Medicaid IDs, ADHS license, branding colors.',
  },
  {
    href: '/settings/users',
    title: 'User Management',
    description: 'Invite staff, assign roles (Compliance Officer, EM Coordinator, Read Only, etc.).',
  },
  {
    href: '/settings/notifications',
    title: 'Notification Preferences',
    description: 'Configure email alerts for overdue items, upcoming deadlines, incidents.',
  },
  {
    href: '/settings/integrations',
    title: 'Integrations',
    description: 'Connect to HR / LMS systems for automatic training record sync.',
  },
];

export default async function SettingsPage() {
  const session = await auth();
  const role = session?.user?.role ?? '';
  const canScrape = ['ADMIN', 'COMPLIANCE_OFFICER'].includes(role);
  const isAdmin   = ['ADMIN', 'SUPER_ADMIN'].includes(role);
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your facility configuration and application preferences.</p>
      </div>

      <div className="grid gap-3">
        {sections.map(s => (
          <a
            key={s.href}
            href={s.soon ? '#' : s.href}
            className="bg-card border border-border rounded-xl px-5 py-4 flex items-start justify-between hover:border-purple-600/50 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-purple-400">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
            </div>
            {s.soon ? (
              <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 mt-0.5 shrink-0">
                Coming Soon
              </span>
            ) : (
              <span className="text-muted-foreground group-hover:text-purple-400 mt-0.5">→</span>
            )}
          </a>
        ))}
      </div>

      {/* Demo Requests — admin only */}
      {isAdmin && (
        <Link
          href="/settings/demo-requests"
          className="bg-card border border-amber-700/30 rounded-xl px-5 py-4 flex items-start justify-between hover:border-amber-500/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 flex items-center justify-center shrink-0">
              <Inbox className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-amber-400">Demo / Access Requests</p>
              <p className="text-xs text-muted-foreground">Review inbound facility demo requests submitted via the signup page.</p>
            </div>
          </div>
          <span className="text-muted-foreground group-hover:text-amber-400 mt-0.5">→</span>
        </Link>
      )}

      {/* Regulatory Intelligence — sync button for admins */}
      {canScrape && (
        <div className="bg-card border border-rose-700/30 rounded-xl px-5 py-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-950/40 flex items-center justify-center">
              <Radio className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Regulatory Intelligence Feed</p>
              <p className="text-xs text-muted-foreground">
                Fetch the latest rules, notices, and guidance from CMS, OSHA, DEA, HHS/OCR, AZ ADHS, and The Joint Commission.
              </p>
            </div>
          </div>
          <ScrapeButton variant="primary" />
        </div>
      )}
    </div>
  );
}
