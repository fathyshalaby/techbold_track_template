import { streamSSE } from 'hono/streaming';
import { ulid } from 'ulid';
import type { Context } from 'hono';
import { runEventBus } from './run-event-bus.js';
import { getAuditEvents } from '../store/audit.js';

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

    const listeners = new Map<string, (payload: unknown) => void>();

    for (const eventType of SSE_EVENT_TYPES) {
      const listener = (payload: unknown) => {
        void stream.writeSSE({
          data: JSON.stringify({
            type: eventType,
            runId,
            ts: new Date().toISOString(),
            payload,
          }),
          event: eventType,
          id: ulid(),
        });
      };
      listeners.set(eventType, listener);
      runEventBus.on(runId, eventType, listener);
    }

    stream.onAbort(() => {
      for (const [eventType, listener] of listeners) {
        runEventBus.off(runId, eventType, listener);
      }
    });

    while (!stream.aborted) {
      await stream.sleep(15000);
      if (!stream.aborted) {
        await stream.writeSSE({ data: '', event: 'keepalive', id: '' });
      }
    }
  });
}
