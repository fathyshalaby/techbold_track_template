export { SSE_EVENT_TYPES } from "@techbold/contracts";
export type { SseEventType } from "@techbold/contracts";

import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { ulid } from "ulid";
import { redactSecrets } from "../safety/redaction.js";
import { getAuditEvents } from "../store/audit.js";
import { runEventBus } from "./run-event-bus.js";

export function createSseStream(c: Context, runId: string) {
  return streamSSE(c, async (stream) => {
    const backfill = getAuditEvents(runId);
    for (const event of backfill) {
      await stream.writeSSE({
        event: event.type,
        data: JSON.stringify({
          type: event.type,
          runId: event.run_id,
          ts: event.ts,
          payload: JSON.parse(event.payload_json),
        }),
        id: event.id,
      });
    }

    const anyListener = (eventType: string, payload: unknown) => {
      void stream.writeSSE({
        event: eventType,
        data: redactSecrets(
          JSON.stringify({
            type: eventType,
            runId,
            ts: new Date().toISOString(),
            payload,
          }),
        ),
        id: ulid(),
      });
    };
    runEventBus.onAny(runId, anyListener);

    stream.onAbort(() => {
      runEventBus.offAny(runId, anyListener);
    });

    while (!stream.aborted) {
      await stream.sleep(15000);
      if (!stream.aborted) {
        await stream.writeSSE({ data: "", event: "keepalive", id: "" });
      }
    }
  });
}
