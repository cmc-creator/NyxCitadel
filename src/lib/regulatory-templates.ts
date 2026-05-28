export interface ComplianceItem {
  id: string;
  standard: string;
  requirement: string;
  frequency: 'annual' | 'quarterly' | 'ongoing' | 'biennial';
  dueDate?: string;
  evidence: string[];
  status: 'compliant' | 'non-compliant' | 'not-applicable' | 'in-progress';
  notes?: string;
  actionItems?: string[];
  owner?: string;
  targetDate?: string;
}

export interface RegulatoryTemplate {
  id: string;
  name: string;
  regulatory_body: 'TJC' | 'CMS' | 'AZDHS';
  frequency: 'annual' | 'quarterly' | 'biennial';
  color: string;
  sections: ComplianceSection[];
  last_updated: string;
}

export interface ComplianceSection {
  id: string;
  title: string;
  description: string;
  items: ComplianceItem[];
}

// ─────────────────────────────────────────────────────────────────
// TJC (The Joint Commission) — Annual Comprehensive Accreditation Manual
// ─────────────────────────────────────────────────────────────────
export const TJC_ANNUAL: RegulatoryTemplate = {
  id: 'tjc-annual',
  name: 'The Joint Commission (TJC) - Annual Accreditation Standards',
  regulatory_body: 'TJC',
  frequency: 'annual',
  color: 'bg-teal-100 text-teal-900',
  last_updated: '2026-01-15',
  sections: [
    {
      id: 'tjc-leadership',
      title: 'Leadership (LD)',
      description: 'Organizational governance, leadership responsibility, and planning',
      items: [
        {
          id: 'ld-04-04-01',
          standard: 'LD.04.04.01',
          requirement: 'Conduct annual proactive risk assessment (HVA) identifying natural, technological, human, and other hazards',
          frequency: 'annual',
          evidence: ['HVA Report', 'Risk Register', 'Mitigation Plans'],
          status: 'compliant',
        },
        {
          id: 'ld-04-05',
          standard: 'LD.04.05',
          requirement: 'Develop emergency management plan based on HVA results',
          frequency: 'annual',
          evidence: ['Emergency Management Plan', 'Drills', 'Training Records'],
          status: 'compliant',
        },
        {
          id: 'ld-02-01',
          standard: 'LD.02.01',
          requirement: 'Establish governance structure with defined roles, responsibilities, and accountability',
          frequency: 'annual',
          evidence: ['Organizational Chart', 'Job Descriptions', 'Committee Minutes'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'tjc-safety',
      title: 'Patient Safety (PS)',
      description: 'Patient identification, communication, and preventing wrong-site/procedure/patient surgery',
      items: [
        {
          id: 'ps-01-01-01',
          standard: 'PS.01.01.01',
          requirement: 'Use two patient identifiers before administering medications, blood, or blood products',
          frequency: 'ongoing',
          evidence: ['Policy Documentation', 'Audit Results', 'Training Records'],
          status: 'compliant',
        },
        {
          id: 'ps-02-01-01',
          standard: 'PS.02.01.01',
          requirement: 'Implement standardized approach to hand-off communication (SBAR)',
          frequency: 'ongoing',
          evidence: ['Communication Standards', 'Staff Training', 'Observation Audits'],
          status: 'compliant',
        },
        {
          id: 'ps-06-01',
          standard: 'PS.06.01',
          requirement: 'Establish moderate sedation/anesthesia procedures and competency requirements',
          frequency: 'annual',
          evidence: ['Procedures', 'Credentialing Records', 'Competency Assessments'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'tjc-infection-control',
      title: 'Infection Control (IC)',
      description: 'Infection prevention, surveillance, and control measures',
      items: [
        {
          id: 'ic-01-01-01-ep4',
          standard: 'IC.01.01.01 EP4',
          requirement: 'Conduct annual Infection Control Risk Assessment (ICRA) for patient populations served',
          frequency: 'annual',
          evidence: ['ICRA Report', 'Risk Assessment', 'Control Measures'],
          status: 'compliant',
        },
        {
          id: 'ic-02-01',
          standard: 'IC.02.01',
          requirement: 'Implement hand hygiene practices and monitor compliance',
          frequency: 'ongoing',
          evidence: ['Hand Hygiene Policy', 'Observation Audits', 'Compliance Data'],
          status: 'compliant',
        },
        {
          id: 'ic-03-01',
          standard: 'IC.03.01',
          requirement: 'Report healthcare-associated infections (HAI) to NHSN',
          frequency: 'ongoing',
          evidence: ['HAI Surveillance Data', 'NHSN Reports', 'Case Investigations'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'tjc-environment-care',
      title: 'Environment of Care (EC)',
      description: 'Safety, physical environment management, and infection prevention infrastructure',
      items: [
        {
          id: 'ec-01-01-01',
          standard: 'EC.01.01.01',
          requirement: 'Establish environment of care management program covering safety, emergency preparedness, security',
          frequency: 'annual',
          evidence: ['EOC Program', 'Risk Assessments', 'Inspection Records'],
          status: 'compliant',
        },
        {
          id: 'ec-02-04-01',
          standard: 'EC.02.04.01',
          requirement: 'Conduct ongoing environmental rounds and document hazards/deficiencies',
          frequency: 'ongoing',
          evidence: ['Round Reports', 'Corrective Actions', 'Follow-up Documentation'],
          status: 'compliant',
        },
        {
          id: 'ec-02-06-01',
          standard: 'EC.02.06.01',
          requirement: 'Perform ICRA before any construction or renovation project',
          frequency: 'ongoing',
          evidence: ['ICRA Documentation', 'Project Plans', 'Compliance Letters'],
          status: 'compliant',
        },
        {
          id: 'ec-03-01',
          standard: 'EC.03.01',
          requirement: 'Maintain equipment preventive maintenance program',
          frequency: 'ongoing',
          evidence: ['PM Schedule', 'Maintenance Records', 'Equipment Log'],
          status: 'compliant',
        },
        {
          id: 'ec-04-01-01',
          standard: 'EC.04.01.01',
          requirement: 'Assess physical environment for ligature risks, especially psychiatric units',
          frequency: 'annual',
          evidence: ['Ligature Risk Assessment', 'Environmental Design Review', 'Mitigation Plans'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'tjc-quality',
      title: 'Quality, Patient Safety & Education (QC/QA)',
      description: 'Quality improvement, data collection, and QAPI program',
      items: [
        {
          id: 'qc-01-01-01',
          standard: 'QC.01.01.01',
          requirement: 'Establish comprehensive Quality, Patient Safety and Education program (QAPE)',
          frequency: 'annual',
          evidence: ['QAPI Plan', 'Committee Structure', 'Meeting Minutes'],
          status: 'compliant',
        },
        {
          id: 'qc-02-02',
          standard: 'QC.02.02',
          requirement: 'Establish processes for reporting and investigating adverse events/sentinel events',
          frequency: 'ongoing',
          evidence: ['Reporting System', 'Investigations', 'Root Cause Analysis'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'tjc-hr',
      title: 'Human Resources (HR)',
      description: 'Credential verification, competency, and professional practice evaluation',
      items: [
        {
          id: 'hr-01-01-01',
          standard: 'HR.01.01.01',
          requirement: 'Verify credentials and licensure for all clinical staff at hire and ongoing',
          frequency: 'annual',
          evidence: ['Credentialing Files', 'License Verifications', 'Primary Source Documentation'],
          status: 'compliant',
        },
        {
          id: 'hr-02-01',
          standard: 'HR.02.01',
          requirement: 'Conduct OPPE (Ongoing Professional Practice Evaluation) and FPPE (Focused) for physicians',
          frequency: 'annual',
          evidence: ['OPPE/FPPE Documentation', 'Performance Data', 'Peer Reviews'],
          status: 'compliant',
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// CMS (Centers for Medicare & Medicaid Services) — Conditions of Participation
// ─────────────────────────────────────────────────────────────────
export const CMS_ANNUAL: RegulatoryTemplate = {
  id: 'cms-annual',
  name: 'CMS - Conditions of Participation (CoP) Annual Survey',
  regulatory_body: 'CMS',
  frequency: 'annual',
  color: 'bg-blue-100 text-blue-900',
  last_updated: '2026-01-15',
  sections: [
    {
      id: 'cms-governing',
      title: 'Governing Body & Management (482.12)',
      description: 'Hospital organization, governance, and management requirements',
      items: [
        {
          id: 'cms-482-12',
          standard: 'Title 42 CFR 482.12',
          requirement: 'Governing body ensures compliance with federal, state, and local laws',
          frequency: 'annual',
          evidence: ['Board Minutes', 'Policies', 'Compliance Documentation'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'cms-quality',
      title: 'Quality Systems (482.21)',
      description: 'Quality assurance and performance improvement program requirements',
      items: [
        {
          id: 'cms-482-21-a',
          standard: 'Title 42 CFR 482.21(a)',
          requirement: 'Establish Quality Assurance and Performance Improvement (QAPI) program',
          frequency: 'annual',
          evidence: ['QAPI Plan', 'Committee Structure', 'Performance Data'],
          status: 'compliant',
        },
        {
          id: 'cms-482-21-b',
          standard: 'Title 42 CFR 482.21(b)',
          requirement: 'Establish Patient Safety Evaluation System for adverse events',
          frequency: 'ongoing',
          evidence: ['Event Reporting System', 'RCA Documentation', 'Corrective Actions'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'cms-patient-rights',
      title: 'Patient Rights (482.13)',
      description: 'Protection of patient rights and dignity',
      items: [
        {
          id: 'cms-482-13-a',
          standard: 'Title 42 CFR 482.13(a)',
          requirement: 'Patient rights policies include right to appropriate care, privacy, informed consent',
          frequency: 'annual',
          evidence: ['Patient Rights Policy', 'Consent Forms', 'Grievance Records'],
          status: 'compliant',
        },
        {
          id: 'cms-482-13-f',
          standard: 'Title 42 CFR 482.13(f)',
          requirement: 'Establish grievance procedure; resolve patient complaints timely',
          frequency: 'ongoing',
          evidence: ['Grievance Policy', 'Complaint Records', 'Resolution Documentation'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'cms-infection-control',
      title: 'Infection Control (482.42)',
      description: 'Infection prevention and surveillance requirements',
      items: [
        {
          id: 'cms-482-42-a',
          standard: 'Title 42 CFR 482.42(a)',
          requirement: 'Infection Prevention & Control Program with designated IP professional',
          frequency: 'annual',
          evidence: ['IP Program', 'Staff Credentials', 'Surveillance Data'],
          status: 'compliant',
        },
        {
          id: 'cms-482-42-b',
          standard: 'Title 42 CFR 482.42(b)',
          requirement: 'Conduct infection surveillance, prevention, and control measures',
          frequency: 'ongoing',
          evidence: ['HAI Surveillance', 'Outbreak Reports', 'Prevention Measures'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'cms-credentialing',
      title: 'Credentialing & Privileging (482.12)',
      description: 'Initial credentialing and ongoing professional practice evaluation',
      items: [
        {
          id: 'cms-credentialing-initial',
          standard: 'Title 42 CFR 482.12(c)',
          requirement: 'Verify all credentials and primary source documentation before employment',
          frequency: 'ongoing',
          evidence: ['Credentialing Files', 'Primary Source Verifications', 'Background Checks'],
          status: 'compliant',
        },
        {
          id: 'cms-credentialing-ongoing',
          standard: 'Title 42 CFR 482.12(e)',
          requirement: 'Conduct ongoing performance evaluation based on established indicators',
          frequency: 'annual',
          evidence: ['OPPE Data', 'Peer Reviews', 'Incident Reviews'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'cms-medication-management',
      title: 'Medication Management (482.23)',
      description: 'Safe medication use and management systems',
      items: [
        {
          id: 'cms-482-23-c',
          standard: 'Title 42 CFR 482.23(c)',
          requirement: 'Pharmacy services ensure safe medication management and dispensing',
          frequency: 'ongoing',
          evidence: ['Medication Policies', 'Dispensing Records', 'Error Tracking'],
          status: 'compliant',
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// AZDHS (Arizona Department of Health Services) — Licensing Standards
// ─────────────────────────────────────────────────────────────────
export const AZDHS_ANNUAL: RegulatoryTemplate = {
  id: 'azdhs-annual',
  name: 'AZDHS - Hospital Licensing Standards (Annual)',
  regulatory_body: 'AZDHS',
  frequency: 'annual',
  color: 'bg-orange-100 text-orange-900',
  last_updated: '2026-01-15',
  sections: [
    {
      id: 'azdhs-general',
      title: 'General Hospital Requirements (R9-10-101)',
      description: 'Licensure and operational requirements for hospitals',
      items: [
        {
          id: 'azdhs-r9-10-101',
          standard: 'AZDHS R9-10-101',
          requirement: 'Hospital maintains current Arizona Department of Health Services license',
          frequency: 'annual',
          evidence: ['License', 'License Renewal Application', 'Fee Receipts'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'azdhs-administration',
      title: 'Administration & Governance (R9-10-102)',
      description: 'Administrative and organizational structure',
      items: [
        {
          id: 'azdhs-r9-10-102-a',
          standard: 'AZDHS R9-10-102(A)',
          requirement: 'Hospital has governing board with defined responsibilities and written bylaws',
          frequency: 'annual',
          evidence: ['Board Minutes', 'Bylaws', 'Organizational Chart'],
          status: 'compliant',
        },
        {
          id: 'azdhs-r9-10-102-b',
          standard: 'AZDHS R9-10-102(B)',
          requirement: 'Administrator is qualified and responsible for hospital management',
          frequency: 'annual',
          evidence: ['Administrator Credentials', 'Job Description', 'Credentials'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'azdhs-clinical',
      title: 'Clinical Services (R9-10-105)',
      description: 'Clinical service organization and delivery',
      items: [
        {
          id: 'azdhs-r9-10-105-c',
          standard: 'AZDHS R9-10-105(C)',
          requirement: 'Infection control program with written policies and procedures',
          frequency: 'annual',
          evidence: ['IC Program', 'Policies', 'Training Records'],
          status: 'compliant',
        },
        {
          id: 'azdhs-r9-10-105-d',
          standard: 'AZDHS R9-10-105(D)',
          requirement: 'Medical records meet documentation standards and accessibility',
          frequency: 'ongoing',
          evidence: ['Medical Records Policy', 'Audit Results', 'Storage/Access Records'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'azdhs-reports',
      title: 'Incident Reporting (R9-10-109)',
      description: 'Required incident and serious event reporting to AZDHS',
      items: [
        {
          id: 'azdhs-r9-10-109-a',
          standard: 'AZDHS R9-10-109(A)',
          requirement: 'Report serious events (deaths, serious harm) within 24-72 hours of discovery',
          frequency: 'ongoing',
          evidence: ['Incident Reports', 'AZDHS Reports (IR/IAD)', 'Investigation Documents'],
          status: 'compliant',
        },
        {
          id: 'azdhs-r9-10-109-b',
          standard: 'AZDHS R9-10-109(B)',
          requirement: 'Conduct investigation and corrective action for reported incidents',
          frequency: 'ongoing',
          evidence: ['Investigation Reports', 'Corrective Actions', 'Follow-up Documentation'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'azdhs-environment',
      title: 'Environment & Safety (R9-10-110)',
      description: 'Environmental safety and hazard management',
      items: [
        {
          id: 'azdhs-r9-10-110-a',
          standard: 'AZDHS R9-10-110(A)',
          requirement: 'Maintain safe environment and conduct regular safety inspections',
          frequency: 'ongoing',
          evidence: ['Safety Inspection Records', 'Corrective Actions', 'Maintenance Logs'],
          status: 'compliant',
        },
        {
          id: 'azdhs-r9-10-110-b',
          standard: 'AZDHS R9-10-110(B)',
          requirement: 'Implement emergency management and disaster preparedness plans',
          frequency: 'annual',
          evidence: ['Emergency Plan', 'Drills Records', 'Training Documentation'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'azdhs-staff',
      title: 'Staff Requirements (R9-10-115)',
      description: 'Credentialing and competency requirements',
      items: [
        {
          id: 'azdhs-r9-10-115-a',
          standard: 'AZDHS R9-10-115(A)',
          requirement: 'All clinical staff must have appropriate licensure and credentials verified',
          frequency: 'annual',
          evidence: ['Personnel Files', 'License Verifications', 'Credential Verification'],
          status: 'compliant',
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Quarterly Regulatory Compliance Checklists
// ─────────────────────────────────────────────────────────────────
export const CMS_QUARTERLY: RegulatoryTemplate = {
  id: 'cms-quarterly',
  name: 'CMS - Quarterly Compliance Checklist',
  regulatory_body: 'CMS',
  frequency: 'quarterly',
  color: 'bg-blue-100 text-blue-900',
  last_updated: '2026-01-15',
  sections: [
    {
      id: 'cms-q-patient-safety',
      title: 'Quarterly Patient Safety Review',
      description: 'Review recent patient safety events and trends',
      items: [
        {
          id: 'cms-q-adverse',
          standard: 'CoP 482.21(b)',
          requirement: 'Review all adverse events from past quarter; conduct RCA if needed',
          frequency: 'quarterly',
          evidence: ['Event Reports', 'RCA Documentation', 'Corrective Actions'],
          status: 'compliant',
        },
        {
          id: 'cms-q-hai',
          standard: 'CoP 482.42(b)',
          requirement: 'Review HAI surveillance data and trends quarterly',
          frequency: 'quarterly',
          evidence: ['HAI Reports', 'NHSN Data', 'Trend Analysis'],
          status: 'compliant',
        },
        {
          id: 'cms-q-grievances',
          standard: 'CoP 482.13(f)',
          requirement: 'Review patient grievances and ensure resolution documentation',
          frequency: 'quarterly',
          evidence: ['Grievance Log', 'Resolution Records', 'Trends'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'cms-q-compliance',
      title: 'Quarterly Compliance Monitoring',
      description: 'Monitor key compliance indicators',
      items: [
        {
          id: 'cms-q-staffing',
          standard: 'CoP 482.12(b)',
          requirement: 'Verify current credentials on file for all new clinical hires',
          frequency: 'quarterly',
          evidence: ['New Hire Files', 'Credentialing Records', 'Board Approvals'],
          status: 'compliant',
        },
        {
          id: 'cms-q-medication',
          standard: 'CoP 482.23(c)',
          requirement: 'Audit medication management processes for compliance',
          frequency: 'quarterly',
          evidence: ['Audit Results', 'Corrective Actions', 'Staff Training'],
          status: 'compliant',
        },
      ],
    },
  ],
};

export const TJC_QUARTERLY: RegulatoryTemplate = {
  id: 'tjc-quarterly',
  name: 'The Joint Commission - Quarterly Readiness Checklist',
  regulatory_body: 'TJC',
  frequency: 'quarterly',
  color: 'bg-teal-100 text-teal-900',
  last_updated: '2026-01-15',
  sections: [
    {
      id: 'tjc-q-safety',
      title: 'Quarterly Safety Review',
      description: 'Monitor key safety standards on a quarterly basis',
      items: [
        {
          id: 'tjc-q-sentinel',
          standard: 'PS.02.01',
          requirement: 'Review all sentinel events and near-misses; investigate per protocol',
          frequency: 'quarterly',
          evidence: ['Sentinel Event Log', 'Investigations', 'Corrective Actions'],
          status: 'compliant',
        },
        {
          id: 'tjc-q-rounds',
          standard: 'EC.02.04.01',
          requirement: 'Ensure environmental rounds are conducted and documented each quarter',
          frequency: 'quarterly',
          evidence: ['Round Reports', 'Corrective Actions', 'Completion Log'],
          status: 'compliant',
        },
        {
          id: 'tjc-q-credentials',
          standard: 'HR.01.01.01',
          requirement: 'Verify all credentials current and properly filed quarterly',
          frequency: 'quarterly',
          evidence: ['Credential Files', 'License Expiration Checks', 'Compliance Report'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'tjc-q-quality',
      title: 'Quarterly Quality Monitoring',
      description: 'Monitor QAPI activities quarterly',
      items: [
        {
          id: 'tjc-q-metrics',
          standard: 'QC.01.01.01',
          requirement: 'Review quality metrics and performance improvement projects',
          frequency: 'quarterly',
          evidence: ['Metrics Reports', 'Project Status', 'Committee Minutes'],
          status: 'compliant',
        },
      ],
    },
  ],
};

export const AZDHS_QUARTERLY: RegulatoryTemplate = {
  id: 'azdhs-quarterly',
  name: 'AZDHS - Quarterly Licensing Compliance Check',
  regulatory_body: 'AZDHS',
  frequency: 'quarterly',
  color: 'bg-orange-100 text-orange-900',
  last_updated: '2026-01-15',
  sections: [
    {
      id: 'azdhs-q-incidents',
      title: 'Quarterly Incident Review',
      description: 'Review incidents reported to AZDHS',
      items: [
        {
          id: 'azdhs-q-ir-iad',
          standard: 'R9-10-109',
          requirement: 'Verify all required incidents (IR/IAD) were reported within timeframe',
          frequency: 'quarterly',
          evidence: ['Incident Reports', 'AZDHS Reports', 'Submission Confirmations'],
          status: 'compliant',
        },
        {
          id: 'azdhs-q-investigations',
          standard: 'R9-10-109(B)',
          requirement: 'Review incident investigations and corrective actions taken',
          frequency: 'quarterly',
          evidence: ['Investigation Reports', 'Corrective Actions', 'Follow-up Records'],
          status: 'compliant',
        },
      ],
    },
    {
      id: 'azdhs-q-operational',
      title: 'Quarterly Operational Compliance',
      description: 'Verify ongoing operational compliance with AZDHS standards',
      items: [
        {
          id: 'azdhs-q-license',
          standard: 'R9-10-101',
          requirement: 'Verify current AZDHS license is displayed and accessible',
          frequency: 'quarterly',
          evidence: ['License Verification', 'Display Confirmation', 'File Review'],
          status: 'compliant',
        },
        {
          id: 'azdhs-q-safety',
          standard: 'R9-10-110',
          requirement: 'Conduct safety inspection and verify corrective actions completion',
          frequency: 'quarterly',
          evidence: ['Safety Inspection', 'Corrective Action Log', 'Remediation Evidence'],
          status: 'compliant',
        },
      ],
    },
  ],
};

export const ALL_REGULATORY_TEMPLATES: RegulatoryTemplate[] = [
  TJC_ANNUAL,
  CMS_ANNUAL,
  AZDHS_ANNUAL,
  TJC_QUARTERLY,
  CMS_QUARTERLY,
  AZDHS_QUARTERLY,
];

export function getRegulatoryTemplate(id: string): RegulatoryTemplate | undefined {
  return ALL_REGULATORY_TEMPLATES.find(t => t.id === id);
}

export function getRegulatoryTemplatesByBody(body: 'TJC' | 'CMS' | 'AZDHS'): RegulatoryTemplate[] {
  return ALL_REGULATORY_TEMPLATES.filter(t => t.regulatory_body === body);
}

export function getRegulatoryTemplatesByFrequency(frequency: 'annual' | 'quarterly'): RegulatoryTemplate[] {
  return ALL_REGULATORY_TEMPLATES.filter(t => t.frequency === frequency);
}
