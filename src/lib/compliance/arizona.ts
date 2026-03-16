/**
 * Arizona-Specific Compliance Requirements
 * For Acute Care Psychiatric / Behavioral Health Inpatient Facilities
 *
 * Governing Bodies:
 * - AZ ADHS (Dept. of Health Services) - A.A.C. R9-10 (Behavioral Health)
 * - AZ BOMEX (Board of Medical Examiners)
 * - AZ BON (Board of Nursing)
 * - AZ BPPE (Board of Pharmacy)
 * - CMS Conditions of Participation - 42 CFR 482 / 42 CFR 441 (Psychiatric)
 * - Joint Commission (CAMH - Comprehensive Accreditation for BH)
 */

import {
  EventCategory,
  Frequency,
  RegulatoryBody,
  Priority,
} from '@prisma/client';

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  regulatoryBody: RegulatoryBody;
  standardRef: string;
  frequency: Frequency;
  priority: Priority;
  responsibleRole: string;
  month?: number[];  // Calendar months when typically due (1-12)
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMERGENCY MANAGEMENT REQUIREMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const emergencyManagementRequirements: ComplianceRequirement[] = [
  // NOTE: JC EM.01.01.01 requires a designated EM leader and a management process,
  // but does NOT mandate a specific meeting frequency. Monthly EM-only meetings
  // are administrative best practice, not a regulatory requirement for a small
  // acute psychiatric facility. EM topics are covered in the quarterly EOC meeting.
  {
    id: 'em-001',
    title: 'Emergency Management Program Review (Quarterly)',
    description:
      'Quarterly review of EM program status, drill outcomes, plan updates, and upcoming exercises - typically rolled into the EOC/Safety committee meeting.',
    category: EventCategory.EM_COMMITTEE_MEETING,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EM.01.01.01',
    frequency: Frequency.QUARTERLY,
    priority: Priority.MEDIUM,
    responsibleRole: 'EM_COORDINATOR',
    notes: 'No JC standard requires standalone monthly EM meetings. Quarterly review during EOC is compliant.',
  },
  {
    id: 'em-002',
    title: 'Hazard Vulnerability Analysis (HVA)',
    description:
      'Annual assessment of potential hazards and the facility\'s vulnerability, capability, and risk for each.',
    category: EventCategory.HVA_ASSESSMENT,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EM.01.01.01 EP2',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EM_COORDINATOR',
    month: [1, 2],  // Recommended: Q1 of each year
    notes:
      'Use Kaiser Permanente HVA tool or equivalent. Results drive drill planning.',
  },
  {
    id: 'em-003',
    title: 'Emergency Operations Plan (EOP) Annual Review',
    description:
      'Annual review and update of the EOP incorporating lessons learned from drills and exercises.',
    category: EventCategory.EM_PLAN_REVIEW,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EM.02.01.01',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EM_COORDINATOR',
    month: [2, 3],
  },
  {
    id: 'em-004',
    title: 'Tabletop Exercise',
    description:
      'Discussion-based tabletop exercise to test emergency response plans.',
    category: EventCategory.TABLETOP_EXERCISE,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EM.03.01.03',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'EM_COORDINATOR',
    notes: 'Minimum 1 per year. Must address top HVA risks.',
  },
  {
    id: 'em-005',
    title: 'Full-Scale or Functional Exercise',
    description:
      'Operations-based drill/exercise testing deployment of resources and emergency procedures.',
    category: EventCategory.FUNCTIONAL_DRILL,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EM.03.01.03',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'EM_COORDINATOR',
    notes:
      'Minimum 1 per year. Should complement tabletop (different scenarios).',
  },
  {
    id: 'em-006',
    title: 'Fire Evacuation Drill - All Shifts',
    description:
      'Fire response / evacuation drills conducted on all shifts (days, evenings, nights) across all units.',
    category: EventCategory.FUNCTIONAL_DRILL,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'LS.02.01.20',
    frequency: Frequency.QUARTERLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'EM_COORDINATOR',
    notes:
      'JC requires drills on each shift each quarter = minimum 12 drills/year for 3-shift operation. Under NFPA 101.',
  },
  {
    id: 'em-007',
    title: 'After-Action Review / Improvement Planning',
    description:
      'Formal after-action review (AAR) and improvement plan following each drill or exercise.',
    category: EventCategory.AFTER_ACTION_REVIEW,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EM.03.01.03 EP7',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.HIGH,
    responsibleRole: 'EM_COORDINATOR',
    notes: 'Required within 30 days of each exercise.',
  },
  {
    id: 'em-008',
    title: 'Community Partner EM Meeting / MOU Review',
    description:
      'Meeting with community partners (fire, EMS, law enforcement, other hospitals) to review MOUs and coordination plans.',
    category: EventCategory.COMMUNITY_PARTNER_MEETING,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EM.02.02.01',
    frequency: Frequency.ANNUAL,
    priority: Priority.MEDIUM,
    responsibleRole: 'EM_COORDINATOR',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LIFE SAFETY / ENVIRONMENT OF CARE
// ─────────────────────────────────────────────────────────────────────────────

export const lifeSafetyRequirements: ComplianceRequirement[] = [
  {
    id: 'ls-001',
    // JC EC.01.01.01 requires a functional safety committee but does NOT specify
    // monthly meetings; quarterly is compliant and standard for small BH facilities.
    title: 'Environment of Care / Safety Committee Meeting',
    description: 'Quarterly EOC/Safety committee meeting reviewing life safety, utilities, environment of care, and EM program status. Covers EM.01.01.01 EM program review as well.',
    category: EventCategory.EOC_COMMITTEE_MEETING,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EC.01.01.01',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes: 'Quarterly is compliant for small acute psych facilities. Include EM program agenda item each meeting.',
  },
  {
    id: 'ls-002',
    title: 'Fire Alarm System Test - Annual',
    description: 'Annual inspection and test of fire alarm system per NFPA 72.',
    category: EventCategory.FIRE_ALARM_TEST,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EC.02.03.05 / NFPA 72',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'ls-003',
    title: 'Fire Alarm System Test - Semi-Annual (Sprinkler Flow)',
    description: 'Semi-annual testing of sprinkler flow alarms.',
    category: EventCategory.FIRE_ALARM_TEST,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EC.02.03.05 / NFPA 25',
    frequency: Frequency.SEMI_ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'ls-004',
    title: 'Fire Extinguisher Inspection',
    description: 'Monthly visual inspection; annual internal inspection.',
    category: EventCategory.FIRE_EXTINGUISHER_INSPECTION,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EC.02.03.03 / NFPA 10',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'ls-005',
    title: 'Emergency Generator Test - Monthly',
    description:
      'Monthly 30-minute load test of emergency generator(s). Annual load test under load.',
    category: EventCategory.GENERATOR_TEST,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EC.02.05.07 / NFPA 110',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes: 'Document run time, load, and any alarms or anomalies.',
  },
  {
    id: 'ls-006',
    title: 'Sprinkler System Inspection - Quarterly',
    description: 'Quarterly inspection of sprinkler system components.',
    category: EventCategory.SPRINKLER_INSPECTION,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EC.02.03.05 / NFPA 25',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'ls-007',
    title: 'Backflow Preventer Test',
    description: 'Annual backflow preventer testing (City of Phoenix requirement).',
    category: EventCategory.BACKFLOW_PREVENTER_TEST,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'AZ A.A.C. R18-5-201',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'ls-008',
    title: 'Life Safety Rounds',
    description:
      'Quarterly proactive safety rounds of all patient care areas for EOC compliance.',
    category: EventCategory.LIFE_SAFETY_ROUNDS,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'EC.04.01.01',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'ls-009',
    title: 'Elevator Inspection - Annual',
    description:
      'Annual elevator inspection by AZ Dept. of Occupational Safety and Health (ICA).',
    category: EventCategory.ELEVATOR_INSPECTION,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.R.S. § 23-481',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Certificate must be posted in elevator. Coordinate with Arizona ICA.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// JOINT COMMISSION - CAMH SPECIFIC
// ─────────────────────────────────────────────────────────────────────────────

export const jointCommissionRequirements: ComplianceRequirement[] = [
  {
    id: 'jc-001',
    title: 'JC Mock Survey / Tracer',
    description:
      'Annual internal mock survey using JC tracer methodology to identify potential deficiencies.',
    category: EventCategory.JC_MOCK_SURVEY,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'CAMH',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'jc-002',
    title: 'Performance Improvement / PI Meeting',
    description:
      'Monthly quality/PI committee meeting reviewing data, trends, and improvement projects.',
    category: EventCategory.JC_PI_MEETING,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'PI.01.01.01',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
  },
  {
    id: 'jc-003',
    title: 'Restraint/Seclusion Data Review',
    description:
      'Monthly review of restraint and seclusion data including rates, injuries, and deaths.',
    category: EventCategory.JC_PI_MEETING,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'PC.03.05.17 / CMS 482.13(e)',
    frequency: Frequency.MONTHLY,
    priority: Priority.CRITICAL,
    responsibleRole: 'QUALITY',
    notes:
      'Psychiatric-specific requirement. CMS requires reporting deaths within 24 hours.',
  },
  {
    id: 'jc-004',
    title: 'JC Standards Review - Annual',
    description:
      'Annual formal review of all applicable JC standards for changes and compliance gaps.',
    category: EventCategory.JC_STANDARDS_REVIEW,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'CAMH',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
    month: [1],  // January - new standards typically take effect Jan 1
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ARIZONA ADHS - BEHAVIORAL HEALTH LICENSURE
// Rules: A.A.C. R9-10-101 through R9-10-1018
// License type: Inpatient Behavioral Health (IPB)
// ─────────────────────────────────────────────────────────────────────────────

export const arizonaCompliance: ComplianceRequirement[] = [
  {
    id: 'az-001',
    title: 'AZ ADHS License Renewal',
    description:
      'Biennial renewal of Arizona Department of Health Services Behavioral Health Entity license.',
    category: EventCategory.AZ_LICENSE_RENEWAL,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.R.S. § 36-401; A.A.C. R9-10-107',
    frequency: Frequency.BIENNIAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'Submit 90 days before expiration. License must be posted. Requires: fire marshal approval, accreditation letter, staffing plan, policies.',
  },
  {
    id: 'az-002',
    title: 'AZ ADHS Fire Marshal Inspection',
    description:
      'Annual fire safety inspection conducted by the State Fire Marshal as part of ADHS licensure.',
    category: EventCategory.FIRE_MARSHAL_INSPECTION,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.A.C. R9-10-109',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Coordinate with AZ Office of the State Fire Marshal. Required for licensure renewal.',
  },
  {
    id: 'az-003',
    title: 'AZ ADHS Behavioral Health Survey',
    description:
      'ADHS licensing survey - required upon initial licensure, renewal, and complaint investigations.',
    category: EventCategory.AZ_ADHS_SURVEY,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.A.C. R9-10-108',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'az-004',
    title: 'AZ Adverse Event Reporting - DCS/DES',
    description:
      'Mandatory reporting of certain adverse events to ADHS, DCS, and other AZ agencies within required timeframes.',
    category: EventCategory.AZ_REPORT_SUBMISSION,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.A.C. R9-10-211; A.R.S. § 36-133',
    frequency: Frequency.AS_NEEDED,
    priority: Priority.CRITICAL,
    responsibleRole: 'RISK_MANAGER',
    notes:
      'AZ Mental Health Bill of Rights violations must be reported. Patient elopements must be reported to ADHS within specific timeframes.',
  },
  {
    id: 'az-005',
    title: 'AZ Behavioral Health Review - Policy Updates',
    description:
      'Review all P&Ps against updated A.A.C. R9-10 rules annually.',
    category: EventCategory.AZ_BEHAVIORAL_HEALTH_REVIEW,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.A.C. R9-10 (all chapters)',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'az-006',
    title: 'CMS Conditions of Participation - Psych Hospital (IPF)',
    description:
      'Annual internal review of CMS CoPs for Inpatient Psychiatric Facilities.',
    category: EventCategory.CMS_CONDITIONS_REVIEW,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.60–482.62',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'COMPLIANCE_OFFICER',
    notes:
      'Covers: Governing body, patient rights (482.13), medical records, restraint/seclusion, special medical records requirements.',
  },
  {
    id: 'az-007',
    title: 'CMS QAPI (Quality Assessment & Performance Improvement)',
    description:
      'Monthly QAPI meetings and annual QAPI program evaluation per CMS CoP 482.21.',
    category: EventCategory.CMS_QAPI_MEETING,
    regulatoryBody: RegulatoryBody.CMS,
    standardRef: '42 CFR 482.21',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INFECTION CONTROL
// ─────────────────────────────────────────────────────────────────────────────

export const infectionControlRequirements: ComplianceRequirement[] = [
  {
    id: 'ic-001',
    title: 'Infection Control Committee Meeting',
    description:
      'Quarterly (or monthly) infection control committee meeting reviewing surveillance data and IC activities.',
    category: EventCategory.IC_COMMITTEE_MEETING,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'IC.01.01.01',
    frequency: Frequency.QUARTERLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
  },
  {
    id: 'ic-002',
    title: 'Annual Infection Control Risk Assessment (ICRA)',
    description:
      'Annual assessment of infection risks specific to patient population and facility operations.',
    category: EventCategory.IC_RISK_ASSESSMENT,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'IC.01.01.01 EP4',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
    month: [1, 2],
  },
  {
    id: 'ic-003',
    title: 'Hand Hygiene Compliance Audits',
    description:
      'Regular direct observation audits of hand hygiene compliance by unit.',
    category: EventCategory.HAND_HYGIENE_AUDIT,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'NPSG.07.01.01',
    frequency: Frequency.MONTHLY,
    priority: Priority.HIGH,
    responsibleRole: 'QUALITY',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// POLICY & STAFF REQUIREMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const policyAndStaffRequirements: ComplianceRequirement[] = [
  {
    id: 'ps-001',
    title: 'Annual Mandatory Employee Education',
    description:
      'Annual mandatory education for all staff: fire safety, infection control, patient rights, restraint/seclusion, suicide risk, HIPAA.',
    category: EventCategory.MANDATORY_EDUCATION,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'HR.01.05.03',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EDUCATION',
    notes:
      'For AZ BH facilities: must include A.A.C. R9-10 patient rights training and de-escalation/CPI.',
  },
  {
    id: 'ps-002',
    title: 'Policy & Procedure Annual Review',
    description:
      'All clinical and administrative policies must be reviewed at minimum annually.',
    category: EventCategory.POLICY_REVIEW,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'RC.01.02.01 / LD.04.01.01',
    frequency: Frequency.ANNUAL,
    priority: Priority.HIGH,
    responsibleRole: 'COMPLIANCE_OFFICER',
  },
  {
    id: 'ps-003',
    title: 'Medical Staff Credentialing & Privileging',
    description:
      'Review and renewal of medical staff credentials and clinical privileges.',
    category: EventCategory.CREDENTIALING_REVIEW,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'MS.06.01.01',
    frequency: Frequency.BIENNIAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'ADMIN',
    notes:
      'Initial credentialing, reappointment every 2 years. Requires primary source verification.',
  },
  {
    id: 'ps-004',
    title: 'Psychiatric Nursing Staff BLS Certification',
    description:
      'All clinical staff must maintain current BLS (Basic Life Support) certification.',
    category: EventCategory.STAFF_TRAINING,
    regulatoryBody: RegulatoryBody.JOINT_COMMISSION,
    standardRef: 'HR.02.01.03',
    frequency: Frequency.BIENNIAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EDUCATION',
    notes: 'AHA BLS (Healthcare Provider). 2-year renewal.',
  },
  {
    id: 'ps-005',
    title: 'CPI / De-escalation Certification Renewal',
    description:
      'Crisis Prevention Institute (CPI) or equivalent de-escalation training renewal for all direct care staff.',
    category: EventCategory.STAFF_TRAINING,
    regulatoryBody: RegulatoryBody.AZ_ADHS,
    standardRef: 'A.A.C. R9-10-308(D)',
    frequency: Frequency.ANNUAL,
    priority: Priority.CRITICAL,
    responsibleRole: 'EDUCATION',
    notes:
      'Arizona requires de-escalation training for all staff working with behavioral health patients. CPI, PMAB, or equivalent.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MASTER COMPILED LIST
// ─────────────────────────────────────────────────────────────────────────────

export const allArizonaComplianceRequirements: ComplianceRequirement[] = [
  ...emergencyManagementRequirements,
  ...lifeSafetyRequirements,
  ...jointCommissionRequirements,
  ...arizonaCompliance,
  ...infectionControlRequirements,
  ...policyAndStaffRequirements,
];

/**
 * Generate all suggested calendar events for a given calendar year
 * based on Arizona acute psychiatric inpatient compliance requirements.
 */
export function generateComplianceCalendar(
  facilityId: string,
  year: number
): Array<{
  facilityId: string;
  title: string;
  description: string;
  category: EventCategory;
  regulatoryBody: RegulatoryBody | null;
  dueDate: Date;
  isRecurring: boolean;
  priority: Priority;
  notes: string | null;
}> {
  const events: ReturnType<typeof generateComplianceCalendar> = [];

  for (const req of allArizonaComplianceRequirements) {
    const dueDates = getFrequencyDates(req, year);
    for (const dueDate of dueDates) {
      events.push({
        facilityId,
        title: req.title,
        description: req.description,
        category: req.category,
        regulatoryBody: req.regulatoryBody ?? null,
        dueDate,
        isRecurring: req.frequency !== Frequency.ONE_TIME && req.frequency !== Frequency.AS_NEEDED,
        priority: req.priority,
        notes: req.notes ?? null,
      });
    }
  }

  return events.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

function getFrequencyDates(req: ComplianceRequirement, year: number): Date[] {
  const dates: Date[] = [];
  const preferredMonth = req.month?.[0] ?? null;

  switch (req.frequency) {
    case Frequency.DAILY:
      for (let d = 1; d <= 365; d++) {
        const dt = new Date(year, 0, d);
        if (dt.getFullYear() === year) dates.push(dt);
      }
      break;

    case Frequency.WEEKLY:
      for (let w = 0; w < 52; w++) {
        dates.push(new Date(year, 0, 1 + w * 7));
      }
      break;

    case Frequency.MONTHLY:
      for (let m = 0; m < 12; m++) {
        dates.push(new Date(year, m, 15)); // Mid-month default
      }
      break;

    case Frequency.QUARTERLY:
      dates.push(
        new Date(year, 2, 15),  // Q1 - March 15
        new Date(year, 5, 15),  // Q2 - June 15
        new Date(year, 8, 15),  // Q3 - September 15
        new Date(year, 11, 15)  // Q4 - December 15
      );
      break;

    case Frequency.SEMI_ANNUAL:
      dates.push(
        new Date(year, 2, 15),  // March 15
        new Date(year, 8, 15)   // September 15
      );
      break;

    case Frequency.ANNUAL:
      if (preferredMonth) {
        dates.push(new Date(year, preferredMonth - 1, 15));
      } else {
        dates.push(new Date(year, 0, 15)); // Default: January 15
      }
      break;

    case Frequency.BIENNIAL:
      if (year % 2 === 0) {
        dates.push(new Date(year, preferredMonth ? preferredMonth - 1 : 5, 15));
      }
      break;

    case Frequency.AS_NEEDED:
    case Frequency.ONE_TIME:
      // Not scheduled automatically
      break;
  }

  return dates;
}
