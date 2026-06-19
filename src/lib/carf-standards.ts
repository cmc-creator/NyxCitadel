/**
 * CARF Behavioral Health Standards Library
 * Commission on Accreditation of Rehabilitation Facilities — Behavioral Health Standards
 * Applicable to acute psychiatric hospitals, residential programs, and outpatient BH services.
 */

export interface CarfStandard {
  ref: string;
  title: string;
  section: string;
  sectionTitle: string;
  description: string;
}

export interface CarfSection {
  code: string;
  title: string;
  standards: CarfStandard[];
}

export const CARF_STANDARDS: CarfSection[] = [
  {
    code: 'GOV',
    title: 'Governance and Leadership',
    standards: [
      {
        ref: 'GOV.1',
        title: 'Governing Body Authority',
        section: 'GOV',
        sectionTitle: 'Governance and Leadership',
        description: 'A governing body or equivalent has legal authority and responsibility for the overall operation of the organization. The governing body approves mission, strategic direction, major policies, and fiscal affairs.',
      },
      {
        ref: 'GOV.2',
        title: 'Leadership Responsibilities',
        section: 'GOV',
        sectionTitle: 'Governance and Leadership',
        description: 'Organizational leadership ensures sufficient resources, qualified leadership, and effective policies to achieve mission and strategic goals. Leadership fosters a culture of quality improvement and ethical conduct.',
      },
      {
        ref: 'GOV.3',
        title: 'Legal and Ethical Compliance',
        section: 'GOV',
        sectionTitle: 'Governance and Leadership',
        description: 'The organization demonstrates compliance with applicable laws, regulations, and professional standards. Policies for conflict of interest, financial disclosure, and whistleblower protection are in place.',
      },
      {
        ref: 'GOV.4',
        title: 'Financial Management',
        section: 'GOV',
        sectionTitle: 'Governance and Leadership',
        description: 'Financial planning and management ensures the organization\'s long-term viability and supports achievement of mission. Annual budgets, audits, and financial reporting processes are documented.',
      },
      {
        ref: 'GOV.5',
        title: 'Strategic Planning',
        section: 'GOV',
        sectionTitle: 'Governance and Leadership',
        description: 'The organization engages in strategic planning to guide its future direction. Plans address mission alignment, community needs, and resource allocation.',
      },
    ],
  },
  {
    code: 'ACC',
    title: 'Accessible Services',
    standards: [
      {
        ref: 'ACC.1',
        title: 'Referral and Intake Process',
        section: 'ACC',
        sectionTitle: 'Accessible Services',
        description: 'The organization has a defined, timely referral and intake process. Persons seeking services are informed of eligibility, service scope, and wait time expectations.',
      },
      {
        ref: 'ACC.2',
        title: 'Non-Discrimination and Accessibility',
        section: 'ACC',
        sectionTitle: 'Accessible Services',
        description: 'Services are provided without discrimination. The organization ensures accessibility for persons with disabilities and language barriers, including interpreter services.',
      },
      {
        ref: 'ACC.3',
        title: 'Admission Criteria and Screening',
        section: 'ACC',
        sectionTitle: 'Accessible Services',
        description: 'Admission criteria are documented and applied consistently. Initial screening identifies urgent needs, risk factors, and appropriate level of care.',
      },
      {
        ref: 'ACC.4',
        title: 'Wait Time and Continuity',
        section: 'ACC',
        sectionTitle: 'Accessible Services',
        description: 'The organization monitors wait times and implements strategies to reduce barriers. Persons awaiting services receive interim support and are tracked.',
      },
      {
        ref: 'ACC.5',
        title: 'Transition and Discharge Planning',
        section: 'ACC',
        sectionTitle: 'Accessible Services',
        description: 'Transition and discharge planning begins early and involves the person served. Plans address aftercare needs, referrals, and follow-up to prevent relapse or readmission.',
      },
    ],
  },
  {
    code: 'PCS',
    title: 'Person-Centered Services',
    standards: [
      {
        ref: 'PCS.1',
        title: 'Comprehensive Assessment',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'A comprehensive, individualized assessment is conducted for each person served. The assessment includes clinical, social, cultural, and strengths-based domains relevant to behavioral health needs.',
      },
      {
        ref: 'PCS.2',
        title: 'Individualized Treatment Planning',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'Treatment plans are individualized, person-centered, and developed with active participation of the person served and, when appropriate, family members or significant others.',
      },
      {
        ref: 'PCS.3',
        title: 'Rights of Persons Served',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'Persons served are informed of their rights, including the right to refuse treatment, privacy, confidentiality, grievance procedures, and advance directives. Rights are communicated in accessible formats.',
      },
      {
        ref: 'PCS.4',
        title: 'Informed Consent',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'Informed consent is obtained before treatment begins and is documented. The process ensures the person understands the nature of services, alternatives, risks, and benefits.',
      },
      {
        ref: 'PCS.5',
        title: 'Cultural Competence',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'Services are culturally and linguistically competent. Staff demonstrate awareness of cultural factors affecting behavioral health and adapt services to meet diverse needs.',
      },
      {
        ref: 'PCS.6',
        title: 'Crisis Management and Safety',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'Policies and procedures address prevention, de-escalation, and management of behavioral crises. Restraint and seclusion are used only as a last resort and according to documented policy.',
      },
      {
        ref: 'PCS.7',
        title: 'Medication Management',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'Medication administration, monitoring, storage, and education are managed according to policy and professional standards. Informed consent for psychotropic medications is documented.',
      },
      {
        ref: 'PCS.8',
        title: 'Documentation Standards',
        section: 'PCS',
        sectionTitle: 'Person-Centered Services',
        description: 'Clinical records are maintained accurately, completely, and in a timely manner. Documentation supports continuity of care and demonstrates evidence-based practices.',
      },
    ],
  },
  {
    code: 'QM',
    title: 'Quality Management',
    standards: [
      {
        ref: 'QM.1',
        title: 'Quality Improvement Program',
        section: 'QM',
        sectionTitle: 'Quality Management',
        description: 'A formal, documented quality improvement program guides ongoing performance measurement and improvement. The program uses data to identify opportunities and track outcomes.',
      },
      {
        ref: 'QM.2',
        title: 'Outcomes Measurement',
        section: 'QM',
        sectionTitle: 'Quality Management',
        description: 'The organization measures and reports outcomes for persons served using validated tools. Outcome data are used to improve service delivery and demonstrate effectiveness.',
      },
      {
        ref: 'QM.3',
        title: 'Risk Management',
        section: 'QM',
        sectionTitle: 'Quality Management',
        description: 'A risk management program identifies, analyzes, and mitigates risks to persons served and staff. Adverse event reporting, root cause analysis, and corrective action processes are in place.',
      },
      {
        ref: 'QM.4',
        title: 'Infection Control',
        section: 'QM',
        sectionTitle: 'Quality Management',
        description: 'Infection control policies and procedures minimize transmission of communicable diseases. Staff are trained in standard precautions and infection prevention practices.',
      },
      {
        ref: 'QM.5',
        title: 'Health and Safety',
        section: 'QM',
        sectionTitle: 'Quality Management',
        description: 'The physical environment is maintained to protect health and safety of persons served and staff. Emergency preparedness and safety inspections are documented.',
      },
    ],
  },
  {
    code: 'WF',
    title: 'Workforce Excellence',
    standards: [
      {
        ref: 'WF.1',
        title: 'Staff Qualifications and Credentialing',
        section: 'WF',
        sectionTitle: 'Workforce Excellence',
        description: 'All personnel are qualified for their roles through education, training, licensure, and experience. Credentials and licenses are verified and maintained current.',
      },
      {
        ref: 'WF.2',
        title: 'Orientation and Training',
        section: 'WF',
        sectionTitle: 'Workforce Excellence',
        description: 'New employees receive comprehensive orientation. Ongoing training addresses competencies, regulatory changes, and evidence-based practices relevant to behavioral health.',
      },
      {
        ref: 'WF.3',
        title: 'Supervision and Performance Evaluation',
        section: 'WF',
        sectionTitle: 'Workforce Excellence',
        description: 'Clinical staff receive regular, documented supervision. Performance evaluations are conducted at least annually and address competency, professional development, and goal attainment.',
      },
      {
        ref: 'WF.4',
        title: 'Staff Health and Wellness',
        section: 'WF',
        sectionTitle: 'Workforce Excellence',
        description: 'The organization supports staff health, safety, and well-being. Policies address workplace violence prevention, employee assistance, and occupational health requirements.',
      },
      {
        ref: 'WF.5',
        title: 'Peer Specialist and Lived Experience',
        section: 'WF',
        sectionTitle: 'Workforce Excellence',
        description: 'Where applicable, peer specialists and persons with lived experience of mental illness or substance use are integrated into the workforce. Their roles are defined and supported.',
      },
    ],
  },
  {
    code: 'IC',
    title: 'Integrated Care and Special Programs',
    standards: [
      {
        ref: 'IC.1',
        title: 'Co-occurring Disorders',
        section: 'IC',
        sectionTitle: 'Integrated Care and Special Programs',
        description: 'The organization has capacity to identify and address co-occurring mental health and substance use disorders. Integrated treatment is provided or coordinated.',
      },
      {
        ref: 'IC.2',
        title: 'Trauma-Informed Care',
        section: 'IC',
        sectionTitle: 'Integrated Care and Special Programs',
        description: 'Services reflect trauma-informed principles including safety, trustworthiness, peer support, collaboration, empowerment, and cultural sensitivity. Staff are trained in trauma-informed approaches.',
      },
      {
        ref: 'IC.3',
        title: 'Family and Caregiver Involvement',
        section: 'IC',
        sectionTitle: 'Integrated Care and Special Programs',
        description: 'With appropriate consent, families and caregivers are involved in treatment planning and support. Family education and support services are available.',
      },
    ],
  },
];

export function getAllCarfStandards(): CarfStandard[] {
  return CARF_STANDARDS.flatMap(s => s.standards);
}

export function findCarfStandard(ref: string): CarfStandard | undefined {
  return getAllCarfStandards().find(s => s.ref === ref);
}
