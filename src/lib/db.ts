import { PrismaClient } from "@prisma/client";

// Standard Node.js Prisma singleton (Railway). Direct connection to MongoDB
// Atlas via DATABASE_URL — no edge adapter, no Accelerate. A single client is
// reused across hot reloads in dev to avoid exhausting connections.

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

export const prisma =
  global.cachedPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.cachedPrisma = prisma;
}
