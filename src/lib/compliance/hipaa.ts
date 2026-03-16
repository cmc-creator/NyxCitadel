/**
 * HIPAA Compliance Requirements
 * For Covered Entities - Inpatient Psychiatric / Behavioral Health Hospitals
 *
 * Primary Sources:
 * - 45 CFR Part 164 Subpart A - General Administrative Requirements
 * - 45 CFR Part 164 Subpart C - Security Rule (§ 164.302–164.318)
 * - 45 CFR Part 164 Subpart D - Notification in the Case of Breach (§ 164.400–164.414)
 * - 45 CFR Part 164 Subpart E - Privacy Rule (§ 164.500–164.534)
 * - HHS Office for Civil Rights (OCR) Guidance Documents
 * - 42 CFR Part 2 - Substance Use Disorder Patient Records (SUD-specific)
 *
 * Last verified against: HHS OCR HIPAA Guidance - 2024 Final Rules
 * Note: Review annually. Key updates tracked at:
 * https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/index.html
 *
 * BEHAVIORAL HEALTH NOTE:
 * Psychiatric notes receive HEIGHTENED protection under 45 CFR 164.524(a)(1)(i).
 * Patients may request restriction on disclosure to health plan for self-pay services.
 * 42 CFR Part 2 applies if facility provides SUD treatment - stricter consent requirements.
 */

import {
  EventCategory,
  Frequency,
  RegulatoryBody,
  Priority,
} from '@prisma/client';

import type { ComplianceRequirement } from './arizona';

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY RULE - 45 CFR 164 Subpart E
// ─────────────────────────────────────────────────────────────────────────────

export const hipaaPrivacyRequirements: ComplianceRequirement[] = [
  {
    id: 'hipaa-pr-001',
    title: 'Notice of Privacy Practices (NPP) - Annual Review',
    description:
      'Annual review and update of the Notice of Privacy Practices (NPP) to reflect current ' +
      'privacy practices, legal requirements, and any policy changes per 45 CFR 164.520.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER, // HHS/OCR - use OTHER as closest
    standardRef: '45 CFR 164.520',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'NPP must be provided at first service delivery. Posted prominently in facility and on website. ' +
      'Must describe: uses/disclosures, patient rights, complaint process, effective date. ' +
      'Changes to practices require new NPP and re-distribution.',
  },
  {
    id: 'hipaa-pr-002',
    title: 'Patient Privacy Rights Process Audit',
    description:
      'Quarterly audit of patient rights request processes: access to PHI (30-day response), ' +
      'amendment requests, accounting of disclosures, restriction requests per 45 CFR 164.522–164.528.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.522-164.528',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Access requests: respond within 30 days (one 30-day extension permitted). ' +
      'Accounting of disclosures: track for 6 years. ' +
      'BEHAVIORAL HEALTH: psychotherapy notes have restricted access under 164.524(a)(1)(i).',
  },
  {
    id: 'hipaa-pr-003',
    title: 'Minimum Necessary Standard Compliance',
    description:
      'Semi-annual review of minimum necessary policies - ensuring PHI access is limited ' +
      'to least amount necessary to accomplish the intended purpose per 45 CFR 164.502(b).',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.502(b) / 164.514(d)',
    frequency: Frequency.SEMI_ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Define role-based access to PHI. Verify EHR role assignments match minimum necessary. ' +
      'Treatment providers may access all PHI needed; others must be limited by job function.',
  },
  {
    id: 'hipaa-pr-004',
    title: 'Business Associate Agreement (BAA) Inventory & Compliance',
    description:
      'Annual review and update of all Business Associate Agreements. ' +
      'Verify all BAs have current signed BAAs, that agreements include required provisions, ' +
      'and that BAs have not experienced breaches.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.314(a) / 164.504(e)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'A covered entity is liable for BA breaches if it knew of a pattern of activity or practice ' +
      'that constituted a violation and failed to act. ' +
      'BAA must require: safeguards, reporting breaches within 60 days, sub-BA agreements.',
  },
  {
    id: 'hipaa-pr-005',
    title: '42 CFR Part 2 (SUD Records) Compliance Review',
    description:
      'Annual review of compliance with 42 CFR Part 2 if facility provides federally assisted ' +
      'substance use disorder treatment. Stricter consent requirements than standard HIPAA.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '42 CFR Part 2',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      '42 CFR Part 2 was significantly updated in 2024 - now allows disclosure with written consent ' +
      'to covered entities for TPO (Treatment, Payment, Operations), but prohibition on use in ' +
      'criminal investigations remains stronger than HIPAA. Verify consent forms comply with Part 2 format.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY RULE - 45 CFR 164 Subpart C
// ─────────────────────────────────────────────────────────────────────────────

export const hipaaSecurityRequirements: ComplianceRequirement[] = [
  {
    id: 'hipaa-sec-001',
    title: 'Security Risk Analysis (SRA) - Annual',
    description:
      'Annual comprehensive Security Risk Analysis identifying threats and vulnerabilities ' +
      'to ePHI per 45 CFR 164.308(a)(1). Must cover all ePHI systems and locations.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.308(a)(1)(ii)(A)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    month: [1, 2],
    notes:
      'SRA is the #1 cited HIPAA Security Rule violation in OCR audits. ' +
      'Must document: ePHI inventory, threat identification, vulnerability assessment, ' +
      'likelihood and impact ratings, current controls, and risk level. ' +
      'Use HHS SRA tool: https://www.healthit.gov/topic/privacy-security-and-hipaa/security-risk-assessment-tool',
  },
  {
    id: 'hipaa-sec-002',
    title: 'Security Risk Management Plan Review',
    description:
      'Annual review and update of the Security Risk Management plan - documenting how ' +
      'identified risks will be reduced to reasonable and appropriate levels per 45 CFR 164.308(a)(1)(ii)(B).',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.308(a)(1)(ii)(B)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Risk management plan must be linked to the SRA findings. ' +
      'Prioritize remediation by risk level. Document implementation progress quarterly.',
  },
  {
    id: 'hipaa-sec-003',
    title: 'Workforce Security Training - Annual',
    description:
      'Annual security awareness training for all workforce members who access ePHI. ' +
      'Must cover: phishing, password security, device management, reporting incidents.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.308(a)(5)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Training required at hire and periodically thereafter. Annual is the standard. ' +
      'Document completion rates. Add training triggered by incidents or new threats.',
  },
  {
    id: 'hipaa-sec-004',
    title: 'Access Control Review - User Access Audit',
    description:
      'Quarterly review of ePHI system user accounts: add/remove users, verify access levels ' +
      'remain appropriate, audit terminated employee access removal per 45 CFR 164.312(a).',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.312(a)(1)',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Terminated employee access must be revoked SAME DAY if possible; within 24 hrs at most. ' +
      'Audit access logs quarterly for unusual activity (OCR expects this).',
  },
  {
    id: 'hipaa-sec-005',
    title: 'Contingency Plan Testing - Annual',
    description:
      'Annual testing of data backup and disaster recovery plan for ePHI systems per 45 CFR 164.308(a)(7). ' +
      'Includes restore test from backup.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.308(a)(7)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Test backups, document results, review emergency mode operations. ' +
      'HIPAA requires data backups, disaster recovery, and emergency mode operation plan.',
  },
  {
    id: 'hipaa-sec-006',
    title: 'Physical Safeguards Audit - Workstation/Device',
    description:
      'Annual audit of physical safeguards for workstations, mobile devices, and media ' +
      'containing ePHI per 45 CFR 164.310.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.310',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Check: screen locks, encryption on laptops/mobile, locked rooms for servers, ' +
      'media disposal procedures (DOD wiping or physical destruction). ' +
      'Most common breach type: theft/loss of unencrypted devices.',
  },
  {
    id: 'hipaa-sec-007',
    title: 'Audit Log Review - Monthly',
    description:
      'Monthly review of EHR/ePHI system audit logs for inappropriate access to PHI, ' +
      'bulk exports, access to VIP/staff records, and after-hours activity.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.312(b) / 164.308(a)(1)(ii)(D)',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Required "information system activity review." Define what constitutes suspicious activity. ' +
      'Behavioral health EHRs: flag access to records of staff members, executives, or public figures.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BREACH NOTIFICATION RULE - 45 CFR 164 Subpart D
// ─────────────────────────────────────────────────────────────────────────────

export const hipaaBreachNotificationRequirements: ComplianceRequirement[] = [
  {
    id: 'hipaa-bn-001',
    title: 'Breach Response Plan Annual Review',
    description:
      'Annual review of HIPAA breach response plan and procedures. ' +
      'Ensure: breach determination framework, 4-factor risk assessment, ' +
      'notification timelines, and OCR reporting procedure are current.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.400-164.414',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Breach timeline: Individual notification within 60 days of discovery. ' +
      'Media notification (if >500 in state/jurisdiction): within 60 days. ' +
      'OCR annual report: by March 1 for breaches <500; within 60 days for breaches ≥500.',
  },
  {
    id: 'hipaa-bn-002',
    title: 'Breach Log Quarterly Review',
    description:
      'Quarterly review of all privacy and security incidents and breaches: ' +
      'track investigation status, notification deadlines, and OCR submission status.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.408-164.410',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Maintain breach log for 6 years. Track: date of discovery, description, # individuals affected, ' +
      'PHI involved, mitigation steps, notification dates, OCR report date.',
  },
  {
    id: 'hipaa-bn-003',
    title: 'OCR Annual Breach Report Submission',
    description:
      'Submit annual report of all breaches affecting fewer than 500 individuals to HHS OCR ' +
      'by March 1 for the prior calendar year per 45 CFR 164.408.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.408(b)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    month: [2],
    notes:
      'Report via HHS OCR Breach Reporting Portal: https://ocrportal.hhs.gov/ocr/breach/wizard_breach_add.jsf ' +
      'For breaches ≥500: report within 60 days of discovery (no annual batch). ' +
      'For AZ: ADHS requires reporting certain health data breaches - verify current AZ law.',
  },
  {
    id: 'hipaa-bn-004',
    title: 'Breach Risk Assessment Process Tabletop',
    description:
      'Annual tabletop exercise simulating a HIPAA breach scenario to test response procedures, ' +
      'notification workflows, and staff awareness.',
    category: EventCategory.TABLETOP_EXERCISE,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.308(a)(8) / OCR Phase 2 Audit',
    frequency: Frequency.ANNUAL,
    priority: Priority.MEDIUM,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Run a scenario: ransomware attack or lost unencrypted laptop. ' +
      'Test 4-factor risk assessment, notification decision-making, OCR reporting.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HIPAA SANCTIONS & WORKFORCE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const hipaaWorkforceRequirements: ComplianceRequirement[] = [
  {
    id: 'hipaa-wf-001',
    title: 'HIPAA Sanctions Policy Annual Review',
    description:
      'Annual review of workforce sanctions policy for HIPAA violations. ' +
      'Verify sanctions are applied consistently and documented per 45 CFR 164.308(a)(1)(ii)(C).',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.308(a)(1)(ii)(C) / 164.530(e)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Must apply appropriate sanctions against workforce members who fail to comply. ' +
      'Sanctions must be documented. Severity should be proportionate to the violation.',
  },
  {
    id: 'hipaa-wf-002',
    title: 'HIPAA Privacy/Security Training - New Hire',
    description:
      'Ensure all new workforce members receive HIPAA privacy and security training ' +
      'within 30 days of hire per 45 CFR 164.530(b) / 164.308(a)(5).',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.530(b) / 164.308(a)(5)',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Train within 30 days of hire, before any access to PHI. ' +
      'Document training completion - retain records 6 years.',
  },
  {
    id: 'hipaa-wf-003',
    title: 'HIPAA Annual Refresher Training - All Staff',
    description:
      'Annual HIPAA privacy and security refresher training for all workforce members ' +
      'with access to PHI per 45 CFR 164.530(b) / 164.308(a)(5).',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OTHER,
    standardRef: '45 CFR 164.530(b) / 164.308(a)(5)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Include behavioral health-specific privacy: psychotherapy notes, HIV status, ' +
      'substance use disorder records (42 CFR Part 2), and HITECH Act requirements.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MASTER LIST
// ─────────────────────────────────────────────────────────────────────────────

export const allHipaaRequirements: ComplianceRequirement[] = [
  ...hipaaPrivacyRequirements,
  ...hipaaSecurityRequirements,
  ...hipaaBreachNotificationRequirements,
  ...hipaaWorkforceRequirements,
];
