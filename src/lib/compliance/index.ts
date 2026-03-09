/**
 * NyxCitadel Compliance Library — Master Index
 *
 * Comprehensive regulatory reference for:
 * Arizona Acute Care Inpatient Psychiatric / Behavioral Health Facility
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  HOW TO KEEP THIS LIBRARY CURRENT                           │
 * │                                                             │
 * │  1. Each file has a "Last verified against" header comment. │
 * │     Update that date when you review the source regulation. │
 * │                                                             │
 * │  2. Key review triggers:                                    │
 * │     - January: JC new standards take effect                 │
 * │     - March 1:  OCR annual HIPAA breach report due          │
 * │     - New CMS rules: check https://www.cms.gov/newsroom     │
 * │     - DEA changes: https://www.deadiversion.usdoj.gov       │
 * │     - AZ ADHS updates: https://www.azdhs.gov/licensing      │
 * │     - OSHA standards: https://www.osha.gov/laws-regs        │
 * │                                                             │
 * │  3. Add new requirement entries in the relevant file using  │
 * │     the ComplianceRequirement interface. Follow the id      │
 * │     naming convention (prefix-category-###).                │
 * │                                                             │
 * │  4. After adding new requirements, run the seed script to   │
 * │     update the ComplianceItems table in the database.       │
 * └─────────────────────────────────────────────────────────────┘
 *
 * File Organization:
 *   arizona.ts        — AZ ADHS, life safety, EM, JC CAMH, IC, staff
 *   federal-cms.ts    — CMS CoPs (42 CFR 482), patient rights, R/S, psych CoPs
 *   hipaa.ts          — HIPAA Privacy, Security, Breach Notification (45 CFR 164)
 *   pharmacy-dea.ts   — DEA (21 CFR 1300+), AZ BPPE, PDMP, ISMP high-alert meds
 *   osha.ts           — OSHA (29 CFR 1910/1904), employee health, WPV, TB, AZ WC
 */

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORTS — Interface & Types
// ─────────────────────────────────────────────────────────────────────────────

export type { ComplianceRequirement } from './arizona';

export {
  generateComplianceCalendar,
  allArizonaComplianceRequirements,
  emergencyManagementRequirements,
  lifeSafetyRequirements,
  jointCommissionRequirements,
  arizonaCompliance,
  infectionControlRequirements,
  policyAndStaffRequirements,
} from './arizona';

export {
  allFederalCmsRequirements,
  patientRightsCoP,
  restraintSeclusionCoP,
  psychiatricHospitalCoP,
  dischargePlanningCoP,
  qapiCoP,
  infectionControlCoP,
  pharmaceuticalServicesCoP,
  medicalStaffCoP,
  governingBodyCoP,
} from './federal-cms';

export {
  allHipaaRequirements,
  hipaaPrivacyRequirements,
  hipaaSecurityRequirements,
  hipaaBreachNotificationRequirements,
  hipaaWorkforceRequirements,
} from './hipaa';

export {
  allPharmacyDeaRequirements,
  deaRegistrationRequirements,
  csDiversionRequirements,
  pdmpRequirements,
  azPharmacyRequirements,
  highAlertMedicationRequirements,
} from './pharmacy-dea';

export {
  allOshaWorkforceRequirements,
  bloodbornePathogensRequirements,
  oshaRecordkeepingRequirements,
  workplaceViolenceRequirements,
  respiratoryProtectionRequirements,
  employeeHealthRequirements,
  hazcomRequirements,
  arizonaWorkersCompRequirements,
} from './osha';

// ─────────────────────────────────────────────────────────────────────────────
// MASTER COMBINED LIST — All requirements across all regulatory sources
// ─────────────────────────────────────────────────────────────────────────────

import { allArizonaComplianceRequirements } from './arizona';
import { allFederalCmsRequirements } from './federal-cms';
import { allHipaaRequirements } from './hipaa';
import { allPharmacyDeaRequirements } from './pharmacy-dea';
import { allOshaWorkforceRequirements } from './osha';
import type { ComplianceRequirement } from './arizona';
import { RegulatoryBody, Priority } from '@prisma/client';

export const allComplianceRequirements: ComplianceRequirement[] = [
  ...allArizonaComplianceRequirements,
  ...allFederalCmsRequirements,
  ...allHipaaRequirements,
  ...allPharmacyDeaRequirements,
  ...allOshaWorkforceRequirements,
];

// ─────────────────────────────────────────────────────────────────────────────
// LIBRARY METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const COMPLIANCE_LIBRARY_VERSION = '2.0.0';

export const COMPLIANCE_LIBRARY_STATS = {
  totalRequirements: allComplianceRequirements.length,
  bySource: {
    arizona: allArizonaComplianceRequirements.length,
    federalCms: allFederalCmsRequirements.length,
    hipaa: allHipaaRequirements.length,
    pharmacyDea: allPharmacyDeaRequirements.length,
    oshaWorkforce: allOshaWorkforceRequirements.length,
  },
  criticalCount: allComplianceRequirements.filter(r => r.priority === Priority.CRITICAL).length,
  highCount: allComplianceRequirements.filter(r => r.priority === Priority.HIGH).length,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter requirements by regulatory body
 */
export function getRequirementsByBody(body: RegulatoryBody): ComplianceRequirement[] {
  return allComplianceRequirements.filter(r => r.regulatoryBody === body);
}

/**
 * Filter requirements by priority
 */
export function getRequirementsByPriority(priority: Priority): ComplianceRequirement[] {
  return allComplianceRequirements.filter(r => r.priority === priority);
}

/**
 * Get a requirement by its ID
 */
export function getRequirementById(id: string): ComplianceRequirement | undefined {
  return allComplianceRequirements.find(r => r.id === id);
}

/**
 * Search requirements by keyword in title or description
 */
export function searchRequirements(query: string): ComplianceRequirement[] {
  const q = query.toLowerCase();
  return allComplianceRequirements.filter(
    r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.standardRef.toLowerCase().includes(q) ||
      (r.notes?.toLowerCase().includes(q) ?? false)
  );
}

/**
 * Get requirements due in a specific calendar month
 */
export function getRequirementsByMonth(month: number): ComplianceRequirement[] {
  return allComplianceRequirements.filter(r => r.month?.includes(month));
}
