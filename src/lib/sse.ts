// Realtime on Cloudflare's edge can't use an in-process Node EventEmitter —
// isolates are stateless and short-lived, so a shared emitter never fans out.
//
// The Sales dashboard instead POLLS /api/notifications every 15s (see
// src/app/sales/page.tsx). These functions are kept as safe no-ops so the
// submission pipeline keeps its "best-effort broadcast" call sites unchanged.
//
// To upgrade to push realtime later: enable Supabase Realtime on the
// cashback_sales.Notification table and subscribe from the client with the
// anon key + RLS. Polling is the zero-config, edge-safe default.

export interface SSEEventPayload {
  type: "NEW_REQUEST" | "STATUS_UPDATE" | "NOTIFICATION_READ";
  request?: Record<string, unknown>;
  notification?: Record<string, unknown>;
  timestamp: string;
}

export function broadcastNewRequest(
  _request: Record<string, unknown>,
  _notification: Record<string, unknown>
): void {
  // no-op on edge; dashboard picks up new requests via polling
}

export function broadcastStatusUpdate(
  _requestId: string,
  _status: string
): void {
  // no-op on edge
}
