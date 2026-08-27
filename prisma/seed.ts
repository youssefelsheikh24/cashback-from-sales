import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

// Seeds the sales login directly into MongoDB Atlas via DATABASE_URL.
const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "sales@cashback.agency").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "CashBack2026!";
  const name = process.env.ADMIN_NAME || "CashBack Sales";

  const passwordHash = await hashPassword(password);

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
