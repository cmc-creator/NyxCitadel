/**
 * DEA / Pharmacy Compliance Requirements
 * For Hospital Pharmacy - Inpatient Psychiatric / Behavioral Health Facility
 *
 * Primary Sources:
 * - 21 CFR Part 1300–1321 - DEA Controlled Substances Regulations
 *   - 21 CFR 1301 - Registration
 *   - 21 CFR 1304 - Records & Reports
 *   - 21 CFR 1306 - Prescriptions
 *   - 21 CFR 1307 - Miscellaneous
 *   - 21 CFR 1317 - Disposal
 * - ARS § 32-1901 et seq. - Arizona Pharmacy Act
 * - Arizona Pharmacy Practice Act - A.A.C. R4-23 (Board of Pharmacy Rules)
 * - AZ BPPE (Board of Pharmacy and Pharmaceutical Examiners) - Hospital Rules R4-23-651 et seq.
 * - Arizona PDMP - RSAzPMP (Rx Monitoring Program) under A.R.S. § 36-2601 et seq.
 * - ISMP (Institute for Safe Medication Practices) - High Alert Medication Guidelines
 * - TJC CAMH - MM (Medication Management) Standards
 * - 42 CFR 482.25 - CMS Pharmaceutical Services CoP
 *
 * Last verified against: DEA Diversion Control Division - 2025 Updates
 * AZ BPPE Rules effective: July 1, 2024
 * RSAzPMP mandatory prescriber check requirements: effective 2024
 */

import {
  EventCategory,
  Frequency,
  RegulatoryBody,
  Priority,
} from '@prisma/client';

import type { ComplianceRequirement } from './arizona';

// ─────────────────────────────────────────────────────────────────────────────
// DEA REGISTRATION & RECORDS - 21 CFR 1301 / 1304
// ─────────────────────────────────────────────────────────────────────────────

export const deaRegistrationRequirements: ComplianceRequirement[] = [
  {
    id: 'dea-reg-001',
    title: 'DEA Registration Renewal',
    description:
      'DEA Certificate of Registration for hospital pharmacy (Schedule II-V controlled substances). ' +
      'Renew every 3 years. Submit Form DEA-224a (renewal) at least 60 days before expiration.',
    category: EventCategory.PHARMACY_INSPECTION,
    regulatoryBody: RegulatoryBody.DEA,
    standardRef: '21 CFR 1301.13',
    frequency: Frequency.AS_NEEDED, // Every 3 years
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'Registration is facility-specific - not transferable. ' +
      'Renew at: https://www.deadiversion.usdoj.gov  ' +
      'Any significant change (address, schedule addition) requires amendment. ' +
      'Separate DEA registration required if facility has clinics at different locations.',
  },
  {
    id: 'dea-reg-002',
    title: 'DEA Biennial Inventory - Controlled Substances',
    description:
      'Complete physical inventory of all Schedule II-V controlled substances every 2 years ' +
      'per 21 CFR 1304.11. Inventory must be taken on a regular business day.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.DEA,
    standardRef: '21 CFR 1304.11',
    frequency: Frequency.BIENNIAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'Exact count required for Schedule II. Reasonable estimate acceptable for III-V (if > 1000 units: exact count). ' +
      'Retain inventory 2 years. Record: drug name, form, strength, quantity, date, time.',
  },
  {
    id: 'dea-reg-003',
    title: 'Schedule II CS Records - Maintenance & Audit',
    description:
      'Maintain Schedule II controlled substance records in separately-bound or electronic ' +
      'form accessible to DEA inspectors. Conduct monthly internal audit.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.DEA,
    standardRef: '21 CFR 1304.04 / 1304.21',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'All Schedule II records must be kept separately (not co-mingled with III-V). ' +
      'Records must be maintained for 2 years (AZ requires 7 years for pharmacy records). ' +
      'DEA Form 222 (or CSOS electronic equivalent) required for all Schedule II orders.',
  },
  {
    id: 'dea-reg-004',
    title: 'Controlled Substance Loss/Theft Reporting',
    description:
      'Report any significant theft or loss of controlled substances to DEA ' +
      'via DEA Form 106 within 1 business day of discovery per 21 CFR 1301.76.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.DEA,
    standardRef: '21 CFR 1301.76',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'RISK_MANAGER',
    notes:
      'DEA Form 106 filed online at: https://apps.deadiversion.usdoj.gov/webforms/dtSearchForm.jsp  ' +
      'Also notify AZ BPPE of significant diversion. ' +
      'Define "significant loss" in policy (individual case, pattern, or single large incident). ' +
      'For any DEA Schedule I-V theft: also notify local law enforcement.',
  },
  {
    id: 'dea-reg-005',
    title: 'Controlled Substance Disposal - DEA Form 41',
    description:
      'Dispose of expired, damaged, or unwanted controlled substances using authorized DEA methods. ' +
      'Complete DEA Form 41 for waste/disposal per 21 CFR 1317.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.DEA,
    standardRef: '21 CFR 1317',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'Options: DEA take-back events, DEA-authorized reverse distributors, on-site non-retrievable disposal. ' +
      'Hospital/clinic: can witness/document patient medication wasting without DEA Form 41 for wasted doses. ' +
      'Unused expired stock: must use DEA Form 41 or reverse distributor.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLED SUBSTANCE DIVERSION MONITORING
// ─────────────────────────────────────────────────────────────────────────────

export const csDiversionRequirements: ComplianceRequirement[] = [
  {
    id: 'dea-div-001',
    title: 'Controlled Substance Discrepancy Reconciliation - Daily',
    description:
      'Daily reconciliation of all controlled substance transactions: ' +
      'dispensed vs. administered vs. wasted. All discrepancies must be investigated same shift.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.DEA,
    standardRef: '21 CFR 1304 / JC MM.01.01.03',
    frequency: Frequency.DAILY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'Automated Dispensing Cabinets (ADCs): run daily reconciliation reports. ' +
      'Document every discrepancy investigation - resolved or escalated to diversion officer. ' +
      'Pattern of discrepancies by shift or individual must trigger formal investigation.',
  },
  {
    id: 'dea-div-002',
    title: 'Diversion Monitoring Program Review - Quarterly',
    description:
      'Quarterly review of diversion monitoring analytics: ADC data, naltrexone/naloxone usage, ' +
      'override patterns, waste witness compliance, anomaly reports.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.DEA,
    standardRef: '21 CFR 1304 / JC MM.01.01.03',
    frequency: Frequency.QUARTERLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'Use diversion monitoring software (e.g., Medacist, Omnicell Pandora, BD Pyxis analytics). ' +
      'Report diversion monitoring outcomes quarterly to P&T and QAPI. ' +
      'All confirmed or suspected diversion must be reported to DEA.',
  },
  {
    id: 'dea-div-003',
    title: 'CS Waste Witness Compliance Audit',
    description:
      'Monthly audit of controlled substance wasting records to verify all wastes are witnessed ' +
      'by a second licensed nurse or pharmacist per policy and AZ BPPE requirements.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.AZ_BPPE,
    standardRef: 'AZ A.A.C. R4-23-651 / JC MM.01.01.03',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'Unwitnessed wastes are a red flag for diversion. ' +
      'Track by individual employee to identify patterns. ' +
      'AZ BPPE: same-day witness required; no retroactive witnessing.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ARIZONA PDMP - RSAzPMP (Prescription Drug Monitoring Program)
// A.R.S. § 36-2601 et seq.
// ─────────────────────────────────────────────────────────────────────────────

export const pdmpRequirements: ComplianceRequirement[] = [
  {
    id: 'az-pdmp-001',
    title: 'PDMP Prescriber Check - Mandatory Before CS Prescription',
    description:
      'Verify AZ RSAzPMP has been checked before prescribing controlled substances. ' +
      'AZ law requires checking RSAzPMP before prescribing Schedule II-IV drugs (with limited exceptions).',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.AZ_BPPE,
    standardRef: 'A.R.S. § 36-2606(C)',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'AZ RSAzPMP: https://hiqa.azdhs.gov/PMP/  ' +
      'Exceptions: patient in hospice, hospital inpatient administration (on-floor), surgical use. ' +
      'Document RSAzPMP check in the medical record or prescriber note. ' +
      'Significant pattern concerns: report to AZ ADHS per A.R.S. § 36-2606.',
  },
  {
    id: 'az-pdmp-002',
    title: 'PDMP Data Submission - Pharmacy Reporting',
    description:
      'Hospital outpatient pharmacy must report all Schedule II-IV dispensing to RSAzPMP ' +
      'within 1 business day of dispensing per A.R.S. § 36-2603.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.AZ_BPPE,
    standardRef: 'A.R.S. § 36-2603',
    frequency: Frequency.DAILY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'INPATIENT dispensing (floor stock, ADC) generally exempt from PDMP reporting. ' +
      'Outpatient/retail pharmacy dispensing: must report next business day. ' +
      'Failure to report is a class 1 misdemeanor under AZ law.',
  },
  {
    id: 'az-pdmp-003',
    title: 'PDMP Compliance Policy Review - Annual',
    description:
      'Annual review of PDMP policies, prescriber training documentation, and query log audits. ' +
      'Ensure all prescribers are registered users of RSAzPMP.',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.AZ_BPPE,
    standardRef: 'A.R.S. § 36-2601 et seq.',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'RSAzPMP Prescriber registration: https://hiqa.azdhs.gov/PMP/  ' +
      'Audit a sample of CS orders to verify PDMP query was documented.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ARIZONA BOARD OF PHARMACY - AZ BPPE Hospital Pharmacy
// A.A.C. R4-23-651 et seq.
// ─────────────────────────────────────────────────────────────────────────────

export const azPharmacyRequirements: ComplianceRequirement[] = [
  {
    id: 'az-bppe-001',
    title: 'AZ BPPE Hospital Pharmacy Permit Renewal',
    description:
      'Biennial renewal of Arizona Board of Pharmacy hospital pharmacy permit. ' +
      'Submit renewal 90 days before expiration.',
    category: EventCategory.PHARMACY_INSPECTION,
    regulatoryBody: RegulatoryBody.AZ_BPPE,
    standardRef: 'A.R.S. § 32-1929 / A.A.C. R4-23-651',
    frequency: Frequency.BIENNIAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'AZ BPPE eLicense: https://ge.az.gov/  ' +
      'Hospital pharmacy permit expires on even years (as of current BPPE schedule). ' +
      'Director of Pharmacy must hold current AZ pharmacist license.',
  },
  {
    id: 'az-bppe-002',
    title: 'Pharmacy Self-Inspection - Annual',
    description:
      'Annual pharmacy self-inspection using AZ BPPE inspection checklist. ' +
      'Document findings and any corrective actions per A.A.C. R4-23-665.',
    category: EventCategory.PHARMACY_INSPECTION,
    regulatoryBody: RegulatoryBody.AZ_BPPE,
    standardRef: 'A.A.C. R4-23-665',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'AZ BPPE may conduct unannounced inspections. Self-inspection demonstrates proactive compliance. ' +
      'Cover: storage conditions, labeling, records, DEA compliance, returns, sterile compounding (if applicable).',
  },
  {
    id: 'az-bppe-003',
    title: 'Pharmacist-in-Charge (PIC) Responsibilities Review',
    description:
      'Annual review with Pharmacist-in-Charge (PIC) of their legal responsibilities under AZ law: ' +
      'supervision of pharmacy operations, CS accountability, policy maintenance.',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.AZ_BPPE,
    standardRef: 'A.A.C. R4-23-653',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'ADMIN',
    notes:
      'PIC is personally and professionally responsible for pharmacy operations. ' +
      'Notify BPPE within 10 days of PIC change.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-ALERT MEDICATIONS - ISMP / JC NPSG
// ─────────────────────────────────────────────────────────────────────────────

export const highAlertMedicationRequirements: ComplianceRequirement[] = [
  {
    id: 'ismp-ha-001',
    title: 'High-Alert Medication List Annual Review',
    description:
      'Annual review and update of facility\'s high-alert medication list using ISMP guidelines. ' +
      'Confirm special precautions (double-checks, warnings, restrictions) are in place.',
    category: EventCategory.MEDICATION_MANAGEMENT_REVIEW,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'JC NPSG.03.05.01 / ISMP High-Alert Medication List',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'ISMP High-Alert Medications for Acute Care: https://www.ismp.org/recommendations/high-alert-medications-acute-list  ' +
      'Key psychiatric high-alerts: lithium, clozapine, haloperidol IV, insulin, anticoagulants. ' +
      'Precautions must include: independent double-check, reduced concentration, specific labeling.',
  },
  {
    id: 'ismp-ha-002',
    title: 'High-Alert Medication Audit - Monthly',
    description:
      'Monthly audit of high-alert medication storage, labeling, double-check compliance, ' +
      'and administration verification.',
    category: EventCategory.CONTROLLED_SUBSTANCE_AUDIT,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'JC NPSG.03.05.01 / MM.01.01.03',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'Audit: are HAM storage areas labeled? Are double-check sheets complete? ' +
      'Are concentrations standardized? Present results at P&T and QAPI.',
  },
  {
    id: 'ismp-ha-003',
    title: 'Clozapine REMS Compliance (if applicable)',
    description:
      'If prescribing clozapine: verify enrollment and compliance with Clozapine REMS program. ' +
      'Monthly ANC monitoring, registry enrollment, and dispensing verification per FDA REMS.',
    category: EventCategory.MEDICATION_MANAGEMENT_REVIEW,
    regulatoryBody: RegulatoryBody.OTHER, // FDA
    standardRef: 'FDA Clozapine REMS Program (21 CFR 314.520)',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'Clozapine REMS: https://www.clozapinerems.com  ' +
      'ANC monitoring REQUIRED before each dispense (or per REMS protocol). ' +
      'Patients, prescribers, AND pharmacy must be enrolled in REMS. ' +
      'Non-compliance: FDA can restrict prescribing at facility.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MASTER LIST
// ─────────────────────────────────────────────────────────────────────────────

export const allPharmacyDeaRequirements: ComplianceRequirement[] = [
  ...deaRegistrationRequirements,
  ...csDiversionRequirements,
  ...pdmpRequirements,
  ...azPharmacyRequirements,
  ...highAlertMedicationRequirements,
];
