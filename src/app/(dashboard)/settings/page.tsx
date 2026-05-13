import { Settings } from 'lucide-react';

export const metadata = { title: 'Settings' };

const sections: { href: string; title: string; description: string; soon?: boolean }[] = [
  {
    href: '/settings/profile',
    title: 'My Profile',
    description: 'Update your name, job title, department, and password.',
  },
  {
    href: '/settings/security',
    title: 'Security (Two-Factor Auth)',
    description: 'Enable TOTP-based 2FA to protect your account with an authenticator app.',
  },
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
  {
    href: '/settings/regulatory-updates',
    title: 'Regulatory Update Alerts',
    description: 'View monitored regulatory sources and configure urgency alert thresholds.',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-400" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your facility configuration and application preferences.</p>
      </div>

      <div className="grid gap-3">
        {sections.map(s => (
          <a
            key={s.href}
            href={s.soon ? '#' : s.href}
            className="bg-card border border-border rounded-xl px-5 py-4 flex items-start justify-between hover:border-teal-600/50 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-teal-400">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
            </div>
            {s.soon ? (
              <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 mt-0.5 shrink-0">
                Coming Soon
              </span>
            ) : (
              <span className="text-muted-foreground group-hover:text-teal-400 mt-0.5">→</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
