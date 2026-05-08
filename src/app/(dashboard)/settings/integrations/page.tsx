'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plug, CheckCircle2, Clock, ExternalLink, AlertCircle } from 'lucide-react';

interface Integration {
  key: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'available' | 'coming_soon';
  logoText: string;
  logoColor: string;
  docsUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    key: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Powers Sentry Assistant for plain-language compliance guidance, document drafting, and RCA assistance.',
    category: 'AI',
    status: 'connected',
    logoText: 'AI',
    logoColor: 'bg-green-600',
    docsUrl: 'https://docs.anthropic.com',
  },
  {
    key: 'smtp',
    name: 'SMTP Email',
    description: 'Send notification emails for overdue items, deadline alerts, and incident updates to facility staff.',
    category: 'Notifications',
    status: 'available',
    logoText: 'SMTP',
    logoColor: 'bg-blue-600',
  },
  {
    key: 'hr_sync',
    name: 'HR / HRIS Sync',
    description: 'Auto-import staff rosters from your HR system (ADP, Paycom, UKG) to keep training records current.',
    category: 'HR',
    status: 'coming_soon',
    logoText: 'HR',
    logoColor: 'bg-slate-400',
  },
  {
    key: 'lms',
    name: 'LMS Integration',
    description: 'Pull completed training completions from your Learning Management System (HealthStream, TalentLMS) directly into training tracker.',
    category: 'Training',
    status: 'coming_soon',
    logoText: 'LMS',
    logoColor: 'bg-slate-400',
  },
  {
    key: 'ehr',
    name: 'EHR / EMR Connector',
    description: 'Surface incident context and patient safety events directly from Epic, Cerner, or PointClickCare for faster triage.',
    category: 'Clinical',
    status: 'coming_soon',
    logoText: 'EHR',
    logoColor: 'bg-slate-400',
  },
  {
    key: 'adhs_portal',
    name: 'ADHS Reporting Portal',
    description: 'One-click adverse event submission to the Arizona Department of Health Services IR/IAD portal.',
    category: 'Regulatory',
    status: 'coming_soon',
    logoText: 'ADHS',
    logoColor: 'bg-slate-400',
  },
  {
    key: 'jc_connect',
    name: 'Joint Commission Connect',
    description: 'Submit Sentinel Event disclosures and pull accreditation standards updates directly from The Joint Commission.',
    category: 'Regulatory',
    status: 'coming_soon',
    logoText: 'JC',
    logoColor: 'bg-slate-400',
  },
  {
    key: 'slack',
    name: 'Slack / Teams Alerts',
    description: 'Push real-time compliance alerts and overdue notifications to Slack or Microsoft Teams channels.',
    category: 'Notifications',
    status: 'coming_soon',
    logoText: 'Chat',
    logoColor: 'bg-slate-400',
  },
];

const STATUS_CONFIG = {
  connected: {
    label: 'Connected',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-950/20 border-emerald-200',
  },
  available: {
    label: 'Available - Configure',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-950/20 border-blue-200',
  },
  coming_soon: {
    label: 'Coming Soon',
    icon: AlertCircle,
    color: 'text-muted-foreground/70',
    bg: 'bg-card border-border',
  },
};

const CATEGORIES = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const router = useRouter();

  const filtered = INTEGRATIONS.filter(
    i => activeCategory === 'All' || i.category === activeCategory
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Plug className="w-6 h-6 text-teal-600" />
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Connect NyxCitadel to your existing systems to automate data sync and workflow.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === cat
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-card text-muted-foreground border-border hover:border-teal-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      <div className="grid gap-3">
        {filtered.map(integration => {
          const cfg = STATUS_CONFIG[integration.status];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={integration.key}
              className={`bg-card border rounded-xl px-5 py-4 flex items-start gap-4 ${cfg.bg}`}
            >
              {/* Logo */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${integration.logoColor}`}
              >
                {integration.logoText}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                  <span className="text-xs text-muted-foreground/70 bg-accent/50 rounded-full px-2 py-0.5">
                    {integration.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {integration.description}
                </p>
              </div>

              {/* Status / Action */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </div>
                {integration.docsUrl && (
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Docs
                  </a>
                )}
                {integration.status === 'available' && (
                  <button
                    onClick={() => router.push('/settings/notifications')}
                    className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition"
                  >
                    Configure
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/70">
        Need a custom integration? Contact{' '}
        <a href="mailto:support@nyxcitadel.com" className="text-teal-600 hover:underline">
          support@nyxcitadel.com
        </a>
        .
      </p>
    </div>
  );
}
