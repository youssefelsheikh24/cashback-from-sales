import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { hashPassword } from "../src/lib/password";

// Seed runs locally (Node) and writes through Accelerate, same as the app.
// DATABASE_URL must be the Accelerate `prisma://` URL. Schema/migrations
// (prisma db push) use DIRECT_URL — see .env.example.
const prisma = new PrismaClient().$extends(withAccelerate());

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
