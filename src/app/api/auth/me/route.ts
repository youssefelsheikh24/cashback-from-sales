import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return NextResponse.json({
    success: true,
    user: { email: session.email, name: session.name, role: session.role },
  });
}
