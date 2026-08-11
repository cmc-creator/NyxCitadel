/**
 * Demo Data Seeder for NyxCitadel
 * Provides client-side state initialization for Demo Mode
 */

export interface DemoSeedSummary {
  facility: string;
  incidentsCount: number;
  capsCount: number;
  surveysCount: number;
  calendarItemsCount: number;
  trainingRecordsCount: number;
  eocItemsCount: number;
  timestamp: string;
}

export const DEMO_FACILITY = {
  id: 'destiny-springs',
  name: 'Destiny Springs Healthcare',
  shortName: 'DSH',
  facilityType: 'ACUTE_PSYCH',
  bedCount: 60,
  city: 'Peoria',
  state: 'AZ',
};

export const DEMO_INCIDENTS = [
  {
    id: 'INC-2026-001',
    title: 'Unwitnessed Patient Fall - Unit 3B (Room 312)',
    category: 'PATIENT_FALL',
    severity: 'MEDIUM',
    status: 'UNDER_INVESTIGATION',
    incidentDate: '2026-03-08T14:30:00Z',
    reportedBy: 'Sarah Jenkins, RN',
    department: 'Adult Inpatient',
    summary: 'Patient slid from bedside chair during shift change observation. No loss of consciousness. Vital signs stable. X-ray negative for fracture.',
    adhsReportable: false,
    rcaRequired: true,
  },
  {
    id: 'INC-2026-002',
    title: 'Medication Variance - Clozapine Dosage Timing',
    category: 'MEDICATION_VARIANCE',
    severity: 'HIGH',
    status: 'RCA_IN_PROGRESS',
    incidentDate: '2026-03-07T09:15:00Z',
    reportedBy: 'Michael Vance, PharmD',
    department: 'Pharmacy',
    summary: 'Evening Clozapine administration delayed by 3 hours due to eMAR order sync lag during pharmacy shift handover.',
    adhsReportable: false,
    rcaRequired: true,
  },
  {
    id: 'INC-2026-003',
    title: 'Ligature Point Identification - Room 118 Bathroom',
    category: 'ENVIRONMENT_SAFETY',
    severity: 'HIGH',
    status: 'CAP_ASSIGNED',
    incidentDate: '2026-03-05T11:00:00Z',
    reportedBy: 'David Miller, EOC Safety Officer',
    department: 'Facility Operations',
    summary: 'Exposed towel hook mounting bracket identified during monthly EOC safety rounds. Room vacated immediately.',
    adhsReportable: false,
    rcaRequired: true,
  },
  {
    id: 'INC-2026-004',
    title: 'Restraint Documentation Timeout Variance',
    category: 'RESTRAINT_SECLUSION',
    severity: 'CRITICAL',
    status: 'OPEN',
    incidentDate: '2026-03-04T18:45:00Z',
    reportedBy: 'Quality Auditing Team',
    department: 'Behavioral Health',
    summary: '15-minute 1:1 observation log missing 2 consecutive intervals during a 2-hour mechanical restraint episode (CMS 482.13 e).',
    adhsReportable: true,
    rcaRequired: true,
  },
  {
    id: 'INC-2026-005',
    title: 'Patient Grievance Regarding Discharge Coordination',
    category: 'PATIENT_GRIEVANCE',
    severity: 'LOW',
    status: 'RESOLVED',
    incidentDate: '2026-03-01T10:20:00Z',
    reportedBy: 'Patient Advocate Office',
    department: 'Case Management',
    summary: 'Family requested formal review of outpatient follow-up appointment timeline prior to formal discharge sign-off.',
    adhsReportable: false,
    rcaRequired: false,
  },
];

export const DEMO_CAPS = [
  {
    id: 'CAP-2026-001',
    incidentId: 'INC-2026-003',
    title: 'Replace Non-Ligature Resistant Towel Hardware in Unit 1',
    owner: 'Facility Operations / Maintenance',
    dueDate: '2026-03-25',
    status: 'IN_PROGRESS',
    progress: 75,
    actionItems: [
      'Audit all 24 bathrooms in Wing A & B',
      'Procure TJC-approved anti-ligature sloped fixtures',
      'Complete installation and sign-off with EOC Committee',
    ],
  },
  {
    id: 'CAP-2026-002',
    incidentId: 'INC-2026-004',
    title: 'Mandatory Re-Education on CMS Restraint 15-Min Observation Logs',
    owner: 'Clinical Nursing Education',
    dueDate: '2026-03-18',
    status: 'OPEN',
    progress: 40,
    actionItems: [
      'Update eMAR electronic restraint flowsheets',
      'Conduct 100% nursing staff competency verification',
      'Implement daily charge nurse audit checks',
    ],
  },
  {
    id: 'CAP-2026-003',
    incidentId: 'INC-2026-002',
    title: 'Pharmacy eMAR Handover Verification Protocol',
    owner: 'Pharmacy Director',
    dueDate: '2026-04-01',
    status: 'OPEN',
    progress: 20,
    actionItems: [
      'Automate eMAR order queue sync alerts',
      'Mandate dual-signoff on high-risk psychotropic meds',
    ],
  },
];

export const DEMO_SURVEYS = [
  {
    id: 'SURV-2026-001',
    title: 'Joint Commission Unannounced Mock Survey',
    surveyorType: 'TJC',
    date: '2026-02-20',
    score: 96.4,
    status: 'COMPLETED',
    findingsCount: 2,
    summary: 'Strong compliance across Environment of Care (EC) and Medical Staff (MS) standards. Minor documentation note on CPR cert tracking.',
  },
  {
    id: 'SURV-2026-002',
    title: 'Arizona ADHS R9-10 Annual Recertification Inspection',
    surveyorType: 'ADHS',
    date: '2026-01-15',
    score: 100,
    status: 'COMPLETED',
    findingsCount: 0,
    summary: 'Zero deficiency findings for state behavioral health license renewal.',
  },
];

export const DEMO_CALENDAR_ITEMS = [
  {
    id: 'CAL-2026-001',
    title: 'Q1 Unannounced Fire Drill (Night Shift)',
    regulator: 'NFPA 101 / TJC EC.02.03.01',
    dueDate: '2026-03-20',
    status: 'UPCOMING',
    urgency: 'HIGH',
  },
  {
    id: 'CAL-2026-002',
    title: 'Annual Hazard Vulnerability Analysis (HVA) Review',
    regulator: 'CMS Emergency Preparedness CoP',
    dueDate: '2026-03-30',
    status: 'UPCOMING',
    urgency: 'MEDIUM',
  },
  {
    id: 'CAL-2026-003',
    title: 'OSHA 300A Annual Injury Summary Posting',
    regulator: 'OSHA 29 CFR 1904',
    dueDate: '2026-04-15',
    status: 'SCHEDULED',
    urgency: 'LOW',
  },
  {
    id: 'CAL-2026-004',
    title: 'Quarterly Medical Executive Committee (MEC) OPPE Review',
    regulator: 'TJC MS.06.01.05',
    dueDate: '2026-03-28',
    status: 'UPCOMING',
    urgency: 'HIGH',
  },
];

const STORAGE_KEY = 'nyxcitadel:demo-seed:v1';

export function seedDemoStorage(): DemoSeedSummary {
  if (typeof window === 'undefined') {
    return {
      facility: DEMO_FACILITY.name,
      incidentsCount: DEMO_INCIDENTS.length,
      capsCount: DEMO_CAPS.length,
      surveysCount: DEMO_SURVEYS.length,
      calendarItemsCount: DEMO_CALENDAR_ITEMS.length,
      trainingRecordsCount: 45,
      eocItemsCount: 18,
      timestamp: new Date().toISOString(),
    };
  }

  const payload: DemoSeedSummary = {
    facility: DEMO_FACILITY.name,
    incidentsCount: DEMO_INCIDENTS.length,
    capsCount: DEMO_CAPS.length,
    surveysCount: DEMO_SURVEYS.length,
    calendarItemsCount: DEMO_CALENDAR_ITEMS.length,
    trainingRecordsCount: 45,
    eocItemsCount: 18,
    timestamp: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.localStorage.setItem('nyxcitadel:demo-incidents', JSON.stringify(DEMO_INCIDENTS));
  window.localStorage.setItem('nyxcitadel:demo-caps', JSON.stringify(DEMO_CAPS));
  window.localStorage.setItem('nyxcitadel:demo-surveys', JSON.stringify(DEMO_SURVEYS));
  window.localStorage.setItem('nyxcitadel:demo-calendar', JSON.stringify(DEMO_CALENDAR_ITEMS));

  window.dispatchEvent(new CustomEvent('nyx:demo-data-seeded', { detail: payload }));
  return payload;
}

export function getDemoSeedStatus(): DemoSeedSummary | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}
