import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Edge-compatible Prisma via Prisma Accelerate. The client is generated with
// `--no-engine`, so it ships no binary query engine and talks to Accelerate
// over HTTPS (no Node TCP/`pg`) — which is what lets it run on Cloudflare
// Pages/Workers. Accelerate connects to the Supabase Postgres behind the
// scenes; DATABASE_URL is the Accelerate `prisma://` connection.

type AcceleratedClient = ReturnType<typeof createPrisma>;

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  }).$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as {
  prisma?: AcceleratedClient;
};

// Lazy singleton: the client is only constructed on FIRST property access, not
// at import time. This is essential for `next build` — its "collect page data"
// step imports every route in an edge sandbox where no Accelerate URL exists,
// and eager construction there would throw. At real request time (edge, env
// present) the first `prisma.*` access builds and caches the client.
function getClient(): AcceleratedClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrisma();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as AcceleratedClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
