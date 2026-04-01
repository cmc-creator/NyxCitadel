const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "ccooper@destinysprings.com" } });
  if (existing) { console.log("Admin already exists:", existing.id, existing.role); return; }
  const hash = await bcrypt.hash("DSHAdmin2025!", 10);
  const user = await prisma.user.create({ data: { name: "Connie Cooper", email: "ccooper@destinysprings.com", password: hash, role: "ADMIN" } });
  console.log("Created:", user.id, user.email, user.role);
}
main().catch(console.error).finally(() => prisma.$disconnect());
