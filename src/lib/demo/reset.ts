import {
  DrillStatus,
  DrillType,
  IrIncidentType,
  IrSeverity,
  Priority,
  TrainingCategory,
  TrainingStatus,
} from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { applyQuickStartTemplates } from '@/lib/quick-start-templates';

function irNumber(prefix: string, sequence: number): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${stamp}-${String(sequence).padStart(3, '0')}`;
}

export async function resetFacilityDemoData(facilityId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.drillAction.deleteMany({ where: { facilityId } });
    await tx.drillKillTask.deleteMany({ where: { facilityId } });
    await tx.drillMusterEntry.deleteMany({ where: { facilityId } });

    await tx.notification.deleteMany({ where: { facilityId } });
    await tx.incidentReport.deleteMany({ where: { facilityId } });
    await tx.incident.deleteMany({ where: { facilityId } });
    await tx.rootCauseAnalysis.deleteMany({ where: { facilityId } });
    await tx.grievanceRecord.deleteMany({ where: { facilityId } });
    await tx.trainingRecord.deleteMany({ where: { facilityId } });
    await tx.hipaaBreachLog.deleteMany({ where: { facilityId } });
    await tx.controlledSubstanceLog.deleteMany({ where: { facilityId } });
    await tx.survey.deleteMany({ where: { facilityId } });
    await tx.drill.deleteMany({ where: { facilityId } });
    await tx.calendarEvent.deleteMany({ where: { facilityId } });
    await tx.policy.deleteMany({ where: { facilityId } });
    await tx.correctiveActionPlan.deleteMany({ where: { facilityId } });
  });

  const templates = await applyQuickStartTemplates(facilityId);

  const now = new Date();
  const incidentRows = [
    {
      facilityId,
      irNumber: irNumber('IR', 1),
      incidentDate: subDays(now, 21),
      incidentType: IrIncidentType.MEDICATION_ERROR,
      severity: IrSeverity.MODERATE,
      location: 'Adult Unit A',
      briefDescription: 'Medication administration variance identified during routine MAR reconciliation.',
      immediateActions: 'Patient assessed, attending notified, and pharmacy review initiated.',
      status: 'INVESTIGATING' as const,
      aiTriageSeverity: 'HIGH',
    },
    {
      facilityId,
      irNumber: irNumber('IR', 2),
      incidentDate: subDays(now, 11),
      incidentType: IrIncidentType.PATIENT_FALL,
      severity: IrSeverity.MINOR,
      location: 'Hallway near nurse station',
      briefDescription: 'Observed assisted fall with no injury requiring external transfer.',
      immediateActions: 'Neuro checks initiated and environmental hazard review documented.',
      status: 'PENDING_REVIEW' as const,
      aiTriageSeverity: 'MODERATE',
    },
    {
      facilityId,
      irNumber: irNumber('IR', 3),
      incidentDate: subDays(now, 4),
      incidentType: IrIncidentType.SENTINEL_EVENT,
      severity: IrSeverity.SENTINEL,
      location: 'Seclusion Room 2',
      briefDescription: 'High-risk self-harm attempt interrupted by rapid response protocol.',
      immediateActions: 'Emergency response, leadership notification, and RCA trigger initiated.',
      status: 'OPEN' as const,
      aiTriageSeverity: 'CRITICAL',
    },
  ];

  const trainingRows = [
    {
      facilityId,
      staffName: 'Jordan Hayes',
      trainingName: 'Annual CPI De-Escalation Refresher',
      category: TrainingCategory.CPI_DE_ESCALATION,
      status: TrainingStatus.COMPLETED,
      isRequired: true,
      completedDate: subDays(now, 16),
      expiryDate: addDays(now, 349),
      score: 94,
    },
    {
      facilityId,
      staffName: 'Maya Patel',
      trainingName: 'HIPAA Privacy Refresher',
      category: TrainingCategory.HIPAA_PRIVACY,
      status: TrainingStatus.COMPLETED,
      isRequired: true,
      completedDate: subDays(now, 8),
      expiryDate: addDays(now, 357),
      score: 98,
    },
    {
      facilityId,
      staffName: 'Alex Chen',
      trainingName: 'Fire Safety and Evacuation Competency',
      category: TrainingCategory.FIRE_SAFETY,
      status: TrainingStatus.OVERDUE,
      isRequired: true,
      expiryDate: subDays(now, 3),
    },
  ];

  const drillRows = [
    {
      facilityId,
      drillName: 'Code Silver Tabletop - Behavioral Health Wing',
      drillType: DrillType.TABLETOP,
      scheduledDate: addDays(now, 9),
      status: DrillStatus.SCHEDULED,
      location: 'Conference Room B',
      scenario: 'Escalating threat response and communication cascade validation.',
      objectives: 'Validate command structure and response handoffs in under 5 minutes.',
      participantCount: 14,
      observer: 'Quality Lead',
      priority: Priority.HIGH,
    },
    {
      facilityId,
      drillName: 'Fire Evacuation Drill - Evening Shift',
      drillType: DrillType.FIRE_EVACUATION,
      scheduledDate: subDays(now, 12),
      conductedDate: subDays(now, 12),
      status: DrillStatus.COMPLETED,
      location: 'South Wing',
      scenario: 'Smoke condition in utility corridor requiring partial unit evacuation.',
      objectives: 'Complete evacuation and muster accountability under 7 minutes.',
      participantCount: 22,
      observer: 'EM Coordinator',
      strengths: 'Rapid patient triage and clear runner communication.',
      improvements: 'Need faster accountability check-ins for agency staff.',
      aarGeneratedAt: subDays(now, 11),
      priority: Priority.MEDIUM,
    },
  ];

  const [incidents, trainings, drills] = await Promise.all([
    prisma.incidentReport.createMany({ data: incidentRows }),
    prisma.trainingRecord.createMany({ data: trainingRows }),
    prisma.drill.createMany({ data: drillRows.map(({ priority, ...drill }) => drill) }),
  ]);

  return {
    templates,
    incidentsCreated: incidents.count,
    trainingsCreated: trainings.count,
    drillsCreated: drills.count,
  };
}
