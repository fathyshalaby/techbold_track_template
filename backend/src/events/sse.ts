import { streamSSE } from 'hono/streaming';
import { ulid } from 'ulid';
import type { Context } from 'hono';
import { runEventBus } from './run-event-bus.js';
import { getAuditEvents } from '../store/audit.js';
import { redactSecrets } from '../safety/redaction.js';

export const SSE_EVENT_TYPES = [
  'run.started',
  'agent.thought_summary',
  'command.proposed',
  'command.blocked',
  'approval.required',
  'command.executing',
  'command.completed',
  'observation.added',
  'fix.proposed',
  'validation.completed',
  'activity.drafted',
  'activity.submitted',
  'run.completed',
  'run.failed',
] as const;

export function createSseStream(c: Context, runId: string) {
  return streamSSE(c, async (stream) => {
    const backfill = getAuditEvents(runId);
    for (const event of backfill) {
      await stream.writeSSE({
        data: JSON.stringify({
          type: event.type,
          runId: event.run_id,
          ts: event.ts,
          payload: JSON.parse(event.payload_json),
        }),
        event: event.type,
        id: event.id,
      });
    }

    // Subscribe to ALL events for this run via the wildcard channel, so every
    // event the orchestrator emits streams live — no allowlist to drift out of
    // sync with the real event names (the prior fixed list missed several).
    const anyListener = (eventType: string, payload: unknown) => {
      // The live channel carries the orchestrator's in-memory payload (e.g. an
      // LLM-authored proposal/rationale), which is NOT pre-redacted like the DB
      // copy. Redact the serialized frame so no secret can stream to the browser.
      void stream.writeSSE({
        data: redactSecrets(JSON.stringify({
          type: eventType,
          runId,
          ts: new Date().toISOString(),
          payload,
        })),
        event: eventType,
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
        await stream.writeSSE({ data: '', event: 'keepalive', id: '' });
      }
    }
  });
}
