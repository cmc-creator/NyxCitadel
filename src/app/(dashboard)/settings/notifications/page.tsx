'use client';

import { useState } from 'react';
import { Bell, Save, CheckCircle } from 'lucide-react';
import {
  buildDefaultNotificationPreferences,
  NOTIFICATION_RULE_DEFS,
  type ExportEmailFrequency,
  type NotificationDigestMode,
} from '@/lib/notifications/preferences-schema';

import { useEffect } from 'react';

interface AlertRule {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  daysAhead: number;
}

const DEFAULT_PREFS = buildDefaultNotificationPreferences();
const DEFAULT_RULES: AlertRule[] = NOTIFICATION_RULE_DEFS.map((rule) => ({
  key: rule.key,
  label: rule.label,
  description: rule.description,
  enabled: rule.defaultEnabled,
  daysAhead: rule.defaultDaysAhead,
}));

const DAY_OPTIONS = [0, 3, 7, 14, 21, 30, 45, 60, 90];

export default function NotificationPreferencesPage() {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_RULES);
  const [digestMode, setDigestMode] = useState<NotificationDigestMode>('immediate');
  const [suppressWeekends, setSuppressWeekends] = useState(false);
  const [quietEnabled, setQuietEnabled] = useState(false);
  const [quietStartHour, setQuietStartHour] = useState(20);
  const [quietEndHour, setQuietEndHour] = useState(7);
  const [exportEmailEnabled, setExportEmailEnabled] = useState(true);
  const [exportFrequency, setExportFrequency] = useState<ExportEmailFrequency>('weekly');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch('/api/settings/notifications');
        if (!res.ok) return;
        const data = (await res.json()) as {
          preferences?: {
            digestMode?: NotificationDigestMode;
            suppressWeekends?: boolean;
            quietHours?: {
              enabled?: boolean;
              startHour?: number;
              endHour?: number;
              timezone?: string;
            };
            exportEmails?: {
              enabled?: boolean;
              frequency?: ExportEmailFrequency;
            };
            rules?: Record<string, { enabled?: boolean; daysAhead?: number }>;
          };
        };

        const prefs = data.preferences;
        if (!prefs) return;

        setDigestMode(prefs.digestMode === 'daily' ? 'daily' : 'immediate');
        setSuppressWeekends(Boolean(prefs.suppressWeekends));
        setQuietEnabled(Boolean(prefs.quietHours?.enabled));
        setQuietStartHour(typeof prefs.quietHours?.startHour === 'number' ? prefs.quietHours.startHour : 20);
        setQuietEndHour(typeof prefs.quietHours?.endHour === 'number' ? prefs.quietHours.endHour : 7);
        setExportEmailEnabled(prefs.exportEmails?.enabled ?? true);
        setExportFrequency(prefs.exportEmails?.frequency === 'daily' ? 'daily' : 'weekly');
        setRules(DEFAULT_RULES.map((rule) => ({
          ...rule,
          enabled: prefs.rules?.[rule.key]?.enabled ?? rule.enabled,
          daysAhead: prefs.rules?.[rule.key]?.daysAhead ?? rule.daysAhead,
        })));
      } finally {
        setLoading(false);
      }
    }

    void loadPrefs();
  }, []);

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
    const payload = {
      digestMode,
      suppressWeekends,
      quietHours: {
        enabled: quietEnabled,
        startHour: quietStartHour,
        endHour: quietEndHour,
        timezone: DEFAULT_PREFS.quietHours.timezone,
      },
      exportEmails: {
        enabled: exportEmailEnabled,
        frequency: exportFrequency,
      },
      rules: {
        ...DEFAULT_PREFS.rules,
        ...Object.fromEntries(rules.map((r) => [r.key, { enabled: r.enabled, daysAhead: r.daysAhead }])),
      },
    };

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            Notification Preferences
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure which alerts you receive and how far in advance to be notified.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
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

      {/* Suppression Windows */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Alert Suppression Windows</p>
        <label className="flex items-center gap-2 text-xs text-foreground/80">
          <input
            type="checkbox"
            checked={suppressWeekends}
            onChange={(e) => {
              setSuppressWeekends(e.target.checked);
              setSaved(false);
            }}
          />
          Suppress alert emails on weekends
        </label>
        <label className="flex items-center gap-2 text-xs text-foreground/80">
          <input
            type="checkbox"
            checked={quietEnabled}
            onChange={(e) => {
              setQuietEnabled(e.target.checked);
              setSaved(false);
            }}
          />
          Enable quiet hours
        </label>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Start</span>
            <select
              value={quietStartHour}
              disabled={!quietEnabled}
              onChange={(e) => {
                setQuietStartHour(Number(e.target.value));
                setSaved(false);
              }}
              className="border border-border rounded-md px-2 py-1 bg-background disabled:opacity-40"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={`start-${h}`} value={h}>{h.toString().padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">End</span>
            <select
              value={quietEndHour}
              disabled={!quietEnabled}
              onChange={(e) => {
                setQuietEndHour(Number(e.target.value));
                setSaved(false);
              }}
              className="border border-border rounded-md px-2 py-1 bg-background disabled:opacity-40"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={`end-${h}`} value={h}>{h.toString().padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leadership CSV Schedule */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Leadership CSV Email Schedule</p>
        <label className="flex items-center gap-2 text-xs text-foreground/80">
          <input
            type="checkbox"
            checked={exportEmailEnabled}
            onChange={(e) => {
              setExportEmailEnabled(e.target.checked);
              setSaved(false);
            }}
          />
          Send scheduled export summary emails
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setExportFrequency('daily'); setSaved(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${exportFrequency === 'daily' ? 'bg-teal-600 text-white border-teal-600' : 'bg-card text-foreground/80 border-border hover:border-border/60'}`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => { setExportFrequency('weekly'); setSaved(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${exportFrequency === 'weekly' ? 'bg-teal-600 text-white border-teal-600' : 'bg-card text-foreground/80 border-border hover:border-border/60'}`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Digest Mode */}
      <div className="bg-card border border-border rounded-xl px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Email Delivery Mode</p>
        <p className="text-xs text-slate-500 mt-0.5">Choose whether alert emails are sent immediately or grouped into one daily digest.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setDigestMode('immediate'); setSaved(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${digestMode === 'immediate' ? 'bg-teal-600 text-white border-teal-600' : 'bg-card text-foreground/80 border-border hover:border-border/60'}`}
          >
            Immediate Emails
          </button>
          <button
            type="button"
            onClick={() => { setDigestMode('daily'); setSaved(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${digestMode === 'daily' ? 'bg-teal-600 text-white border-teal-600' : 'bg-card text-foreground/80 border-border hover:border-border/60'}`}
          >
            Daily Digest
          </button>
        </div>
      </div>

      {/* Alert Rules */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border/30">
        {loading && (
          <div className="px-5 py-4 text-xs text-slate-500">Loading your saved preferences...</div>
        )}
        {rules.map(rule => (
          <div key={rule.key} className="flex items-start gap-4 px-5 py-4">
            {/* Toggle */}
            <button
              onClick={() => toggleRule(rule.key)}
              className={`mt-0.5 w-10 h-6 flex-shrink-0 rounded-full transition-colors relative ${
                rule.enabled ? 'bg-teal-600' : 'bg-muted'
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
              <p className={`text-sm font-semibold ${rule.enabled ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                {rule.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
            </div>

            {/* Days-ahead selector */}
            {rule.daysAhead > 0 && (
              <div className="shrink-0 flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">Days before</label>
                <select
                  value={rule.daysAhead}
                  disabled={!rule.enabled}
                  onChange={e => setDays(rule.key, Number(e.target.value))}
                  className="text-xs border border-border rounded-md px-2 py-1 bg-background disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-400"
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
      <p className="text-xs text-muted-foreground/70">
        Notifications appear in the bell menu in the top bar. Email delivery can be configured once an SMTP integration is set up under <strong>Settings → Integrations</strong>.
      </p>
    </div>
  );
}
