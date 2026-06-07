// The canonical SSE event tuple. This MUST mirror the audit/event types the
// backend actually emits to the run event bus (every appendAuditEvent / emitEvent
// type), because the dashboard subscribes via addEventListener(<name>) for each
// entry here — any emitted type NOT listed is silently dropped by the client, so
// the live view would miss it. Keep this list in sync with the orchestrator's
// emissions (apps/backend/src/ai/orchestrator.ts + routes).
export const SSE_EVENT_TYPES = [
  "run.started",
  "preflight.completed",
  "agent.unavailable",
  "approval.required",
  "command.approved",
  "command.rejected",
  "command.blocked",
  "command.completed",
  "diagnosis.root_cause_found",
  "diagnosis.more_needed",
  "fix.failed",
  "fix.rollback_proposed",
  "fix.rollback_blocked",
  "validation.completed",
  "activity.drafted",
  "activity.fields_overridden",
  "activity.submitted",
  "ticket.status_updated",
  "ticket.status_update_failed",
  "ticket.left_open_unvalidated",
  "run.steps_capped",
  "run.aborted",
  "run.failed",
] as const;

export type SseEventType = (typeof SSE_EVENT_TYPES)[number];

export interface SseEvent {
  type: SseEventType;
  runId: string;
  ts: string;
  payload: unknown;
}
