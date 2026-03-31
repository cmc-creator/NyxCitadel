import { prisma } from '@/lib/prisma';
import { addDays, addMonths } from 'date-fns';

export async function seedSampleDataForFacility(facilityId: string) {
  const now = new Date();
  
  try {
    // Sample compliance calendar events
    await prisma.calendarEvent.createMany({
      data: [
        {
          facilityId,
          title: 'CMS Annual Compliance Survey',
          description: 'Annual survey by state health department',
          dueDate: addDays(now, 45),
          category: 'CMS_MOCK_SURVEY',
          status: 'UPCOMING',
          priority: 'HIGH',
        },
        {
          facilityId,
          title: 'Staff Competency Reviews - Q2',
          description: 'Annual competency validation for clinical staff',
          dueDate: addDays(now, 25),
          category: 'STAFF_TRAINING',
          status: 'UPCOMING',
          priority: 'MEDIUM',
        },
        {
          facilityId,
          title: 'HIPAA Risk Assessment Update',
          description: 'Update facility-wide HIPAA risk assessment per 45 CFR',
          dueDate: addDays(now, 60),
          category: 'CMS_CONDITIONS_REVIEW',
          status: 'UPCOMING',
          priority: 'MEDIUM',
        },
        {
          facilityId,
          title: 'Board Compliance Report - April',
          description: 'Monthly compliance scorecard for board review',
          dueDate: addDays(now, 12),
          category: 'QAPI_MEETING',
          status: 'UPCOMING',
          priority: 'HIGH',
        },
        {
          facilityId,
          title: 'Emergency Drill - Evacuation',
          description: 'Full facility evacuation drill with documentation',
          dueDate: addDays(now, 35),
          category: 'FULL_SCALE_DRILL',
          status: 'UPCOMING',
          priority: 'HIGH',
        },
      ],
      skipDuplicates: true,
    });

    // Sample CAPs (Corrective Action Plans)
    const deficiency1 = await prisma.correctiveActionPlan.create({
      data: {
        facilityId,
        capNumber: `CAP-${facilityId.substring(0, 4).toUpperCase()}-001`,
        title: 'F-835: Inadequate discharge documentation',
        source: 'SURVEY_FINDING',
        sourceRef: 'F-835',
        description: 'Sample CAP for F-835 deficiency found in recent survey',
        rootCause: 'Staff training gap and template not easily accessible in EHR',
        correctionPlan: 'Implement new discharge checklist and conduct staff retraining',
        targetDate: addDays(now, 60),
        status: 'OPEN',
        priority: 'HIGH',
      },
    }).catch(() => null);

    const deficiency2 = await prisma.correctiveActionPlan.create({
      data: {
        facilityId,
        capNumber: `CAP-${facilityId.substring(0, 4).toUpperCase()}-002`,
        title: 'F-801: Admission screening incomplete',
        source: 'SURVEY_FINDING',
        sourceRef: 'F-801',
        description: 'Screening tool not administered within 24 hours for recent admissions',
        rootCause: 'Volume spike coincided with staff turnover',
        correctionPlan: 'Increase screening staff and update admission SOP',
        targetDate: addDays(now, 30),
        status: 'OPEN',
        priority: 'CRITICAL',
      },
    }).catch(() => null);

    // Sample incidents
    await prisma.incidentReport.createMany({
      data: [
        {
          facilityId,
          irNumber: `IR-${facilityId.substring(0, 4).toUpperCase()}-001`,
          incidentDate: addDays(now, -1),
          incidentType: 'PATIENT_FALL',
          briefDescription: 'Patient fell while ambulating from PT to room. No injuries noted.',
          severity: 'MINOR',
          location: 'Hallway - 2nd Floor West',
          adhsReportable: false,
          adhsReported: false,
          status: 'INVESTIGATING',
          iadRequired: false,
          iadSubmitted: false,
        },
        {
          facilityId,
          irNumber: `IR-${facilityId.substring(0, 4).toUpperCase()}-002`,
          incidentDate: addDays(now, -2),
          incidentType: 'MEDICATION_ERROR',
          briefDescription: 'PRN medication administered at double intended dose. Patient monitored closely.',
          severity: 'MODERATE',
          location: 'Med Room - 3rd Floor',
          adhsReportable: false,
          adhsReported: false,
          status: 'CLOSED',
          iadRequired: false,
          iadSubmitted: false,
        },
      ],
      skipDuplicates: true,
    });

    // Sample policies
    await prisma.policy.createMany({
      data: [
        {
          facilityId,
          policyNumber: 'POL-PR-001',
          title: 'Patient Rights and Responsibilities',
          category: 'PATIENT_RIGHTS',
          summary: 'Comprehensive policy on patient rights per CMS conditions of participation',
          effectiveDate: addMonths(now, -1),
          nextReviewDate: addDays(now, 90),
          status: 'ACTIVE',
          owner: 'Compliance Officer',
          version: '2.1',
        },
        {
          facilityId,
          policyNumber: 'POL-IC-001',
          title: 'Infection Prevention and Control',
          category: 'INFECTION_CONTROL',
          summary: 'IPAC procedures including PPE, hand hygiene, and sanitization protocols',
          effectiveDate: addMonths(now, -2),
          nextReviewDate: addDays(now, 120),
          status: 'ACTIVE',
          owner: 'Nursing Director',
          version: '3.0',
        },
        {
          facilityId,
          policyNumber: 'POL-EM-001',
          title: 'Emergency Preparedness Plan',
          category: 'EMERGENCY_MANAGEMENT',
          summary: 'HVA, emergency response procedures, drill schedules',
          effectiveDate: addMonths(now, -6),
          nextReviewDate: addDays(now, 180),
          status: 'ACTIVE',
          owner: 'Emergency Manager',
          version: '1.8',
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✓ Sample data seeded successfully for facility ${facilityId}`);
    return true;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return false;
  }
}

export const SAMPLE_DATA_SEEDED_FLAG = 'sample_data_seeded_v1';
