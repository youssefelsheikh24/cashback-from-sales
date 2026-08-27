import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "sales@cashback.agency").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "CashBack2026!";
  const name = process.env.ADMIN_NAME || "CashBack Sales";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name, role: "sales" },
  });

  console.log("✓ Sales user ready:");
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${password}`);
  console.log("   (Change ADMIN_PASSWORD in .env and re-seed to update.)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
