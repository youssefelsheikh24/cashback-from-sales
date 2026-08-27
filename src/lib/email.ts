import { SERVICE_LABELS } from "@/lib/constants";
import type { ServiceId } from "@/types";

interface EmailRequestData {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  brandName: string;
  services: ServiceId[];
  projectDescription: string;
  budget: string;
  preferredShootDate?: string | null;
  deliveryDeadline?: string | null;
  fileCount: number;
}

// Minimal HTML escaping so client-supplied text can't break the email markup.
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serviceNames(ids: ServiceId[]): string {
  return ids.map((id) => SERVICE_LABELS[id] || id).join(" + ");
}

/**
 * Send the NEW PRODUCTION REQUEST notification email to the CashBack Sales dept.
 *
 * When SMTP is not configured we DON'T pretend it was sent — we log the
 * notification to the server console and return { sent: false }.
 */
export async function sendRequestNotificationEmail(
  req: EmailRequestData
): Promise<{ sent: boolean; messageId?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM || "CashBack Production <onboarding@resend.dev>";
  const to =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "sales@cashback.agency";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const requestUrl = `${appUrl}/sales?requestId=${req.id}`;

  const services = esc(serviceNames(req.services));
  const subject = `New Production Request — ${req.brandName} (${req.reference})`;

  const row = (label: string, value: string, gold = false) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #17171F;">
          <div style="font-size:11px;color:#87879B;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${label}</div>
          <div style="font-size:15px;color:${gold ? "#D4AF37" : "#FFFFFF"};font-weight:${gold ? 700 : 500};">${value}</div>
        </td>
      </tr>`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#040406;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#fff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#0E0E14;border:1px solid #22222F;border-radius:14px;padding:36px;box-shadow:0 10px 30px rgba(0,0,0,.5);">
      <div style="text-align:center;border-bottom:1px solid #1C1C28;padding-bottom:22px;margin-bottom:12px;">
        <div style="font-size:26px;font-weight:800;letter-spacing:3px;color:#D4AF37;text-transform:uppercase;">CashBack</div>
        <div style="font-size:11px;letter-spacing:4px;color:#87879B;text-transform:uppercase;margin-top:6px;">Production House</div>
      </div>
      <div style="text-align:center;margin:22px 0 6px;">
        <span style="display:inline-block;background:rgba(212,175,55,.15);border:1px solid #D4AF37;color:#F5DF90;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;">New Production Request</span>
        <h2 style="font-size:22px;font-weight:600;margin:16px 0 4px;color:#fff;">${esc(req.brandName)}</h2>
        <div style="font-family:monospace;font-size:13px;letter-spacing:2px;color:#87879B;">${esc(req.reference)}</div>
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${row("Client", esc(req.fullName))}
        ${row("Requested", services, true)}
        ${row("Email", `<a href="mailto:${esc(req.email)}" style="color:#F5DF90;text-decoration:none;">${esc(req.email)}</a>`)}
        ${row("Phone", `<a href="tel:${esc(req.phone)}" style="color:#F5DF90;text-decoration:none;">${esc(req.phone)}</a>`)}
        ${req.whatsapp ? row("WhatsApp", esc(req.whatsapp)) : ""}
        ${row("Budget", esc(req.budget), true)}
        ${req.preferredShootDate ? row("Shooting Date", esc(req.preferredShootDate)) : ""}
        ${req.deliveryDeadline ? row("Delivery Deadline", esc(req.deliveryDeadline)) : ""}
        ${req.fileCount ? row("Reference Files", `${req.fileCount} attached`) : ""}
      </table>
      <div style="background:#08080C;border:1px solid #1C1C28;border-radius:8px;padding:16px;margin:18px 0;">
        <div style="font-size:11px;color:#87879B;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">The Brief</div>
        <div style="font-size:14px;color:#E0E0E6;line-height:1.6;white-space:pre-wrap;">${esc(req.projectDescription)}</div>
      </div>
      <div style="text-align:center;margin-top:28px;">
        <a href="${requestUrl}" style="display:inline-block;background:linear-gradient(135deg,#F3E5AB 0%,#D4AF37 50%,#AA7C11 100%);color:#050508;font-size:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:14px 34px;border-radius:8px;">View Request &rarr;</a>
      </div>
    </div>
    <div style="text-align:center;font-size:12px;color:#555566;margin-top:24px;">Automated notification · CashBack Sales &amp; Production</div>
  </div>
</body></html>`;

  // No API key configured → log instead of faking a send.
  if (!apiKey) {
    console.log(`
==================================================
[EMAIL — DEV MODE: RESEND_API_KEY not set, not sent]
To:        ${to}
Subject:   ${subject}
Client:    ${req.fullName} (${req.brandName})
Ref:       ${req.reference}
Requested: ${serviceNames(req.services)}
Budget:    ${req.budget}
View:      ${requestUrl}
Set RESEND_API_KEY in .env to send real emails.
==================================================
`);
    return { sent: false };
  }

  // Resend HTTP API — edge/Workers compatible (no SMTP sockets).
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("✗ Resend send failed:", res.status, detail);
      return { sent: false };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    console.log(`✓ Production request email sent: ${json.id ?? "ok"}`);
    return { sent: true, messageId: json.id };
  } catch (error) {
    console.error("✗ Failed to send production request email:", error);
    return { sent: false };
  }
}
