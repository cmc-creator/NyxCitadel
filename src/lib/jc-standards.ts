/**
 * Joint Commission CAMH Standards Library
 * Acute/Psychiatric Hospital Program — scored Element of Performance (EP) library
 * Used by the Mock Survey Tracer Tool to present standards for scoring.
 *
 * Scope: Behavioral Health / Acute Psychiatric (CAMH)
 * Chapters: NPSG, EC, IC, HR, MM, PC, RC, RI, TS, WT, LD, PI
 */

export interface EP {
  ref: string;       // e.g. "EC.02.06.01 EP 1"
  standard: string;  // e.g. "EC.02.06.01"
  epNumber: string;  // e.g. "EP 1"
  text: string;
  scored: boolean;   // some EPs are informational only
  priority?: 'A' | 'C'; // Direct Impact Patient Safety = A; others = C
}

export interface Standard {
  ref: string;       // e.g. "EC.02.06.01"
  title: string;
  chapter: string;
  eps: EP[];
}

export interface Chapter {
  code: string;
  title: string;
  standards: Standard[];
}

// ─── Helper ──────────────────────────────────────────────────────────────────
function ep(standard: string, epNum: string, text: string, priority?: 'A' | 'C'): EP {
  return { ref: `${standard} ${epNum}`, standard, epNumber: epNum, text, scored: true, priority };
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTERS
// ─────────────────────────────────────────────────────────────────────────────

export const JC_STANDARDS: Chapter[] = [
  // ── NPSG ─────────────────────────────────────────────────────────────────
  {
    code: 'NPSG',
    title: 'National Patient Safety Goals',
    standards: [
      {
        ref: 'NPSG.01.01.01', chapter: 'NPSG',
        title: 'Identify patients correctly — use two identifiers',
        eps: [
          ep('NPSG.01.01.01', 'EP 1', 'Use at least two patient identifiers when providing care, treatment, or services.', 'A'),
          ep('NPSG.01.01.01', 'EP 2', 'Label containers used for blood and other specimens in the presence of the patient.', 'A'),
        ],
      },
      {
        ref: 'NPSG.02.03.01', chapter: 'NPSG',
        title: 'Improve the effectiveness of communication among caregivers',
        eps: [
          ep('NPSG.02.03.01', 'EP 1', 'Report critical results of tests and diagnostic procedures on a timely basis.', 'A'),
          ep('NPSG.02.03.01', 'EP 2', 'The time frame for reporting critical results is defined by the organization.', 'C'),
        ],
      },
      {
        ref: 'NPSG.03.04.01', chapter: 'NPSG',
        title: 'Label all medications and medication containers',
        eps: [
          ep('NPSG.03.04.01', 'EP 1', 'Label all medications and medication containers not immediately administered.', 'A'),
          ep('NPSG.03.04.01', 'EP 2', 'Verify all labels verbally and visually before administration.', 'A'),
        ],
      },
      {
        ref: 'NPSG.06.01.01', chapter: 'NPSG',
        title: 'Reduce harm associated with clinical alarm systems',
        eps: [
          ep('NPSG.06.01.01', 'EP 1', 'Establish alarm system safety as a priority.', 'A'),
          ep('NPSG.06.01.01', 'EP 2', 'Identify the most important alarms to manage based on risk.', 'A'),
          ep('NPSG.06.01.01', 'EP 3', 'Establish policies and procedures for managing alarms.', 'C'),
        ],
      },
      {
        ref: 'NPSG.07.01.01', chapter: 'NPSG',
        title: 'Comply with hand hygiene guidelines',
        eps: [
          ep('NPSG.07.01.01', 'EP 1', 'Comply with WHO or CDC hand hygiene guidelines.', 'A'),
          ep('NPSG.07.01.01', 'EP 2', 'Set goals for improving compliance with hand hygiene guidelines.', 'C'),
          ep('NPSG.07.01.01', 'EP 3', 'Improve compliance with hand hygiene guidelines based on performance improvement goals.', 'C'),
        ],
      },
      {
        ref: 'NPSG.15.01.01', chapter: 'NPSG',
        title: 'Identify safety risks inherent in the patient population — suicide risk',
        eps: [
          ep('NPSG.15.01.01', 'EP 1', 'Conduct a validated suicide risk assessment for all patients being evaluated or treated for behavioral health conditions.', 'A'),
          ep('NPSG.15.01.01', 'EP 2', 'Reassess suicide risk at defined intervals during the episode of care.', 'A'),
          ep('NPSG.15.01.01', 'EP 3', 'Identify individuals in the high-risk group and communicate to the care team.', 'A'),
          ep('NPSG.15.01.01', 'EP 4', 'Provide information about suicide prevention to patients and families.', 'C'),
        ],
      },
    ],
  },

  // ── EC ──────────────────────────────────────────────────────────────────
  {
    code: 'EC',
    title: 'Environment of Care',
    standards: [
      {
        ref: 'EC.02.01.01', chapter: 'EC',
        title: 'Manage safety and security risks',
        eps: [
          ep('EC.02.01.01', 'EP 1', 'The hospital identifies safety and security risks from internal sources based on its patient population.', 'C'),
          ep('EC.02.01.01', 'EP 2', 'Implement processes to address identified safety and security risks.', 'A'),
          ep('EC.02.01.01', 'EP 3', 'The hospital controls access to sensitive areas.', 'A'),
          ep('EC.02.01.01', 'EP 8', 'The hospital reports crimes against individuals on hospital property to law enforcement.', 'A'),
        ],
      },
      {
        ref: 'EC.02.02.01', chapter: 'EC',
        title: 'Manage hazardous materials and waste risks',
        eps: [
          ep('EC.02.02.01', 'EP 1', 'Maintain an inventory of hazardous materials and waste used, stored, or generated.', 'C'),
          ep('EC.02.02.01', 'EP 3', 'Safely handle, store, transport, use, and dispose of hazardous materials and waste.', 'A'),
          ep('EC.02.02.01', 'EP 7', 'Have a process for identifying and managing hazardous medications found outside the pharmacy.', 'A'),
        ],
      },
      {
        ref: 'EC.02.03.01', chapter: 'EC',
        title: 'Manage fire risks',
        eps: [
          ep('EC.02.03.01', 'EP 1', 'Provide building features that protect occupants from fire and smoke.', 'A'),
          ep('EC.02.03.01', 'EP 3', 'Inspect, test, and maintain fire protection equipment and building features.', 'A'),
          ep('EC.02.03.01', 'EP 20', 'Conduct fire drills at required frequencies.', 'A'),
        ],
      },
      {
        ref: 'EC.02.06.01', chapter: 'EC',
        title: 'Establish and maintain a safe, functional environment — ligature risk',
        eps: [
          ep('EC.02.06.01', 'EP 1', 'Assess environmental risks for suicide by ligature in patient care areas.', 'A'),
          ep('EC.02.06.01', 'EP 2', 'Minimize ligature risks where clinically appropriate.', 'A'),
          ep('EC.02.06.01', 'EP 3', 'Document ligature risk assessments and mitigation strategies.', 'C'),
          ep('EC.02.06.01', 'EP 6', 'The hospital has a process for managing ligature risks identified during daily operations.', 'A'),
        ],
      },
      {
        ref: 'EC.04.01.01', chapter: 'EC',
        title: 'Conduct environment of care rounds',
        eps: [
          ep('EC.04.01.01', 'EP 1', 'Conduct EOC rounds at regular intervals to identify environmental safety issues.', 'C'),
          ep('EC.04.01.01', 'EP 2', 'Document findings of EOC rounds.', 'C'),
          ep('EC.04.01.01', 'EP 3', 'Resolve identified EOC issues or document justification for deferral.', 'A'),
        ],
      },
    ],
  },

  // ── IC ──────────────────────────────────────────────────────────────────
  {
    code: 'IC',
    title: 'Infection Control',
    standards: [
      {
        ref: 'IC.01.01.01', chapter: 'IC',
        title: 'Infection prevention and control leadership and coordination',
        eps: [
          ep('IC.01.01.01', 'EP 1', 'An infection prevention and control program is implemented.', 'C'),
          ep('IC.01.01.01', 'EP 2', 'Individuals responsible for infection prevention and control have appropriate training.', 'C'),
        ],
      },
      {
        ref: 'IC.02.01.01', chapter: 'IC',
        title: 'Reduce risk of infections associated with medical equipment, devices, and supplies',
        eps: [
          ep('IC.02.01.01', 'EP 1', 'Implement infection prevention activities for high-risk processes.', 'A'),
          ep('IC.02.01.01', 'EP 2', 'Follow manufacturer instructions for cleaning, disinfecting, and sterilizing equipment.', 'A'),
        ],
      },
      {
        ref: 'IC.02.02.01', chapter: 'IC',
        title: 'Reduce the risk of infections — transmission-based precautions',
        eps: [
          ep('IC.02.02.01', 'EP 1', 'Implement transmission-based precautions based on CDC guidelines.', 'A'),
          ep('IC.02.02.01', 'EP 2', 'Educate patients and families on transmission-based precautions.', 'C'),
        ],
      },
      {
        ref: 'IC.02.05.01', chapter: 'IC',
        title: 'Healthcare-associated infection surveillance',
        eps: [
          ep('IC.02.05.01', 'EP 1', 'Collect and analyze data on infections.', 'C'),
          ep('IC.02.05.01', 'EP 2', 'Benchmark infection rates against national standards (NHSN).', 'C'),
          ep('IC.02.05.01', 'EP 3', 'Report infection data to appropriate leadership and committees.', 'C'),
        ],
      },
    ],
  },

  // ── HR ──────────────────────────────────────────────────────────────────
  {
    code: 'HR',
    title: 'Human Resources',
    standards: [
      {
        ref: 'HR.01.02.01', chapter: 'HR',
        title: 'Verify staff qualifications',
        eps: [
          ep('HR.01.02.01', 'EP 1', 'Verify current licensure, certification, or registration for all licensed staff.', 'A'),
          ep('HR.01.02.01', 'EP 2', 'Primary source verification of credentials is performed.', 'A'),
        ],
      },
      {
        ref: 'HR.01.04.01', chapter: 'HR',
        title: 'Provide staff orientation',
        eps: [
          ep('HR.01.04.01', 'EP 1', 'All staff complete orientation before providing care.', 'C'),
          ep('HR.01.04.01', 'EP 2', 'Orientation addresses hospital-specific policies and the patient population served.', 'C'),
        ],
      },
      {
        ref: 'HR.01.05.03', chapter: 'HR',
        title: 'Staff complete ongoing education and training',
        eps: [
          ep('HR.01.05.03', 'EP 1', 'Staff receive ongoing education and training including changes in law, regulation, and policy.', 'C'),
          ep('HR.01.05.03', 'EP 2', 'Staff are educated about patient rights including de-escalation and restraint.', 'A'),
          ep('HR.01.05.03', 'EP 3', 'Training on restraint and seclusion is completed before applying restraint or seclusion.', 'A'),
        ],
      },
      {
        ref: 'HR.02.01.03', chapter: 'HR',
        title: 'Assess staff competencies',
        eps: [
          ep('HR.02.01.03', 'EP 1', 'Competency is assessed using defined elements and methods.', 'C'),
          ep('HR.02.01.03', 'EP 2', 'Competency assessments are performed at defined intervals.', 'C'),
          ep('HR.02.01.03', 'EP 3', 'Staff not meeting competency standards are addressed.', 'A'),
        ],
      },
    ],
  },

  // ── MM ──────────────────────────────────────────────────────────────────
  {
    code: 'MM',
    title: 'Medication Management',
    standards: [
      {
        ref: 'MM.01.01.03', chapter: 'MM',
        title: 'Formulary and medication selection',
        eps: [
          ep('MM.01.01.03', 'EP 1', 'A formulary or list of approved medications is maintained.', 'C'),
          ep('MM.01.01.03', 'EP 2', 'The formulary is reviewed and approved at defined intervals.', 'C'),
        ],
      },
      {
        ref: 'MM.04.01.01', chapter: 'MM',
        title: 'Medications are prescribed or ordered safely',
        eps: [
          ep('MM.04.01.01', 'EP 1', 'All medication orders include the required elements.', 'A'),
          ep('MM.04.01.01', 'EP 2', 'Verbal and telephone orders are limited to urgent situations.', 'C'),
          ep('MM.04.01.01', 'EP 4', 'High-alert medications have special ordering protocols.', 'A'),
        ],
      },
      {
        ref: 'MM.05.01.01', chapter: 'MM',
        title: 'Medications are prepared safely',
        eps: [
          ep('MM.05.01.01', 'EP 1', 'Staff prepare medications safely and according to policy.', 'A'),
          ep('MM.05.01.01', 'EP 3', 'Medications are labeled according to policy.', 'A'),
        ],
      },
      {
        ref: 'MM.06.01.01', chapter: 'MM',
        title: 'Medications are administered safely',
        eps: [
          ep('MM.06.01.01', 'EP 1', 'Staff administer only medications they have prepared.', 'A'),
          ep('MM.06.01.01', 'EP 2', 'Staff verify the rights of medication administration.', 'A'),
          ep('MM.06.01.01', 'EP 6', 'Adverse drug reactions are reported per policy.', 'A'),
        ],
      },
    ],
  },

  // ── PC ──────────────────────────────────────────────────────────────────
  {
    code: 'PC',
    title: 'Provision of Care, Treatment, and Services',
    standards: [
      {
        ref: 'PC.01.02.01', chapter: 'PC',
        title: 'The hospital accepts patients for care based on its mission and capabilities',
        eps: [
          ep('PC.01.02.01', 'EP 1', 'Policies define the criteria for accepting and transferring patients.', 'C'),
          ep('PC.01.02.01', 'EP 2', 'Patients are not turned away without an EMTALA-compliant medical screening.', 'A'),
        ],
      },
      {
        ref: 'PC.01.02.03', chapter: 'PC',
        title: 'Assess patients',
        eps: [
          ep('PC.01.02.03', 'EP 1', 'An individualized comprehensive assessment is performed for each patient.', 'A'),
          ep('PC.01.02.03', 'EP 2', 'Assessments are completed within the time frame defined by policy.', 'A'),
          ep('PC.01.02.03', 'EP 3', 'Reassessments are performed at defined intervals and when condition changes.', 'A'),
        ],
      },
      {
        ref: 'PC.03.05.01', chapter: 'PC',
        title: 'Manage restraint and seclusion',
        eps: [
          ep('PC.03.05.01', 'EP 1', 'Restraint and seclusion are used only when less restrictive measures have failed.', 'A'),
          ep('PC.03.05.01', 'EP 2', 'Orders for restraint and seclusion are time-limited.', 'A'),
          ep('PC.03.05.01', 'EP 3', 'Patients in restraint or seclusion are continually monitored.', 'A'),
          ep('PC.03.05.01', 'EP 7', 'A physician or licensed practitioner evaluates the patient in person within 1 hour of restraint order.', 'A'),
          ep('PC.03.05.01', 'EP 13', 'Restraint and seclusion deaths are reported to CMS within 24 hours.', 'A'),
          ep('PC.03.05.01', 'EP 14', 'HBIPS data for restraint and seclusion is submitted monthly to JC.', 'A'),
        ],
      },
      {
        ref: 'PC.04.01.01', chapter: 'PC',
        title: 'Care is coordinated',
        eps: [
          ep('PC.04.01.01', 'EP 1', 'The hospital coordinates care among all settings and providers involved in the patient\'s care.', 'C'),
          ep('PC.04.01.01', 'EP 4', 'The hospital\'s care coordination includes discharge planning.', 'C'),
        ],
      },
    ],
  },

  // ── RC ──────────────────────────────────────────────────────────────────
  {
    code: 'RC',
    title: 'Record of Care, Treatment, and Services',
    standards: [
      {
        ref: 'RC.01.01.01', chapter: 'RC',
        title: 'The hospital maintains complete and accurate medical records',
        eps: [
          ep('RC.01.01.01', 'EP 1', 'The hospital uses a single medical record for each patient.', 'C'),
          ep('RC.01.01.01', 'EP 2', 'Medical records contain the required data elements.', 'A'),
        ],
      },
      {
        ref: 'RC.02.01.01', chapter: 'RC',
        title: 'Required medical record content',
        eps: [
          ep('RC.02.01.01', 'EP 1', 'Medical records contain the patient\'s name and date of birth.', 'A'),
          ep('RC.02.01.01', 'EP 5', 'Medical records include the reason for admission.', 'A'),
          ep('RC.02.01.01', 'EP 17', 'Medical records include a discharge summary.', 'A'),
        ],
      },
      {
        ref: 'RC.02.01.07', chapter: 'RC',
        title: 'Behavioral health records',
        eps: [
          ep('RC.02.01.07', 'EP 1', 'Records include the psychiatric history and mental status exam.', 'A'),
          ep('RC.02.01.07', 'EP 2', 'Records include a social history.', 'A'),
          ep('RC.02.01.07', 'EP 3', 'Records include a master treatment plan.', 'A'),
          ep('RC.02.01.07', 'EP 5', 'All treatment plan team members are identified.', 'C'),
        ],
      },
    ],
  },

  // ── RI ──────────────────────────────────────────────────────────────────
  {
    code: 'RI',
    title: 'Rights and Responsibilities of the Individual',
    standards: [
      {
        ref: 'RI.01.01.01', chapter: 'RI',
        title: 'The hospital respects patient rights',
        eps: [
          ep('RI.01.01.01', 'EP 1', 'The hospital informs patients of their rights.', 'A'),
          ep('RI.01.01.01', 'EP 2', 'The hospital displays patient rights in a manner accessible to patients and families.', 'C'),
          ep('RI.01.01.01', 'EP 8', 'Patients are free from all forms of abuse, neglect, and exploitation.', 'A'),
        ],
      },
      {
        ref: 'RI.01.02.01', chapter: 'RI',
        title: 'The hospital protects patient privacy and confidentiality',
        eps: [
          ep('RI.01.02.01', 'EP 1', 'Patient privacy is maintained during care, treatment, and services.', 'A'),
          ep('RI.01.02.01', 'EP 2', 'Policies address patient confidentiality and disclosure of medical record information.', 'C'),
        ],
      },
      {
        ref: 'RI.01.03.01', chapter: 'RI',
        title: 'The hospital honors the patient\'s right to give or withhold informed consent',
        eps: [
          ep('RI.01.03.01', 'EP 1', 'The hospital obtains informed consent for treatment.', 'A'),
          ep('RI.01.03.01', 'EP 3', 'Informed consent is documented in the medical record.', 'A'),
        ],
      },
    ],
  },

  // ── TS ──────────────────────────────────────────────────────────────────
  {
    code: 'TS',
    title: 'Transplant Safety',
    standards: [
      {
        ref: 'TS.03.01.01', chapter: 'TS',
        title: 'Blood and blood product management',
        eps: [
          ep('TS.03.01.01', 'EP 1', 'Policies govern the ordering, dispensing, and administration of blood products.', 'C'),
          ep('TS.03.01.01', 'EP 2', 'Patient identity is verified before blood product administration.', 'A'),
        ],
      },
    ],
  },

  // ── WT ──────────────────────────────────────────────────────────────────
  {
    code: 'WT',
    title: 'Waived Testing',
    standards: [
      {
        ref: 'WT.01.01.01', chapter: 'WT',
        title: 'Implement and maintain a waived testing program',
        eps: [
          ep('WT.01.01.01', 'EP 1', 'Policies address waived testing requirements.', 'C'),
          ep('WT.01.01.01', 'EP 2', 'Staff are trained and competency-assessed for each waived test performed.', 'A'),
          ep('WT.01.01.01', 'EP 6', 'Quality control is performed for waived testing per manufacturer instructions.', 'A'),
        ],
      },
    ],
  },

  // ── LD ──────────────────────────────────────────────────────────────────
  {
    code: 'LD',
    title: 'Leadership',
    standards: [
      {
        ref: 'LD.03.01.01', chapter: 'LD',
        title: 'Leaders create and maintain a culture of safety and quality',
        eps: [
          ep('LD.03.01.01', 'EP 1', 'Leaders regularly evaluate the culture of safety and quality.', 'C'),
          ep('LD.03.01.01', 'EP 2', 'Leaders prioritize and take action based on culture of safety data.', 'A'),
          ep('LD.03.01.01', 'EP 5', 'Leaders develop a code of conduct and policies for disruptive behavior.', 'C'),
        ],
      },
      {
        ref: 'LD.04.04.05', chapter: 'LD',
        title: 'Leaders conduct thorough analysis of sentinel events',
        eps: [
          ep('LD.04.04.05', 'EP 1', 'The hospital conducts a root cause analysis when a sentinel event occurs.', 'A'),
          ep('LD.04.04.05', 'EP 2', 'The RCA is completed within 45 days of the sentinel event.', 'A'),
          ep('LD.04.04.05', 'EP 3', 'The RCA results in an action plan that is implemented and monitored.', 'A'),
          ep('LD.04.04.05', 'EP 4', 'Sentinel events are reported to the Joint Commission.', 'A'),
        ],
      },
    ],
  },

  // ── PI ──────────────────────────────────────────────────────────────────
  {
    code: 'PI',
    title: 'Performance Improvement',
    standards: [
      {
        ref: 'PI.01.01.01', chapter: 'PI',
        title: 'Plan for collecting performance improvement data',
        eps: [
          ep('PI.01.01.01', 'EP 1', 'Data is systematically collected to monitor conditions relevant to patient safety and quality.', 'C'),
          ep('PI.01.01.01', 'EP 2', 'Data collection includes HBIPS core measures.', 'A'),
        ],
      },
      {
        ref: 'PI.02.01.01', chapter: 'PI',
        title: 'Compile and analyze performance improvement data',
        eps: [
          ep('PI.02.01.01', 'EP 1', 'The hospital compiles and analyzes data to identify improvements.', 'C'),
          ep('PI.02.01.01', 'EP 2', 'The hospital uses statistical methods to analyze data trends.', 'C'),
          ep('PI.02.01.01', 'EP 5', 'The hospital compares its performance data to prior performance and external benchmarks.', 'C'),
        ],
      },
      {
        ref: 'PI.03.01.01', chapter: 'PI',
        title: 'Improve performance',
        eps: [
          ep('PI.03.01.01', 'EP 1', 'The hospital implements performance improvement activities based on analysis.', 'A'),
          ep('PI.03.01.01', 'EP 3', 'Improvements are evaluated for effectiveness.', 'A'),
        ],
      },
    ],
  },
];

// ─── Utility functions ────────────────────────────────────────────────────────

export function getChapter(code: string): Chapter | undefined {
  return JC_STANDARDS.find(c => c.code === code);
}

export function getAllEPs(): EP[] {
  return JC_STANDARDS.flatMap(ch => ch.standards.flatMap(s => s.eps));
}

export function getEPsForChapters(codes: string[]): EP[] {
  return JC_STANDARDS
    .filter(ch => codes.includes(ch.code))
    .flatMap(ch => ch.standards.flatMap(s => s.eps));
}

export const CHAPTER_CODES = JC_STANDARDS.map(c => c.code);

export const CHAPTER_LABELS: Record<string, string> = Object.fromEntries(
  JC_STANDARDS.map(c => [c.code, c.title])
);
