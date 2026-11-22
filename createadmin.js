// One-off bootstrap helper: create the first ADMIN user for a deployment.
// No credentials are stored in this file. Set them in the environment first:
//   CREATE_ADMIN_EMAIL=admin@yourfacility.com
//   CREATE_ADMIN_NAME="Site Administrator"
//   CREATE_ADMIN_PASSWORD=<strong unique password>
//   CREATE_ADMIN_FACILITY_ID=<facility id the admin belongs to> (optional)
// Then run: node createadmin.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
async function main() {
  const email = process.env.CREATE_ADMIN_EMAIL;
  const name = process.env.CREATE_ADMIN_NAME || "Site Administrator";
  const password = process.env.CREATE_ADMIN_PASSWORD;
  const facilityId = process.env.CREATE_ADMIN_FACILITY_ID || undefined;
  if (!email || !password) {
    console.error("Set CREATE_ADMIN_EMAIL and CREATE_ADMIN_PASSWORD in the environment before running this script.");
    process.exit(1);
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { console.log("Admin already exists:", existing.id, existing.role); return; }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash: hash, role: "ADMIN", ...(facilityId ? { facilityId } : {}) } });
  console.log("Created:", user.id, user.email, user.role);
}
main().catch(console.error).finally(() => prisma.$disconnect());
