'use client';

import { useState } from 'react';
import { Bell, Save, CheckCircle } from 'lucide-react';

interface AlertRule {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  daysAhead: number;
}

const DEFAULT_RULES: AlertRule[] = [
  {
    key: 'DEADLINE_REMINDER',
    label: 'Deadline Reminders',
    description: 'Notify before compliance items or corrective actions are due.',
    enabled: true,
    daysAhead: 14,
  },
  {
    key: 'OVERDUE_ALERT',
    label: 'Overdue Alerts',
    description: 'Alert when an item passes its due date without resolution.',
    enabled: true,
    daysAhead: 0,
  },
  {
    key: 'TRAINING_EXPIRING',
    label: 'Training / Competency Expiring',
    description: 'Remind staff before training certifications lapse.',
    enabled: true,
    daysAhead: 30,
  },
  {
    key: 'INCIDENT_UPDATE',
    label: 'Incident Report Updates',
    description: 'Alert on status changes to IR / IAD incident reports.',
    enabled: true,
    daysAhead: 0,
  },
  {
    key: 'POLICY_REVIEW_DUE',
    label: 'Policy Review Due',
    description: 'Remind reviewers before policies reach their next review date.',
    enabled: true,
    daysAhead: 60,
  },
  {
    key: 'SURVEY_UPCOMING',
    label: 'Upcoming Surveys',
    description: 'Alert when a regulatory survey is approaching.',
    enabled: false,
    daysAhead: 30,
  },
  {
    key: 'CAP_MILESTONE',
    label: 'CAP Milestone Reminders',
    description: 'Prompt assignees when a Corrective Action Plan milestone is near.',
    enabled: false,
    daysAhead: 7,
  },
];

const DAY_OPTIONS = [0, 3, 7, 14, 21, 30, 45, 60, 90];

export default function NotificationPreferencesPage() {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_RULES);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleRule(key: string) {
    setRules(prev =>
      prev.map(r => (r.key === key ? { ...r, enabled: !r.enabled } : r))
    );
    setSaved(false);
  }

  function setDays(key: string, days: number) {
    setRules(prev =>
      prev.map(r => (r.key === key ? { ...r, daysAhead: days } : r))
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    // In a full implementation this would persist to the DB via /api/settings/notifications
    // For now simulate a save delay
    await new Promise(res => setTimeout(res, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            Notification Preferences
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure which alerts you receive and how far in advance to be notified.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Preferences'}
            </>
          )}
        </button>
      </div>

      {/* Alert Rules */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {rules.map(rule => (
          <div key={rule.key} className="flex items-start gap-4 px-5 py-4">
            {/* Toggle */}
            <button
              onClick={() => toggleRule(rule.key)}
              className={`mt-0.5 w-10 h-6 flex-shrink-0 rounded-full transition-colors relative ${
                rule.enabled ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  rule.enabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${rule.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                {rule.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
            </div>

            {/* Days-ahead selector */}
            {rule.key !== 'OVERDUE_ALERT' && rule.key !== 'INCIDENT_UPDATE' && (
              <div className="shrink-0 flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">Days before</label>
                <select
                  value={rule.daysAhead}
                  disabled={!rule.enabled}
                  onChange={e => setDays(rule.key, Number(e.target.value))}
                  className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {DAY_OPTIONS.filter(d => d > 0).map(d => (
                    <option key={d} value={d}>
                      {d} day{d !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info note */}
      <p className="text-xs text-slate-400">
        Notifications appear in the bell menu in the top bar. Email delivery can be configured once an SMTP integration is set up under <strong>Settings → Integrations</strong>.
      </p>
    </div>
  );
}
