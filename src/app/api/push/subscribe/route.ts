import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST — store a Web Push subscription for the authenticated Sales admin. */
export async function POST(req: NextRequest) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const endpoint: string | undefined = body?.endpoint;
  const p256dh: string | undefined = body?.keys?.p256dh;
  const auth: string | undefined = body?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { success: false, error: "Invalid subscription." },
      { status: 400 }
    );
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh, auth, userAgent: req.headers.get("user-agent") || null },
    create: { endpoint, p256dh, auth, userAgent: req.headers.get("user-agent") || null },
  });

  return NextResponse.json({ success: true });
}

/** DELETE — remove a subscription (on logout / disable). */
export async function DELETE(req: NextRequest) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const endpoint: string | undefined = body?.endpoint;
  if (endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } }).catch(() => {});
  }
  return NextResponse.json({ success: true });
}
