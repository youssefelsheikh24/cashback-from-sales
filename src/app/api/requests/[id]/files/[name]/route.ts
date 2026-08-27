import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";
import { signedUrlForFile } from "@/lib/storage";
import { serializeRequest } from "@/lib/serialize";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/requests/:id/files/:name — return a short-lived signed URL for a
 * stored reference file and redirect to it. Files live in a PRIVATE Supabase
 * bucket; only the authenticated Sales team can mint a link, and only for a
 * file that actually belongs to the request.
 *
 * `:name` is the URL-encoded object path (e.g. "CB-7F3A/ab12cd.pdf").
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
  const storedName = decodeURIComponent(params.name);
  const meta = request.files.find((f) => f.storedName === storedName);
  if (!meta) {
    return NextResponse.json(
      { success: false, error: "File not found" },
      { status: 404 }
    );
  }

  const url = await signedUrlForFile(request.reference, meta.storedName, 300);
  if (!url) {
    return NextResponse.json(
      { success: false, error: "File no longer available" },
      { status: 404 }
    );
  }

  return NextResponse.redirect(url, 307);
}
