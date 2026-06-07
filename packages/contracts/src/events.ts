// The canonical SSE event tuple. MUST mirror the audit/event types the backend
// actually emits to the run event bus — the dashboard subscribes via
// addEventListener(<name>) per entry, so an emitted type NOT listed here is
// silently dropped from the live view. Keep in sync with the orchestrator + routes.
export const SSE_EVENT_TYPES = [
  "run.started",
  "memory.recalled",
  "memory.indexed",
  "memory.index_failed",
  "approval.required",
  "command.approved",
  "command.rejected",
  "command.blocked",
  "command.duplicate_blocked",
  "command.completed",
  "diagnosis.root_cause_found",
  "diagnosis.more_needed",
  "fix.failed",
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
  "agent.unavailable",
] as const;

export type SseEventType = (typeof SSE_EVENT_TYPES)[number];

export interface SseEvent {
  type: SseEventType;
  runId: string;
  ts: string;
  payload: unknown;
}
