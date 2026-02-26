/**
 * NyxCitadel Database Seed Script
 * Seeds Destiny Springs Healthcare (AZ acute psychiatric) as the demo facility
 *
 * Run with: npm run db:seed
 */

import { PrismaClient, UserRole, FacilityType, ResponseTemplateCategory } from '@prisma/client';
import { hash } from 'bcryptjs';
import {
  allArizonaComplianceRequirements,
  generateComplianceCalendar,
} from '../src/lib/compliance/arizona';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NyxCitadel database...\n');

  // ─── 1. Create Destiny Springs Healthcare facility ──────────────────────
  console.log('Creating facility: Destiny Springs Healthcare...');
  const facility = await prisma.facility.upsert({
    where: { id: 'destiny-springs' },
    update: {},
    create: {
      id: 'destiny-springs',
      name: 'Destiny Springs Healthcare',
      shortName: 'DSH',
      address: '13451 N 94th Drive',
      city: 'Peoria',
      state: 'AZ',
      zip: '85381',
      phone: '(623) 236-2000',
      primaryColor: '#5b21b6',    // Deep purple
      secondaryColor: '#8b5cf6',
      facilityType: FacilityType.ACUTE_PSYCH,
      bedCount: 60,
      timezone: 'America/Phoenix',
      isActive: true,
    },
  });
  console.log(`  ✅ Facility created: ${facility.name} [${facility.id}]`);

  // ─── 2. Create admin user ────────────────────────────────────────────────
  console.log('\nCreating admin user...');
  const adminPassword = await hash('Admin@DSH2026!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@destinysprings.com' },
    update: {},
    create: {
      email: 'admin@destinysprings.com',
      name: 'DSH Administrator',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      title: 'Compliance & Risk Manager',
      department: 'Administration',
      facilityId: facility.id,
      isActive: true,
    },
  });
  console.log(`  ✅ Admin user: ${adminUser.email}`);

  // Compliance officer user
  const compPassword = await hash('Compliance@DSH2026!', 12);
  const compUser = await prisma.user.upsert({
    where: { email: 'compliance@destinysprings.com' },
    update: {},
    create: {
      email: 'compliance@destinysprings.com',
      name: 'Compliance Officer',
      passwordHash: compPassword,
      role: UserRole.COMPLIANCE_OFFICER,
      title: 'Compliance Officer',
      department: 'Compliance',
      facilityId: facility.id,
      isActive: true,
    },
  });
  console.log(`  ✅ Compliance user: ${compUser.email}`);

  // EM Coordinator
  const emPassword = await hash('Emergency@DSH2026!', 12);
  const emUser = await prisma.user.upsert({
    where: { email: 'emc@destinysprings.com' },
    update: {},
    create: {
      email: 'emc@destinysprings.com',
      name: 'EM Coordinator',
      passwordHash: emPassword,
      role: UserRole.EM_COORDINATOR,
      title: 'Emergency Management Coordinator',
      department: 'Administration',
      facilityId: facility.id,
      isActive: true,
    },
  });
  console.log(`  ✅ EM Coordinator: ${emUser.email}`);

  // ─── 3. Seed compliance items from Arizona rules ─────────────────────────
  console.log('\nSeeding Arizona compliance requirements...');
  let reqCount = 0;
  for (const req of allArizonaComplianceRequirements) {
    await prisma.complianceItem.upsert({
      where: {
        id: `${facility.id}-${req.id}`,
      },
      update: {},
      create: {
        id: `${facility.id}-${req.id}`,
        facilityId: facility.id,
        title: req.title,
        description: req.description,
        regulatoryBody: req.regulatoryBody,
        standardRef: req.standardRef ?? null,
        category: req.category,
        frequency: req.frequency,
        status: 'ACTIVE',
        isRequired: true,
        notes: req.notes ?? null,
      },
    });
    reqCount++;
  }
  console.log(`  ✅ Created ${reqCount} compliance requirements`);

  // ─── 4. Generate compliance calendar for current year + next year ────────
  const currentYear = new Date().getFullYear();
  console.log(`\nGenerating compliance calendar for ${currentYear} and ${currentYear + 1}...`);

  for (const year of [currentYear, currentYear + 1]) {
    const events = generateComplianceCalendar(facility.id, year);
    let created = 0;
    for (const event of events) {
      const key = `${facility.id}-${event.title}-${event.dueDate.toISOString().slice(0, 10)}`;
      await prisma.calendarEvent.upsert({
        where: { id: key },
        update: {},
        create: {
          id: key,
          ...event,
          status: 'UPCOMING',
          remindDaysBefore: [90, 60, 30, 14, 7],
        },
      });
      created++;
    }
    console.log(`  ✅ ${year}: ${created} calendar events`);
  }

  // ─── 5. Seed sample policies ─────────────────────────────────────────────
  console.log('\nSeeding sample policies...');
  const samplePolicies = [
    {
      policyNumber: 'ADM-001',
      title: 'Patient Rights and Responsibilities',
      category: 'ADMINISTRATIVE' as const,
      owner: 'Administration',
      reviewFrequency: 'ANNUAL' as const,
    },
    {
      policyNumber: 'CLN-001',
      title: 'Restraint and Seclusion Policy',
      category: 'CLINICAL' as const,
      owner: 'Clinical Services',
      reviewFrequency: 'ANNUAL' as const,
    },
    {
      policyNumber: 'CLN-002',
      title: 'Suicide Risk Assessment and Prevention',
      category: 'CLINICAL' as const,
      owner: 'Clinical Services',
      reviewFrequency: 'ANNUAL' as const,
    },
    {
      policyNumber: 'EM-001',
      title: 'Emergency Operations Plan — General',
      category: 'EMERGENCY_MANAGEMENT' as const,
      owner: 'Administration',
      reviewFrequency: 'ANNUAL' as const,
    },
    {
      policyNumber: 'IC-001',
      title: 'Infection Prevention and Control Program',
      category: 'INFECTION_CONTROL' as const,
      owner: 'Infection Control',
      reviewFrequency: 'ANNUAL' as const,
    },
    {
      policyNumber: 'MED-001',
      title: 'Medication Management — High Alert Medications',
      category: 'MEDICATION_MANAGEMENT' as const,
      owner: 'Pharmacy / Nursing',
      reviewFrequency: 'ANNUAL' as const,
    },
    {
      policyNumber: 'HR-001',
      title: 'Employee Health Screening and Immunizations',
      category: 'HUMAN_RESOURCES' as const,
      owner: 'Human Resources',
      reviewFrequency: 'ANNUAL' as const,
    },
    {
      policyNumber: 'PR-001',
      title: 'Patient Privacy (HIPAA) Policy',
      category: 'PRIVACY_SECURITY' as const,
      owner: 'Compliance',
      reviewFrequency: 'ANNUAL' as const,
    },
  ];

  for (const p of samplePolicies) {
    const effectiveDate = new Date(currentYear - 1, 0, 1);
    const nextReviewDate = new Date(currentYear, 11, 31);
    await prisma.policy.upsert({
      where: { id: `${facility.id}-${p.policyNumber}` },
      update: {},
      create: {
        id: `${facility.id}-${p.policyNumber}`,
        facilityId: facility.id,
        policyNumber: p.policyNumber,
        title: p.title,
        category: p.category,
        regulatoryBody: ['JOINT_COMMISSION', 'CMS'],
        effectiveDate,
        nextReviewDate,
        reviewFrequency: p.reviewFrequency,
        status: 'ACTIVE',
        version: '1.0',
        owner: p.owner,
      },
    });
  }
  console.log(`  ✅ Created ${samplePolicies.length} sample policies`);

  // ─── 6. Seed HVA with common AZ psychiatric hospital hazards ─────────────
  console.log('\nSeeding HVA assessment...');
  const hva = await prisma.hvaAssessment.upsert({
    where: {
      facilityId_assessmentYear: {
        facilityId: facility.id,
        assessmentYear: currentYear - 1,
      },
    },
    update: {},
    create: {
      facilityId: facility.id,
      assessmentYear: currentYear - 1,
      completedDate: new Date(currentYear - 1, 2, 15),
      reviewedBy: 'EM Coordinator',
      approvedBy: 'Administrator',
      status: 'APPROVED',
      totalRiskScore: 0.42,
    },
  });

  const hazards = [
    { name: 'Extreme Heat Event', type: 'NATURAL' as const, prob: 3, mag: 2, prep: 1 },
    { name: 'Earthquake', type: 'NATURAL' as const, prob: 1, mag: 3, prep: 2 },
    { name: 'Flooding (Monsoon)', type: 'NATURAL' as const, prob: 2, mag: 2, prep: 2 },
    { name: 'Power Failure / Electrical Outage', type: 'TECHNOLOGICAL' as const, prob: 2, mag: 3, prep: 1 },
    { name: 'IT System / EHR Failure', type: 'TECHNOLOGICAL' as const, prob: 2, mag: 2, prep: 2 },
    { name: 'HVAC Failure (Extreme Heat)', type: 'INFRASTRUCTURE' as const, prob: 2, mag: 3, prep: 1 },
    { name: 'Water System Failure', type: 'INFRASTRUCTURE' as const, prob: 1, mag: 3, prep: 2 },
    { name: 'Active Threat / Violence', type: 'HUMAN' as const, prob: 2, mag: 3, prep: 2 },
    { name: 'Mass Casualty — Community', type: 'HUMAN' as const, prob: 1, mag: 3, prep: 2 },
    { name: 'Patient Elopement — Mass', type: 'HUMAN' as const, prob: 2, mag: 2, prep: 2 },
    { name: 'Infectious Disease Outbreak', type: 'HAZMAT' as const, prob: 2, mag: 2, prep: 2 },
  ];

  for (const h of hazards) {
    const riskScore = h.prob * h.mag * h.prep / 27; // normalized 0–1
    await prisma.hvaHazard.upsert({
      where: { id: `${hva.id}-${h.name.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `${hva.id}-${h.name.replace(/\s/g, '-').toLowerCase()}`,
        assessmentId: hva.id,
        hazardName: h.name,
        hazardType: h.type,
        probability: h.prob,
        magnitude: h.mag,
        preparedness: h.prep,
        riskScore,
      },
    });
  }
  console.log(`  ✅ HVA ${currentYear - 1} with ${hazards.length} hazards`);

  // ─── 7. Seed upcoming drills ──────────────────────────────────────────────
  console.log('\nSeeding sample drills...');
  const drillSeeds = [
    {
      name: 'Q1 Fire Evacuation — Day Shift',
      type: 'FIRE_EVACUATION' as const,
      scheduledOffset: 15,
      status: 'SCHEDULED' as const,
    },
    {
      name: 'Q1 Fire Evacuation — Evening Shift',
      type: 'FIRE_EVACUATION' as const,
      scheduledOffset: 20,
      status: 'SCHEDULED' as const,
    },
    {
      name: 'Code Silver — Active Threat Tabletop',
      type: 'TABLETOP' as const,
      scheduledOffset: 45,
      status: 'SCHEDULED' as const,
    },
    {
      name: 'Power Failure Functional Drill',
      type: 'UTILITY_FAILURE' as const,
      scheduledOffset: 60,
      status: 'SCHEDULED' as const,
    },
  ];

  const now = new Date();
  for (const d of drillSeeds) {
    const scheduledDate = new Date(now.getTime() + d.scheduledOffset * 24 * 60 * 60 * 1000);
    await prisma.drill.upsert({
      where: { id: `${facility.id}-${d.name.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `${facility.id}-${d.name.replace(/\s/g, '-').toLowerCase()}`,
        facilityId: facility.id,
        drillName: d.name,
        drillType: d.type,
        scheduledDate,
        status: d.status,
        regulatoryBody: 'JOINT_COMMISSION',
        standardRef: d.type === 'FIRE_EVACUATION' ? 'LS.02.01.20' : 'EM.03.01.03',
      },
    });
  }
  console.log(`  ✅ Created ${drillSeeds.length} upcoming drills`);

  // ─────────────────────────────────────────────────
  // DEFAULT QOC RESPONSE TEMPLATES
  // ─────────────────────────────────────────────────
  console.log('\n📄 Seeding default QOC response templates...');

  const defaultTemplates = [
    {
      id: `${facility.id}-tpl-grievance-ack`,
      name: 'Patient Grievance Acknowledgment',
      category: 'PATIENT_GRIEVANCE_ACKNOWLEDGMENT',
      description: 'Written acknowledgment of receipt of a patient grievance. Required within 7 calendar days per CMS 42 CFR 482.13(e).',
      subject: 'Acknowledgment of Your Grievance {{GRIEVANCE_NUMBER}}',
      daysRequired: 7,
      regulatoryRef: '42 CFR 482.13(e)',
      variables: ['{{PATIENT_NAME}}', '{{COMPLAINANT_NAME}}', '{{DATE_RECEIVED}}', '{{GRIEVANCE_NUMBER}}', '{{ASSIGNED_TO}}', '{{FACILITY_NAME}}', '{{CONTACT_PHONE}}'],
      bodyTemplate: `Dear {{COMPLAINANT_NAME}},

We are writing to acknowledge receipt of your grievance received by Destiny Springs Healthcare on {{DATE_RECEIVED}}.

Your concerns have been assigned grievance number {{GRIEVANCE_NUMBER}} and have been referred to {{ASSIGNED_TO}} for thorough review and investigation.

We take all patient and family concerns seriously and are committed to addressing your grievance in a timely manner. You will receive our written determination, including the steps taken to investigate your grievance and the results of the investigation, within 30 days of the date your grievance was received.

If you have questions in the meantime, please contact us at {{CONTACT_PHONE}}.

Sincerely,

Patient Rights Officer
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Must be sent within 7 calendar days of grievance receipt. Reference CMS 482.13(e). Retain copy in grievance file.',
    },
    {
      id: `${facility.id}-tpl-grievance-res`,
      name: 'Patient Grievance Resolution',
      category: 'PATIENT_GRIEVANCE_RESOLUTION',
      description: 'Written resolution letter for patient grievances. Must include investigation findings, actions taken, and appeal rights. Required within 30 days per CMS 42 CFR 482.13(e).',
      subject: 'Resolution of Your Grievance {{GRIEVANCE_NUMBER}}',
      daysRequired: 30,
      regulatoryRef: '42 CFR 482.13(e)',
      variables: ['{{PATIENT_NAME}}', '{{COMPLAINANT_NAME}}', '{{DATE_RECEIVED}}', '{{GRIEVANCE_NUMBER}}', '{{FACILITY_NAME}}', '{{RESOLUTION_SUMMARY}}', '{{ACTIONS_TAKEN}}', '{{CONTACT_PHONE}}'],
      bodyTemplate: `Dear {{COMPLAINANT_NAME}},

We are writing to inform you of the outcome of our review of your grievance ({{GRIEVANCE_NUMBER}}) received on {{DATE_RECEIVED}} regarding {{PATIENT_NAME}}.

INVESTIGATION SUMMARY
{{RESOLUTION_SUMMARY}}

ACTIONS TAKEN
{{ACTIONS_TAKEN}}

OUTCOME
Based on our investigation, we have determined that [Substantiated / Unsubstantiated / Partially Substantiated].

YOUR RIGHT TO APPEAL
If you are not satisfied with the outcome of this investigation, you have the right to contact:
• Arizona Department of Health Services (ADHS): 1-800-221-9968
• The Joint Commission: www.jointcommission.org or 1-800-994-6610
• Medicare Beneficiaries may also contact your Beneficiary and Family Centered Care Quality Improvement Organization (BFCC-QIO)

If you have further questions, please contact us at {{CONTACT_PHONE}}.

Sincerely,

Patient Rights Officer
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Must be sent within 30 calendar days of grievance receipt. Must include: investigation steps, findings, actions taken, appeal rights. Retain in grievance file.',
    },
    {
      id: `${facility.id}-tpl-sentinel-family`,
      name: 'Sentinel Event Family Notification',
      category: 'SENTINEL_EVENT_FAMILY_NOTICE',
      description: 'Prompt notification to patient\'s family/authorized representative following a sentinel event. Joint Commission requires timely, compassionate communication.',
      subject: 'Regarding {{PATIENT_NAME}} — Important Update from Destiny Springs Healthcare',
      daysRequired: 1,
      regulatoryRef: 'JC RI.01.07.01, LD.04.04.05',
      variables: ['{{PATIENT_NAME}}', '{{FAMILY_NAME}}', '{{EVENT_DATE}}', '{{FACILITY_NAME}}', '{{CONTACT_PHONE}}', '{{CONTACT_NAME}}'],
      bodyTemplate: `Dear {{FAMILY_NAME}},

We are contacting you regarding a serious and unexpected event involving {{PATIENT_NAME}} that occurred on {{EVENT_DATE}} at {{FACILITY_NAME}}.

We want to ensure you are promptly informed and to express our deepest concern for {{PATIENT_NAME}} and your family.

Our clinical leadership and patient safety team have been immediately notified and are conducting a thorough review of the circumstances surrounding this event. We are committed to:

1. Providing you with ongoing updates as our investigation progresses
2. Answering your questions as fully as possible
3. Ensuring {{PATIENT_NAME}} receives appropriate support and care

We sincerely apologize for the distress this situation has caused. A dedicated member of our team, {{CONTACT_NAME}}, will be in direct contact with you. You may also reach {{FACILITY_NAME}} directly at {{CONTACT_PHONE}}.

We take events of this nature with the utmost seriousness and are committed to transparency, accountability, and continuous improvement.

With sincere concern,

Chief Medical Officer / Clinical Director
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Contact family immediately (same day). Compassionate, transparent communication required. Activate family liaison. Document all communications.',
    },
    {
      id: `${facility.id}-tpl-adhs-adverse`,
      name: 'AZ ADHS Adverse Event Notification',
      category: 'STATE_ADVERSE_EVENT_REPORT',
      description: 'Cover letter for mandatory adverse event reporting to Arizona Department of Health Services per A.A.C. R9-10-211.',
      subject: 'Mandatory Adverse Event Notification — {{INCIDENT_NUMBER}} — Destiny Springs Healthcare',
      daysRequired: 1,
      regulatoryRef: 'A.A.C. R9-10-211',
      variables: ['{{INCIDENT_NUMBER}}', '{{EVENT_DATE}}', '{{EVENT_TYPE}}', '{{FACILITY_NAME}}', '{{FACILITY_LICENSE_NUMBER}}', '{{CONTACT_NAME}}', '{{CONTACT_PHONE}}', '{{CONTACT_EMAIL}}'],
      bodyTemplate: `Arizona Department of Health Services
Division of Licensing Services
150 N. 18th Ave., Suite 450
Phoenix, AZ 85007

RE: Mandatory Adverse Event Notification
Facility: Destiny Springs Healthcare
License Number: {{FACILITY_LICENSE_NUMBER}}
Incident Reference: {{INCIDENT_NUMBER}}
Event Date: {{EVENT_DATE}}

Dear ADHS Licensing Division,

Pursuant to A.A.C. R9-10-211, Destiny Springs Healthcare hereby provides notification of the following adverse event:

Event Type: {{EVENT_TYPE}}
Date of Occurrence: {{EVENT_DATE}}
Reference Number: {{INCIDENT_NUMBER}}

[Detailed description of the event to be attached]

Destiny Springs Healthcare has initiated an immediate investigation and has implemented interim protective measures as required. A comprehensive root cause analysis is underway, and a complete report with corrective action plan will be submitted within the required timeframe.

Please contact our compliance officer, {{CONTACT_NAME}}, at {{CONTACT_PHONE}} or {{CONTACT_EMAIL}} with any questions or requests for additional information.

Respectfully submitted,

{{CONTACT_NAME}}
Compliance / Risk Officer
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Must be submitted to ADHS within 24 hours of discovery per A.A.C. R9-10-211. Use secure portal submission when available. Retain proof of submission.',
    },
    {
      id: `${facility.id}-tpl-poc-cover`,
      name: 'Plan of Correction Cover Letter',
      category: 'PLAN_OF_CORRECTION',
      description: 'Formal cover letter to accompany a Plan of Correction submitted to a regulatory body following a survey.',
      subject: 'Plan of Correction — {{SURVEY_DATE}} Survey — Destiny Springs Healthcare',
      daysRequired: 10,
      regulatoryRef: 'CMS / JC / ADHS POC requirements',
      variables: ['{{REGULATORY_BODY}}', '{{SURVEY_DATE}}', '{{POC_NUMBER}}', '{{FACILITY_NAME}}', '{{FACILITY_LICENSE_NUMBER}}', '{{CONTACT_NAME}}', '{{CONTACT_PHONE}}', '{{SUBMISSION_DATE}}'],
      bodyTemplate: `{{REGULATORY_BODY}}

RE: Plan of Correction
Facility: Destiny Springs Healthcare
License / Provider Number: {{FACILITY_LICENSE_NUMBER}}
Survey Date: {{SURVEY_DATE}}
POC Reference: {{POC_NUMBER}}
Submission Date: {{SUBMISSION_DATE}}

Dear Survey Team,

Destiny Springs Healthcare submits this Plan of Correction in response to the deficiency findings identified during the survey conducted on {{SURVEY_DATE}}.

We have thoroughly reviewed each finding and have developed the attached comprehensive Plan of Correction that addresses every cited deficiency. Our plan details:

• The specific corrective action taken to address each deficiency
• The measures implemented to prevent recurrence
• The monitoring strategy to ensure sustained compliance
• The person(s) responsible for implementation and monitoring
• The target completion date for each corrective action

We are fully committed to achieving and maintaining compliance with all applicable standards and regulations. We respectfully request your review of this Plan of Correction at your earliest convenience.

Please do not hesitate to contact {{CONTACT_NAME}} at {{CONTACT_PHONE}} with any questions.

Respectfully submitted,

Chief Executive Officer / Administrator
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ

CERTIFICATION
I certify that the information contained in this Plan of Correction is true and accurate, to the best of my knowledge.

________________________________
Signature / Date`,
      instructions: 'Must be submitted by the regulatory deadline (typically 10 days for JC, varies for ADHS/CMS). Include signed certification page. Keep copy in compliance file.',
    },
    {
      id: `${facility.id}-tpl-cap-complete`,
      name: 'CAP Completion Verification Notice',
      category: 'CAP_COMPLETION_NOTICE',
      description: 'Notification confirming that a Corrective Action Plan has been completed and verified with evidence.',
      subject: 'CAP Completion Verification — {{CAP_NUMBER}} — Destiny Springs Healthcare',
      daysRequired: null,
      regulatoryRef: null,
      variables: ['{{CAP_NUMBER}}', '{{ORIGINAL_FINDING}}', '{{COMPLETION_DATE}}', '{{EVIDENCE_SUMMARY}}', '{{VERIFIED_BY}}', '{{FACILITY_NAME}}'],
      bodyTemplate: `RE: Corrective Action Plan Completion Verification
CAP Reference: {{CAP_NUMBER}}
Completion Date: {{COMPLETION_DATE}}

This notice confirms that Corrective Action Plan {{CAP_NUMBER}}, initiated in response to {{ORIGINAL_FINDING}}, has been fully implemented and verified as of {{COMPLETION_DATE}}.

Evidence of Completion:
{{EVIDENCE_SUMMARY}}

Verified by: {{VERIFIED_BY}}
Date Verified: {{COMPLETION_DATE}}

All corrective actions identified in the original CAP have been implemented. Monitoring procedures are in place to ensure sustained compliance.

{{FACILITY_NAME}}
Destiny Springs Healthcare`,
      instructions: 'Send to relevant department heads and file in compliance record. If CAP was tied to a regulatory finding, submit to the regulatory body as required.',
    },
    {
      id: `${facility.id}-tpl-incident-family`,
      name: 'Incident Family Notification',
      category: 'INCIDENT_FAMILY_NOTIFICATION',
      description: 'Notification to patient\'s family/representative following a significant incident. AZ patients have right to notification per AZ Mental Health Bill of Rights.',
      subject: 'Regarding {{PATIENT_NAME}} — Notification from Destiny Springs Healthcare',
      daysRequired: 1,
      regulatoryRef: 'AZ Mental Health Bill of Rights, A.R.S. 36-504',
      variables: ['{{PATIENT_NAME}}', '{{FAMILY_NAME}}', '{{INCIDENT_DATE}}', '{{INCIDENT_TYPE}}', '{{CURRENT_STATUS}}', '{{CONTACT_NAME}}', '{{CONTACT_PHONE}}', '{{FACILITY_NAME}}'],
      bodyTemplate: `Dear {{FAMILY_NAME}},

We are contacting you to inform you that {{PATIENT_NAME}} was involved in an incident on {{INCIDENT_DATE}} at {{FACILITY_NAME}}.

Incident Type: {{INCIDENT_TYPE}}
Current Patient Status: {{CURRENT_STATUS}}

Our clinical team responded immediately, and {{PATIENT_NAME}} is currently receiving appropriate care. We have implemented additional safety measures and are conducting a full review of the circumstances.

As the authorized representative for {{PATIENT_NAME}}, you have the right to be informed of significant events. We are committed to keeping you updated throughout this process.

Please contact {{CONTACT_NAME}} at {{CONTACT_PHONE}} if you have any questions or would like to speak with a member of the clinical care team.

Sincerely,

Clinical Director / Charge Nurse
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Contact within 24 hours. Document notification in medical record. Ensure authorized representative is on file.',
    },
    {
      id: `${facility.id}-tpl-jc-rfi`,
      name: 'Joint Commission RFI Response',
      category: 'REGULATORY_INQUIRY_RESPONSE',
      description: 'Response to a Joint Commission Request for Information (RFI) following a complaint investigation.',
      subject: 'Response to Request for Information — {{RFI_NUMBER}} — Destiny Springs Healthcare',
      daysRequired: 5,
      regulatoryRef: 'JC Standards',
      variables: ['{{RFI_NUMBER}}', '{{RFI_DATE}}', '{{COMPLAINT_SUMMARY}}', '{{FACILITY_NAME}}', '{{FACILITY_ACCREDITATION_NUMBER}}', '{{CONTACT_NAME}}', '{{CONTACT_PHONE}}', '{{RESPONSE_SUMMARY}}'],
      bodyTemplate: `The Joint Commission
Complaint Investigations Unit
One Renaissance Boulevard
Oakbrook Terrace, IL 60181

RE: Response to Request for Information
RFI Number: {{RFI_NUMBER}}
RFI Date: {{RFI_DATE}}
Facility: Destiny Springs Healthcare
Accreditation Number: {{FACILITY_ACCREDITATION_NUMBER}}

Dear Joint Commission Complaint Investigations Team,

Destiny Springs Healthcare is pleased to provide the following response to your Request for Information dated {{RFI_DATE}} regarding {{COMPLAINT_SUMMARY}}.

RESPONSE SUMMARY
{{RESPONSE_SUMMARY}}

[Attach supporting documentation including: policies, procedures, training records, investigation findings, corrective actions, and evidence of compliance.]

We cooperate fully with The Joint Commission's complaint investigation process and are committed to providing any additional information requested. Please contact {{CONTACT_NAME}} at {{CONTACT_PHONE}} if you require clarification or additional documentation.

Respectfully submitted,

CEO / Compliance Officer
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Respond within the timeline specified in the JC RFI letter (typically 5-10 business days). Include all referenced documentation. Copy legal counsel if warranted.',
    },
    {
      id: `${facility.id}-tpl-complaint-ack`,
      name: 'Complaint Acknowledgment',
      category: 'COMPLAINT_ACKNOWLEDGMENT',
      description: 'General acknowledgment letter for complaints received via any channel.',
      subject: 'Acknowledgment of Your Complaint — Destiny Springs Healthcare',
      daysRequired: 2,
      regulatoryRef: null,
      variables: ['{{COMPLAINANT_NAME}}', '{{DATE_RECEIVED}}', '{{COMPLAINT_REF}}', '{{ASSIGNED_TO}}', '{{CONTACT_PHONE}}', '{{FACILITY_NAME}}'],
      bodyTemplate: `Dear {{COMPLAINANT_NAME}},

Thank you for bringing your concerns to our attention. We have received your complaint submitted on {{DATE_RECEIVED}} and have assigned it reference number {{COMPLAINT_REF}}.

Your concerns are important to us, and we take all feedback seriously. {{ASSIGNED_TO}} has been assigned to review your complaint and will follow up with you promptly.

If you have additional information to share or questions in the meantime, please contact us at {{CONTACT_PHONE}}.

Sincerely,

Patient Experience / Compliance Team
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Send acknowledgment within 2 business days. Log in complaints register. Route to appropriate department.',
    },
    {
      id: `${facility.id}-tpl-survey-response`,
      name: 'Survey Entrance Conference Response',
      category: 'SURVEY_RESPONSE_COVER',
      description: 'Formal response cover letter when responding to a regulatory agency survey or inspection.',
      subject: 'Survey Response — {{SURVEY_DATE}} — Destiny Springs Healthcare',
      daysRequired: 10,
      regulatoryRef: 'CMS / ADHS / JC',
      variables: ['{{REGULATORY_BODY}}', '{{SURVEY_DATE}}', '{{FACILITY_NAME}}', '{{FACILITY_LICENSE}}', '{{CONTACT_NAME}}', '{{CONTACT_PHONE}}'],
      bodyTemplate: `{{REGULATORY_BODY}}

RE: Survey Response
Facility: Destiny Springs Healthcare
License/Provider #: {{FACILITY_LICENSE}}
Survey Date: {{SURVEY_DATE}}

Dear Survey Team,

On behalf of Destiny Springs Healthcare, we respectfully submit our formal response to the findings identified during the survey conducted on {{SURVEY_DATE}}.

We have carefully reviewed each finding and are committed to full compliance with all applicable standards, regulations, and conditions of participation. Our responses, detailed in the attached documentation, reflect our commitment to providing safe, high-quality care to the individuals we serve.

We have already taken decisive corrective action where needed and have implemented monitoring processes to ensure sustained compliance.

Please contact {{CONTACT_NAME}} at {{CONTACT_PHONE}} with any questions.

Respectfully,

CEO / Administrator
{{FACILITY_NAME}}
Destiny Springs Healthcare | Peoria, AZ`,
      instructions: 'Coordinate with clinical, quality, and compliance leadership before submission. Legal review recommended for adverse findings.',
    },
  ];

  for (const tpl of defaultTemplates) {
    const { id, variables, daysRequired, category, ...rest } = tpl;
    const typedCategory = category as ResponseTemplateCategory;
    await prisma.responseTemplate.upsert({
      where: { id },
      create: {
        id,
        facilityId: facility.id,
        variables,
        daysRequired: daysRequired ?? null,
        category: typedCategory,
        isDefault: true,
        isActive: true,
        ...rest,
      },
      update: {
        variables,
        daysRequired: daysRequired ?? null,
        category: typedCategory,
        isDefault: true,
        isActive: true,
        ...rest,
      },
    });
  }
  console.log(`  ✅ Seeded ${defaultTemplates.length} default QOC response templates`);

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────────────');
  console.log('LOGIN CREDENTIALS:');
  console.log('  Admin:        admin@destinysprings.com  /  Admin@DSH2026!');
  console.log('  Compliance:   compliance@destinysprings.com  /  Compliance@DSH2026!');
  console.log('  EM Coord:     emc@destinysprings.com  /  Emergency@DSH2026!');
  console.log('─────────────────────────────────────────────────\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
