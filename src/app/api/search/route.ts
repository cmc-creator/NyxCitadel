import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId as string;
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const search = { contains: q, mode: 'insensitive' as const };

  const [policies, training, incidents, caps, grievances, surveys, iriad, rca, qoc, risks, docs, calEvents,
    providers, hipaaBreaches, governanceDocs, employeeHealth, oshaEntries, treatmentPlans, dischargePlans, restraintEvents
  ] = await Promise.all([
    // Policies
    prisma.policy.findMany({
      where: { facilityId, OR: [{ title: search }, { summary: search }, { policyNumber: search }] },
      select: { id: true, title: true, policyNumber: true, status: true, category: true },
      take: 5,
    }),
    // Training
    prisma.trainingRecord.findMany({
      where: { facilityId, OR: [{ trainingName: search }, { staffName: search }, { department: search }] },
      select: { id: true, trainingName: true, staffName: true, status: true },
      take: 5,
    }),
    // Incidents
    prisma.incident.findMany({
      where: { facilityId, OR: [{ description: search }, { incidentNumber: search }, { location: search }] },
      select: { id: true, incidentNumber: true, incidentType: true, severity: true, status: true },
      take: 5,
    }),
    // CAPs
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, OR: [{ title: search }, { capNumber: search }, { description: search }] },
      select: { id: true, capNumber: true, title: true, status: true, priority: true },
      take: 5,
    }),
    // Grievances
    prisma.grievanceRecord.findMany({
      where: { facilityId, OR: [{ grievanceNumber: search }, { summary: search }, { complainantName: search }, { patientName: search }] },
      select: { id: true, grievanceNumber: true, complainantName: true, status: true, category: true },
      take: 5,
    }),
    // Surveys
    prisma.survey.findMany({
      where: { facilityId, OR: [{ notes: search }, { outcome: search }, { surveyorNames: search }] },
      select: { id: true, surveyType: true, regulatoryBody: true, status: true, conductedDate: true },
      take: 5,
    }),
    // IR/IAD
    prisma.incidentReport.findMany({
      where: { facilityId, OR: [{ irNumber: search }, { briefDescription: search }, { patientName: search }] },
      select: { id: true, irNumber: true, incidentType: true, severity: true, status: true },
      take: 5,
    }),
    // RCA
    prisma.rootCauseAnalysis.findMany({
      where: { facilityId, OR: [{ rcaNumber: search }, { eventDescription: search }] },
      select: { id: true, rcaNumber: true, eventType: true, status: true, eventDate: true },
      take: 5,
    }),
    // QOC
    prisma.qocComplaint.findMany({
      where: { facilityId, OR: [{ qocNumber: search }, { allegationSummary: search }] },
      select: { id: true, qocNumber: true, status: true, dateReceived: true },
      take: 5,
    }),
    // Risk Assessments
    prisma.riskAssessment.findMany({
      where: { facilityId, OR: [{ title: search }, { scope: search }, { summary: search }] },
      select: { id: true, title: true, assessmentType: true, status: true },
      take: 5,
    }),
    // Documents
    prisma.document.findMany({
      where: { facilityId, OR: [{ name: search }, { description: search }, { category: search }] },
      select: { id: true, name: true, category: true, fileUrl: true },
      take: 5,
    }),
    // Calendar events
    prisma.calendarEvent.findMany({
      where: { facilityId, OR: [{ title: search }, { description: search }, { notes: search }] },
      select: { id: true, title: true, category: true, status: true, dueDate: true },
      take: 5,
    }),
    // Providers (credentialing)
    prisma.provider.findMany({
      where: { facilityId, OR: [{ firstName: search }, { lastName: search }, { npi: search }, { specialty: search }] },
      select: { id: true, firstName: true, lastName: true, specialty: true, status: true },
      take: 5,
    }),
    // HIPAA Breaches
    prisma.hipaaBreachLog.findMany({
      where: { facilityId, OR: [{ incidentNumber: search }, { description: search }] },
      select: { id: true, incidentNumber: true, discoveryDate: true, status: true },
      take: 5,
    }),
    // Governance Documents
    prisma.governanceDocument.findMany({
      where: { facilityId, OR: [{ title: search }, { approvedBy: search }] },
      select: { id: true, title: true, docType: true, status: true },
      take: 5,
    }),
    // Employee Health
    prisma.employeeHealthRecord.findMany({
      where: { facilityId, OR: [{ employeeName: search }, { department: search }] },
      select: { id: true, employeeName: true, department: true, tbResult: true },
      take: 5,
    }),
    // OSHA Log
    prisma.oshaLog.findMany({
      where: { facilityId, OR: [{ caseNumber: search }, { employeeName: search }] },
      select: { id: true, caseNumber: true, employeeName: true, injuryType: true, recordable: true },
      take: 5,
    }),
    // Treatment Plans
    prisma.treatmentPlan.findMany({
      where: { facilityId, OR: [{ patientInitials: search }, { primaryDx: search }, { unit: search }] },
      select: { id: true, patientInitials: true, primaryDx: true, status: true },
      take: 5,
    }),
    // Discharge Plans
    prisma.dischargePlan.findMany({
      where: { facilityId, OR: [{ patientInitials: search }, { unit: search }] },
      select: { id: true, patientInitials: true, expectedDisposition: true, status: true },
      take: 5,
    }),
    // Restraint Events
    prisma.restraintEvent.findMany({
      where: { facilityId, OR: [{ eventNumber: search }, { patientInitials: search }, { unit: search }] },
      select: { id: true, eventNumber: true, patientInitials: true, status: true, deathOccurred: true },
      take: 5,
    }),
  ]);

  const results: ResultGroup[] = [];

  if (calEvents.length) results.push({
    label: 'Compliance Calendar',
    icon: 'calendar',
    items: calEvents.map(e => ({
      id: e.id,
      href: `/calendar/${e.id}`,
      title: e.title,
      meta: `${e.category.replace(/_/g, ' ')} · ${e.status} · ${e.dueDate ? new Date(e.dueDate).toLocaleDateString() : ''}`,
    })),
  });

  if (policies.length) results.push({
    label: 'Policies & Procedures',
    icon: 'policy',
    items: policies.map(p => ({
      id: p.id,
      href: `/trackers/policies/${p.id}`,
      title: p.title,
      meta: `${p.policyNumber} · ${p.category.replace(/_/g, ' ')} · ${p.status}`,
    })),
  });

  if (training.length) results.push({
    label: 'Training Records',
    icon: 'training',
    items: training.map(t => ({
      id: t.id,
      href: `/trackers/training/${t.id}`,
      title: t.trainingName,
      meta: `${t.staffName} · ${t.status}`,
    })),
  });

  if (incidents.length) results.push({
    label: 'Incidents',
    icon: 'incident',
    items: incidents.map(i => ({
      id: i.id,
      href: `/trackers/incidents/${i.id}`,
      title: `${i.incidentNumber} — ${i.incidentType.replace(/_/g, ' ')}`,
      meta: `${i.severity} · ${i.status}`,
    })),
  });

  if (caps.length) results.push({
    label: 'Corrective Action Plans',
    icon: 'cap',
    items: caps.map(c => ({
      id: c.id,
      href: `/trackers/caps/${c.id}`,
      title: `${c.capNumber} — ${c.title}`,
      meta: `${c.priority} · ${c.status}`,
    })),
  });

  if (grievances.length) results.push({
    label: 'Patient Grievances',
    icon: 'grievance',
    items: grievances.map(g => ({
      id: g.id,
      href: `/trackers/grievances/${g.id}`,
      title: `${g.grievanceNumber} — ${g.complainantName}`,
      meta: `${g.category.replace(/_/g, ' ')} · ${g.status}`,
    })),
  });

  if (surveys.length) results.push({
    label: 'Surveys & Inspections',
    icon: 'survey',
    items: surveys.map(s => ({
      id: s.id,
      href: `/surveys/${s.id}`,
      title: `${s.surveyType.replace(/_/g, ' ')} — ${s.regulatoryBody.replace(/_/g, ' ')}`,
      meta: `${s.status}${s.conductedDate ? ` · ${new Date(s.conductedDate).toLocaleDateString()}` : ''}`,
    })),
  });

  if (iriad.length) results.push({
    label: 'IR / IAD Incidents',
    icon: 'iriad',
    items: iriad.map(i => ({
      id: i.id,
      href: `/trackers/ir-iad/${i.id}`,
      title: `${i.irNumber} — ${i.incidentType.replace(/_/g, ' ')}`,
      meta: `${i.severity} · ${i.status}`,
    })),
  });

  if (rca.length) results.push({
    label: 'Root Cause Analyses',
    icon: 'rca',
    items: rca.map(r => ({
      id: r.id,
      href: `/trackers/rca/${r.id}`,
      title: `${r.rcaNumber} — ${r.eventType}`,
      meta: `${r.status}${r.eventDate ? ` · ${new Date(r.eventDate).toLocaleDateString()}` : ''}`,
    })),
  });

  if (qoc.length) results.push({
    label: 'QOC / LOI Complaints',
    icon: 'qoc',
    items: qoc.map(q => ({
      id: q.id,
      href: `/trackers/qoc/${q.id}`,
      title: q.qocNumber,
      meta: `${q.status} · Received ${new Date(q.dateReceived).toLocaleDateString()}`,
    })),
  });

  if (risks.length) results.push({
    label: 'Risk Assessments',
    icon: 'risk',
    items: risks.map(r => ({
      id: r.id,
      href: `/trackers/risk-assessments/${r.id}`,
      title: r.title,
      meta: `${r.assessmentType.replace(/_/g, ' ')} · ${r.status}`,
    })),
  });

  if (docs.length) results.push({
    label: 'Documents',
    icon: 'doc',
    items: docs.map(d => ({
      id: d.id,
      href: `/documents`,
      title: d.name,
      meta: d.category,
    })),
  });

  if (providers.length) results.push({
    label: 'Providers (Credentialing)',
    icon: 'provider',
    items: providers.map(p => ({
      id: p.id,
      href: `/credentialing/providers`,
      title: `${p.firstName} ${p.lastName}`,
      meta: `${p.specialty ?? 'Provider'} · ${p.status}`,
    })),
  });

  if (hipaaBreaches.length) results.push({
    label: 'HIPAA Breaches',
    icon: 'hipaa',
    items: hipaaBreaches.map(b => ({
      id: b.id,
      href: `/hipaa/breaches`,
      title: b.incidentNumber,
      meta: `${b.status} · ${new Date(b.discoveryDate).toLocaleDateString()}`,
    })),
  });

  if (governanceDocs.length) results.push({
    label: 'Governance Documents',
    icon: 'governance',
    items: governanceDocs.map(g => ({
      id: g.id,
      href: `/governance/documents`,
      title: g.title,
      meta: `${g.docType} · ${g.status}`,
    })),
  });

  if (employeeHealth.length) results.push({
    label: 'Employee Health',
    icon: 'health',
    items: employeeHealth.map(e => ({
      id: e.id,
      href: `/workforce-health/employee-health`,
      title: e.employeeName,
      meta: `${e.department ?? 'Staff'} · TB: ${e.tbResult ?? 'Not recorded'}`,
    })),
  });

  if (oshaEntries.length) results.push({
    label: 'OSHA 300 Log',
    icon: 'osha',
    items: oshaEntries.map(o => ({
      id: o.id,
      href: `/workforce-health/osha`,
      title: `${o.caseNumber} — ${o.employeeName}`,
      meta: `${o.injuryType ?? 'Injury'} · ${o.recordable ? 'Recordable' : 'Non-recordable'}`,
    })),
  });

  if (treatmentPlans.length) results.push({
    label: 'Treatment Plans',
    icon: 'treatment',
    items: treatmentPlans.map(t => ({
      id: t.id,
      href: `/treatment-plans`,
      title: `${t.patientInitials} — ${t.primaryDx ?? 'No Dx'}`,
      meta: t.status,
    })),
  });

  if (dischargePlans.length) results.push({
    label: 'Discharge Plans',
    icon: 'discharge',
    items: dischargePlans.map(d => ({
      id: d.id,
      href: `/discharge-planning`,
      title: `${d.patientInitials} — ${d.expectedDisposition ?? 'TBD'}`,
      meta: d.status,
    })),
  });

  if (restraintEvents.length) results.push({
    label: 'Restraint / Seclusion Events',
    icon: 'restraint',
    items: restraintEvents.map(r => ({
      id: r.id,
      href: `/restraint-seclusion`,
      title: `${r.eventNumber} — ${r.patientInitials}`,
      meta: `${r.status}${r.deathOccurred ? ' · DEATH REPORTED' : ''}`,
    })),
  });

  return NextResponse.json({ results, query: q, total: results.reduce((s, g) => s + g.items.length, 0) });
}

interface ResultGroup {
  label: string;
  icon: string;
  items: { id: string; href: string; title: string; meta: string }[];
}
