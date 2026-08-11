/**
 * Federal CMS Conditions of Participation (CoP) Requirements
 * For Inpatient Psychiatric Facilities (IPF) / Acute Psychiatric Hospitals
 *
 * Primary Sources:
 * - 42 CFR Part 482 - Conditions of Participation for Hospitals
 * - 42 CFR Part 482, Subpart E (§ 482.60-482.62) - Special Requirements for
 *   Psychiatric Hospitals (IPF CoPs)
 * - 42 CFR Part 441 Subpart D - IMD (Institutions for Mental Disease) Medicaid
 * - CMS State Operations Manual (SOM) - Appendix A (hospitals), Appendix AA (psych)
 * - CMS Interpretive Guidelines for Restraint/Seclusion (482.13(e)(f))
 *
 * Last verified against: CMS SOM Update - January 2025
 * Note: Review annually for CoP revisions. CMS publishes SOM updates at:
 * https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/Internet-Only-Manuals-IOMs
 */

import {
  EventCategory,
  Frequency,
  RegulatoryBody,
  Priority,
} from '@prisma/client';

import type { ComplianceRequirement } from './arizona';

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT RIGHTS - 42 CFR 482.13
// ─────────────────────────────────────────────────────────────────────────────

export const patientRightsCoP: ComplianceRequirement[] = [
  {
    id: 'cms-pr-001',
    title: 'Patient Rights Policy Annual Review',
    description:
      'Annual review of all patient rights policies against 42 CFR 482.13. ' +
      'Includes: notice of rights, privacy, consent, grievance process, restraint/seclusion.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'CMS requires hospitals to inform each patient of their rights BEFORE providing care when possible. ' +
      'In a psychiatric setting this includes AZ Mental Health Bill of Rights (A.R.S. § 36-504).',
  },
  {
    id: 'cms-pr-002',
    title: 'Informed Consent Process Audit',
    description:
      'Monthly audit of informed consent documentation - treatment, medications, ' +
      'procedures, and research participation per 42 CFR 482.13(b).',
    category: EventCategory.INFORMED_CONSENT_AUDIT,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(b)',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'Sample minimum 10% of consent forms monthly. Document findings in QAPI.',
  },
  {
    id: 'cms-pr-003',
    title: 'Grievance Process Compliance Review',
    description:
      'Quarterly review of grievance logs, resolution timelines, and written responses ' +
      'per 42 CFR 482.13(a). Verify 7-day acknowledgment and 30-day resolution.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(a)',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'Hospitals must have a grievance committee. Written response required for all grievances. ' +
      'Verbal complaints resolved at point of care do NOT require written response.',
  },
  {
    id: 'cms-pr-004',
    title: 'Patient Rights Notice Distribution Audit',
    description:
      'Quarterly audit confirming all patients receive written notice of rights at admission ' +
      'per 42 CFR 482.13(a)(1). Check for language access accommodations.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(a)(1)',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'Must be provided in a language and format the patient can understand. ' +
      'For behavioral health: AZ requires rights notice in AZ Mental Health Bill of Rights format.',
  },
  {
    id: 'cms-pr-005',
    title: 'Advance Directive Compliance Audit',
    description:
      'Annual audit of advance directive documentation, staff education, and honoring of ' +
      'patient advance directives per 42 CFR 482.13(b)(3) and PSDA requirements.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(b)(3) / PSDA (42 USC 1395cc)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Patient Self-Determination Act requires hospitals to ask about and document advance directives. ' +
      'AZ: POLST (Physician Orders for Life-Sustaining Treatment) recognized under A.R.S. § 36-3261.',
  },
  {
    id: 'cms-pr-006',
    title: 'Involuntary Hold / Psychiatric Detention Process Review',
    description:
      'Quarterly review of involuntary hold (Title 36 / court-ordered) documentation, ' +
      'patient notification of rights, hearing timelines, and legal representation access.',
    category: EventCategory.PATIENT_RIGHTS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(e) / AZ A.R.S. § 36-520 et seq.',
    frequency: Frequency.QUARTERLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'AZ Title 36 Involuntary Evaluation (IEA) - maximum 72 hrs without court order. ' +
      'Court-ordered evaluation (COE) extends to hearing. Patient has right to counsel.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RESTRAINT & SECLUSION - 42 CFR 482.13(e)(f)
// ─────────────────────────────────────────────────────────────────────────────

export const restraintSeclusionCoP: ComplianceRequirement[] = [
  {
    id: 'cms-rs-001',
    title: 'Restraint/Seclusion Death Reporting to CMS',
    description:
      'Report all deaths occurring during or within 24 hours of restraint or seclusion, ' +
      'or within 1 week when there is reasonable likelihood of causal relationship.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(g)',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'RISK_MANAGER',
    notes:
      'Report to CMS Regional Office and State agency (AZ ADHS) within business day of awareness. ' +
      'Document: patient name/age, date/time of death, type/duration of restraint, circumstances.',
  },
  {
    id: 'cms-rs-002',
    title: 'Restraint/Seclusion Data Monthly Review (QAPI)',
    description:
      'Monthly QAPI review of all restraint/seclusion events including: rates per 1000 patient days, ' +
      'duration, injuries, deaths, and improvement trends.',
    category: EventCategory.JC_PI_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(e) / JC PC.03.05.17',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'CMS and JC both require active QAPI review of R/S data. ' +
      'Must track and trend events toward reduction. Report to Board quarterly.',
  },
  {
    id: 'cms-rs-003',
    title: 'Restraint Order Compliance Audit',
    description:
      'Monthly audit of restraint orders: physician/LIP order present, 1-hour face-to-face ' +
      'assessment completed, order time limits followed (4hr adult / 2hr youth / 1hr < 9yrs).',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(e)(5)',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'Original order expires based on age; cannot be written as PRN. ' +
      'Each renewal requires new face-to-face by LIP or trained RN per facility policy.',
  },
  {
    id: 'cms-rs-004',
    title: 'Restraint/Seclusion Staff Training - Initial & Annual',
    description:
      'Verify all staff authorized to apply restraints or place in seclusion have completed ' +
      'required initial and annual training per 42 CFR 482.13(f)(2).',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.13(f)(2)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EDUCATION',
    notes:
      'Training must cover: safe application, monitoring, identifying physical distress, ' +
      'clinical criteria for use, alternatives, first aid, CPR. Document in personnel files.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PSYCHIATRIC HOSPITAL SPECIAL CONDITIONS - 42 CFR 482.60-482.62
// ─────────────────────────────────────────────────────────────────────────────

export const psychiatricHospitalCoP: ComplianceRequirement[] = [
  {
    id: 'cms-phc-001',
    title: 'Individualized Treatment Plan (ITP) Compliance Audit',
    description:
      'Monthly audit of individualized treatment plans per 42 CFR 482.61(b). ' +
      'Verify: completed within 3 days of admission, interdisciplinary team involvement, ' +
      'measurable goals, patient participation documented.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.61(b)',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'IPF CoP requires treatment plans within 3 days. Must include: ' +
      'diagnosis, treatment goals, discharge criteria, and signature of attending physician. ' +
      'JC requires within 72 hours. AZ ADHS R9-10-306: within 72 hours.',
  },
  {
    id: 'cms-phc-002',
    title: 'Medical Records - Psychiatric Special Requirements Audit',
    description:
      'Annual audit of psychiatric hospital medical record requirements per 42 CFR 482.61(d): ' +
      'legal status, psychosocial history, summary of findings, condition on discharge.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.61(d)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'In addition to standard CoP 482.24 medical record requirements, ' +
      'psychiatric hospitals must document: legal status on admission/discharge, ' +
      'complete social history, ITP, and condition at discharge including aftercare plan.',
  },
  {
    id: 'cms-phc-003',
    title: 'Active Treatment Program Review',
    description:
      'Annual review of active treatment program per 42 CFR 482.61(a)/(c). ' +
      'Verify: 24-hour therapeutic milieu, structured programming, activity schedule, ' +
      'community meetings, individualized activities.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.61(a)(c)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      '"Active treatment" is the defining criterion for a psychiatric hospital under Medicare. ' +
      'CMS surveyors will observe the milieu and review activity schedules and group notes.',
  },
  {
    id: 'cms-phc-004',
    title: 'Special Staff Requirements Review',
    description:
      'Annual verification of psychiatric hospital special staffing requirements per 42 CFR 482.62: ' +
      'full-time director of psychiatric nursing, effective medical staff, ' +
      'psychiatrist with responsibility for treatment programs.',
    category: EventCategory.CREDENTIALING_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.62',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'A psychiatrist must be responsible for all medical activities. ' +
      'Psychiatric nursing director must be full-time. These are mandatory CoP requirements.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DISCHARGE PLANNING - 42 CFR 482.43
// ─────────────────────────────────────────────────────────────────────────────

export const dischargePlanningCoP: ComplianceRequirement[] = [
  {
    id: 'cms-dp-001',
    title: 'Discharge Planning Process Annual Policy Review',
    description:
      'Annual review of discharge planning policies against 42 CFR 482.43. ' +
      'Verify: evaluation screens within 24 hours, patient/family involvement, ' +
      'post-acute referral process, follow-up appointment documentation.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.43',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'IMPACT Act (2014) extended discharge planning requirements. ' +
      'Must evaluate EVERY patient for discharge planning needs. ' +
      'Patient choice of post-acute provider must be documented and respected.',
  },
  {
    id: 'cms-dp-002',
    title: 'Discharge Planning Compliance Audit',
    description:
      'Monthly chart audit: timeliness of evaluation, documented discharge plan, ' +
      'patient/family education, aftercare appointments made, medication reconciliation completed.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.43(c)',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'For psychiatric discharges: 7-day follow-up appointment is the HEDIS/NCQA standard. ' +
      'CMS CoP requires documented follow-up plan; JC RC.02.04.01 requires aftercare instructions.',
  },
  {
    id: 'cms-dp-003',
    title: 'Readmission Review - Discharge Planning Effectiveness',
    description:
      'Monthly review of 30-day readmissions to assess discharge planning effectiveness. ' +
      'Identify barriers, incomplete discharge plans, and failed referrals.',
    category: EventCategory.QAPI_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.21 / 482.43',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'CMS publicly reports 30-day readmission rates. Psych hospitals: HBIPS-6 (30-day post-discharge follow-up). ' +
      'Present readmission data at QAPI and Governing Body meetings.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// QAPI - 42 CFR 482.21
// ─────────────────────────────────────────────────────────────────────────────

export const qapiCoP: ComplianceRequirement[] = [
  {
    id: 'cms-qapi-001',
    title: 'QAPI Program Annual Evaluation',
    description:
      'Annual written evaluation of the QAPI program: scope, objectives, activities, ' +
      'performance improvement projects, and outcomes per 42 CFR 482.21(e).',
    category: EventCategory.CMS_QAPI_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.21(e)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    month: [12],
    notes:
      'Annual QAPI evaluation must be presented to Governing Body. ' +
      'Must include: all hospital departments, all contracted services, ' +
      'adverse events, and an ongoing performance improvement project.',
  },
  {
    id: 'cms-qapi-002',
    title: 'QAPI Performance Improvement Projects (PIPs)',
    description:
      'Maintain at least 2 active performance improvement projects at all times. ' +
      'Projects must address high-risk, high-volume, or problem-prone areas.',
    category: EventCategory.CMS_QAPI_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.21(d)',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'CMS surveyors will request evidence of active PIPs and improvement over time. ' +
      'Document using PDSA (Plan-Do-Study-Act) or equivalent methodology.',
  },
  {
    id: 'cms-qapi-003',
    title: 'HBIPS Core Measures Data Submission',
    description:
      'Monthly patient-level data submission of Hospital-Based Inpatient Psychiatric ' +
      'Services (HBIPS) core measures to The Joint Commission (ORYX) or CMS.',
    category: EventCategory.CMS_QAPI_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.21 / HBIPS Measure Set',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'HBIPS measures: HBIPS-2 (hours of physical restraint), HBIPS-3 (hours of seclusion), ' +
      'HBIPS-5 (patients discharged on multiple antipsychotics), ' +
      'HBIPS-6 (post-discharge follow-up 7d), HBIPS-7 (follow-up 30d).',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INFECTION CONTROL CoP - 42 CFR 482.42
// ─────────────────────────────────────────────────────────────────────────────

export const infectionControlCoP: ComplianceRequirement[] = [
  {
    id: 'cms-ic-001',
    title: 'Infection Control Officer (ICO) Designation',
    description:
      'Annual confirmation that a qualified individual serves as Infection Control Officer. ' +
      'Verify qualifications, scope of responsibilities, and reporting structure.',
    category: EventCategory.IC_COMMITTEE_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.42(a)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'ADMIN',
    notes:
      'CMS requires a designated, qualified ICO. No specific credential mandated by CMS, ' +
      'but CIC (Certified in Infection Control) is best practice and JC expectation.',
  },
  {
    id: 'cms-ic-002',
    title: 'Infection Control Surveillance - Ongoing',
    description:
      'Ongoing surveillance of healthcare-associated infections (HAIs). ' +
      'Monthly reporting of HAI rates: SSI, CLABSI, CAUTI, CDI, MRSA.',
    category: EventCategory.IC_SURVEILLANCE_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.42(a)(1)',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'HAI reporting via NHSN (CDC National Healthcare Safety Network) required for Medicare participation. ' +
      'AZ ADHS also requires NHSN enrollment and reporting.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PHARMACEUTICAL SERVICES CoP - 42 CFR 482.25
// ─────────────────────────────────────────────────────────────────────────────

export const pharmaceuticalServicesCoP: ComplianceRequirement[] = [
  {
    id: 'cms-ph-001',
    title: 'Pharmacy and Therapeutics Committee Meeting',
    description:
      'Quarterly Pharmacy & Therapeutics (P&T) committee meeting reviewing formulary, ' +
      'medication safety incidents, ADRs, and drug utilization per 42 CFR 482.25(b).',
    category: EventCategory.MEDICATION_MANAGEMENT_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.25(b)',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'P&T must include medical staff representation. ' +
      'Minutes must be maintained and available for survey.',
  },
  {
    id: 'cms-ph-002',
    title: 'Formulary Review Annual',
    description:
      'Annual review and update of facility formulary including formulary exceptions process, ' +
      'non-formulary usage patterns, and therapeutic alternatives.',
    category: EventCategory.FORMULARY_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.25(b)(2)',
    frequency: Frequency.ANNUAL,
    priority: Priority.MEDIUM,
    responsibleRole: 'QUALITY',
  },
  {
    id: 'cms-ph-003',
    title: 'Medication Error / ADR Reporting Review',
    description:
      'Monthly review of medication errors, adverse drug reactions, and near-misses. ' +
      'Trend analysis and QAPI integration per 42 CFR 482.25(b)(4).',
    category: EventCategory.MEDICATION_MANAGEMENT_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.25(b)(4)',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    notes:
      'All ADRs should be reported to FDA MedWatch for serious events. ' +
      'AZ ADHS requires reporting significant medication errors under R9-10-211.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MEDICAL STAFF CoP - 42 CFR 482.22
// ─────────────────────────────────────────────────────────────────────────────

export const medicalStaffCoP: ComplianceRequirement[] = [
  {
    id: 'cms-ms-001',
    title: 'Medical Staff Bylaws Review',
    description:
      'Annual review of Medical Staff Bylaws, rules, and regulations for compliance with ' +
      '42 CFR 482.22 and facility accreditation standards.',
    category: EventCategory.BYLAWS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.22(b)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'ADMIN',
    notes:
      'Bylaws must address: credentialing, privileging, peer review, MEC composition, ' +
      'and corrective action procedures. Must be approved by Governing Body.',
  },
  {
    id: 'cms-ms-002',
    title: 'Medical Executive Committee (MEC) Meeting',
    description:
      'Monthly Medical Executive Committee meeting reviewing quality, credentialing, ' +
      'peer review outcomes, and medical staff activities.',
    category: EventCategory.MEDICAL_STAFF_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.22(a)',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'ADMIN',
    notes:
      'MEC must report to Governing Body. Minutes must be protected peer review documents.',
  },
  {
    id: 'cms-ms-003',
    title: 'Focused Professional Practice Evaluation (FPPE)',
    description:
      'Initiate FPPE for all new privileges and whenever there is a question about a ' +
      'practitioner\'s ability to provide safe, high-quality patient care.',
    category: EventCategory.CREDENTIALING_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.22 / JC MS.08.01.01',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'FPPE is triggered, not scheduled. Must have defined criteria and time limits. ' +
      'Convert to OPPE (Ongoing PPE) after FPPE period concludes satisfactorily.',
  },
  {
    id: 'cms-ms-004',
    title: 'Ongoing Professional Practice Evaluation (OPPE)',
    description:
      'Ongoing monitoring of every practitioner who holds privileges at minimum every 12 months. ' +
      'Data must inform reappointment decisions per 42 CFR 482.22 / JC MS.08.01.03.',
    category: EventCategory.CREDENTIALING_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.22 / JC MS.08.01.03',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'ADMIN',
    notes:
      'OPPE data elements: professional performance data, clinical/technical skills, outcomes. ' +
      'Must be reviewed and actionable. Document review in credentialing files.',
  },
  {
    id: 'cms-ms-005',
    title: 'OIG Exclusion Database Monthly Check',
    description:
      'Monthly verification that no employed or contracted practitioners appear on the ' +
      'OIG List of Excluded Individuals/Entities (LEIE) or SAM.gov exclusion list.',
    category: EventCategory.CREDENTIALING_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 1001.1901 / OIG Advisory Opinion 95-1',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'OIG LEIE: https://oig.hhs.gov/exclusions/exclusions_list.asp  ' +
      'SAM.gov: https://sam.gov  ' +
      'Employing an excluded individual results in overpayment liability. ' +
      'Check all new hires before start date; existing staff monthly.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GOVERNING BODY CoP - 42 CFR 482.12
// ─────────────────────────────────────────────────────────────────────────────

export const governingBodyCoP: ComplianceRequirement[] = [
  {
    id: 'cms-gb-001',
    title: 'Governing Body Meeting - Quarterly',
    description:
      'Governing Body / Board of Directors quarterly meeting. Agenda must include: ' +
      'quality and patient safety data, QAPI program report, credentialing actions, ' +
      'and financial reports per 42 CFR 482.12.',
    category: EventCategory.BOARD_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.12',
    frequency: Frequency.QUARTERLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'Governing Body has ULTIMATE authority and responsibility for the hospital. ' +
      'Must approve bylaws (medical staff, hospital), budget, and quality program.',
  },
  {
    id: 'cms-gb-002',
    title: 'CEO / Hospital Administration Annual Evaluation',
    description:
      'Annual performance evaluation of the Chief Executive Officer by the Governing Body, ' +
      'including review of hospital quality outcomes, financial performance, and strategic goals.',
    category: EventCategory.ANNUAL_EVALUATION,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.12(a)(5)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'ADMIN',
    notes:
      'CMS requires the Governing Body to appoint a CEO and annually assess performance. ' +
      'Document CEO evaluation in Board minutes.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MASTER LIST
// ─────────────────────────────────────────────────────────────────────────────

export const allFederalCmsRequirements: ComplianceRequirement[] = [
  ...patientRightsCoP,
  ...restraintSeclusionCoP,
  ...psychiatricHospitalCoP,
  ...dischargePlanningCoP,
  ...qapiCoP,
  ...infectionControlCoP,
  ...pharmaceuticalServicesCoP,
  ...medicalStaffCoP,
  ...governingBodyCoP,
];
