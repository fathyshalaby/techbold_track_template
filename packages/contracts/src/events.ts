export const SSE_EVENT_TYPES = [
  "run.started",
  "memory.recalled",
  "agent.thought_summary",
  "command.proposed",
  "command.blocked",
  "approval.required",
  "command.executing",
  "command.completed",
  "observation.added",
  "fix.proposed",
  "validation.completed",
  "activity.drafted",
  "activity.submitted",
  "agent.unavailable",
  "run.completed",
  "run.failed",
] as const;

export type SseEventType = (typeof SSE_EVENT_TYPES)[number];

export interface SseEvent {
  type: SseEventType;
  runId: string;
  ts: string;
  payload: unknown;
}
