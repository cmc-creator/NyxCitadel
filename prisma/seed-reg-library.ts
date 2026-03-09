/**
 * Regulatory Reference Library Seeder
 *
 * Populates the `regulatory_references` table from the TypeScript compliance
 * library files in src/lib/compliance/.
 *
 * Run with:
 *   npx tsx prisma/seed-reg-library.ts
 *
 * Safe to re-run — uses upsert on refId so existing entries are updated
 * rather than duplicated.  Custom (isBuiltIn=false) entries are never touched.
 *
 * After updating any compliance/*.ts file, re-run this script so the DB
 * reflects the latest canonical regulation text.
 */

import { PrismaClient } from '@prisma/client';
import { allComplianceRequirements } from '../src/lib/compliance/index';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📚 Seeding Regulatory Reference Library...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const req of allComplianceRequirements) {
    try {
      const result = await prisma.regulatoryReference.upsert({
        where: { refId: req.id },
        update: {
          // Update core fields in case the TS library was corrected
          title:          req.title,
          description:    req.description,
          standardRef:    req.standardRef,
          regulatoryBody: req.regulatoryBody?.toString() ?? 'OTHER',
          category:       req.category?.toString() ?? 'OTHER',
          frequency:      req.frequency?.toString() ?? 'AS_NEEDED',
          priority:       req.priority?.toString() ?? 'MEDIUM',
          responsibleRole:req.responsibleRole ?? null,
          months:         req.month ?? [],
          // NOTE: notes, sourceUrl, lastVerified are NOT overwritten on update
          // so manual annotations are preserved. Set them to the TS value only
          // on initial create (handled in create block below).
        },
        create: {
          refId:          req.id,
          title:          req.title,
          description:    req.description,
          standardRef:    req.standardRef,
          regulatoryBody: req.regulatoryBody?.toString() ?? 'OTHER',
          category:       req.category?.toString() ?? 'OTHER',
          frequency:      req.frequency?.toString() ?? 'AS_NEEDED',
          priority:       req.priority?.toString() ?? 'MEDIUM',
          responsibleRole:req.responsibleRole ?? null,
          notes:          req.notes ?? null,
          sourceUrl:      null,
          lastVerified:   null,
          months:         req.month ?? [],
          isBuiltIn:      true,
          facilityId:     null,
        },
      });

      if (result.createdAt === result.updatedAt) {
        created++;
      } else {
        updated++;
      }
    } catch {
      console.warn(`  ⚠️  Skipped ${req.id} — ${req.title.slice(0, 50)}`);
      skipped++;
    }
  }

  console.log(`  ✅ Created: ${created}`);
  console.log(`  🔄 Updated: ${updated}`);
  if (skipped) console.log(`  ⚠️  Skipped: ${skipped}`);

  const total = await prisma.regulatoryReference.count({ where: { isBuiltIn: true } });
  console.log(`\n📊 Total built-in entries in DB: ${total}`);
  console.log('\n✅ Regulatory Reference Library seed complete!\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
