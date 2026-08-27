import { EventEmitter } from "events";

// A single global EventEmitter fans out realtime Sales events (new requests,
// status changes) to every connected SSE stream across API handlers.
declare global {
  // eslint-disable-next-line no-var
  var salesSseEmitter: EventEmitter | undefined;
}

export const sseEmitter = global.salesSseEmitter || new EventEmitter();

// Allow many concurrent Sales tabs without Node's default 10-listener warning.
sseEmitter.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  global.salesSseEmitter = sseEmitter;
}

export const SSE_CHANNEL = "cashback_sales_event";

export interface SSEEventPayload {
  type: "NEW_REQUEST" | "STATUS_UPDATE" | "NOTIFICATION_READ";
  request?: Record<string, unknown>;
  notification?: Record<string, unknown>;
  timestamp: string;
}

export function broadcastNewRequest(
  request: Record<string, unknown>,
  notification: Record<string, unknown>
) {
  const payload: SSEEventPayload = {
    type: "NEW_REQUEST",
    request,
    notification,
    timestamp: new Date().toISOString(),
  };
  sseEmitter.emit(SSE_CHANNEL, payload);
}

export function broadcastStatusUpdate(requestId: string, status: string) {
  const payload: SSEEventPayload = {
    type: "STATUS_UPDATE",
    request: { id: requestId, status },
    timestamp: new Date().toISOString(),
  };
  sseEmitter.emit(SSE_CHANNEL, payload);
}
