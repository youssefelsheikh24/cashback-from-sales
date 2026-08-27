import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";
import { requestUpdateSchema } from "@/lib/validations";
import { serializeRequest } from "@/lib/serialize";
import { broadcastStatusUpdate } from "@/lib/sse";

export const dynamic = "force-dynamic";

/** GET a single request's full details (Sales only). */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const request = await prisma.productionRequest.findUnique({
    where: { id: params.id },
  });
  if (!request) {
    return NextResponse.json(
      { success: false, error: "Request not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, request: serializeRequest(request) });
}

/** PATCH — update status and/or internal notes (Sales only). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = requestUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid update payload." },
      { status: 422 }
    );
  }

  const existing = await prisma.productionRequest.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Request not found" },
      { status: 404 }
    );
  }

  const request = await prisma.productionRequest.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.internalNotes !== undefined
        ? { internalNotes: parsed.data.internalNotes }
        : {}),
    },
  });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    try {
      broadcastStatusUpdate(request.id, request.status);
    } catch (e) {
      console.error("SSE status broadcast failed (non-fatal):", e);
    }
  }

  return NextResponse.json({ success: true, request: serializeRequest(request) });
}

/** DELETE — remove a request permanently (Sales only). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const existing = await prisma.productionRequest.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Request not found" },
      { status: 404 }
    );
  }

  // Related notifications cascade-delete via the schema relation.
  await prisma.productionRequest.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
