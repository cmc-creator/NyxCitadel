import { PrismaClient } from '@prisma/client';
import pkg from 'bcryptjs';
const { hash } = pkg;

// Usage: node --env-file=.env.local scripts/reset-admin-password.mjs <newpassword>
const newPassword = process.argv[2];
if (!newPassword || newPassword.length < 8) {
  console.error('Usage: node --env-file=.env.local scripts/reset-admin-password.mjs <newpassword>');
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const p = new PrismaClient();
const passwordHash = await hash(newPassword, 12);

const updated = await p.user.update({
  where: { email: 'admin@destinysprings.com' },
  data: { passwordHash },
  select: { email: true, role: true, isActive: true },
});

console.log('Password reset successfully for:', updated.email);
console.log('Role:', updated.role, '| Active:', updated.isActive);

await p.$disconnect();
