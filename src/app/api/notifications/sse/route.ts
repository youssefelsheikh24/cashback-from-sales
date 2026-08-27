import { NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/auth";
import { sseEmitter, SSE_CHANNEL, type SSEEventPayload } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/sse — authenticated Server-Sent Events stream.
 * Pushes NEW_REQUEST / STATUS_UPDATE events to the Sales dashboard in realtime.
 */
export async function GET(req: NextRequest) {
  const session = await checkAdminAuth(req);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (data: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          /* stream already closed */
        }
      };

      send(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

      const onEvent = (payload: SSEEventPayload) => {
        send(`event: message\ndata: ${JSON.stringify(payload)}\n\n`);
      };
      sseEmitter.on(SSE_CHANNEL, onEvent);

      const heartbeat = setInterval(() => {
        send(`: keep-alive ${Date.now()}\n\n`);
      }, 25000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        sseEmitter.off(SSE_CHANNEL, onEvent);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
