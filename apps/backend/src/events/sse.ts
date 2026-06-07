export { SSE_EVENT_TYPES } from "@techbold/contracts";
export type { SseEventType } from "@techbold/contracts";

import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { ulid } from "ulid";
import { redactSecrets } from "../safety/redaction.js";
import { getAuditEvents } from "../store/audit.js";
import { runEventBus } from "./run-event-bus.js";

type SseWriter = {
  writeSSE: (payload: { data: string; event?: string; id?: string }) => Promise<void>;
};

async function safeWriteSse(
  stream: SseWriter,
  payload: { data: string; event?: string; id?: string },
): Promise<void> {
  try {
    await stream.writeSSE(payload);
  } catch (err) {
    console.error("[sse] write failed:", (err as Error).message);
  }
}

export function createSseStream(c: Context, runId: string) {
  return streamSSE(c, async (stream) => {
    const backfill = getAuditEvents(runId);
    for (const event of backfill) {
      await safeWriteSse(stream, {
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
      void safeWriteSse(stream, {
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
        await safeWriteSse(stream, { data: "", event: "keepalive", id: "" });
      }
    }
  });
}
