import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";
import { REQUEST_STATUSES } from "@/lib/validations";
import { serializeRequest } from "@/lib/serialize";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/requests — Sales only.
 * Query params: q (search), status (filter), sort (newest|oldest).
 * Returns the filtered requests plus an all-time stats summary.
 */
export async function GET(req: NextRequest) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") === "oldest" ? "asc" : "desc";

  const where: Prisma.ProductionRequestWhereInput = {};

  if (status && REQUEST_STATUSES.includes(status as (typeof REQUEST_STATUSES)[number])) {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { brandName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { reference: { contains: q } },
    ];
  }

  const [requests, statusCounts, total] = await Promise.all([
    prisma.productionRequest.findMany({ where, orderBy: { createdAt: sort } }),
    prisma.productionRequest.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.productionRequest.count(),
  ]);

  const stats: Record<string, number> = { total };
  for (const s of REQUEST_STATUSES) stats[s] = 0;
  for (const row of statusCounts) {
    stats[row.status] = row._count.status;
  }

  return NextResponse.json({
    success: true,
    stats,
    requests: requests.map(serializeRequest),
  });
}
