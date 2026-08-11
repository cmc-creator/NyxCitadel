/**
 * Quick-Start Templates
 * Pre-built compliance data templates for new facilities.
 * Call `applyQuickStartTemplates(facilityId)` from the setup wizard or API.
 */
import { prisma } from '@/lib/prisma';
import {
  EventCategory,
  EventStatus,
  CapSource,
  CapStatus,
  PolicyCategory,
  PolicyStatus,
  Priority,
} from '@prisma/client';
import { addDays, addMonths, setMonth, setDate, setYear } from 'date-fns';
import type { Prisma } from '@prisma/client';

// ─── Calendar Events ──────────────────────────────────────────────────────────
function buildCalendarTemplates(facilityId: string): Prisma.CalendarEventCreateManyInput[] {
  const now = new Date();
  const year = now.getFullYear();

  const date = (month: number, day: number, offsetYear = 0) =>
    setDate(setMonth(setYear(new Date(), year + offsetYear), month - 1), day);

  return [
    // CMS / Survey
    { facilityId, title: 'CMS Mock Survey - Internal Prep', dueDate: addDays(now, 60), category: EventCategory.CMS_MOCK_SURVEY, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Self-assessment survey simulation to identify gaps before state visit.' },
    { facilityId, title: 'ADHS Annual Licensing Renewal', dueDate: date(10, 1), category: EventCategory.AZ_LICENSE_RENEWAL, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Arizona ADHS facility license renewal submission deadline.' },
    // QAPI
    { facilityId, title: 'QAPI Committee Meeting - Q1', dueDate: date(3, 15), category: EventCategory.QAPI_MEETING, priority: Priority.MEDIUM, status: EventStatus.UPCOMING, description: 'Quarterly QAPI committee review.' },
    { facilityId, title: 'QAPI Committee Meeting - Q2', dueDate: date(6, 15), category: EventCategory.QAPI_MEETING, priority: Priority.MEDIUM, status: EventStatus.UPCOMING, description: 'Quarterly QAPI committee review.' },
    { facilityId, title: 'QAPI Committee Meeting - Q3', dueDate: date(9, 15), category: EventCategory.QAPI_MEETING, priority: Priority.MEDIUM, status: EventStatus.UPCOMING, description: 'Quarterly QAPI committee review.' },
    { facilityId, title: 'QAPI Committee Meeting - Q4', dueDate: date(12, 15), category: EventCategory.QAPI_MEETING, priority: Priority.MEDIUM, status: EventStatus.UPCOMING, description: 'Quarterly QAPI committee review.' },
    // Training
    { facilityId, title: 'Annual Staff Competency Reviews', dueDate: date(9, 30), category: EventCategory.STAFF_TRAINING, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Annual clinical competency validation for all direct-care staff.' },
    { facilityId, title: 'CPR / First Aid Recertification', dueDate: date(6, 30), category: EventCategory.STAFF_TRAINING, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'BLS recertification for clinical staff. 100% compliance required.' },
    { facilityId, title: 'HIPAA & Privacy Training - Annual', dueDate: date(3, 31), category: EventCategory.STAFF_TRAINING, priority: Priority.MEDIUM, status: EventStatus.UPCOMING, description: 'Annual HIPAA workforce training per 45 CFR 164.530(b).' },
    // EM / Drills
    { facilityId, title: 'Fire Evacuation Drill - Jan', dueDate: date(1, 28), category: EventCategory.FULL_SCALE_DRILL, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Monthly fire evacuation drill - P.M. shift.' },
    { facilityId, title: 'Fire Evacuation Drill - Apr', dueDate: date(4, 28), category: EventCategory.FULL_SCALE_DRILL, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Monthly fire evacuation drill - A.M. shift.' },
    { facilityId, title: 'Fire Evacuation Drill - Jul', dueDate: date(7, 28), category: EventCategory.FULL_SCALE_DRILL, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Monthly fire evacuation drill - P.M. shift.' },
    { facilityId, title: 'Fire Evacuation Drill - Oct', dueDate: date(10, 28), category: EventCategory.FULL_SCALE_DRILL, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Monthly fire evacuation drill - A.M. shift.' },
    { facilityId, title: 'Tabletop Exercise - Emergency Preparedness', dueDate: date(5, 15), category: EventCategory.TABLETOP_EXERCISE, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Annual tabletop exercise per JC EM.03.01.03.' },
    // Policy reviews
    { facilityId, title: 'Patient Rights Policies - Annual Review', dueDate: addDays(now, 90), category: EventCategory.CMS_CONDITIONS_REVIEW, priority: Priority.MEDIUM, status: EventStatus.UPCOMING, description: 'Annual review of Patient Rights policy set per CMS §482.13.' },
    { facilityId, title: 'Infection Control Program Review', dueDate: date(11, 1), category: EventCategory.CMS_CONDITIONS_REVIEW, priority: Priority.MEDIUM, status: EventStatus.UPCOMING, description: 'Annual IC program evaluation and ICRA update.' },
    { facilityId, title: 'Emergency Operations Plan (EOP) Review', dueDate: date(2, 1), category: EventCategory.CMS_CONDITIONS_REVIEW, priority: Priority.HIGH, status: EventStatus.UPCOMING, description: 'Annual EOP review per CMS CoP §482.15.' },
  ];
}

// ─── Policies ─────────────────────────────────────────────────────────────────
function buildPolicyTemplates(facilityId: string): Prisma.PolicyCreateManyInput[] {
  const now = new Date();
  const nextReview = addMonths(now, 12);

  return [
    {
      facilityId,
      policyNumber: 'PAT-001',
      title: 'Patient Rights & Responsibilities',
      category: PolicyCategory.PATIENT_RIGHTS,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'Establishes the rights and responsibilities of all patients served, consistent with CMS Conditions of Participation §482.13.',
      nextReviewDate: nextReview,
    },
    {
      facilityId,
      policyNumber: 'HIP-001',
      title: 'HIPAA Privacy & Confidentiality Policy',
      category: PolicyCategory.PRIVACY_SECURITY,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'Governs the use and disclosure of Protected Health Information (PHI) per 45 CFR Parts 160 and 164.',
      nextReviewDate: nextReview,
    },
    {
      facilityId,
      policyNumber: 'EM-001',
      title: 'Emergency Management & Preparedness Plan',
      category: PolicyCategory.EMERGENCY_MANAGEMENT,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'Comprehensive emergency operations plan addressing mitigation, preparedness, response, and recovery per CMS §482.15.',
      nextReviewDate: nextReview,
    },
    {
      facilityId,
      policyNumber: 'IC-001',
      title: 'Infection Prevention & Control Program',
      category: PolicyCategory.INFECTION_CONTROL,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'Infection control and prevention policies per CMS §482.42, including standard precautions, hand hygiene, and outbreak response.',
      nextReviewDate: nextReview,
    },
    {
      facilityId,
      policyNumber: 'RES-001',
      title: 'Restraint & Seclusion Policy',
      category: PolicyCategory.CLINICAL,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'Governs the use of restraint and seclusion as a last resort, consistent with CMS §482.13(e) and state regulations.',
      nextReviewDate: nextReview,
    },
    {
      facilityId,
      policyNumber: 'QA-001',
      title: 'Quality Assessment & Performance Improvement (QAPI)',
      category: PolicyCategory.PERFORMANCE_IMPROVEMENT,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'QAPI program structure, meeting cadence, project tracking, and reporting to the governing body per CMS §482.21.',
      nextReviewDate: nextReview,
    },
    {
      facilityId,
      policyNumber: 'HR-001',
      title: 'Staff Orientation & Competency Validation',
      category: PolicyCategory.HUMAN_RESOURCES,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'Initial and annual competency assessment process for all clinical and support staff per The Joint Commission HR standards.',
      nextReviewDate: nextReview,
    },
    {
      facilityId,
      policyNumber: 'MED-001',
      title: 'Medication Management & Administration',
      category: PolicyCategory.CLINICAL,
      status: PolicyStatus.DRAFT,
      effectiveDate: now,
      summary: 'Safe medication prescribing, dispensing, administration, and monitoring practices per CMS §482.25.',
      nextReviewDate: nextReview,
    },
  ];
}

// ─── CAPs (example survey deficiency starters) ───────────────────────────────
function buildCapTemplates(facilityId: string): Prisma.CorrectiveActionPlanCreateManyInput[] {
  const now = new Date();
  return [
    {
      facilityId,
      capNumber: `CAP-TEMPLATE-001`,
      title: 'Sample CAP: Policy Annual Review Overdue',
      source: CapSource.INTERNAL_AUDIT,
      description: 'One or more facility policies have not received their required annual review.',
      rootCause: 'No automated tracking system in place to alert compliance officer of upcoming review dates.',
      correctionPlan: '1. Audit all policies for review dates. 2. Enter all policies into NyxCitadel policy tracker. 3. Enable review-date alerts in notification settings.',
      targetDate: addDays(now, 30),
      status: CapStatus.OPEN,
      priority: Priority.MEDIUM,
    },
  ];
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function applyQuickStartTemplates(facilityId: string): Promise<{
  calendarEventsCreated: number;
  policiesCreated: number;
  capsCreated: number;
}> {
  const calendarTemplates = buildCalendarTemplates(facilityId);
  const policyTemplates = buildPolicyTemplates(facilityId);
  const capTemplates = buildCapTemplates(facilityId);

  const [calResult, polResult, capResult] = await Promise.all([
    prisma.calendarEvent.createMany({ data: calendarTemplates, skipDuplicates: true }),
    prisma.policy.createMany({ data: policyTemplates, skipDuplicates: true }),
    prisma.correctiveActionPlan.createMany({ data: capTemplates, skipDuplicates: true }),
  ]);

  return {
    calendarEventsCreated: calResult.count,
    policiesCreated: polResult.count,
    capsCreated: capResult.count,
  };
}
