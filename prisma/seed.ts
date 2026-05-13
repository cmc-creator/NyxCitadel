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

  const drillNow = new Date();
  for (const d of drillSeeds) {
    const scheduledDate = new Date(drillNow.getTime() + d.scheduledOffset * 24 * 60 * 60 * 1000);
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

  // ─── TRAINING RECORDS ─────────────────────────────────────────────────────
  console.log('\n📚 Seeding training records...');
  const now = new Date();
  const y = now.getFullYear();

  const trainingData = [
    // Nursing staff — all current
    { staffName: 'Maria Santos, RN',   staffId: 'EMP-101', department: 'Acute Inpatient', jobTitle: 'Registered Nurse', trainingName: 'Annual Mandatory Training Package', category: 'ANNUAL_MANDATORY' as const, completedDate: new Date(`${y}-01-15`), expiryDate: new Date(`${y+1}-01-15`), status: 'COMPLETED' as const, score: 94, passingScore: 80, provider: 'HealthStream' },
    { staffName: 'Maria Santos, RN',   staffId: 'EMP-101', department: 'Acute Inpatient', jobTitle: 'Registered Nurse', trainingName: 'CPI Nonviolent Crisis Intervention', category: 'CPI_DE_ESCALATION' as const, completedDate: new Date(`${y}-02-10`), expiryDate: new Date(`${y+1}-02-10`), status: 'COMPLETED' as const, score: 88, passingScore: 80, provider: 'Crisis Prevention Institute' },
    { staffName: 'Maria Santos, RN',   staffId: 'EMP-101', department: 'Acute Inpatient', jobTitle: 'Registered Nurse', trainingName: 'BLS / CPR Recertification', category: 'CPR_BLS' as const, completedDate: new Date(`${y}-03-05`), expiryDate: new Date(`${y+2}-03-05`), status: 'COMPLETED' as const, score: 100, passingScore: 80, provider: 'American Heart Association' },
    { staffName: 'Darnell Williams, MHT', staffId: 'EMP-102', department: 'Acute Inpatient', jobTitle: 'Mental Health Technician', trainingName: 'Annual Mandatory Training Package', category: 'ANNUAL_MANDATORY' as const, completedDate: new Date(`${y}-01-20`), expiryDate: new Date(`${y+1}-01-20`), status: 'COMPLETED' as const, score: 86, passingScore: 80, provider: 'HealthStream' },
    { staffName: 'Darnell Williams, MHT', staffId: 'EMP-102', department: 'Acute Inpatient', jobTitle: 'Mental Health Technician', trainingName: 'Suicide Risk Assessment', category: 'SUICIDE_RISK' as const, completedDate: new Date(`${y}-02-28`), expiryDate: new Date(`${y+1}-02-28`), status: 'COMPLETED' as const, score: 91, passingScore: 80, provider: 'Zero Suicide Institute' },
    { staffName: 'Darnell Williams, MHT', staffId: 'EMP-102', department: 'Acute Inpatient', jobTitle: 'Mental Health Technician', trainingName: 'Restraint & Seclusion — Safe Application', category: 'RESTRAINT_SECLUSION' as const, completedDate: new Date(`${y}-03-12`), expiryDate: new Date(`${y+1}-03-12`), status: 'COMPLETED' as const, score: 90, passingScore: 80, provider: 'Internal' },
    // Overdue staff
    { staffName: 'Takeshi Yamamoto, LCSW', staffId: 'EMP-103', department: 'Clinical', jobTitle: 'Licensed Clinical Social Worker', trainingName: 'Annual Mandatory Training Package', category: 'ANNUAL_MANDATORY' as const, completedDate: new Date(`${y-1}-01-10`), expiryDate: new Date(`${y}-01-10`), status: 'OVERDUE' as const, score: null, passingScore: 80, provider: 'HealthStream' },
    { staffName: 'Takeshi Yamamoto, LCSW', staffId: 'EMP-103', department: 'Clinical', jobTitle: 'Licensed Clinical Social Worker', trainingName: 'HIPAA Privacy & Security', category: 'HIPAA_PRIVACY' as const, completedDate: new Date(`${y}-04-01`), expiryDate: new Date(`${y+1}-04-01`), status: 'COMPLETED' as const, score: 97, passingScore: 80, provider: 'HealthStream' },
    { staffName: 'Carmen Reyes, LPN',  staffId: 'EMP-104', department: 'Acute Inpatient', jobTitle: 'Licensed Practical Nurse', trainingName: 'Annual Mandatory Training Package', category: 'ANNUAL_MANDATORY' as const, completedDate: new Date(`${y}-01-18`), expiryDate: new Date(`${y+1}-01-18`), status: 'COMPLETED' as const, score: 89, passingScore: 80, provider: 'HealthStream' },
    { staffName: 'Carmen Reyes, LPN',  staffId: 'EMP-104', department: 'Acute Inpatient', jobTitle: 'Licensed Practical Nurse', trainingName: 'Medication Management Safety', category: 'MEDICATION_MANAGEMENT' as const, completedDate: new Date(`${y}-02-20`), expiryDate: new Date(`${y+1}-02-20`), status: 'COMPLETED' as const, score: 92, passingScore: 80, provider: 'HealthStream' },
    { staffName: 'Priya Nair, RN',    staffId: 'EMP-105', department: 'Intake/Assessment', jobTitle: 'Assessment Nurse', trainingName: 'Annual Mandatory Training Package', category: 'ANNUAL_MANDATORY' as const, completedDate: new Date(`${y}-01-22`), expiryDate: new Date(`${y+1}-01-22`), status: 'COMPLETED' as const, score: 93, passingScore: 80, provider: 'HealthStream' },
    { staffName: 'Priya Nair, RN',    staffId: 'EMP-105', department: 'Intake/Assessment', jobTitle: 'Assessment Nurse', trainingName: 'Suicide Risk Assessment', category: 'SUICIDE_RISK' as const, completedDate: null, expiryDate: null, status: 'PENDING' as const, score: null, passingScore: 80, provider: 'Zero Suicide Institute' },
    // Leadership
    { staffName: 'James Holloway, CEO', staffId: 'EMP-001', department: 'Administration', jobTitle: 'Chief Executive Officer', trainingName: 'Emergency Management Leadership', category: 'EMERGENCY_MANAGEMENT' as const, completedDate: new Date(`${y}-03-01`), expiryDate: new Date(`${y+1}-03-01`), status: 'COMPLETED' as const, score: 95, passingScore: 80, provider: 'Internal' },
    { staffName: 'Linda Park, CNO',   staffId: 'EMP-002', department: 'Nursing Administration', jobTitle: 'Chief Nursing Officer', trainingName: 'Infection Control Annual Update', category: 'INFECTION_CONTROL' as const, completedDate: new Date(`${y}-02-14`), expiryDate: new Date(`${y+1}-02-14`), status: 'COMPLETED' as const, score: 98, passingScore: 80, provider: 'APIC' },
    // Dietary — expired
    { staffName: 'Oscar Tran, CDM',   staffId: 'EMP-201', department: 'Dietary', jobTitle: 'Certified Dietary Manager', trainingName: 'Fire Safety & Evacuation', category: 'FIRE_SAFETY' as const, completedDate: new Date(`${y-1}-06-15`), expiryDate: new Date(`${y}-06-15`), status: 'EXPIRED' as const, score: 88, passingScore: 80, provider: 'Internal' },
  ];

  for (const t of trainingData) {
    await prisma.trainingRecord.create({
      data: {
        facilityId: facility.id,
        staffName: t.staffName,
        staffId: t.staffId,
        department: t.department,
        jobTitle: t.jobTitle,
        trainingName: t.trainingName,
        category: t.category,
        completedDate: t.completedDate,
        expiryDate: t.expiryDate,
        isRequired: true,
        status: t.status,
        score: t.score,
        passingScore: t.passingScore,
        provider: t.provider,
      },
    });
  }
  console.log(`  ✅ Seeded ${trainingData.length} training records`);

  // ─── INCIDENTS ────────────────────────────────────────────────────────────
  console.log('\n🚨 Seeding incidents...');
  const incidents = [
    { incidentNumber: `INC-${y}-001`, dateOccurred: new Date(`${y}-01-08 14:30`), incidentType: 'PATIENT_FALL' as const, severity: 'MODERATE' as const, location: 'Unit A — Room 104', description: 'Patient found on floor beside bed during afternoon rounds. No apparent injury. Non-slip socks not applied per care plan.', immediateActions: 'Vital signs assessed, physician notified, family contacted. PT/OT consult ordered.', patientInvolved: true, correctionRequired: true, reportableToState: false, status: 'CLOSED' as const, closedDate: new Date(`${y}-02-01`) },
    { incidentNumber: `INC-${y}-002`, dateOccurred: new Date(`${y}-01-19 09:15`), incidentType: 'MEDICATION_ERROR' as const, severity: 'MINOR' as const, location: 'Medication Room — Unit B', description: 'Patient received incorrect dose of Lithium 300mg instead of 600mg. Error discovered during nurse-to-nurse handoff.', immediateActions: 'Physician notified, patient monitored x4 hours. Pharmacy incident report filed.', patientInvolved: true, correctionRequired: true, reportableToState: false, status: 'CLOSED' as const, closedDate: new Date(`${y}-02-10`) },
    { incidentNumber: `INC-${y}-003`, dateOccurred: new Date(`${y}-02-14 23:45`), incidentType: 'ELOPEMENT' as const, severity: 'MAJOR' as const, location: 'East Exit — Parking Lot', description: 'ITA patient eloped through unsecured exterior door during overnight shift. Patient located by law enforcement 30 minutes later, returned safely.', immediateActions: 'Code Green activated, law enforcement called, family notified, physician notified. Patient returned unharmed. Door mechanism inspected.', patientInvolved: true, correctionRequired: true, reportableToState: true, reportedToState: true, stateReportDate: new Date(`${y}-02-15`), status: 'UNDER_INVESTIGATION' as const },
    { incidentNumber: `INC-${y}-004`, dateOccurred: new Date(`${y}-03-02 16:20`), incidentType: 'ASSAULT_PATIENT_TO_STAFF' as const, severity: 'MODERATE' as const, location: 'Unit A — Day Room', description: 'Acutely agitated patient struck MHT in face during de-escalation attempt. Staff sustained minor laceration.', immediateActions: 'Security called, patient placed on 1:1 observation. Staff assessed in employee health. PRN medication administered per orders.', staffInvolved: true, patientInvolved: true, correctionRequired: true, reportableToState: false, status: 'CLOSED' as const, closedDate: new Date(`${y}-03-20`) },
    { incidentNumber: `INC-${y}-005`, dateOccurred: new Date(`${y}-03-18 11:00`), incidentType: 'RESTRAINT_SECLUSION' as const, severity: 'MODERATE' as const, location: 'Seclusion Room 1', description: 'Patient placed in emergency physical hold and seclusion for imminent danger to self. Hold lasted 22 minutes. All monitoring documentation completed.', immediateActions: 'Physician verbal order obtained within 1 hour. Debriefing conducted with patient and staff within 24 hours.', patientInvolved: true, correctionRequired: false, reportableToState: false, status: 'CLOSED' as const, closedDate: new Date(`${y}-03-25`) },
    { incidentNumber: `INC-${y}-006`, dateOccurred: new Date(`${y}-04-05 08:00`), incidentType: 'NEAR_MISS' as const, severity: 'MINOR' as const, location: 'Pharmacy', description: 'Nurse almost administered medication to wrong patient — caught by barcode scanning system at bedside. No patient harm.', immediateActions: 'Staff counseled on two-patient identifier policy. Pharmacy notified. Near-miss documented.', patientInvolved: true, correctionRequired: true, reportableToState: false, status: 'OPEN' as const },
  ];

  const createdIncidents: Record<string, string> = {};
  type IncExtra = { staffInvolved?: boolean; reportedToState?: boolean; stateReportDate?: Date | null; closedDate?: Date | null };
  for (const inc of incidents) {
    const record = await prisma.incident.create({
      data: {
        facilityId: facility.id,
        incidentNumber: inc.incidentNumber,
        dateOccurred: inc.dateOccurred,
        incidentType: inc.incidentType,
        severity: inc.severity,
        location: inc.location,
        description: inc.description,
        immediateActions: inc.immediateActions,
        patientInvolved: inc.patientInvolved ?? false,
        staffInvolved: (inc as IncExtra).staffInvolved ?? false,
        correctionRequired: inc.correctionRequired,
        reportableToState: inc.reportableToState,
        reportedToState: (inc as IncExtra).reportedToState ?? false,
        stateReportDate: (inc as IncExtra).stateReportDate ?? null,
        status: inc.status,
        closedDate: (inc as IncExtra).closedDate ?? null,
      },
    });
    createdIncidents[inc.incidentNumber] = record.id;
  }
  console.log(`  ✅ Seeded ${incidents.length} incidents`);

  // ─── CORRECTIVE ACTION PLANS ─────────────────────────────────────────────
  console.log('\n📋 Seeding corrective action plans...');
  const caps = [
    {
      capNumber: `CAP-${y}-001`,
      title: 'Patient Fall Prevention — Non-Slip Footwear Compliance',
      source: 'INCIDENT' as const,
      sourceRef: `INC-${y}-001`,
      description: 'Following a patient fall in Unit A, a review found 3 of 10 patients on fall precautions were not wearing non-slip socks. This CAP addresses the system gap in care plan-to-bedside compliance.',
      rootCause: 'Oncoming nursing staff failed to verify fall precaution accessories during shift handoff. Handoff checklist did not include fall risk gear verification.',
      correctionPlan: '1. Update shift handoff checklist to include fall precaution gear check.\n2. Laminated fall-risk visual cues placed outside patient rooms.\n3. Re-education for all nursing staff on fall bundle compliance.\n4. CNO review of fall precaution audits at weekly safety huddle.',
      measureOfSuccess: 'Zero fall-related incidents attributed to missing fall gear for 90 consecutive days. 100% compliance on monthly fall bundle audits.',
      targetDate: new Date(`${y}-04-30`),
      completedDate: new Date(`${y}-04-15`),
      status: 'VERIFIED' as const,
      priority: 'HIGH' as const,
    },
    {
      capNumber: `CAP-${y}-002`,
      title: 'Medication Administration — Two-Patient Identifier Protocol',
      source: 'INCIDENT' as const,
      sourceRef: `INC-${y}-002`,
      description: 'A near-miss medication error revealed that barcode scanning compliance was below 80% on Unit B. This CAP reinforces the two-patient identifier requirement at point of administration.',
      rootCause: 'Scanner device battery issues caused staff to bypass scanning and rely on visual verification only. No backup process was documented.',
      correctionPlan: '1. All scanner devices charged nightly — assigned to charge nurse to verify.\n2. New policy: medication not administered without successful scan unless device failure documented and pharmacist notified.\n3. Bi-weekly medication safety audits by charge nurses.\n4. Monthly compliance rate reported to QAPI committee.',
      measureOfSuccess: 'Barcode scan compliance >95% on monthly audits for 3 consecutive months.',
      targetDate: new Date(`${y}-05-15`),
      completedDate: null,
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
    },
    {
      capNumber: `CAP-${y}-003`,
      title: 'Elopement Risk — Perimeter Security Hardening',
      source: 'INCIDENT' as const,
      sourceRef: `INC-${y}-003`,
      description: 'Patient elopement through unsecured east exterior door. Root cause analysis identified a malfunctioning magnetic lock and delayed staff response to door alarm.',
      rootCause: 'East door magnetic lock had intermittent fault for 3 days prior to incident. Maintenance work order had been submitted but not prioritized. Door alarm was silenced by security without investigation.',
      correctionPlan: '1. All exterior door locks inspected and certified by Facilities within 48 hours.\n2. Door alarm protocol revised — all alarms require physical investigation before silence.\n3. Maintenance work order SLA for security hardware set to 4-hour response.\n4. AWOL / elopement risk screening added to admission assessment.',
      measureOfSuccess: 'Zero elopement incidents for 180 days. 100% monthly door lock inspection completion.',
      targetDate: new Date(`${y}-06-01`),
      completedDate: null,
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
    },
    {
      capNumber: `CAP-${y}-004`,
      title: 'Annual Staff Training Completion — Overdue Staff Resolution',
      source: 'INTERNAL_AUDIT' as const,
      sourceRef: 'HR-AUDIT-2026-Q1',
      description: 'Q1 HR audit identified 3 staff members with overdue annual mandatory training. CMS CoP requires all staff to complete annual mandatory training.',
      rootCause: 'HealthStream auto-reminders disabled for staff on FMLA. No supervisor-level backup notification existed.',
      correctionPlan: '1. HealthStream supervisor notification enabled for all direct reports regardless of leave status.\n2. Monthly training compliance dashboard review added to department head meetings.\n3. HR to audit outstanding training at end of each quarter.',
      measureOfSuccess: '≥95% annual mandatory training completion rate at next quarterly audit.',
      targetDate: new Date(`${y}-07-31`),
      completedDate: null,
      status: 'OPEN' as const,
      priority: 'MEDIUM' as const,
    },
  ];

  for (const cap of caps) {
    await prisma.correctiveActionPlan.create({
      data: {
        facilityId: facility.id,
        capNumber: cap.capNumber,
        title: cap.title,
        source: cap.source,
        sourceRef: cap.sourceRef,
        description: cap.description,
        rootCause: cap.rootCause,
        correctionPlan: cap.correctionPlan,
        measureOfSuccess: cap.measureOfSuccess,
        targetDate: cap.targetDate,
        completedDate: cap.completedDate,
        status: cap.status,
        priority: cap.priority,
      },
    });
  }
  console.log(`  ✅ Seeded ${caps.length} corrective action plans`);

  // ─── GRIEVANCES ───────────────────────────────────────────────────────────
  console.log('\n📬 Seeding grievances...');
  const grievances = [
    {
      grievanceNumber: `GRV-${y}-001`,
      dateReceived: new Date(`${y}-02-03`),
      complainantName: 'Patricia Moore',
      complainantType: 'FAMILY_MEMBER' as const,
      complainantPhone: '(602) 555-0191',
      patientName: 'D. Moore',
      patientMRN: 'MRN-78234',
      summary: 'Family member reports that patient was placed in seclusion on 01/28 without adequate explanation to family. Family states staff were rude and dismissive when they called for an update.',
      category: 'RESTRAINT_SECLUSION' as const,
      severity: 'STANDARD' as const,
      assignedTo: 'Patient Advocate',
      acknowledgmentDueDate: new Date(`${y}-02-10`),
      resolutionDueDate: new Date(`${y}-03-05`),
      acknowledgmentDate: new Date(`${y}-02-07`),
      acknowledgmentSentBy: 'Patient Rights Officer',
      resolutionDate: new Date(`${y}-02-28`),
      resolutionSentBy: 'CNO / Patient Rights Officer',
      status: 'RESOLVED' as const,
      resolution: 'Full review of seclusion event conducted. Seclusion was clinically justified and documented appropriately. Patient and family meeting facilitated with treatment team. Staff reminded of family communication obligations. No regulatory violation found.',
      outcomeCategory: 'Unsubstantiated',
      reportableToAdhs: false,
    },
    {
      grievanceNumber: `GRV-${y}-002`,
      dateReceived: new Date(`${y}-03-10`),
      complainantName: 'Anonymous',
      complainantType: 'ANONYMOUS' as const,
      patientName: null,
      patientMRN: null,
      summary: 'Anonymous complainant states that on multiple occasions nursing staff have been observed not washing hands between patient rooms on Unit B.',
      category: 'CLINICAL_CARE_QUALITY' as const,
      severity: 'STANDARD' as const,
      assignedTo: 'Infection Control Officer',
      acknowledgmentDueDate: new Date(`${y}-03-17`),
      resolutionDueDate: new Date(`${y}-04-09`),
      acknowledgmentDate: null,
      resolutionDate: null,
      status: 'UNDER_REVIEW' as const,
      resolution: null,
      outcomeCategory: null,
      reportableToAdhs: false,
    },
    {
      grievanceNumber: `GRV-${y}-003`,
      dateReceived: new Date(`${y}-04-01`),
      complainantName: 'Roberto Fuentes',
      complainantType: 'PATIENT' as const,
      complainantPhone: '(480) 555-0242',
      patientName: 'Roberto Fuentes',
      patientMRN: 'MRN-91045',
      summary: 'Patient alleges that a staff member made demeaning comments during a group therapy session regarding his diagnosis and nationality.',
      category: 'STAFF_CONDUCT' as const,
      severity: 'EXPEDITED' as const,
      assignedTo: 'HR / Clinical Director',
      acknowledgmentDueDate: new Date(`${y}-04-08`),
      resolutionDueDate: new Date(`${y}-05-01`),
      acknowledgmentDate: new Date(`${y}-04-04`),
      acknowledgmentSentBy: 'Patient Rights Officer',
      resolutionDate: null,
      status: 'PENDING_RESOLUTION' as const,
      resolution: null,
      outcomeCategory: null,
      reportableToAdhs: false,
    },
  ];

  type GrievExtra = { complainantPhone?: string | null; patientName?: string | null; patientMRN?: string | null; acknowledgmentDate?: Date | null; acknowledgmentSentBy?: string | null; resolutionDate?: Date | null; resolutionSentBy?: string | null; resolution?: string | null; outcomeCategory?: string | null };
  for (const g of grievances) {
    await prisma.grievanceRecord.create({
      data: {
        facilityId: facility.id,
        grievanceNumber: g.grievanceNumber,
        dateReceived: g.dateReceived,
        complainantName: g.complainantName,
        complainantType: g.complainantType,
        complainantPhone: (g as GrievExtra).complainantPhone ?? null,
        patientName: (g as GrievExtra).patientName ?? null,
        patientMRN: (g as GrievExtra).patientMRN ?? null,
        summary: g.summary,
        category: g.category,
        severity: g.severity,
        assignedTo: g.assignedTo,
        acknowledgmentDueDate: g.acknowledgmentDueDate,
        resolutionDueDate: g.resolutionDueDate,
        acknowledgmentDate: (g as GrievExtra).acknowledgmentDate ?? null,
        acknowledgmentSentBy: (g as GrievExtra).acknowledgmentSentBy ?? null,
        resolutionDate: (g as GrievExtra).resolutionDate ?? null,
        resolutionSentBy: (g as GrievExtra).resolutionSentBy ?? null,
        status: g.status,
        resolution: (g as GrievExtra).resolution ?? null,
        outcomeCategory: (g as GrievExtra).outcomeCategory ?? null,
        reportableToAdhs: g.reportableToAdhs,
      },
    });
  }
  console.log(`  ✅ Seeded ${grievances.length} grievances`);

  // ─── QOC / LOI COMPLAINTS ─────────────────────────────────────────────────
  console.log('\n🔍 Seeding QOC/LOI complaints...');
  await prisma.qocComplaint.create({
    data: {
      facilityId: facility.id,
      qocNumber: `QOC-${y}-001`,
      dateReceived: new Date(`${y}-02-20`),
      complainantType: 'FAMILY_MEMBER',
      allegationSummary: 'Complainant alleges patient was denied access to phone to call family for 3 days, violating patient rights under ARS 36-507.',
      allegationCategories: ['Patient Rights', 'Communication'],
      loiReceivedDate: new Date(`${y}-03-01`),
      investigationType: 'STANDARD',
      investigatorName: 'AZ ADHS Survey Team',
      responseDueDate: new Date(`${y}-03-15`),
      status: 'RESPONSE_SUBMITTED',
      responseSubmittedDate: new Date(`${y}-03-14`),
      deficienciesFound: false,
    },
  });
  await prisma.qocComplaint.create({
    data: {
      facilityId: facility.id,
      qocNumber: `QOC-${y}-002`,
      dateReceived: new Date(`${y}-04-10`),
      complainantType: 'ANONYMOUS',
      allegationSummary: 'Anonymous complaint alleges inadequate supervision of patients at-risk for self-harm on the overnight shift of 04/05/2026.',
      allegationCategories: ['Patient Safety', 'Staffing'],
      loiReceivedDate: null,
      investigationType: 'STANDARD',
      responseDueDate: null,
      status: 'OPEN',
      deficienciesFound: false,
    },
  });
  console.log('  ✅ Seeded 2 QOC/LOI complaints');

  // ─── INCIDENT REPORTS (IR/IAD) ────────────────────────────────────────────
  console.log('\n📄 Seeding incident reports (IR/IAD)...');
  const irRecords = [
    {
      irNumber: `IR-${y}-001`,
      incidentDate: new Date(`${y}-01-08`),
      incidentTime: '14:30',
      incidentType: 'PATIENT_FALL' as const,
      severity: 'MODERATE' as const,
      location: 'Unit A',
      unitName: 'Acute Inpatient Unit A',
      briefDescription: 'Patient found on floor beside bed during afternoon rounds. Non-slip socks not in place per care plan.',
      injuryDescription: 'No apparent injury. Vital signs stable.',
      immediateActions: 'VS assessed, MD notified, family contacted. PT/OT consult ordered.',
      patientName: 'T.R. (Patient)',
      patientMRN: 'MRN-78011',
      physicianNotified: true,
      physicianNotifiedTime: '14:45',
      supervisorNotified: true,
      supervisorNotifiedTime: '14:40',
      adhsReportable: false,
      status: 'CLOSED' as const,
      closedDate: new Date(`${y}-01-25`),
      aiTriageSeverity: 'MODERATE',
      aiTriageTags: 'patient_safety,fall_risk',
    },
    {
      irNumber: `IR-${y}-002`,
      incidentDate: new Date(`${y}-02-14`),
      incidentTime: '23:45',
      incidentType: 'ELOPEMENT' as const,
      severity: 'SERIOUS' as const,
      location: 'East Exit',
      unitName: 'Acute Inpatient Unit B',
      briefDescription: 'ITA patient eloped through unsecured exterior door on overnight shift. Located by law enforcement within 30 minutes.',
      injuryDescription: 'No physical injury reported.',
      immediateActions: 'Code Green activated. Law enforcement notified. Family notified at 00:10. Patient returned safely at 00:22.',
      patientName: 'K.M. (Patient)',
      patientMRN: 'MRN-83442',
      physicianNotified: true,
      physicianNotifiedTime: '23:50',
      supervisorNotified: true,
      supervisorNotifiedTime: '23:48',
      familyNotified: true,
      adhsReportable: true,
      adhsReportableCategory: '24-hour',
      adhsReported: true,
      adhsReportDate: new Date(`${y}-02-15`),
      adhsConfirmationNumber: 'ADHS-2026-04821',
      status: 'CLOSED' as const,
      closedDate: new Date(`${y}-03-01`),
      aiTriageSeverity: 'HIGH',
      aiTriageTags: 'elopement,regulatory_exposure,ita_patient',
      aiCascadeTriggered: true,
    },
    {
      irNumber: `IR-${y}-003`,
      incidentDate: new Date(`${y}-03-02`),
      incidentTime: '16:20',
      incidentType: 'ASSAULT_PATIENT_TO_STAFF' as const,
      severity: 'MODERATE' as const,
      location: 'Unit A Day Room',
      unitName: 'Acute Inpatient Unit A',
      briefDescription: 'Acutely agitated patient struck MHT in face during de-escalation attempt. Staff sustained minor facial laceration.',
      injuryDescription: 'Staff: 1.5cm laceration above left eyebrow, sutured in ED.',
      immediateActions: 'Security called. Patient placed on 1:1 observation. Staff sent to Employee Health/ED. PRN administered.',
      patientMRN: 'MRN-91203',
      staffInvolvedNames: 'Darnell Williams, MHT',
      physicianNotified: true,
      physicianNotifiedTime: '16:30',
      supervisorNotified: true,
      supervisorNotifiedTime: '16:22',
      adhsReportable: false,
      status: 'CLOSED' as const,
      closedDate: new Date(`${y}-03-25`),
      aiTriageSeverity: 'MODERATE',
      aiTriageTags: 'staff_safety,aggression,workplace_injury',
    },
    {
      irNumber: `IR-${y}-004`,
      incidentDate: new Date(`${y}-04-05`),
      incidentTime: '08:00',
      incidentType: 'MEDICATION_ERROR' as const,
      severity: 'NEAR_MISS' as const,
      location: 'Pharmacy / Unit B Bedside',
      unitName: 'Acute Inpatient Unit B',
      briefDescription: 'Nurse almost administered medication to wrong patient. Caught by barcode scanning system. No harm occurred.',
      immediateActions: 'Scan failure investigated. Correct patient verified via two-identifier protocol. Pharmacy notified. Staff counseled.',
      patientMRN: 'MRN-56712',
      physicianNotified: false,
      supervisorNotified: true,
      supervisorNotifiedTime: '08:15',
      adhsReportable: false,
      status: 'INVESTIGATING' as const,
      aiTriageSeverity: 'LOW',
      aiTriageTags: 'medication_safety,near_miss',
    },
  ];

  type IrExtra = { injuryDescription?: string | null; patientName?: string | null; patientMRN?: string | null; staffInvolvedNames?: string | null; physicianNotifiedTime?: string | null; supervisorNotifiedTime?: string | null; familyNotified?: boolean; adhsReportableCategory?: string | null; adhsReported?: boolean; adhsReportDate?: Date | null; adhsConfirmationNumber?: string | null; closedDate?: Date | null; aiCascadeTriggered?: boolean };
  for (const ir of irRecords) {
    await prisma.incidentReport.create({
      data: {
        facilityId: facility.id,
        irNumber: ir.irNumber,
        incidentDate: ir.incidentDate,
        incidentTime: ir.incidentTime,
        incidentType: ir.incidentType,
        severity: ir.severity,
        location: ir.location,
        unitName: ir.unitName,
        briefDescription: ir.briefDescription,
        injuryDescription: (ir as IrExtra).injuryDescription ?? null,
        immediateActions: ir.immediateActions,
        patientName: (ir as IrExtra).patientName ?? null,
        patientMRN: (ir as IrExtra).patientMRN ?? null,
        staffInvolvedNames: (ir as IrExtra).staffInvolvedNames ?? null,
        physicianNotified: ir.physicianNotified,
        physicianNotifiedTime: (ir as IrExtra).physicianNotifiedTime ?? null,
        supervisorNotified: ir.supervisorNotified,
        supervisorNotifiedTime: (ir as IrExtra).supervisorNotifiedTime ?? null,
        familyNotified: (ir as IrExtra).familyNotified ?? false,
        adhsReportable: ir.adhsReportable,
        adhsReportableCategory: (ir as IrExtra).adhsReportableCategory ?? null,
        adhsReported: (ir as IrExtra).adhsReported ?? false,
        adhsReportDate: (ir as IrExtra).adhsReportDate ?? null,
        adhsConfirmationNumber: (ir as IrExtra).adhsConfirmationNumber ?? null,
        status: ir.status,
        closedDate: (ir as IrExtra).closedDate ?? null,
        aiTriageSeverity: ir.aiTriageSeverity,
        aiTriageTags: ir.aiTriageTags,
        aiCascadeTriggered: (ir as IrExtra).aiCascadeTriggered ?? false,
      },
    });
  }
  console.log(`  ✅ Seeded ${irRecords.length} incident reports (IR/IAD)`);

  // ─── QAPI METRICS (6 months rolling) ─────────────────────────────────────
  console.log('\n📊 Seeding QAPI metrics...');
  const currentMonth = now.getMonth() + 1; // 1-based
  const qapiYear     = now.getFullYear();

  interface MetricDef {
    metricName: string;
    metricKey: string;
    category: 'PATIENT_SAFETY' | 'RESTRAINT_SECLUSION' | 'MEDICATION_SAFETY' | 'PATIENT_EXPERIENCE' | 'INFECTION_PREVENTION';
    unit: string;
    target: number;
    values: number[]; // 6 months oldest first
  }

  const metricDefs: MetricDef[] = [
    { metricName: 'Patient Fall Rate', metricKey: 'patient_fall_rate', category: 'PATIENT_SAFETY', unit: 'per 1000 pt-days', target: 2.0, values: [3.1, 2.8, 2.2, 1.9, 2.1, 1.7] },
    { metricName: 'Restraint Utilization Rate', metricKey: 'restraint_rate', category: 'RESTRAINT_SECLUSION', unit: '%', target: 5.0, values: [7.2, 6.8, 6.1, 5.9, 5.4, 4.8] },
    { metricName: 'Medication Error Rate', metricKey: 'medication_error_rate', category: 'MEDICATION_SAFETY', unit: 'per 1000 doses', target: 1.5, values: [2.4, 2.0, 1.8, 1.6, 1.9, 1.4] },
    { metricName: 'Patient Satisfaction Score', metricKey: 'patient_satisfaction', category: 'PATIENT_EXPERIENCE', unit: '%', target: 80.0, values: [71.0, 73.5, 75.0, 77.0, 78.5, 80.0] },
    { metricName: 'Hand Hygiene Compliance', metricKey: 'hand_hygiene_compliance', category: 'INFECTION_PREVENTION', unit: '%', target: 90.0, values: [82.0, 84.0, 86.5, 87.0, 89.0, 91.0] },
  ];

  for (const metric of metricDefs) {
    for (let i = 0; i < 6; i++) {
      let month = currentMonth - 5 + i;
      let year  = qapiYear;
      if (month <= 0) { month += 12; year -= 1; }
      await prisma.qapiMetric.upsert({
        where: {
          facilityId_metricKey_month_year: {
            facilityId: facility.id,
            metricKey:  metric.metricKey,
            month,
            year,
          },
        },
        create: {
          facilityId:  facility.id,
          metricName:  metric.metricName,
          metricKey:   metric.metricKey,
          category:    metric.category,
          month,
          year,
          value:  metric.values[i],
          target: metric.target,
          unit:   metric.unit,
        },
        update: {
          value:  metric.values[i],
          target: metric.target,
        },
      });
    }
  }
  console.log(`  ✅ Seeded QAPI metrics (5 metrics × 6 months)`);

  // ─── SURVEYS ──────────────────────────────────────────────────────────────
  console.log('\n🏥 Seeding surveys...');
  await prisma.survey.upsert({
    where: { id: 'survey-az-annual-2025' },
    create: {
      id:             'survey-az-annual-2025',
      facilityId:     facility.id,
      surveyType:     'LICENSURE',
      regulatoryBody: 'AZ_ADHS',
      conductedDate:  new Date(`${y-1}-11-14`),
      surveyorNames:  'ADHS Survey Team (3 surveyors)',
      status:         'CLOSED',
      outcome:        'Conditional — 2 Standard-level findings issued',
      findingCount:   2,
      satisfactionScore: 76.0,
      immediateJeopardy: false,
      conditionLevel: false,
      responseDeadline: new Date(`${y-1}-12-14`),
      responseSubmitted: new Date(`${y-1}-12-10`),
      notes: 'Annual licensure renewal survey. Two findings: F1 — lack of documented patient rights discussion at admission; F2 — incomplete advance directive documentation in 3 of 10 records reviewed. POC submitted and accepted.',
    },
    update: {},
  });
  await prisma.survey.upsert({
    where: { id: 'survey-mock-jc-2026' },
    create: {
      id:             'survey-mock-jc-2026',
      facilityId:     facility.id,
      surveyType:     'MOCK',
      regulatoryBody: 'JOINT_COMMISSION',
      conductedDate:  new Date(`${y}-05-20`),
      status:         'SCHEDULED',
      findingCount:   0,
      immediateJeopardy: false,
      conditionLevel: false,
      notes: 'Internal mock Joint Commission survey scheduled prior to anticipated accreditation renewal in Q3. Conducted by external consultants.',
    },
    update: {},
  });
  console.log('  ✅ Seeded 2 surveys (1 completed licensure, 1 scheduled mock JC)');

  // ─── RISK ASSESSMENT ──────────────────────────────────────────────────────
  console.log('\n⚠️  Seeding risk assessment...');
  const ra = await prisma.riskAssessment.upsert({
    where: { id: 'ra-annual-proactive-2026' },
    create: {
      id:              'ra-annual-proactive-2026',
      facilityId:      facility.id,
      title:           `${y} Annual Proactive Risk Assessment`,
      assessmentType:  'ANNUAL_PROACTIVE',
      scope:           'Facility-wide — all patient care areas and support departments',
      conductedDate:   new Date(`${y}-01-30`),
      conductedBy:     'Quality & Compliance Team',
      reviewedBy:      'Linda Park, CNO',
      approvedBy:      'James Holloway, CEO',
      status:          'APPROVED',
      summary:         `Annual proactive risk assessment per JC LD.04.04.01. Identified 12 risk items across 5 domains. Highest priority: elopement risk from perimeter access control failures and medication safety related to scanner compliance. Both items linked to active CAPs.`,
      overallRiskLevel: 'MEDIUM',
      regulatoryBody:  'JOINT_COMMISSION',
      standardRef:     'LD.04.04.01',
      nextReviewDate:  new Date(`${y+1}-01-30`),
    },
    update: {},
  });

  const riskItems = [
    { riskDescription: 'Perimeter access control — east wing door lock failure history', category: 'Security', likelihood: 3, severity: 5, riskScore: 15, riskLevel: 'HIGH' as const, currentControls: 'Magnetic locks, security camera coverage, door alarms', recommendedActions: 'Monthly door lock certification; 4-hour maintenance SLA for security hardware', priority: 'HIGH' as const, targetDate: new Date(`${y}-03-31`), status: 'IN_PROGRESS' as const },
    { riskDescription: 'Medication barcode scanning compliance below 90%', category: 'Medication Safety', likelihood: 4, severity: 3, riskScore: 12, riskLevel: 'HIGH' as const, currentControls: 'Barcoding system, 2-patient identifier policy', recommendedActions: 'Device maintenance protocol, compliance audits, staff re-education', priority: 'HIGH' as const, targetDate: new Date(`${y}-04-30`), status: 'IN_PROGRESS' as const },
    { riskDescription: 'Incomplete fall precaution bundle compliance at shift change', category: 'Patient Safety', likelihood: 3, severity: 3, riskScore: 9, riskLevel: 'MEDIUM' as const, currentControls: 'Fall bundle protocol, fall risk assessment on admission', recommendedActions: 'Updated handoff checklist, visual fall cues, routine audits', priority: 'MEDIUM' as const, targetDate: new Date(`${y}-04-30`), status: 'MITIGATED' as const },
  ];

  for (const item of riskItems) {
    await prisma.riskAssessmentItem.create({
      data: {
        assessmentId: ra.id,
        riskDescription: item.riskDescription,
        category: item.category,
        likelihood: item.likelihood,
        severity: item.severity,
        riskScore: item.riskScore,
        riskLevel: item.riskLevel,
        currentControls: item.currentControls,
        recommendedActions: item.recommendedActions,
        priority: item.priority,
        targetDate: item.targetDate,
        status: item.status,
      },
    });
  }
  console.log('  ✅ Seeded 1 risk assessment with 3 risk items');

  // ─── ENVIRONMENT OF CARE ────────────────────────────────────────────────────
  console.log('\n[8/8] Seeding Environment of Care data...');

  // --- Ligature Risk Items ---
  const ligatureItems = [
    {
      id: 'lig-2026-001', itemNumber: 'LIG-2026-001',
      location: 'Seclusion Room 1 – Bathroom', unit: 'Acute Adult',
      itemDescription: 'Shower curtain rod – standard (not breakaway)',
      riskLevel: 'IMMEDIATE' as const, status: 'IN_MITIGATION' as const,
      identifiedDate: new Date('2026-01-15'), identifiedBy: 'Maria Santos RN',
      mitigationPlan: 'Remove rod; switch to curtain-less design pending plumber',
      targetDate: new Date('2026-01-16'),
      notes: 'Do NOT return to patient use until resolved. Plant Ops notified.',
    },
    {
      id: 'lig-2026-002', itemNumber: 'LIG-2026-002',
      location: 'Room 118 – Bathroom', unit: 'Acute Adult',
      itemDescription: 'Door hinges – standard exposed knuckle can serve as anchor',
      riskLevel: 'HIGH' as const, status: 'OPEN' as const,
      identifiedDate: new Date('2026-02-20'), identifiedBy: 'Compliance Officer',
      mitigationPlan: 'Replace with anti-ligature continuous piano hinges',
      targetDate: new Date('2026-03-20'),
      notes: 'Vendor quote requested from Creative Safety Supply',
    },
    {
      id: 'lig-2026-003', itemNumber: 'LIG-2026-003',
      location: 'Room 104 – Bathroom', unit: 'Adolescent Unit',
      itemDescription: 'Towel hook – exposed J-hook style',
      riskLevel: 'HIGH' as const, status: 'OPEN' as const,
      identifiedDate: new Date('2026-02-20'), identifiedBy: 'Compliance Officer',
      mitigationPlan: 'Replace with anti-ligature concealed towel bar',
      targetDate: new Date('2026-03-20'), notes: '',
    },
    {
      id: 'lig-2026-004', itemNumber: 'LIG-2026-004',
      location: 'Main Hallway – North Wing', unit: 'All Units',
      itemDescription: 'Overhead data conduit accessible from common area ceiling tile',
      riskLevel: 'HIGH' as const, status: 'IN_MITIGATION' as const,
      identifiedDate: new Date('2026-01-28'), identifiedBy: 'Carlos Vega EOC Chair',
      mitigationPlan: 'Enclose in locked chase; in progress by maintenance',
      targetDate: new Date('2026-02-28'), notes: '70% complete as of 3/1/2026',
    },
    {
      id: 'lig-2026-005', itemNumber: 'LIG-2026-005',
      location: 'Group Therapy Room A', unit: 'Acute Adult',
      itemDescription: 'Ceiling sprinkler head – unguarded',
      riskLevel: 'MEDIUM' as const, status: 'OPEN' as const,
      identifiedDate: new Date('2026-02-25'), identifiedBy: 'Maria Santos RN',
      mitigationPlan: 'Install anti-ligature sprinkler guards',
      targetDate: new Date('2026-03-25'), notes: 'Order placed; 3-week lead time per vendor',
    },
    {
      id: 'lig-2026-006', itemNumber: 'LIG-2026-006',
      location: 'Room 115 – Bedroom', unit: 'Acute Adult',
      itemDescription: 'Window blinds cord – looped pull cord exposed',
      riskLevel: 'MEDIUM' as const, status: 'OPEN' as const,
      identifiedDate: new Date('2026-02-25'), identifiedBy: 'Maria Santos RN',
      mitigationPlan: 'Replace all corded blinds with cordless roller shades',
      targetDate: new Date('2026-03-10'), notes: '',
    },
    {
      id: 'lig-2026-007', itemNumber: 'LIG-2026-007',
      location: 'Family Visitation Room', unit: 'Main Floor',
      itemDescription: 'Picture frame wire – hanging artwork in visitation',
      riskLevel: 'LOW' as const, status: 'RESOLVED' as const,
      identifiedDate: new Date('2025-10-05'), identifiedBy: 'Survey Prep Team',
      mitigationPlan: 'All artwork removed; replaced with anti-ligature mounted prints',
      targetDate: new Date('2025-10-20'),
      resolvedDate: new Date('2025-10-18'), resolvedBy: 'Facilities', notes: '',
    },
  ];

  for (const item of ligatureItems) {
    await prisma.ligatureRiskItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, facilityId: 'destiny-springs' },
    });
  }
  console.log(`  ✅ Seeded ${ligatureItems.length} ligature risk items`);

  // --- EOC Rounds ---
  const eocRound1Id = 'eoc-round-2026-lig-01';
  const eocRound2Id = 'eoc-round-2026-02';
  const eocRound3Id = 'eoc-round-2026-03';

  await prisma.eocRound.upsert({
    where: { id: eocRound1Id },
    update: {},
    create: {
      id: eocRound1Id, facilityId: 'destiny-springs',
      roundNumber: 'EOC-ROUND-2026-LIG-01',
      roundType: 'LIGATURE_RISK' as const,
      conductedDate: new Date('2026-02-20'),
      conductedBy: 'Compliance Officer / Carlos Vega',
      participantIds: ['Maria Santos RN', 'Risk Manager'],
      areasInspected: ['All Patient Rooms', 'Bathrooms', 'Group Therapy Rooms', 'Seclusion Room', 'Common Areas'],
      totalItems: 10, openItems: 4, status: 'COMPLETED' as const,
      summary: 'Full facility ligature survey completed per TJC EC.02.06.01. 10 items identified; 1 IMMEDIATE, 3 HIGH, 4 MEDIUM, 2 LOW. Written mitigation plans issued for all.',
    },
  });

  await prisma.eocRound.upsert({
    where: { id: eocRound2Id },
    update: {},
    create: {
      id: eocRound2Id, facilityId: 'destiny-springs',
      roundNumber: 'EOC-ROUND-2026-02',
      roundType: 'LIFE_SAFETY_GENERAL' as const,
      conductedDate: new Date('2026-02-07'),
      conductedBy: 'Carlos Vega, EOC Chair',
      participantIds: ['Linda Park CNO', 'Facilities Manager'],
      areasInspected: ['Adolescent Unit', 'Step-Down Unit', 'Family Visitation', 'Cafeteria', 'Parking/Exterior'],
      totalItems: 38, openItems: 0, status: 'REVIEWED' as const,
      summary: 'All findings from January round resolved. No persistent open items. Certificate signed by CNO.',
    },
  });

  await prisma.eocRound.upsert({
    where: { id: eocRound3Id },
    update: {},
    create: {
      id: eocRound3Id, facilityId: 'destiny-springs',
      roundNumber: 'EOC-ROUND-2026-03',
      roundType: 'LIFE_SAFETY_GENERAL' as const,
      conductedDate: new Date('2026-03-07'),
      conductedBy: 'Carlos Vega, EOC Chair',
      participantIds: ['Maria Santos RN', 'Darnell Williams MHT'],
      areasInspected: ['Acute Adult Unit', 'Nursing Stations', 'Medication Room', 'Stairwells', 'Mechanical Room'],
      totalItems: 42, openItems: 3, status: 'IN_PROGRESS' as const,
      summary: 'Round in progress. Three open deficiencies identified: two ligature-related, one fire door.',
    },
  });
  console.log('  ✅ Seeded 3 EOC rounds');

  // --- EOC Deficiencies ---
  const deficiencies = [
    {
      id: 'def-2026-001', defNumber: 'DEF-2026-001',
      roundId: eocRound1Id,
      location: 'Seclusion Room 1 – Bathroom', unit: 'Acute Adult',
      description: 'Shower curtain rod – standard, not breakaway',
      category: 'LIGATURE_RISK' as const, severity: 'IMMEDIATE_JEOPARDY' as const, status: 'RESOLVED' as const,
      assignedTo: 'Carlos Vega', dueDate: new Date('2026-01-16'),
      resolvedDate: new Date('2026-01-15'), resolvedBy: 'Carlos Vega',
      notes: 'Rod removed same day. Room cleared for occupancy after verification.',
    },
    {
      id: 'def-2026-002', defNumber: 'DEF-2026-002',
      roundId: eocRound1Id,
      location: 'Main Hallway – North Wing', unit: 'All Units',
      description: 'Overhead data conduit accessible from common area ceiling tile',
      category: 'LIGATURE_RISK' as const, severity: 'HIGH' as const, status: 'IN_PROGRESS' as const,
      assignedTo: 'Facilities Manager', dueDate: new Date('2026-02-28'),
      notes: 'Chase enclosure 70% complete as of 3/1/2026.',
    },
    {
      id: 'def-2026-004', defNumber: 'DEF-2026-004',
      roundId: eocRound3Id,
      location: 'Medication Room', unit: 'Acute Adult',
      description: 'Hand hygiene dispenser empty – bracket corroded and inoperable',
      category: 'INFECTION_CONTROL' as const, severity: 'MEDIUM' as const, status: 'OPEN' as const,
      assignedTo: 'Maria Santos RN', dueDate: new Date('2026-03-12'),
      notes: 'New dispenser ordered. Temporary soap pump placed.',
    },
    {
      id: 'def-2026-005', defNumber: 'DEF-2026-005',
      roundId: eocRound3Id,
      location: 'Nurses Station – Wing B', unit: 'Acute Adult',
      description: 'Fire door closer inoperable – door does not fully latch',
      category: 'FIRE_SAFETY' as const, severity: 'MEDIUM' as const, status: 'IN_PROGRESS' as const,
      assignedTo: 'Facilities Manager', dueDate: new Date('2026-03-21'),
      notes: 'Door closer on order. Staff instructed to manually close door.',
    },
    {
      id: 'def-2026-006', defNumber: 'DEF-2026-006',
      roundId: eocRound3Id,
      location: 'Seclusion Room 1', unit: 'Acute Adult',
      description: 'Emergency ligature cutter not mounted at door',
      category: 'LIGATURE_RISK' as const, severity: 'HIGH' as const, status: 'IN_PROGRESS' as const,
      assignedTo: 'Carlos Vega', dueDate: new Date('2026-03-10'),
      notes: 'Cutter ordered — standard hook-and-blade mount kit. ETA 3/10.',
    },
    {
      id: 'def-2026-007', defNumber: 'DEF-2026-007',
      roundId: eocRound1Id,
      location: 'Room 118 – Bathroom', unit: 'Acute Adult',
      description: 'Door hinge plates non-ligature-resistant (standard exposed knuckle)',
      category: 'LIGATURE_RISK' as const, severity: 'HIGH' as const, status: 'OPEN' as const,
      assignedTo: 'Facilities Manager', dueDate: new Date('2026-03-20'),
      notes: 'Anti-ligature piano hinge vendor quote requested.',
    },
  ];

  for (const d of deficiencies) {
    await prisma.eocDeficiency.upsert({
      where: { id: d.id },
      update: {},
      create: { ...d, facilityId: 'destiny-springs', photoUrls: [] },
    });
  }
  console.log(`  ✅ Seeded ${deficiencies.length} EOC deficiencies`);

  // --- Equipment PM ---
  const equipmentItems = [
    {
      id: 'pm-2026-001', equipmentName: 'Kitchen Hood Suppression System (Ansul R-102)',
      equipmentId: 'FS-HOOD-01', location: 'Dietary – Kitchen',
      category: 'FIRE_SUPPRESSION' as const, frequency: 'SEMI_ANNUAL' as const,
      lastServiceDate: new Date('2025-09-05'), nextServiceDate: new Date('2026-03-05'),
      vendor: 'Ansul Service AZ', contactPhone: '(623) 555-0190',
      status: 'OVERDUE' as const, notes: 'Service scheduled 3/20/2026. Tag expired 3/5.',
    },
    {
      id: 'pm-2026-002', equipmentName: 'Emergency Exit Lighting – North Wing',
      equipmentId: 'EL-N-WING-01', location: 'North Hallway – 1st Floor',
      category: 'EMERGENCY_LIGHTING' as const, frequency: 'ANNUAL' as const,
      lastServiceDate: new Date('2025-02-10'), nextServiceDate: new Date('2026-02-10'),
      vendor: 'Arizona Life Safety LLC', contactPhone: '(602) 555-0141',
      status: 'OVERDUE' as const, notes: '30-second and 90-minute battery test overdue.',
    },
    {
      id: 'pm-2026-003', equipmentName: 'Fire Alarm Panel – Notifier NFS2-3030',
      equipmentId: 'FA-PANEL-MAIN', location: 'Main Electrical Room',
      category: 'FIRE_ALARM' as const, frequency: 'ANNUAL' as const,
      lastServiceDate: new Date('2025-03-18'), nextServiceDate: new Date('2026-03-18'),
      vendor: 'Arizona Fire Systems', contactPhone: '(602) 555-0182',
      status: 'DUE_SOON' as const, notes: 'Full panel inspection includes detector testing and sprinkler flow test.',
    },
    {
      id: 'pm-2026-004', equipmentName: 'Emergency Generator – Cummins 500kW Diesel',
      equipmentId: 'GEN-MAIN-01', location: 'Exterior – East Mechanical Pad',
      category: 'GENERATOR' as const, frequency: 'MONTHLY' as const,
      lastServiceDate: new Date('2026-02-07'), nextServiceDate: new Date('2026-03-07'),
      vendor: 'Cummins Power Systems – AZ', contactPhone: '(602) 555-0175',
      status: 'DUE_SOON' as const, notes: 'Monthly load test: run under load for 30 minutes.',
    },
    {
      id: 'pm-2026-005', equipmentName: 'Fire Extinguishers – All Areas (42 units)',
      equipmentId: 'FE-ALL', location: 'Facility-wide',
      category: 'FIRE_SUPPRESSION' as const, frequency: 'ANNUAL' as const,
      lastServiceDate: new Date('2025-03-15'), nextServiceDate: new Date('2026-03-15'),
      vendor: 'Phoenix Fire Equipment', contactPhone: '(602) 555-0163',
      status: 'DUE_SOON' as const, notes: 'Annual certification + 6-year inspection for applicable units.',
    },
    {
      id: 'pm-2026-006', equipmentName: 'Elevator – Kone MiniSpace (Wing A)',
      equipmentId: 'ELV-WING-A', location: 'Wing A – 1st/2nd Floor',
      category: 'ELEVATOR' as const, frequency: 'ANNUAL' as const,
      lastServiceDate: new Date('2025-04-01'), nextServiceDate: new Date('2026-04-01'),
      vendor: 'KONE Americas', contactPhone: '(602) 555-0199',
      status: 'UPCOMING' as const, notes: 'State-required annual certification by AZ Elevator Safety.',
    },
    {
      id: 'pm-2026-007', equipmentName: 'AHU-1 – Air Handling Unit (Acute Unit)',
      equipmentId: 'HVAC-AHU-1', location: 'Roof – Acute Unit Zone',
      category: 'HVAC' as const, frequency: 'QUARTERLY' as const,
      lastServiceDate: new Date('2026-01-10'), nextServiceDate: new Date('2026-04-10'),
      vendor: 'Comfort Systems AZ', contactPhone: '(602) 555-0177',
      status: 'UPCOMING' as const, notes: 'Change MERV-14 filters, check coils, verify negative pressure.',
    },
    {
      id: 'pm-2026-008', equipmentName: 'Sprinkler System – Quarterly Inspection',
      equipmentId: 'SPK-ALL', location: 'Facility-wide',
      category: 'FIRE_SUPPRESSION' as const, frequency: 'QUARTERLY' as const,
      lastServiceDate: new Date('2026-01-20'), nextServiceDate: new Date('2026-04-20'),
      vendor: 'Arizona Fire Systems', contactPhone: '(602) 555-0182',
      status: 'COMPLETED' as const, notes: 'Q1 2026 complete. Certificate posted in EOC binder. No deficiencies.',
    },
    {
      id: 'pm-2026-009', equipmentName: 'Security Camera System – Annual Review',
      equipmentId: 'SEC-CAM-ALL', location: 'Facility-wide',
      category: 'SECURITY_SYSTEM' as const, frequency: 'ANNUAL' as const,
      lastServiceDate: new Date('2026-02-15'), nextServiceDate: new Date('2027-02-15'),
      vendor: 'Integrated Security Solutions', contactPhone: '(602) 555-0188',
      status: 'COMPLETED' as const, notes: 'All 34 cameras verified operational. 90-day retention confirmed.',
    },
  ];

  for (const item of equipmentItems) {
    await prisma.equipmentPm.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, facilityId: 'destiny-springs' },
    });
  }
  console.log(`  ✅ Seeded ${equipmentItems.length} equipment PM records`);

  // ─── RESTRAINT & SECLUSION EVENTS ─────────────────────────────────────────
  console.log('\n🔒 Seeding restraint & seclusion events...');
  const rsEvents = [
    {
      eventNumber: `RS-${y}-001`,
      patientInitials: 'T.R.',
      unit: 'Acute Inpatient Unit A',
      eventDate: new Date(`${y}-01-15T14:30:00`),
      eventTime: '14:30',
      rsType: 'PHYSICAL_RESTRAINT' as const,
      orderingProvider: 'Dr. Elena Vasquez, MD',
      orderDateTime: new Date(`${y}-01-15T14:45:00`),
      initiatedBy: 'Maria Santos, RN',
      clinicalJustification: 'Patient exhibiting imminent danger to self — attempting to strike head against wall.',
      behaviors: 'Head-banging, self-injurious behavior, not responding to verbal redirection.',
      lessRestrictiveTried: 'Verbal de-escalation attempted for 5 minutes. PRN medication offered and declined.',
      monitoringLogs: [
        { time: '14:30', staff: 'Maria Santos, RN', assessment: 'Patient restrained, agitated', vitals: 'HR 102, RR 16' },
        { time: '14:45', staff: 'Maria Santos, RN', assessment: 'Calming, cooperative', vitals: 'HR 94, RR 14' },
        { time: '15:00', staff: 'Darnell Williams, MHT', assessment: 'Calm, requesting release', vitals: 'HR 88, RR 14' },
      ],
      faceToFaceTime: new Date(`${y}-01-15T15:10:00`),
      faceToFaceBy: 'Dr. Elena Vasquez, MD',
      releasedAt: new Date(`${y}-01-15T15:12:00`),
      releasedBy: 'Maria Santos, RN',
      releaseReason: 'BEHAVIORAL_CRITERIA_MET' as const,
      durationMinutes: 42,
      debrief: true,
      debriefDate: new Date(`${y}-01-15T16:00:00`),
      debriefParticipants: ['T.R. (Patient)', 'Maria Santos, RN', 'Darnell Williams, MHT'],
      debriefNotes: 'Patient expressed preference for weighted blanket as PRN comfort measure.',
      injuryOccurred: false,
      deathOccurred: false,
      status: 'CLOSED' as const,
    },
    {
      eventNumber: `RS-${y}-002`,
      patientInitials: 'K.M.',
      unit: 'Acute Inpatient Unit B',
      eventDate: new Date(`${y}-02-22T22:15:00`),
      eventTime: '22:15',
      rsType: 'SECLUSION' as const,
      orderingProvider: 'Dr. James Ortega, DO (on-call)',
      orderDateTime: new Date(`${y}-02-22T22:25:00`),
      initiatedBy: 'Carmen Reyes, LPN',
      clinicalJustification: 'Patient is ITA, actively threatening staff and other patients with improvised weapon (broken utensil).',
      behaviors: 'Threatening behavior, brandishing object, refusing all verbal redirection.',
      lessRestrictiveTried: 'Security called, verbal de-escalation by two staff, PRN offered.',
      monitoringLogs: [
        { time: '22:15', staff: 'Carmen Reyes, LPN', assessment: 'Highly agitated, shouting', vitals: 'HR 118, RR 20' },
        { time: '22:30', staff: 'Darnell Williams, MHT', assessment: 'Still agitated', vitals: 'HR 110, RR 18' },
        { time: '22:45', staff: 'Darnell Williams, MHT', assessment: 'Calming, sitting down', vitals: 'HR 98, RR 16' },
      ],
      faceToFaceTime: new Date(`${y}-02-22T23:10:00`),
      faceToFaceBy: 'Dr. James Ortega, DO',
      releasedAt: new Date(`${y}-02-22T23:00:00`),
      releasedBy: 'Carmen Reyes, LPN',
      releaseReason: 'BEHAVIORAL_CRITERIA_MET' as const,
      durationMinutes: 45,
      debrief: true,
      debriefDate: new Date(`${y}-02-23T10:00:00`),
      debriefParticipants: ['K.M. (Patient)', 'Carmen Reyes, LPN', 'Dr. James Ortega, DO'],
      debriefNotes: 'Patient reported feeling overwhelmed by noise on unit. Sensory break protocol added to care plan.',
      injuryOccurred: false,
      deathOccurred: false,
      status: 'CLOSED' as const,
    },
  ];

  for (const ev of rsEvents) {
    await prisma.restraintEvent.upsert({
      where: { id: `${facility.id}-${ev.eventNumber}` },
      update: {},
      create: { id: `${facility.id}-${ev.eventNumber}`, facilityId: facility.id, ...ev },
    });
  }
  console.log(`  ✅ Seeded ${rsEvents.length} restraint/seclusion events`);

  // ─── INFECTION CONTROL ────────────────────────────────────────────────────
  console.log('\n🦠 Seeding infection control data...');

  await prisma.icRiskAssessment.upsert({
    where: { id: `${facility.id}-icra-${y}` },
    update: {},
    create: {
      id: `${facility.id}-icra-${y}`,
      facilityId: facility.id,
      assessmentYear: y,
      conductedDate: new Date(`${y}-01-25`),
      conductedBy: 'Linda Park, CNO / IC Committee',
      reviewedBy: 'James Holloway, CEO',
      status: 'APPROVED' as const,
      riskAreas: [
        { area: 'Hand Hygiene Compliance', risk: 'Staff non-compliance during high-census periods', rating: 'HIGH', mitigationGoal: 'Achieve ≥90% compliance by Q3' },
        { area: 'Multi-Drug Resistant Organisms (MDROs)', risk: 'MRSA transmission to immunocompromised psychiatric patients', rating: 'MEDIUM', mitigationGoal: 'Zero MRSA BSI; active surveillance for known MRSA patients' },
        { area: 'Respiratory Illness (Flu)', risk: 'Annual influenza outbreak in inpatient population', rating: 'MEDIUM', mitigationGoal: '≥90% staff flu vaccination by Oct 1' },
        { area: 'C. difficile', risk: 'CDI risk from antibiotic use in medically complex patients', rating: 'LOW', mitigationGoal: 'Maintain CDI rate below NHSN benchmark' },
        { area: 'Construction/Renovation (ICRA)', risk: 'Aspergillus risk if renovation occurs near patient areas', rating: 'LOW', mitigationGoal: 'ICRA completion before any construction initiation' },
      ],
      goals: [
        { goal: 'Hand hygiene compliance ≥90%', baseline: '84%', target: '90%', method: 'Monthly direct observation audits', responsible: 'IC Officer' },
        { goal: 'Staff flu vaccination ≥90%', baseline: '78% (prior year)', target: '90%', method: 'Tracking via Employee Health', responsible: 'HR / Employee Health' },
        { goal: 'Zero CLABSI / CAUTI', baseline: '0 events (YTD)', target: '0 events', method: 'NHSN monthly surveillance', responsible: 'IC Officer / CNO' },
      ],
      approvedDate: new Date(`${y}-02-01`),
      approvedBy: 'James Holloway, CEO',
      notes: 'Annual ICRA completed per CMS §482.42 and TJC IC.01.01.01.',
    },
  });

  const haiData = [
    { reportMonth: 1, reportYear: y, haiType: 'CAUTI' as const, caseCount: 0, patientDays: 420, rate: 0, nhsnBenchmark: 0.8, sir: 0 },
    { reportMonth: 2, reportYear: y, haiType: 'CAUTI' as const, caseCount: 0, patientDays: 389, rate: 0, nhsnBenchmark: 0.8, sir: 0 },
    { reportMonth: 3, reportYear: y, haiType: 'CAUTI' as const, caseCount: 1, patientDays: 410, rate: 2.44, nhsnBenchmark: 0.8, sir: 3.0 },
    { reportMonth: 1, reportYear: y, haiType: 'CLABSI' as const, caseCount: 0, patientDays: 420, rate: 0, nhsnBenchmark: 0.5, sir: 0 },
    { reportMonth: 2, reportYear: y, haiType: 'CLABSI' as const, caseCount: 0, patientDays: 389, rate: 0, nhsnBenchmark: 0.5, sir: 0 },
    { reportMonth: 3, reportYear: y, haiType: 'CLABSI' as const, caseCount: 0, patientDays: 410, rate: 0, nhsnBenchmark: 0.5, sir: 0 },
  ];

  for (const hai of haiData) {
    await prisma.haiSurveillance.upsert({
      where: { id: `${facility.id}-hai-${hai.haiType}-${hai.reportYear}-${hai.reportMonth}` },
      update: {},
      create: { id: `${facility.id}-hai-${hai.haiType}-${hai.reportYear}-${hai.reportMonth}`, facilityId: facility.id, ...hai, submittedToNhsn: true },
    });
  }

  await prisma.handHygieneAudit.upsert({
    where: { id: `${facility.id}-hh-${y}-01` },
    update: {},
    create: { id: `${facility.id}-hh-${y}-01`, facilityId: facility.id, auditDate: new Date(`${y}-01-20`), unit: 'Acute Inpatient Unit A', auditor: 'IC Officer', opportunities: 62, compliant: 52, complianceRate: 83.9, staffType: 'Mixed', notes: 'Below 90% target; re-education delivered.' },
  });
  await prisma.handHygieneAudit.upsert({
    where: { id: `${facility.id}-hh-${y}-02` },
    update: {},
    create: { id: `${facility.id}-hh-${y}-02`, facilityId: facility.id, auditDate: new Date(`${y}-02-18`), unit: 'Acute Inpatient Unit A', auditor: 'IC Officer', opportunities: 58, compliant: 51, complianceRate: 87.9, staffType: 'RN', notes: 'Improving trend.' },
  });
  await prisma.handHygieneAudit.upsert({
    where: { id: `${facility.id}-hh-${y}-03` },
    update: {},
    create: { id: `${facility.id}-hh-${y}-03`, facilityId: facility.id, auditDate: new Date(`${y}-03-15`), unit: 'Acute Inpatient Unit B', auditor: 'IC Officer', opportunities: 55, compliant: 50, complianceRate: 90.9, staffType: 'Mixed', notes: 'Met 90% target for first time this year.' },
  });

  console.log('  ✅ Seeded IC risk assessment, 6 HAI surveillance records, 3 hand hygiene audits');

  // ─── CREDENTIALING — PROVIDERS & LICENSES ────────────────────────────────
  console.log('\n🩺 Seeding providers, licenses & OPPE...');
  const providersData = [
    {
      id: `${facility.id}-prov-001`,
      npi: '1234567890',
      firstName: 'Elena', lastName: 'Vasquez', credentials: 'MD',
      specialty: 'Psychiatry', providerType: 'PHYSICIAN' as const,
      department: 'Inpatient Psychiatry',
      primaryEmail: 'evasquez@destinysprings.com',
      phone: '(623) 555-0101',
      status: 'ACTIVE' as const,
      initialAppointDate: new Date(`${y-3}-07-01`),
      reappointmentDate: new Date(`${y+1}-07-01`),
    },
    {
      id: `${facility.id}-prov-002`,
      npi: '0987654321',
      firstName: 'James', lastName: 'Ortega', credentials: 'DO',
      specialty: 'Psychiatry', providerType: 'PHYSICIAN' as const,
      department: 'Inpatient Psychiatry',
      primaryEmail: 'jortega@destinysprings.com',
      phone: '(623) 555-0102',
      status: 'ACTIVE' as const,
      initialAppointDate: new Date(`${y-2}-03-01`),
      reappointmentDate: new Date(`${y+2}-03-01`),
    },
    {
      id: `${facility.id}-prov-003`,
      npi: '1122334455',
      firstName: 'Priya', lastName: 'Sharma', credentials: 'PMHNP-BC',
      specialty: 'Psychiatric Mental Health NP', providerType: 'ADVANCED_PRACTICE' as const,
      department: 'Outpatient Services',
      primaryEmail: 'psharma@destinysprings.com',
      phone: '(623) 555-0103',
      status: 'ACTIVE' as const,
      initialAppointDate: new Date(`${y-1}-10-01`),
      reappointmentDate: new Date(`${y+3}-10-01`),
    },
  ];

  for (const p of providersData) {
    await prisma.provider.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, facilityId: facility.id },
    });
  }

  // Provider licenses — including one expiring soon for notification testing
  const licensesData = [
    { id: `${facility.id}-lic-001`, providerId: `${facility.id}-prov-001`, licenseType: 'Medical License', licenseNumber: 'AZ-MD-123456', state: 'AZ', issuedDate: new Date(`${y-2}-07-01`), expiryDate: new Date(`${y+1}-06-30`), isVerified: true, verifiedDate: new Date(`${y-1}-11-01`), verifiedBy: 'Credentialing Coordinator', status: 'ACTIVE' as const },
    { id: `${facility.id}-lic-002`, providerId: `${facility.id}-prov-001`, licenseType: 'DEA Certificate', licenseNumber: 'BV1234567', state: 'AZ', issuedDate: new Date(`${y-1}-01-01`), expiryDate: new Date(`${y}-06-01`), isVerified: true, verifiedDate: new Date(`${y-1}-11-01`), verifiedBy: 'Credentialing Coordinator', status: 'ACTIVE' as const },
    { id: `${facility.id}-lic-003`, providerId: `${facility.id}-prov-002`, licenseType: 'Medical License', licenseNumber: 'AZ-DO-654321', state: 'AZ', issuedDate: new Date(`${y-1}-03-01`), expiryDate: new Date(`${y+3}-02-28`), isVerified: true, verifiedDate: new Date(`${y-1}-11-01`), verifiedBy: 'Credentialing Coordinator', status: 'ACTIVE' as const },
    { id: `${facility.id}-lic-004`, providerId: `${facility.id}-prov-003`, licenseType: 'APRN License', licenseNumber: 'AZ-APRN-778899', state: 'AZ', issuedDate: new Date(`${y-1}-10-01`), expiryDate: new Date(`${y}-09-30`), isVerified: true, verifiedDate: new Date(`${y-1}-11-01`), verifiedBy: 'Credentialing Coordinator', status: 'ACTIVE' as const },
  ];

  for (const lic of licensesData) {
    await prisma.providerLicense.upsert({
      where: { id: lic.id },
      update: {},
      create: lic,
    });
  }

  // Clinical Privileges
  await prisma.clinicalPrivilege.upsert({
    where: { id: `${facility.id}-priv-001` },
    update: {},
    create: { id: `${facility.id}-priv-001`, providerId: `${facility.id}-prov-001`, category: 'Inpatient Psychiatry', description: 'Full inpatient psychiatric privileges including admission, treatment orders, restraint/seclusion orders.', grantedDate: new Date(`${y-3}-07-01`), expiryDate: new Date(`${y+1}-07-01`), status: 'GRANTED' as const, requiresFppe: false },
  });
  await prisma.clinicalPrivilege.upsert({
    where: { id: `${facility.id}-priv-002` },
    update: {},
    create: { id: `${facility.id}-priv-002`, providerId: `${facility.id}-prov-003`, category: 'Advanced Practice Prescribing — Psychiatry', description: 'Prescriptive authority for psychiatric medications per NP collaborative agreement.', grantedDate: new Date(`${y-1}-10-01`), expiryDate: new Date(`${y+3}-10-01`), status: 'PROVISIONAL' as const, requiresFppe: true, notes: 'FPPE in progress — 10 cases required.' },
  });

  // OPPE Record
  await prisma.oppeRecord.upsert({
    where: { id: `${facility.id}-oppe-001` },
    update: {},
    create: {
      id: `${facility.id}-oppe-001`,
      providerId: `${facility.id}-prov-001`,
      periodStart: new Date(`${y-1}-01-01`),
      periodEnd: new Date(`${y-1}-12-31`),
      reviewCycle: `Annual ${y-1}`,
      totalCases: 48,
      compliantCases: 46,
      metrics: [
        { metric: 'Documentation completeness', numerator: 46, denominator: 48, rate: 95.8, benchmark: 95.0 },
        { metric: 'Treatment plan timeliness (within 24h)', numerator: 48, denominator: 48, rate: 100.0, benchmark: 95.0 },
        { metric: 'Restraint order compliance', numerator: 5, denominator: 5, rate: 100.0, benchmark: 100.0 },
      ],
      overallRating: 'ACCEPTABLE' as const,
      reviewedBy: 'Medical Executive Committee',
      approvedByMec: true,
      notes: 'No concerns identified. Reappointment recommended.',
    },
  });

  console.log('  ✅ Seeded 3 providers, 4 licenses, 2 privileges, 1 OPPE record');

  // ─── TREATMENT PLANS ──────────────────────────────────────────────────────
  console.log('\n📋 Seeding treatment plans...');
  const tx1Id = `${facility.id}-tp-001`;
  await prisma.treatmentPlan.upsert({
    where: { id: tx1Id },
    update: {},
    create: {
      id: tx1Id,
      facilityId: facility.id,
      patientInitials: 'A.B.',
      admitDate: new Date(`${y}-03-10`),
      unit: 'Acute Inpatient Unit A',
      primaryDx: 'Major Depressive Disorder with Suicidal Ideation (F32.2)',
      treatmentTeam: ['Dr. Elena Vasquez, MD', 'Takeshi Yamamoto, LCSW', 'Maria Santos, RN', 'Priya Nair, RN (Intake)'],
      planCreatedDate: new Date(`${y}-03-11`),
      planCreatedBy: 'Dr. Elena Vasquez, MD',
      patientParticipated: true,
      participationNotes: 'Patient verbalized understanding of all goals and signed participation attestation.',
      goals: [
        { goalText: 'Reduce PHQ-9 score from 22 to <10 by discharge', targetDate: new Date(`${y}-03-24`), progress: 'In progress — PHQ-9 now 16 at Day 4' },
        { goalText: 'Develop individualized safety plan with patient', targetDate: new Date(`${y}-03-13`), progress: 'Completed on Day 2' },
        { goalText: 'Identify 3 coping strategies for suicidal ideation', targetDate: new Date(`${y}-03-18`), progress: 'In progress — 2 of 3 identified' },
      ],
      dischargeGoal: 'Discharge to home with outpatient CBT weekly and medication management follow-up within 7 days.',
      estimatedLos: '14 days',
      status: 'ACTIVE' as const,
    },
  });

  await prisma.treatmentPlanReview.upsert({
    where: { id: `${facility.id}-tpr-001` },
    update: {},
    create: {
      id: `${facility.id}-tpr-001`,
      planId: tx1Id,
      reviewDate: new Date(`${y}-03-14`),
      reviewedBy: 'Dr. Elena Vasquez, MD',
      attendees: ['Patient A.B.', 'Dr. Elena Vasquez, MD', 'Takeshi Yamamoto, LCSW', 'Maria Santos, RN'],
      progressSummary: 'Patient demonstrates improved mood. PHQ-9 dropped to 14. Safety plan reviewed and patient verbalized all elements. Discharge planning initiated.',
      goalsUpdated: true,
      dischargeTarget: `${y}-03-24`,
    },
  });

  console.log('  ✅ Seeded 1 treatment plan with review');

  // ─── HIPAA ────────────────────────────────────────────────────────────────
  console.log('\n🔐 Seeding HIPAA breach log & BAA tracker...');

  await prisma.hipaaBreachLog.upsert({
    where: { id: `${facility.id}-hipaa-001` },
    update: {},
    create: {
      id: `${facility.id}-hipaa-001`,
      facilityId: facility.id,
      incidentNumber: `HIPAA-${y}-001`,
      discoveryDate: new Date(`${y}-02-10`),
      incidentDate: new Date(`${y}-02-08`),
      breachType: 'MISDIRECTED_COMMUNICATIONS' as const,
      phiInvolved: ['Name', 'Dates of service', 'Diagnosis'],
      individualCount: 1,
      description: 'Discharge summary for patient J.T. was faxed to incorrect number. Fax was intended for outpatient therapist but sent to unrelated medical office. Receiving office confirmed receipt and destruction of document.',
      immediateActions: 'Receiving office contacted and confirmed document destroyed. Fax number corrected in EHR. Incident reported to Privacy Officer.',
      riskAssessment: 'LOW' as const,
      reportableBreach: false,
      status: 'CLOSED' as const,
      closedDate: new Date(`${y}-02-20`),
      notes: 'Four-factor risk assessment completed. Not likely reportable per §164.402 standard. Documented in breach log per policy.',
    },
  });

  await prisma.hipaaBreachLog.upsert({
    where: { id: `${facility.id}-hipaa-002` },
    update: {},
    create: {
      id: `${facility.id}-hipaa-002`,
      facilityId: facility.id,
      incidentNumber: `HIPAA-${y}-002`,
      discoveryDate: new Date(`${y}-04-01`),
      breachType: 'UNAUTHORIZED_ACCESS' as const,
      phiInvolved: ['Name', 'MRN', 'Dates of service', 'Diagnosis', 'Medication list'],
      individualCount: 3,
      description: 'Former employee accessed EHR records of 3 patients without authorization in the 2 days prior to termination. Access identified through routine audit log review.',
      immediateActions: 'Access terminated immediately. IT audit log preserved. Legal counsel notified. HR notified.',
      riskAssessment: 'HIGH' as const,
      reportableBreach: true,
      status: 'INVESTIGATION' as const,
      notes: 'Under investigation. Decision on HHS notification pending legal review. 60-day HHS notification deadline: June 1.',
    },
  });

  const baaVendors = [
    { id: `${facility.id}-baa-001`, vendorName: 'HealthStream', vendorContact: 'Account Manager', vendorEmail: 'accounts@healthstream.com', serviceDescription: 'Online learning management system for staff training and competency tracking.', agreementDate: new Date(`${y-2}-06-01`), expiryDate: new Date(`${y+1}-05-31`), autoRenew: true, status: 'ACTIVE' as const, phoneHipaaVerified: true },
    { id: `${facility.id}-baa-002`, vendorName: 'Shred-it / Stericycle', vendorContact: 'Client Services', vendorEmail: 'service@shred-it.com', serviceDescription: 'Shredding services for PHI documents and media destruction.', agreementDate: new Date(`${y-1}-01-15`), expiryDate: new Date(`${y+2}-01-14`), autoRenew: false, status: 'ACTIVE' as const, phoneHipaaVerified: true },
    { id: `${facility.id}-baa-003`, vendorName: 'Arizona Health Information Exchange', vendorContact: 'Legal Department', vendorEmail: 'legal@azhie.org', serviceDescription: 'State health information exchange for care coordination and clinical data sharing.', agreementDate: new Date(`${y-3}-04-01`), expiryDate: null, autoRenew: false, status: 'ACTIVE' as const, phoneHipaaVerified: true },
    { id: `${facility.id}-baa-004`, vendorName: 'Nuance Communications (AI Transcription)', vendorContact: 'Enterprise Support', vendorEmail: 'enterprise@nuance.com', serviceDescription: 'AI-powered clinical documentation dictation and transcription service.', agreementDate: new Date(`${y-1}-09-01`), expiryDate: new Date(`${y+2}-08-31`), autoRenew: true, status: 'ACTIVE' as const, phoneHipaaVerified: false, notes: 'HIPAA verification phone call pending per annual audit.' },
  ];

  for (const baa of baaVendors) {
    await prisma.baaTracker.upsert({ where: { id: baa.id }, update: {}, create: { ...baa, facilityId: facility.id } });
  }

  console.log('  ✅ Seeded 2 HIPAA breach logs, 4 BAA tracker records');

  // ─── PATIENT RIGHTS ───────────────────────────────────────────────────────
  console.log('\n⚖️  Seeding patient rights records...');

  // Consents
  const consents = [
    { id: `${facility.id}-con-001`, patientInitials: 'A.B.', admitDate: new Date(`${y}-03-10`), consentType: 'GENERAL_TREATMENT' as const, consentDate: new Date(`${y}-03-10`), obtainedBy: 'Priya Nair, RN', status: 'SIGNED' as const },
    { id: `${facility.id}-con-002`, patientInitials: 'A.B.', admitDate: new Date(`${y}-03-10`), consentType: 'MEDICATION' as const, consentDate: new Date(`${y}-03-10`), obtainedBy: 'Priya Nair, RN', status: 'SIGNED' as const },
    { id: `${facility.id}-con-003`, patientInitials: 'K.M.', admitDate: new Date(`${y}-02-14`), consentType: 'GENERAL_TREATMENT' as const, consentDate: new Date(`${y}-02-14`), obtainedBy: 'Carmen Reyes, LPN', patientCapacityDetermined: false, legalRepresentative: 'Court-appointed guardian (ITA)', status: 'SIGNED' as const },
  ];
  for (const c of consents) {
    await prisma.consentRecord.upsert({ where: { id: c.id }, update: {}, create: { ...c, facilityId: facility.id } });
  }

  // Advance directives
  await prisma.advanceDirectiveRecord.upsert({
    where: { id: `${facility.id}-ad-001` },
    update: {},
    create: { id: `${facility.id}-ad-001`, facilityId: facility.id, patientInitials: 'A.B.', admitDate: new Date(`${y}-03-10`), adExists: true, adType: 'DPAHC', adOnFile: true, informationProvided: true, providedBy: 'Priya Nair, RN', documentedBy: 'Priya Nair, RN', documentedDate: new Date(`${y}-03-10`) },
  });

  // MOON notices — include one PENDING for notification testing
  const moonNotices = [
    { id: `${facility.id}-moon-001`, patientInitials: 'R.W.', admitDate: new Date(`${y}-03-05`), observationStartDate: new Date(`${y}-03-05`), noticeIssuedDate: new Date(`${y}-03-05`), noticeIssuedBy: 'Carmen Reyes, LPN', patientSignedDate: new Date(`${y}-03-05`), status: 'SIGNED' as const },
    { id: `${facility.id}-moon-002`, patientInitials: 'P.D.', admitDate: new Date(`${y}-04-10`), observationStartDate: new Date(`${y}-04-10`), status: 'PENDING' as const, notes: 'Notice not yet issued — patient admitted to observation status today. Must issue within 36 hours.' },
  ];
  for (const m of moonNotices) {
    await prisma.moonNotice.upsert({ where: { id: m.id }, update: {}, create: { ...m, facilityId: facility.id } });
  }

  // Involuntary holds
  await prisma.involuntaryHoldLog.upsert({
    where: { id: `${facility.id}-hold-001` },
    update: {},
    create: { id: `${facility.id}-hold-001`, facilityId: facility.id, patientInitials: 'K.M.', holdType: 'Title 36 – 72hr ITA', holdStartDate: new Date(`${y}-02-14`), holdExpiryDate: new Date(`${y}-02-17`), orderingPhysician: 'Dr. James Ortega, DO', legalCounselNotified: true, outcome: 'Converted to voluntary admission on Day 2', status: 'DISCHARGED' as const },
  });

  console.log('  ✅ Seeded 3 consents, 1 advance directive, 2 MOON notices, 1 involuntary hold');

  // ─── PHARMACY ─────────────────────────────────────────────────────────────
  console.log('\n💊 Seeding pharmacy records...');

  // Controlled substance logs — include one DISCREPANCY_OPEN for notification testing
  const csLogs = [
    { id: `${facility.id}-cs-001`, logDate: new Date(`${y}-04-01T07:00:00`), unit: 'Acute Inpatient Unit A', shift: 'Day', medicationName: 'Lorazepam 1mg (CIV)', schedule: 'SCHEDULE_IV' as const, amountExpected: 20, amountCounted: 20, countDifference: 0, discrepancyFound: false, witnessName: 'Darnell Williams, MHT', countedBy: 'Maria Santos, RN', status: 'RECONCILED' as const },
    { id: `${facility.id}-cs-002`, logDate: new Date(`${y}-04-02T07:00:00`), unit: 'Acute Inpatient Unit A', shift: 'Day', medicationName: 'Clonazepam 0.5mg (CIV)', schedule: 'SCHEDULE_IV' as const, amountExpected: 15, amountCounted: 14, countDifference: -1, discrepancyFound: true, witnessName: 'Carmen Reyes, LPN', countedBy: 'Maria Santos, RN', discrepancyExplanation: null, reportedToPharmacy: true, reportedDate: new Date(`${y}-04-02T07:30:00`), status: 'DISCREPANCY_OPEN' as const },
  ];
  for (const cs of csLogs) {
    await prisma.controlledSubstanceLog.upsert({ where: { id: cs.id }, update: {}, create: { ...cs, facilityId: facility.id } });
  }

  // High alert med audits
  await prisma.highAlertMedAudit.upsert({
    where: { id: `${facility.id}-ha-001` },
    update: {},
    create: { id: `${facility.id}-ha-001`, facilityId: facility.id, auditDate: new Date(`${y}-03-20`), medication: 'Insulin (all formulations)', unit: 'Medical Unit', auditor: 'Carmen Reyes, LPN', storageCorrect: true, labelingCorrect: true, doubleCheckDone: true, auditFindings: 'No deficiencies noted. All high-alert labels in place. Double-check log current.', actionRequired: false },
  });
  await prisma.highAlertMedAudit.upsert({
    where: { id: `${facility.id}-ha-002` },
    update: {},
    create: { id: `${facility.id}-ha-002`, facilityId: facility.id, auditDate: new Date(`${y}-03-20`), medication: 'Lithium (all strengths)', unit: 'Acute Inpatient Unit B', auditor: 'Carmen Reyes, LPN', storageCorrect: true, labelingCorrect: false, doubleCheckDone: true, auditFindings: 'Lithium 300mg and 600mg stored in same bin — labeling not sufficiently differentiated. CAP initiated.', actionRequired: true, actionTaken: 'Separate bins ordered. Interim: additional "VERIFY DOSE" label affixed to Lithium bin.' },
  });

  // PDMP checks
  await prisma.pdmpCheck.upsert({
    where: { id: `${facility.id}-pdmp-001` },
    update: {},
    create: { id: `${facility.id}-pdmp-001`, facilityId: facility.id, checkDate: new Date(`${y}-03-10`), patientInitials: 'A.B.', prescriberId: `${facility.id}-prov-001`, prescriptionType: 'Benzodiazepine (Lorazepam)', significantFinding: false, actionTaken: 'No concurrent prescriptions from other prescribers identified.' },
  });

  // P&T Committee meeting
  await prisma.ptMeeting.upsert({
    where: { id: `${facility.id}-pt-001` },
    update: {},
    create: {
      id: `${facility.id}-pt-001`,
      facilityId: facility.id,
      meetingDate: new Date(`${y}-02-14`),
      quorumMet: true,
      chair: 'Dr. Elena Vasquez, MD',
      attendees: ['Dr. Elena Vasquez, MD', 'Dr. James Ortega, DO', 'Carmen Reyes, LPN (Pharmacy Liaison)', 'Linda Park, CNO'],
      agendaItems: ['Q4 Medication Error Trend Review', 'High Alert Medication Policy Update', 'Formulary Addition: Brexpiprazole', 'ADE Reports'],
      formularyChanges: [{ drug: 'Brexpiprazole (Rexulti)', action: 'ADDED', rationale: 'Evidence-based adjunct for MDD; requested by Dr. Vasquez' }],
      medErrorsTrended: 3,
      actionItems: [
        { item: 'Update high-alert med policy to separate Lithium storage', owner: 'CNO', dueDate: new Date(`${y}-03-15`), status: 'IN_PROGRESS' },
        { item: 'Staff re-education on two-patient identifier for all high-alert meds', owner: 'Education Coordinator', dueDate: new Date(`${y}-03-31`), status: 'COMPLETED' },
      ],
      nextMeetingDate: new Date(`${y}-05-09`),
      minutesApproved: true,
    },
  });

  console.log('  ✅ Seeded 2 CS logs (1 discrepancy), 2 high-alert audits, 1 PDMP check, 1 P&T meeting');

  // ─── GOVERNANCE ───────────────────────────────────────────────────────────
  console.log('\n🏛️  Seeding governance records...');

  const govDocs = [
    { id: `${facility.id}-gd-001`, docType: 'MEDICAL_STAFF_BYLAWS' as const, title: 'Medical Staff Bylaws', version: '3.2', effectiveDate: new Date(`${y-1}-07-01`), reviewDate: new Date(`${y+2}-07-01`), approvedBy: 'Governing Body Board', status: 'ACTIVE' as const },
    { id: `${facility.id}-gd-002`, docType: 'BOARD_BYLAWS' as const, title: 'Board of Directors Bylaws', version: '5.0', effectiveDate: new Date(`${y-2}-01-01`), reviewDate: new Date(`${y+1}-01-01`), approvedBy: 'Chairman of the Board', status: 'ACTIVE' as const },
    { id: `${facility.id}-gd-003`, docType: 'RULES_REGULATIONS' as const, title: 'Medical Staff Rules and Regulations', version: '2.1', effectiveDate: new Date(`${y-1}-07-01`), reviewDate: new Date(`${y+2}-07-01`), approvedBy: 'Medical Executive Committee', status: 'ACTIVE' as const },
    { id: `${facility.id}-gd-004`, docType: 'CREDENTIALING_CRITERIA' as const, title: 'Credentialing Policies and Criteria', version: '1.5', effectiveDate: new Date(`${y-1}-01-15`), reviewDate: new Date(`${y}-01-15`), approvedBy: 'Credentials Committee', status: 'UNDER_REVIEW' as const, notes: 'Annual review overdue — scheduled for next Credentials Committee meeting.' },
  ];
  for (const gd of govDocs) {
    await prisma.governanceDocument.upsert({ where: { id: gd.id }, update: {}, create: { ...gd, facilityId: facility.id } });
  }

  await prisma.committeeMeeting.upsert({
    where: { id: `${facility.id}-cm-001` },
    update: {},
    create: {
      id: `${facility.id}-cm-001`,
      facilityId: facility.id,
      committeeType: 'QUALITY_PATIENT_SAFETY' as const,
      meetingDate: new Date(`${y}-02-20`),
      quorumMet: true,
      chair: 'Linda Park, CNO',
      attendees: ['Linda Park, CNO', 'Dr. Elena Vasquez, MD', 'James Holloway, CEO', 'Compliance Officer', 'Quality Director'],
      absentees: [],
      agendaItems: ['QAPI Metrics Q4 Review', 'Incident Trend Review', 'CAP Status Update', 'Ligature Risk Mitigation Update'],
      actionItems: [
        { item: 'CAP-2026-002: Barcode compliance to reach 95% by May 15', owner: 'CNO', dueDate: new Date(`${y}-05-15`), status: 'IN_PROGRESS' },
        { item: 'Complete all HIGH-priority ligature items by Q1 end', owner: 'Carlos Vega', dueDate: new Date(`${y}-03-31`), status: 'IN_PROGRESS' },
      ],
      reportReferences: ['QAPI Dashboard', 'Incident Reports', 'CAP Tracker', 'EOC Report'],
      minutesApprovedDate: new Date(`${y}-03-06`),
      nextMeetingDate: new Date(`${y}-04-17`),
    },
  });

  await prisma.committeeMeeting.upsert({
    where: { id: `${facility.id}-cm-002` },
    update: {},
    create: {
      id: `${facility.id}-cm-002`,
      facilityId: facility.id,
      committeeType: 'GOVERNING_BODY' as const,
      meetingDate: new Date(`${y}-03-15`),
      quorumMet: true,
      chair: 'Harold Stevens (Board Chair)',
      attendees: ['Harold Stevens', 'Patricia Nguyen', 'Robert Moore', 'James Holloway, CEO'],
      absentees: ['Thomas Grant'],
      agendaItems: ['CEO Report', 'QAPI Annual Report', 'Medical Staff Appointments/Reappointments', 'Financial Review Q1'],
      actionItems: [
        { item: 'Approve Dr. Vasquez reappointment per MEC recommendation', owner: 'Board Secretary', dueDate: new Date(`${y}-03-30`), status: 'COMPLETED' },
      ],
      reportReferences: ['CEO Report', 'QAPI Annual Report', 'Medical Staff MEC Minutes'],
      minutesApprovedDate: new Date(`${y}-04-19`),
      nextMeetingDate: new Date(`${y}-06-21`),
    },
  });

  console.log('  ✅ Seeded 4 governance documents, 2 committee meetings');

  // ─── WORKFORCE HEALTH ─────────────────────────────────────────────────────
  console.log('\n🩺 Seeding employee health records...');

  const empHealthData = [
    { id: `${facility.id}-eh-001`, employeeId: 'EMP-101', employeeName: 'Maria Santos, RN', department: 'Acute Inpatient', hireDate: new Date(`${y-3}-03-01`), tbScreenDate: new Date(`${y}-01-10`), tbMethod: 'IGRA', tbResult: 'Negative', tbNextDueDate: new Date(`${y+1}-01-10`), fluVaxDate: new Date(`${y-1}-10-15`), fluVaxSeason: `${y-1}-${y}`, fluVaxDeclined: false, covidVaxStatus: 'Fully vaccinated + boosted', bgCheckDate: new Date(`${y-3}-02-15`), licenseVerified: true, fitTestDate: new Date(`${y}-01-10`), fitTestResult: 'PASS', fitTestModel: '3M 1860 N95' },
    { id: `${facility.id}-eh-002`, employeeId: 'EMP-102', employeeName: 'Darnell Williams, MHT', department: 'Acute Inpatient', hireDate: new Date(`${y-2}-08-15`), tbScreenDate: new Date(`${y}-01-12`), tbMethod: 'TST', tbResult: 'Negative', tbNextDueDate: new Date(`${y+1}-01-12`), fluVaxDate: new Date(`${y-1}-10-20`), fluVaxSeason: `${y-1}-${y}`, fluVaxDeclined: false, covidVaxStatus: 'Fully vaccinated', bgCheckDate: new Date(`${y-2}-08-01`), licenseVerified: false, fitTestDate: new Date(`${y}-01-12`), fitTestResult: 'PASS', fitTestModel: '3M 8210 N95' },
    { id: `${facility.id}-eh-003`, employeeId: 'EMP-103', employeeName: 'Takeshi Yamamoto, LCSW', department: 'Clinical', hireDate: new Date(`${y-5}-06-01`), tbScreenDate: new Date(`${y-1}-01-08`), tbMethod: 'IGRA', tbResult: 'Negative', tbNextDueDate: new Date(`${y}-01-08`), fluVaxDate: null, fluVaxSeason: null, fluVaxDeclined: true, fluDeclineReason: 'Religious exemption filed', covidVaxStatus: 'Exemption on file', bgCheckDate: new Date(`${y-5}-05-15`), licenseVerified: true, notes: 'TB screening was due 01/08 — OVERDUE. Schedule immediately.' },
    { id: `${facility.id}-eh-004`, employeeId: 'EMP-001', employeeName: 'James Holloway, CEO', department: 'Administration', hireDate: new Date(`${y-7}-01-01`), tbScreenDate: new Date(`${y}-02-01`), tbMethod: 'IGRA', tbResult: 'Negative', tbNextDueDate: new Date(`${y+1}-02-01`), fluVaxDate: new Date(`${y-1}-10-05`), fluVaxSeason: `${y-1}-${y}`, fluVaxDeclined: false, covidVaxStatus: 'Fully vaccinated + boosted', bgCheckDate: new Date(`${y-7}-12-01`), licenseVerified: false },
  ];

  for (const eh of empHealthData) {
    await prisma.employeeHealthRecord.upsert({ where: { id: eh.id }, update: {}, create: { ...eh, facilityId: facility.id } });
  }

  // OSHA 300 Log
  await prisma.oshaLog.upsert({
    where: { id: `${facility.id}-osha-001` },
    update: {},
    create: {
      id: `${facility.id}-osha-001`,
      facilityId: facility.id,
      caseNumber: `OSHA-300-${y}-001`,
      caseYear: y,
      injuryDate: new Date(`${y}-03-02`),
      employeeName: 'Darnell Williams, MHT',
      jobTitle: 'Mental Health Technician',
      department: 'Acute Inpatient',
      injuryType: 'PATIENT_ASSAULT' as const,
      bodyPart: 'Face (above left eyebrow)',
      description: 'Employee was struck in the face by an acutely agitated patient during de-escalation attempt in the Day Room. 1.5cm laceration sustained; sutured in ED.',
      daysAway: 2,
      daysRestriction: 5,
      recordable: true,
      privacyCase: false,
      outcome: 'DAYS_AWAY' as const,
      rootCause: 'Insufficient staffing ratio during high-acuity patient de-escalation event. CPI training refresher needed for staff.',
      correctiveAction: 'CPI refresher scheduled for all unit staff. Staffing ratio policy reviewed and updated for high-acuity situations.',
    },
  });

  console.log('  ✅ Seeded 4 employee health records, 1 OSHA 300 log entry');

  // ─── DISCHARGE PLANNING ───────────────────────────────────────────────────
  console.log('\n🏠 Seeding discharge plans...');

  const dischargePlans = [
    {
      id: `${facility.id}-dp-001`,
      patientInitials: 'A.B.',
      admitDate: new Date(`${y}-03-10`),
      unit: 'Acute Inpatient Unit A',
      assessmentStartDate: new Date(`${y}-03-10`),
      assessmentBy: 'Priya Nair, RN',
      expectedDisposition: 'HOME_WITH_SERVICES' as const,
      estimatedDischargeDate: new Date(`${y}-03-24`),
      primaryDx: 'Major Depressive Disorder with SI (F32.2)',
      careCoordinator: 'Takeshi Yamamoto, LCSW',
      familyInvolved: true,
      barrierNotes: 'Transportation barrier — patient does not drive. Identified family member willing to transport.',
      moonRequired: false,
      actualDischargeDate: new Date(`${y}-03-23`),
      actualDisposition: 'HOME_WITH_SERVICES' as const,
      referralsSent: ['Outpatient CBT therapist (Dr. R. Chen)', 'Psychiatrist follow-up (Dr. Vasquez telehealth)', 'Crisis line handout given'],
      transitionCareNote: true,
      followUpCall1Date: new Date(`${y}-03-25`),
      followUpCall1By: 'Takeshi Yamamoto, LCSW',
      followUpCall1Notes: 'Patient at home; feeling stable. Confirmed therapy appointment for 3/28.',
      followUpResult: 'Successful transition. Patient engaged with outpatient care.',
      status: 'DISCHARGED' as const,
    },
    {
      id: `${facility.id}-dp-002`,
      patientInitials: 'K.M.',
      admitDate: new Date(`${y}-02-14`),
      unit: 'Acute Inpatient Unit B',
      assessmentStartDate: new Date(`${y}-02-14`),
      assessmentBy: 'Carmen Reyes, LPN',
      expectedDisposition: 'RESIDENTIAL_TREATMENT' as const,
      estimatedDischargeDate: new Date(`${y}-03-05`),
      primaryDx: 'Schizoaffective Disorder, Bipolar Type (F25.0)',
      careCoordinator: 'Takeshi Yamamoto, LCSW',
      familyInvolved: false,
      barrierNotes: 'No family support. Homeless at time of admission. Court-ordered (ITA) — discharge requires judge approval.',
      moonRequired: true,
      moonIssuedDate: new Date(`${y}-02-22`),
      referralsSent: ['Arizona Behavioral Health Authority residential referral', 'ACT Team referral'],
      transitionCareNote: false,
      status: 'ACTIVE' as const,
    },
  ];

  for (const dp of dischargePlans) {
    await prisma.dischargePlan.upsert({ where: { id: dp.id }, update: {}, create: { ...dp, facilityId: facility.id } });
  }

  console.log('  ✅ Seeded 2 discharge plans');

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
