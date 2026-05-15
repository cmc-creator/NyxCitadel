import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const users = await p.user.findMany({
  select: { email: true, passwordHash: true, isActive: true, role: true },
});

for (const u of users) {
  console.log('---');
  console.log('email:', u.email);
  console.log('role:', u.role);
  console.log('isActive:', u.isActive);
  console.log('hasHash:', !!u.passwordHash);
  if (u.passwordHash) {
    const prefix = u.passwordHash.substring(0, 7);
    console.log('hash prefix:', prefix, '(valid if $2b$10 or $2a$10)');
  }
}

await p.$disconnect();
