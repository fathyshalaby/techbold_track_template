import type { AuditEvent } from "@techbold/contracts";

export type TranscriptRole = "agent" | "technician" | "ssh" | "system" | "phoenix";

export type TranscriptTone = "default" | "danger" | "success" | "warning";

export interface TranscriptMessage {
  id: string;
  role: TranscriptRole;
  actorLabel: string;
  title: string;
  body: string;
  command: string | null;
  tone: TranscriptTone;
  ts: string;
}

const ACTOR_LABEL: Record<TranscriptRole, string> = {
  agent: "Autopilot",
  technician: "Technician",
  ssh: "Target host",
  system: "System",
  phoenix: "Ticketing",
};

const TITLE_BY_TYPE: Record<string, string> = {
  "run.started": "Run started",
  "agent.thought_summary": "Reasoning",
  "command.proposed": "Command proposed",
  "command.blocked": "Command blocked by safety policy",
  "command.executing": "Executing command",
  "command.completed": "Command finished",
  "command.approved": "Approved command",
  "command.rejected": "Rejected command",
  "observation.added": "Observation",
  "diagnosis.root_cause_found": "Root cause identified",
  "diagnosis.more_needed": "More diagnosis needed",
  "fix.proposed": "Fix proposed",
  "validation.completed": "Validation completed",
  "activity.drafted": "Activity log drafted",
  "activity.submitted": "Activity log submitted",
  "agent.unavailable": "Agent unavailable",
  "run.completed": "Run completed",
  "run.failed": "Run failed",
  "run.aborted": "Run aborted",
  "run.steps_capped": "Step limit reached",
};

const DANGER_TYPES = new Set(["command.blocked", "command.rejected", "run.failed"]);
const SUCCESS_TYPES = new Set(["command.approved", "run.completed", "activity.submitted"]);
const WARNING_TYPES = new Set([
  "diagnosis.more_needed",
  "run.aborted",
  "run.steps_capped",
  "agent.unavailable",
]);

function roleForActor(actor: string): TranscriptRole {
  if (actor === "agent" || actor === "technician" || actor === "ssh" || actor === "phoenix") {
    return actor;
  }
  return "system";
}

function titleForType(type: string): string {
  return TITLE_BY_TYPE[type] ?? type;
}

function toneForType(type: string, payload: Record<string, unknown>): TranscriptTone {
  if (DANGER_TYPES.has(type)) return "danger";
  if (type === "validation.completed") {
    const status = typeof payload.status === "string" ? payload.status : "";
    return status === "VERIFIED_FIXED" || status === "LIKELY_FIXED" ? "success" : "warning";
  }
  if (SUCCESS_TYPES.has(type)) return "success";
  if (WARNING_TYPES.has(type)) return "warning";
  return "default";
}

function parsePayload(payloadJson?: string): Record<string, unknown> {
  if (!payloadJson) return {};
  try {
    const parsed = JSON.parse(payloadJson) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function pickCommand(payload: Record<string, unknown>): string | null {
  if (typeof payload.command === "string") return payload.command;
  const proposal = payload.proposal;
  if (proposal && typeof proposal === "object") {
    const candidate = (proposal as Record<string, unknown>).proposed_command;
    if (typeof candidate === "string") return candidate;
  }
  return null;
}

// Turn an audit payload into a short, human-readable line. Mirrors the backend
// audit payload shapes (command/reason/status/message/hypothesis/exitCode).
function bodyForEvent(type: string, payload: Record<string, unknown>): string {
  if (type === "command.completed") {
    const exitCode = payload.exitCode;
    return typeof exitCode === "number"
      ? `Exit code ${exitCode}${exitCode === 0 ? " (success)" : ""}`
      : "Command finished";
  }
  if (typeof payload.hypothesis === "string") return payload.hypothesis;
  if (typeof payload.reason === "string") return payload.reason;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.status === "string") return payload.status;
  if (typeof payload.stepCount === "number") {
    return `Stopped after ${payload.stepCount} steps`;
  }
  return "";
}

export function auditEventToMessage(event: AuditEvent): TranscriptMessage {
  const payload = parsePayload(event.payload_json);
  const role = roleForActor(event.actor);
  return {
    id: event.id,
    role,
    actorLabel: ACTOR_LABEL[role],
    title: titleForType(event.type),
    body: bodyForEvent(event.type, payload),
    command: pickCommand(payload),
    tone: toneForType(event.type, payload),
    ts: event.ts,
  };
}

export function timelineToMessages(timeline: AuditEvent[]): TranscriptMessage[] {
  return timeline.map(auditEventToMessage);
}
