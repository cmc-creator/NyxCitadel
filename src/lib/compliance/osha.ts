/**
 * OSHA & Workforce Health Compliance Requirements
 * For Healthcare Workers - Inpatient Psychiatric / Behavioral Health Facility
 *
 * Primary Sources:
 * - 29 CFR Part 1910 - OSHA General Industry Standards
 *   - 1910.1030 - Bloodborne Pathogens
 *   - 1910.134 - Respiratory Protection
 *   - 1910.1200 - Hazard Communication (HazCom / GHS)
 *   - 1910.147 - Lockout/Tagout (LOTO)
 *   - 1910.132-138 - Personal Protective Equipment (PPE)
 * - 29 CFR Part 1904 - OSHA Recordkeeping
 * - Arizona ADOSH (AZ Division of Occupational Safety and Health) - A.R.S. § 23-401 et seq.
 * - AZ Workers' Compensation - A.R.S. § 23-901 et seq.
 * - CDC/NIOSH Healthcare Worker Guidelines
 * - OSHA Healthcare Worker Violence Prevention Guidelines (CPL 02-01-052)
 * - CDC TB Guidelines for Healthcare Settings (MMWR 2023)
 * - ACIP Immunization Schedule for Healthcare Personnel
 *
 * Last verified against: OSHA Standards updated January 2025
 * AZ ADOSH adopts federal OSHA standards with AZ-specific additions.
 * AZ ADOSH: https://www.azica.gov/divisions/arizona-division-occupational-safety-health
 */

import {
  EventCategory,
  Frequency,
  RegulatoryBody,
  Priority,
} from '@prisma/client';

import type { ComplianceRequirement } from './arizona';

// ─────────────────────────────────────────────────────────────────────────────
// BLOODBORNE PATHOGENS - 29 CFR 1910.1030
// ─────────────────────────────────────────────────────────────────────────────

export const bloodbornePathogensRequirements: ComplianceRequirement[] = [
  {
    id: 'osha-bbp-001',
    title: 'Exposure Control Plan - Annual Review & Update',
    description:
      'Annual review and update of the Bloodborne Pathogens Exposure Control Plan per 29 CFR 1910.1030(c). ' +
      'Must reflect changes in technology, procedures, and staff roles.',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.1030(c)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    month: [1],
    notes:
      'Must include: exposure determination, control methods (engineering/work practice), ' +
      'PPE provision, HBV vaccination, post-exposure evaluation, training, record-keeping. ' +
      'Solicit input from frontline employees on safer medical devices annually.',
  },
  {
    id: 'osha-bbp-002',
    title: 'Hepatitis B Vaccination Offer - New Employees',
    description:
      'Offer Hepatitis B vaccine series at no cost to all employees with occupational exposure ' +
      'within 10 working days of assignment per 29 CFR 1910.1030(f)(1).',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.1030(f)(1)',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Document: offer made, employee acceptance or informed declination (signed declination form). ' +
      'Post-series: offer anti-HBs titer 1-2 months after completing 3-dose series. ' +
      'Non-responders may need additional doses or be counseled.',
  },
  {
    id: 'osha-bbp-003',
    title: 'Post-Exposure Evaluation & Follow-Up Protocol',
    description:
      'Ensure immediate and accessible post-exposure evaluation following any potential ' +
      'blood/body fluid exposure per 29 CFR 1910.1030(f)(3). ' +
      'Track all exposures and follow-up to completion.',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.1030(f)(3)',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Immediate steps: wash/irrigate exposure site, report to supervisor and Employee Health. ' +
      'Baseline source testing (if consent obtained). PEP (post-exposure prophylaxis) for HIV within 72 hrs. ' +
      'Document all exposures on OSHA 301. Annual review of exposure report trends.',
  },
  {
    id: 'osha-bbp-004',
    title: 'Bloodborne Pathogens Annual Training',
    description:
      'Annual BBP training for all employees with occupational exposure per 29 CFR 1910.1030(g)(2). ' +
      'Training at hire and annually thereafter.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.1030(g)(2)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EDUCATION',
    notes:
      'Training must include: OSHA standard content, transmission, preventive measures, ' +
      'PPE use, HBV vaccination, post-exposure process, labeling. ' +
      'Retain training records 3 years.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// OSHA RECORDKEEPING - 29 CFR 1904
// ─────────────────────────────────────────────────────────────────────────────

export const oshaRecordkeepingRequirements: ComplianceRequirement[] = [
  {
    id: 'osha-rk-001',
    title: 'OSHA 300 Log - Maintain Throughout Year',
    description:
      'Maintain OSHA 300 Log of Work-Related Injuries and Illnesses throughout the year. ' +
      'Record within 7 calendar days of learning of a recordable incident per 29 CFR 1904.29.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1904.29',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Recordable: work-related injury/illness requiring more than first aid. ' +
      'Also record: days away from work, restricted work, medical treatment beyond first aid, ' +
      'loss of consciousness, diagnosis by licensed health professional. ' +
      'Privacy cases: do not enter employee name on OSHA 300 for sensitive injuries.',
  },
  {
    id: 'osha-rk-002',
    title: 'OSHA 300A Summary - Post February 1–April 30',
    description:
      'Complete and post OSHA 300A Annual Summary of Work-Related Injuries ' +
      'from February 1 through April 30 per 29 CFR 1904.32.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1904.32',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    month: [2],
    notes:
      'Must be signed by company executive (President, VP, GM, or highest-ranking official at site). ' +
      'Post where employees normally receive information about workplace safety. ' +
      'Retain OSHA 300, 300A, 301 forms for 5 years.',
  },
  {
    id: 'osha-rk-003',
    title: 'OSHA 301 Incident Report - Per Recordable Event',
    description:
      'Complete OSHA 301 Injury and Illness Incident Report (or equivalent) ' +
      'for each recordable work-related injury/illness within 7 days.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1904.29(b)',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Workers\' comp first report of injury can substitute if it contains all 301 data elements. ' +
      'AZ Workers\' Comp: Submit AZ ICA First Report of Injury (Form 101) within 10 days.',
  },
  {
    id: 'osha-rk-004',
    title: 'Severe Injury / Fatality Reporting to OSHA',
    description:
      'Report all work-related fatalities within 8 hours and inpatient hospitalizations, ' +
      'amputations, or eye loss within 24 hours to OSHA per 29 CFR 1904.39.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1904.39',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Report via OSHA website, phone, or in-person to nearest OSHA office. ' +
      'AZ ADOSH: (602) 542-5795 for reporting in Arizona. ' +
      'Do NOT wait for investigation - report immediately.',
  },
  {
    id: 'osha-rk-005',
    title: 'OSHA 300 Data Electronic Submission (if required)',
    description:
      'Electronically submit OSHA 300A summary data via ITA (Injury Tracking Application) ' +
      'if facility has 250+ employees or is in a high-hazard industry per 29 CFR 1904.41.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1904.41',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    month: [3],
    notes:
      'Submission deadline: March 2 for the previous calendar year. ' +
      'ITA portal: https://www.osha.gov/injuryreporting  ' +
      'Healthcare is a high-hazard industry. Verify if facility meets 250-employee threshold.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// WORKPLACE VIOLENCE PREVENTION
// ─────────────────────────────────────────────────────────────────────────────

export const workplaceViolenceRequirements: ComplianceRequirement[] = [
  {
    id: 'osha-wv-001',
    title: 'Workplace Violence Prevention Program - Annual Review',
    description:
      'Annual review of Workplace Violence Prevention Program per OSHA General Duty Clause ' +
      '(Section 5(a)(1)) and OSHA Workplace Violence in Healthcare Guidelines.',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: 'OSHA 29 USC 654(a)(1) / OSHA CPL 02-01-052',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Psychiatric facilities are among the HIGHEST risk workplaces for violence. ' +
      'Program must include: risk assessment, engineering controls (panic buttons, safe rooms, ' +
      'visitor management), administrative controls, training, and post-incident response. ' +
      'AZ: Arizona SB 1452 (2021) requires WPV prevention programs for healthcare facilities.',
  },
  {
    id: 'osha-wv-002',
    title: 'Workplace Violence Incident Tracking - Monthly Review',
    description:
      'Monthly review of all workplace violence incidents (physical assaults, threats, ' +
      'verbal abuse) involving staff. Identify trends and corrective actions.',
    category: EventCategory.QAPI_MEETING,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: 'OSHA CPL 02-01-052 / 29 CFR 1904',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Staff-on-patient and patient-on-staff violence must both be tracked. ' +
      'Physical assaults resulting in injury: OSHA recordable. ' +
      'Report to QAPI, Risk Management, and MEC.',
  },
  {
    id: 'osha-wv-003',
    title: 'De-escalation / WPV Prevention Training - Annual',
    description:
      'Annual workplace violence prevention and de-escalation training for all staff ' +
      'working in patient care areas.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: 'OSHA CPL 02-01-052 / AZ A.A.C. R9-10-308',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EDUCATION',
    notes:
      'AZ ADHS requires de-escalation training for all BH direct care staff. ' +
      'Approved programs: CPI (Crisis Prevention Institute), PMAB, AVADE, Verbal Judo. ' +
      'Document training completion. New hires before working independently with patients.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RESPIRATORY PROTECTION - 29 CFR 1910.134
// ─────────────────────────────────────────────────────────────────────────────

export const respiratoryProtectionRequirements: ComplianceRequirement[] = [
  {
    id: 'osha-rp-001',
    title: 'N95 Respirator Fit Testing - Annual',
    description:
      'Annual qualitative or quantitative fit testing for all employees required to wear ' +
      'N95 or higher respirators per 29 CFR 1910.134(f).',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.134(f)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Fit test required: at initial use, when different respirator model, with physical changes ' +
      '(weight change, dental work, facial scarring) that may affect fit. ' +
      'Medical evaluation (OSHA Appendix C questionnaire) required BEFORE fit testing. ' +
      'Psychiatric facilities: primarily for airborne precautions (TB, COVID, varicella).',
  },
  {
    id: 'osha-rp-002',
    title: 'Written Respiratory Protection Program - Annual Review',
    description:
      'Annual review of written Respiratory Protection Program covering: ' +
      'respirator selection, medical evaluation, fit testing, training, maintenance, storage.',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.134(c)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Must designate a Program Administrator. ' +
      'Surgical masks are NOT respirators - do not substitute for required N95 use.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE HEALTH - TB / IMMUNIZATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const employeeHealthRequirements: ComplianceRequirement[] = [
  {
    id: 'emp-health-001',
    title: 'TB Screening - New Hire Pre-Employment',
    description:
      'TB risk assessment and IGRA (preferred) or TST screening for all new healthcare workers ' +
      'per CDC 2023 TB Guidelines for Healthcare Settings and JC HR standards.',
    category: EventCategory.COMPETENCY_ASSESSMENT,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'CDC MMWR 2023 / JC HR.01.02.01',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'CDC 2023 update: IGRA preferred over TST for serial TB screening. ' +
      'Baseline: 2-step TST or single IGRA at hire. ' +
      'Annual screening for HIGH-risk settings (psychiatric hospitals with known community TB). ' +
      'AZ: Maricopa County requires annual TB testing for healthcare workers in certain settings.',
  },
  {
    id: 'emp-health-002',
    title: 'Annual TB Screening - High-Risk Staff',
    description:
      'Annual TB screening (IGRA or symptom review) for staff in high-risk areas or with ' +
      'known exposure, per CDC 2023 TB healthcare guidelines.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'CDC MMWR 2023 / JC IC.02.04.01',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'AZ ADHS classifies Maricopa County as medium-risk TB area. ' +
      'Annual screening recommended for psychiatric hospital workers. ' +
      'Positive IGRA/TST: chest X-ray, medical evaluation, and no direct patient care until cleared.',
  },
  {
    id: 'emp-health-003',
    title: 'Influenza Vaccination - Annual Offer',
    description:
      'Annual influenza vaccination offered to all healthcare personnel (HCP) at no cost. ' +
      'Document acceptance or declination per JC IC.02.04.01 and CMS CoP 482.42.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'JC IC.02.04.01 / 42 CFR 482.42',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    month: [10, 11],
    notes:
      'Target: offer before October 31 (flu season onset). ' +
      'AZ: Does NOT currently mandate flu vaccine for HCP, but mandating is a JC expectation. ' +
      'Track vaccination rates - JC expects published and improving rates. ' +
      'Declination: must sign form acknowledging flu risks.',
  },
  {
    id: 'emp-health-004',
    title: 'Healthcare Worker Immunization Status Review - Annual',
    description:
      'Annual review of all HCP immunization records: MMR, Varicella, HBV, Tdap, COVID-19. ' +
      'Follow ACIP Healthcare Personnel Immunization Schedule.',
    category: EventCategory.COMPETENCY_ASSESSMENT,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'ACIP HCP Schedule / JC IC.02.04.01',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'ACIP schedule: https://www.cdc.gov/vaccines/schedules/hcp/imz-healthcare-workers.html  ' +
      'Document evidence of immunity (vaccination record, titer, or medical contraindication). ' +
      'Psychiatric hospital: varicella and measles immunity critical (close patient contact).',
  },
  {
    id: 'emp-health-005',
    title: 'Post-Exposure Protocol - Biological/Chemical/Physical',
    description:
      'Annual review and drill of post-exposure protocols for: bloodborne pathogens, TB exposure, ' +
      'body fluid exposure, and workplace violence injury.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.1030(f)(3) / CDC Guidelines',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Post-exposure kits should be accessible 24/7. ' +
      'HIV PEP must start within 72 hours. ' +
      'Hepatitis B HBIG administration within 24 hours for unvaccinated HCP with blood exposure.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HAZARD COMMUNICATION - 29 CFR 1910.1200
// ─────────────────────────────────────────────────────────────────────────────

export const hazcomRequirements: ComplianceRequirement[] = [
  {
    id: 'osha-hc-001',
    title: 'SDS (Safety Data Sheets) Inventory - Annual Review',
    description:
      'Annual review of SDS binder/system to ensure current SDS for all hazardous chemicals ' +
      'are available and accessible to all employees per 29 CFR 1910.1200(g).',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.1200(g)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'SDS must be immediately accessible during all work shifts - electronic OK if always available. ' +
      'Include all chemical products: disinfectants, cleaning agents, medications if applicable. ' +
      'Ensure GHS-format labels on all secondary containers.',
  },
  {
    id: 'osha-hc-002',
    title: 'HazCom Training - At Hire & When New Hazards Introduced',
    description:
      'HazCom/GHS training for all workers who may be exposed to hazardous chemicals. ' +
      'Train at hire; retrain when new chemical hazards are introduced.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.OSHA,
    standardRef: '29 CFR 1910.1200(h)',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.HIGH,
    responsibleRole: 'EDUCATION',
    notes:
      'Training must cover: properties of hazardous chemicals present, SDS understanding, ' +
      'GHS label elements (pictograms, signal words, hazard statements, precautionary statements). ' +
      'Document completion.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ARIZONA WORKERS' COMPENSATION
// A.R.S. § 23-901 et seq.
// ─────────────────────────────────────────────────────────────────────────────

export const arizonaWorkersCompRequirements: ComplianceRequirement[] = [
  {
    id: 'az-wc-001',
    title: 'AZ Workers\' Comp Coverage Verification - Annual',
    description:
      'Annual verification that facility maintains required workers\' compensation insurance ' +
      'coverage per A.R.S. § 23-961. Verify all employees and volunteers are covered.',
    category: EventCategory.AZ_LICENSE_RENEWAL,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.R.S. § 23-961',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'AZ requires workers\' comp for employers with ANY employees. Self-insurance permitted with AZ ICA approval. ' +
      'Post the WC notice of compliance in a conspicuous location. ' +
      'Report workplace injuries to ICA and insurer per A.R.S. § 23-1061.',
  },
  {
    id: 'az-wc-002',
    title: 'First Report of Injury (AZ ICA Form 101) - Per Injury',
    description:
      'Submit AZ ICA Employer\'s Report of Industrial Injury (Form 101) within 10 days ' +
      'of learning of a reportable work injury per A.R.S. § 23-1061.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.R.S. § 23-1061',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Submit Form 101 via AZ ICA online portal. ' +
      'Also report to workers\' comp insurer per policy requirements. ' +
      'Reportable: medical treatment, lost time, or death. ' +
      'Non-reporting: civil penalty up to $1,000 per violation.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MASTER LIST
// ─────────────────────────────────────────────────────────────────────────────

export const allOshaWorkforceRequirements: ComplianceRequirement[] = [
  ...bloodbornePathogensRequirements,
  ...oshaRecordkeepingRequirements,
  ...workplaceViolenceRequirements,
  ...respiratoryProtectionRequirements,
  ...employeeHealthRequirements,
  ...hazcomRequirements,
  ...arizonaWorkersCompRequirements,
];
