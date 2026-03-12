'use client';

import { useState, useEffect } from 'react';
import { Bell, Save, CheckCircle, Loader2 } from 'lucide-react';

interface AlertRule {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  daysAhead: number;
  noDays?: boolean; // rules where daysAhead makes no sense
}

const RULE_META: Omit<AlertRule, 'enabled' | 'daysAhead'>[] = [
  { key: 'DEADLINE_REMINDER',     label: 'Deadline Reminders',              description: 'Notify before compliance items or corrective actions are due.' },
  { key: 'OVERDUE_ALERT',         label: 'Overdue Alerts',                  description: 'Alert when an item passes its due date without resolution.', noDays: true },
  { key: 'TRAINING_EXPIRING',     label: 'Training / Competency Expiring',  description: 'Remind staff before training certifications lapse.' },
  { key: 'INCIDENT_UPDATE',       label: 'Incident Report Updates',         description: 'Alert on status changes to IR / IAD incident reports.', noDays: true },
  { key: 'SENTINEL_EVENT',        label: 'Sentinel / Serious Events',       description: 'Alert immediately when a sentinel or serious safety event is logged.', noDays: true },
  { key: 'POLICY_REVIEW_DUE',     label: 'Policy Review Due',               description: 'Remind reviewers before policies reach their next review date.' },
  { key: 'CAP_OVERDUE',           label: 'Overdue CAPs',                    description: 'Alert when a Corrective Action Plan passes its target completion date.', noDays: true },
  { key: 'POLICY_OVERDUE',        label: 'Overdue Policy Reviews',          description: 'Alert when a policy passes its review date without action.', noDays: true },
  { key: 'LICENSE_EXPIRING',      label: 'Provider License Expiring',       description: 'Warn before a provider license or DEA registration expires.' },
  { key: 'CS_DISCREPANCY',        label: 'Controlled Substance Discrepancy', description: 'Alert when an unresolved CS count discrepancy is detected.', noDays: true },
  { key: 'TB_OVERDUE',            label: 'Overdue TB Screenings',           description: 'Alert when an employee has a past-due TB screening.', noDays: true },
  { key: 'BREACH_REPORTABLE',     label: 'HIPAA Breach Action Required',    description: 'Alert when a high-risk HIPAA breach is open and nearing the 60-day HHS deadline.', noDays: true },
  { key: 'SURVEY_ALERT',          label: 'Upcoming Surveys',                description: 'Alert when a regulatory survey or inspection is approaching.' },
  { key: 'CAP_UPDATE',            label: 'CAP Milestone Reminders',         description: 'Prompt assignees when a Corrective Action Plan milestone is near.' },
];

const DEFAULT_PREFS: Record<string, { enabled: boolean; daysAhead: number }> = {
  DEADLINE_REMINDER: { enabled: true,  daysAhead: 14 },
  OVERDUE_ALERT:     { enabled: true,  daysAhead: 0  },
  TRAINING_EXPIRING: { enabled: true,  daysAhead: 30 },
  INCIDENT_UPDATE:   { enabled: true,  daysAhead: 0  },
  SENTINEL_EVENT:    { enabled: true,  daysAhead: 0  },
  POLICY_REVIEW_DUE: { enabled: true,  daysAhead: 60 },
  CAP_OVERDUE:       { enabled: true,  daysAhead: 0  },
  POLICY_OVERDUE:    { enabled: true,  daysAhead: 0  },
  LICENSE_EXPIRING:  { enabled: true,  daysAhead: 90 },
  CS_DISCREPANCY:    { enabled: true,  daysAhead: 0  },
  TB_OVERDUE:        { enabled: true,  daysAhead: 0  },
  BREACH_REPORTABLE: { enabled: true,  daysAhead: 0  },
  SURVEY_ALERT:      { enabled: false, daysAhead: 30 },
  CAP_UPDATE:        { enabled: false, daysAhead: 7  },
};

const DAY_OPTIONS = [3, 7, 14, 21, 30, 45, 60, 90];

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs]   = useState<Record<string, { enabled: boolean; daysAhead: number }>>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch('/api/settings/notifications')
      .then(r => r.json())
      .then(data => {
        if (data.prefs) setPrefs({ ...DEFAULT_PREFS, ...data.prefs });
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  function toggleRule(key: string) {
    setPrefs(p => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }));
    setSaved(false);
  }

  function setDays(key: string, days: number) {
    setPrefs(p => ({ ...p, [key]: { ...p[key], daysAhead: days } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefs }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {/* ignore */} finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 py-12">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading preferences…
      </div>
    );
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
            <><CheckCircle className="w-4 h-4" /> Saved</>
          ) : (
            <><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Preferences'}</>
          )}
        </button>
      </div>

      {/* Alert Rules */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {RULE_META.map(rule => {
          const pref = prefs[rule.key] ?? { enabled: false, daysAhead: 0 };
          return (
            <div key={rule.key} className="flex items-start gap-4 px-5 py-4">
              {/* Toggle */}
              <button
                onClick={() => toggleRule(rule.key)}
                className={`mt-0.5 w-10 h-6 flex-shrink-0 rounded-full transition-colors relative ${
                  pref.enabled ? 'bg-purple-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    pref.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${pref.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                  {rule.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
              </div>

              {/* Days-ahead selector */}
              {!rule.noDays && (
                <div className="shrink-0 flex items-center gap-2">
                  <label className="text-xs text-slate-500 whitespace-nowrap">Days before</label>
                  <select
                    value={pref.daysAhead}
                    disabled={!pref.enabled}
                    onChange={e => setDays(rule.key, Number(e.target.value))}
                    className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {DAY_OPTIONS.map(d => (
                      <option key={d} value={d}>{d} day{d !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <p className="text-xs text-slate-400">
        Notifications appear in the bell menu in the top bar. Your preferences are saved per user account. Email delivery can be configured once an SMTP integration is set up under <strong>Settings → Integrations</strong>.
      </p>
    </div>
  );
}
