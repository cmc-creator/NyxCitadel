/**
 * NyxCitadel — Clean Seed Script
 *
 * Creates the minimum required data for a tester or new client onboarding:
 *   1. One facility  (configurable via env vars)
 *   2. One admin user (configurable via env vars)
 *
 * NO demo data — no sample incidents, policies, compliance items, drills, etc.
 *
 * Usage:
 *   npm run db:seed:clean
 *
 * Override defaults with environment variables:
 *   SEED_FACILITY_NAME="My Hospital"
 *   SEED_ADMIN_EMAIL="admin@myhospital.com"
 *   SEED_ADMIN_PASSWORD="ChangeMe123!"
 *   SEED_ADMIN_NAME="Site Administrator"
 */

import { PrismaClient, UserRole, FacilityType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Configuration (override with env vars) ────────────────────────────────
  const facilityName  = process.env.SEED_FACILITY_NAME  ?? 'My Healthcare Facility';
  const adminEmail    = process.env.SEED_ADMIN_EMAIL    ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const adminName     = process.env.SEED_ADMIN_NAME     ?? 'System Administrator';

  console.log('\n🌱 NyxCitadel — Clean Seed\n');
  console.log(`  Facility : ${facilityName}`);
  console.log(`  Admin    : ${adminEmail}`);
  console.log('');

  // ── 1. Facility ───────────────────────────────────────────────────────────
  const facility = await prisma.facility.upsert({
    where: { id: 'default-facility' },
    update: { name: facilityName },
    create: {
      id:             'default-facility',
      name:           facilityName,
      shortName:      facilityName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5),
      facilityType:   FacilityType.ACUTE_PSYCH,
      primaryColor:   '#5b21b6',
      secondaryColor: '#8b5cf6',
      isActive:       true,
    },
  });
  console.log(`  ✅ Facility: ${facility.name} [${facility.id}]`);

  // ── 2. Admin user ────────────────────────────────────────────────────────
  const hashedPassword = await hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPassword, name: adminName },
    create: {
      email:        adminEmail,
      name:         adminName,
      passwordHash: hashedPassword,
      role:         UserRole.ADMIN,
      facilityId:   facility.id,
      isActive:     true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log('\n✔  Clean seed complete.');
  console.log('\n  ⚠️  IMPORTANT: Change the admin password after first login.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
