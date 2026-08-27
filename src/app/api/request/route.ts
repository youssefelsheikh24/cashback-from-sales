import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { productionRequestSchema } from "@/lib/validations";
import { generateReference } from "@/lib/reference";
import { saveRequestFiles } from "@/lib/storage";
import { sendRequestNotificationEmail } from "@/lib/email";
import { broadcastNewRequest } from "@/lib/sse";
import { SERVICE_LABELS, SHOOT_SERVICES } from "@/lib/constants";
import type { ServiceId } from "@/types";

export const dynamic = "force-dynamic";

/**
 * PUBLIC endpoint — receives a client production/booking request.
 *
 * Accepts multipart/form-data:
 *   - field "payload": JSON string of the form data
 *   - field "files":   zero or more uploaded reference files
 *
 * 1. Validates + sanitizes every field on the server (never trusts the client).
 * 2. Generates a unique reference (CB-XXXX) and persists the request.
 * 3. Saves uploaded reference files to server-only storage.
 * 4. Creates a Sales notification.
 * 5. Broadcasts a realtime event to connected Sales dashboards.
 * 6. Fires the Sales email notification (best-effort; never blocks the client).
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let rawPayload: unknown = null;
    let files: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const payloadStr = form.get("payload");
      if (typeof payloadStr === "string") {
        rawPayload = JSON.parse(payloadStr);
      }
      files = form
        .getAll("files")
        .filter((f): f is File => f instanceof File && f.size > 0);
    } else {
      rawPayload = await req.json().catch(() => null);
    }

    if (!rawPayload) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = productionRequestSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please check the form and try again.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const data = parsed.data;
    const services = data.services as ServiceId[];

    // Only keep scheduling dates relevant to the selected services.
    const involvesShoot = services.some((s) => SHOOT_SERVICES.includes(s));

    const reference = await generateReference();

    // Save uploaded files first so their metadata can be stored on the request.
    let savedFiles: Awaited<ReturnType<typeof saveRequestFiles>> = [];
    try {
      savedFiles = await saveRequestFiles(reference, files);
    } catch (e) {
      console.error("File save failed (non-fatal):", e);
    }

    const request = await prisma.productionRequest.create({
      data: {
        reference,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email.toLowerCase(),
        brandName: data.brandName,
        whatsapp: data.whatsapp || null,
        services: JSON.stringify(services),
        details: JSON.stringify(data.details ?? {}),
        projectDescription: data.projectDescription,
        referenceLink: data.referenceLink || null,
        files: JSON.stringify(savedFiles),
        preferredShootDate: involvesShoot ? data.preferredShootDate || null : null,
        deliveryDeadline: data.deliveryDeadline || null,
        flexibility: data.flexibility || null,
        budget: data.budget,
        status: "New",
      },
    });

    const serviceSummary = services
      .slice(0, 2)
      .map((s) => SERVICE_LABELS[s] || s)
      .join(" + ") + (services.length > 2 ? ` +${services.length - 2}` : "");

    const notification = await prisma.notification.create({
      data: {
        requestId: request.id,
        title: "New Production Request",
        message: `${data.fullName} requested ${services
          .map((s) => SERVICE_LABELS[s] || s)
          .join(" + ")}.`,
        brand: data.brandName,
        service: serviceSummary,
        budget: data.budget,
        reference,
      },
    });

    // Realtime push to any open Sales dashboards (best-effort).
    try {
      broadcastNewRequest(
        {
          id: request.id,
          reference: request.reference,
          fullName: request.fullName,
          brandName: request.brandName,
          services,
          budget: request.budget,
          status: request.status,
          createdAt: request.createdAt,
        },
        {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          brand: notification.brand,
          service: notification.service,
          budget: notification.budget,
          reference: notification.reference,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        }
      );
    } catch (e) {
      console.error("SSE broadcast failed (non-fatal):", e);
    }

    // Email notification — wrapped so a mail failure never breaks submission.
    let emailSent = false;
    try {
      const result = await sendRequestNotificationEmail({
        id: request.id,
        reference: request.reference,
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        whatsapp: request.whatsapp,
        brandName: request.brandName,
        services,
        projectDescription: request.projectDescription,
        budget: request.budget,
        preferredShootDate: request.preferredShootDate,
        deliveryDeadline: request.deliveryDeadline,
        fileCount: savedFiles.length,
      });
      emailSent = result.sent;
    } catch (e) {
      console.error("Email notification failed (non-fatal):", e);
    }

    return NextResponse.json(
      {
        success: true,
        requestId: request.id,
        reference: request.reference,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Production request submission error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
