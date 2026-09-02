import { PrismaClient } from '@prisma/client';
import pkg from 'bcryptjs';
const { hash } = pkg;

// Usage:
//   node --env-file=.env.local scripts/reset-admin-password.mjs <email> <newpassword>
//   node --env-file=.env.local scripts/reset-admin-password.mjs <newpassword>
//     (defaults email to admin@example.com, or ADMIN_EMAIL env)
const args = process.argv.slice(2);
let email = process.env.ADMIN_EMAIL || 'admin@example.com';
let newPassword = args[0];

if (args.length >= 2) {
  email = args[0];
  newPassword = args[1];
}

if (!newPassword || newPassword.length < 8) {
  console.error('Usage: node --env-file=.env.local scripts/reset-admin-password.mjs <email> <newpassword>');
  console.error('   or: node --env-file=.env.local scripts/reset-admin-password.mjs <newpassword>');
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const p = new PrismaClient();
const passwordHash = await hash(newPassword, 12);

try {
  const updated = await p.user.update({
    where: { email },
    data: { passwordHash },
    select: { email: true, role: true, isActive: true },
  });

  console.log('Password reset successfully for:', updated.email);
  console.log('Role:', updated.role, '| Active:', updated.isActive);
} catch (err) {
  console.error(`Failed to reset password for ${email}:`, err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await p.$disconnect();
}
