import { prisma } from "@/lib/db";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

function randomCode(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Generate a unique, human-friendly reference like "CB-7F3A".
 * Retries on the (extremely unlikely) collision, widening the code if needed.
 */
export async function generateReference(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const length = attempt < 8 ? 4 : 5;
    const reference = `CB-${randomCode(length)}`;
    const existing = await prisma.productionRequest.findUnique({
      where: { reference },
      select: { id: true },
    });
    if (!existing) return reference;
  }
  // Final fallback — timestamp suffix guarantees uniqueness.
  return `CB-${randomCode(4)}${Date.now().toString(36).toUpperCase().slice(-3)}`;
}
