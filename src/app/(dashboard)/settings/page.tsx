import { Settings } from 'lucide-react';

export const metadata = { title: 'Settings' };

const sections = [
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

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your facility configuration and application preferences.</p>
      </div>

      <div className="grid gap-3">
        {sections.map(s => (
          <a
            key={s.href}
            href={s.soon ? '#' : s.href}
            className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-start justify-between hover:border-purple-300 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-700">{s.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
            </div>
            {s.soon ? (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 mt-0.5 shrink-0">
                Coming Soon
              </span>
            ) : (
              <span className="text-slate-400 group-hover:text-purple-600 mt-0.5">→</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
