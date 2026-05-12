export type NotificationDigestMode = 'immediate' | 'daily';
export type ExportEmailFrequency = 'daily' | 'weekly';

export type NotificationRuleDefinition = {
  key: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  defaultDaysAhead: number;
};

export const NOTIFICATION_RULE_DEFS: NotificationRuleDefinition[] = [
  {
    key: 'LICENSE_EXPIRING',
    label: 'Provider License Expiring',
    description: 'Alert when provider licenses are nearing expiration.',
    defaultEnabled: true,
    defaultDaysAhead: 90,
  },
  {
    key: 'TRAINING_EXPIRING',
    label: 'Training Expiring',
    description: 'Remind staff before required training certifications lapse.',
    defaultEnabled: true,
    defaultDaysAhead: 30,
  },
  {
    key: 'CAP_OVERDUE',
    label: 'Overdue CAPs',
    description: 'Alert when corrective action plans pass target dates.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'POLICY_OVERDUE',
    label: 'Policy Review Overdue',
    description: 'Alert when policies pass next review dates.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'OVERDUE_ALERT',
    label: 'Overdue Calendar Events',
    description: 'Alert when calendar compliance events are overdue.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'SENTINEL_EVENT',
    label: 'Open Sentinel Events',
    description: 'Alert for serious incident reports that remain open.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'BREACH_REPORTABLE',
    label: 'HIPAA Breach Action Required',
    description: 'Alert for high-risk HIPAA breaches requiring follow-up.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'GOVERNANCE_DOC_OVERDUE',
    label: 'Governance Docs Overdue',
    description: 'Alert when governance document reviews are overdue.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'TB_OVERDUE',
    label: 'TB Screening Overdue',
    description: 'Alert when employee TB screenings are overdue.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'CS_DISCREPANCY',
    label: 'Controlled Substance Discrepancies',
    description: 'Alert for open controlled substance discrepancies.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'MOON_MISSING',
    label: 'Pending MOON Notices',
    description: 'Alert for MOON notices that are not yet issued.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
  {
    key: 'REG_UPDATE_NEW',
    label: 'New Regulatory Updates',
    description: 'Alert when new regulatory updates are published with CRITICAL or HIGH urgency.',
    defaultEnabled: true,
    defaultDaysAhead: 0,
  },
];

export type NotificationRuleKey = (typeof NOTIFICATION_RULE_DEFS)[number]['key'];

export type NotificationRulePreference = {
  enabled: boolean;
  daysAhead: number;
};

export type NotificationPreferences = {
  digestMode: NotificationDigestMode;
  suppressWeekends: boolean;
  quietHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
    timezone: string;
  };
  exportEmails: {
    enabled: boolean;
    frequency: ExportEmailFrequency;
  };
  rules: Record<string, NotificationRulePreference>;
};

export function buildDefaultNotificationPreferences(): NotificationPreferences {
  const rules: Record<string, NotificationRulePreference> = {};

  for (const def of NOTIFICATION_RULE_DEFS) {
    rules[def.key] = {
      enabled: def.defaultEnabled,
      daysAhead: def.defaultDaysAhead,
    };
  }

  return {
    digestMode: 'immediate',
    suppressWeekends: false,
    quietHours: {
      enabled: false,
      startHour: 20,
      endHour: 7,
      timezone: 'America/Phoenix',
    },
    exportEmails: {
      enabled: true,
      frequency: 'weekly',
    },
    rules,
  };
}
