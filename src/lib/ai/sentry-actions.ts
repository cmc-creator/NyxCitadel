export type DraftActionType = 'CREATE_CAP_DRAFT' | 'CREATE_INCIDENT_DRAFT' | 'CREATE_CALENDAR_DRAFT';

export type DraftActionRequest = {
  type: DraftActionType;
  payload: Record<string, unknown>;
};

export type ActionSuggestion = DraftActionRequest;

type Primitive = string | number | boolean | null;

const ALLOWED_TYPES: DraftActionType[] = [
  'CREATE_CAP_DRAFT',
  'CREATE_INCIDENT_DRAFT',
  'CREATE_CALENDAR_DRAFT',
];

const ACTION_ALLOWED_ROLES = new Set<string>([
  'SUPER_ADMIN',
  'ADMIN',
  'COMPLIANCE_OFFICER',
  'RISK_MANAGER',
  'QUALITY',
  'EM_COORDINATOR',
]);

const ACTION_PREVIEW_FIELDS: Record<DraftActionType, string[]> = {
  CREATE_CAP_DRAFT: ['title', 'priority', 'source', 'targetDate', 'description'],
  CREATE_INCIDENT_DRAFT: ['incidentType', 'severity', 'incidentDate', 'location', 'briefDescription'],
  CREATE_CALENDAR_DRAFT: ['title', 'category', 'priority', 'dueDate', 'description'],
};

export function canRunSentryDraftAction(role: string | null | undefined): boolean {
  if (!role) return false;
  return ACTION_ALLOWED_ROLES.has(role);
}

export function sanitizeActionPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {};

  const entries = Object.entries(payload as Record<string, unknown>).slice(0, 20);
  const safe: Record<string, Primitive> = {};

  for (const [key, value] of entries) {
    if (typeof key !== 'string') continue;
    if (typeof value === 'string') {
      safe[key] = value.slice(0, 500);
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      safe[key] = value;
    }
  }

  return safe;
}

export function normalizeDraftActionRequest(input: unknown): DraftActionRequest | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;

  const obj = input as { type?: unknown; payload?: unknown };
  if (typeof obj.type !== 'string') return null;
  if (!ALLOWED_TYPES.includes(obj.type as DraftActionType)) return null;

  return {
    type: obj.type as DraftActionType,
    payload: sanitizeActionPayload(obj.payload),
  };
}

function toDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not provided';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return 'Not provided';
}

function toLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

export function buildActionPreview(action: DraftActionRequest): Array<{ key: string; label: string; value: string }> {
  const fields = ACTION_PREVIEW_FIELDS[action.type] ?? [];

  return fields
    .slice(0, 5)
    .map((key) => ({
      key,
      label: toLabel(key),
      value: toDisplayValue(action.payload[key]),
    }))
    .filter((item) => item.value !== 'Not provided' || item.key === fields[0]);
}

export function buildActionAuditChanges(action: DraftActionRequest, source: 'chat-confirmed' | 'api' = 'chat-confirmed') {
  return {
    assistant: 'Sentry',
    source,
    actionType: action.type,
    payload: action.payload,
  };
}
