import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** GET — recent notifications + unread count (Sales only). */
export async function GET(req: NextRequest) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  return NextResponse.json({ success: true, notifications, unreadCount });
}

const markReadSchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional(),
});

/** PATCH — mark one notification (by id) or all notifications as read. */
export async function PATCH(req: NextRequest) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = markReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid payload" },
      { status: 422 }
    );
  }

  if (parsed.data.all || !parsed.data.id) {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  } else {
    await prisma.notification.update({
      where: { id: parsed.data.id },
      data: { isRead: true },
    });
  }

  const unreadCount = await prisma.notification.count({
    where: { isRead: false },
  });
  return NextResponse.json({ success: true, unreadCount });
}
