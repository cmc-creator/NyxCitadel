/**
 * Rule-Based AI Triage Engine
 * Determines incident severity, tags, and cascade triggers without external AI.
 * Mirrors clinical decision logic used by compliance officers at licensed behavioral health facilities.
 */

export type TriageSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface TriageResult {
  severity: TriageSeverity;
  tags: string[];
  cascadeTriggered: boolean;
  reason: string;
}

// Incident types that are auto-critical regardless of other factors
const CRITICAL_TYPES = new Set([
  'SENTINEL_EVENT',
  'SUICIDE_ATTEMPT',
  'SUICIDE_DEATH',
  'UNEXPECTED_DEATH',
  'ELOPEMENT_HARM',
]);

// Incident types that are auto-high
const HIGH_TYPES = new Set([
  'ELOPEMENT',
  'ASSAULT_STAFF',
  'ASSAULT_PATIENT',
  'ASSAULT',
  'MEDICATION_ERROR',
  'RESTRAINT_INJURY',
  'FALL_WITH_INJURY',
  'SEXUAL_MISCONDUCT',
  'ABUSE_NEGLECT',
]);

// Severity field values mapping to triage levels
const SEVERITY_MAP: Record<string, TriageSeverity> = {
  CATASTROPHIC: 'CRITICAL',
  SENTINEL: 'CRITICAL',
  CRITICAL: 'CRITICAL',
  MAJOR: 'HIGH',
  SERIOUS: 'HIGH',
  MODERATE: 'MODERATE',
  MINOR: 'LOW',
  NEAR_MISS: 'LOW',
};

export function computeTriage(params: {
  incidentType: string;
  severity: string;
  adhsReportable?: boolean;
  jcReportable?: boolean;
  unitName?: string;
  recentSameTypeCount?: number; // How many same-type incidents in same unit last 60 days
}): TriageResult {
  const { incidentType, severity, adhsReportable, jcReportable, unitName, recentSameTypeCount = 0 } = params;

  const tags: string[] = [];
  let level: TriageSeverity = 'LOW';
  const reasons: string[] = [];

  // Step 1: Type-based classification
  if (CRITICAL_TYPES.has(incidentType)) {
    level = 'CRITICAL';
    reasons.push(`Incident type "${incidentType}" is a sentinel-class event.`);
  } else if (HIGH_TYPES.has(incidentType)) {
    level = 'HIGH';
    reasons.push(`Incident type "${incidentType}" carries high regulatory and patient safety risk.`);
  }

  // Step 2: Severity field override (if higher)
  const mappedLevel = SEVERITY_MAP[severity];
  if (mappedLevel) {
    if (severityRank(mappedLevel) > severityRank(level)) {
      level = mappedLevel;
      reasons.push(`Reported severity "${severity}" elevates triage to ${level}.`);
    }
  }

  // Step 3: Repeat-offense escalation
  if (recentSameTypeCount >= 2) {
    tags.push('repeat_offense');
    reasons.push(`${recentSameTypeCount} same-type incidents in the same unit within 60 days — repeat pattern detected.`);
    if (level === 'MODERATE') level = 'HIGH';
    else if (level === 'LOW') level = 'MODERATE';
  }

  // Step 4: Regulatory-exposure tags
  if (adhsReportable) {
    tags.push('regulatory_exposure');
    reasons.push('ADHS-reportable event — state reporting obligation triggered.');
  }
  if (jcReportable) {
    tags.push('jc_reviewable');
    reasons.push('Joint Commission reviewable event.');
  }

  // Step 5: Category-specific tags
  if (incidentType?.includes('MEDICATION')) tags.push('medication_security');
  if (['ASSAULT_STAFF', 'ASSAULT_PATIENT', 'ASSAULT'].includes(incidentType)) tags.push('workplace_safety');
  if (['ELOPEMENT', 'ELOPEMENT_HARM'].includes(incidentType)) tags.push('patient_security');
  if (['SUICIDE_ATTEMPT', 'SUICIDE_DEATH', 'SENTINEL_EVENT', 'UNEXPECTED_DEATH'].includes(incidentType)) {
    tags.push('sentinel_class');
  }

  // Step 6: Determine if an RCA should auto-cascade
  const cascadeTriggered = level === 'CRITICAL' || tags.includes('sentinel_class') || (level === 'HIGH' && jcReportable === true);

  if (cascadeTriggered) {
    reasons.push('Severity and event class meet threshold — RCA workflow auto-triggered.');
  }

  return {
    severity: level,
    tags,
    cascadeTriggered,
    reason: reasons.join(' '),
  };
}

function severityRank(s: TriageSeverity): number {
  return { LOW: 1, MODERATE: 2, HIGH: 3, CRITICAL: 4 }[s] ?? 0;
}

export function triageBadgeStyle(severity: TriageSeverity | string | null | undefined): string {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border border-red-300';
    case 'HIGH':     return 'bg-orange-100 text-orange-800 border border-orange-300';
    case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'LOW':      return 'bg-green-100 text-green-800 border border-green-300';
    default:         return 'bg-slate-100 text-slate-600';
  }
}
