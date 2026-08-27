import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";
import { resolveStoredFile } from "@/lib/storage";
import { serializeRequest } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/requests/:id/files/:name — stream a stored reference file to the
 * authenticated Sales team. Files live outside /public and are guarded against
 * path traversal; only files that belong to the request can be fetched.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; name: string } }
) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const row = await prisma.productionRequest.findUnique({
    where: { id: params.id },
  });
  if (!row) {
    return NextResponse.json(
      { success: false, error: "Request not found" },
      { status: 404 }
    );
  }

  const request = serializeRequest(row);
  const meta = request.files.find((f) => f.storedName === params.name);
  if (!meta) {
    return NextResponse.json(
      { success: false, error: "File not found" },
      { status: 404 }
    );
  }

  const fullPath = await resolveStoredFile(request.reference, meta.storedName);
  if (!fullPath) {
    return NextResponse.json(
      { success: false, error: "File no longer available" },
      { status: 404 }
    );
  }

  const data = await fs.readFile(fullPath);
  const asciiName = meta.name.replace(/[^\x20-\x7E]+/g, "_").replace(/"/g, "");
  return new NextResponse(data, {
    headers: {
      "Content-Type": meta.type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(
        meta.name
      )}`,
      "Content-Length": String(data.length),
      "Cache-Control": "private, no-store",
    },
  });
}
