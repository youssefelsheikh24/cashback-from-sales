import webpush from "web-push";
import { prisma } from "@/lib/db";

// Web Push (VAPID). Runs on the Railway Node.js runtime. Delivers notifications
// to installed Sales PWAs even when the app/tab is closed.

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:sales@cashback.agency";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string; // where notificationclick should navigate
  tag?: string;
}

/**
 * Send a push to every stored Sales subscription (best-effort). Prunes
 * subscriptions the push service reports as gone (404/410).
 */
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number }> {
  if (!ensureConfigured()) {
    console.log("[PUSH] VAPID not configured — skipping push:", payload.title);
    return { sent: 0 };
  }

  const subs = await prisma.pushSubscription.findMany();
  if (!subs.length) return { sent: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) dead.push(s.endpoint);
        else console.error("[PUSH] send failed:", code, (err as Error)?.message);
      }
    })
  );

  if (dead.length) {
    await prisma.pushSubscription
      .deleteMany({ where: { endpoint: { in: dead } } })
      .catch(() => {});
  }

  return { sent };
}
