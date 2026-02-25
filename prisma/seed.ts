/**
 * NyxCitadel Database Seed Script
 * Seeds Destiny Springs Healthcare (AZ acute psychiatric) as the demo facility
 *
 * Run with: npm run db:seed
 */

import { PrismaClient, UserRole, FacilityType } from '@prisma/client';
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
