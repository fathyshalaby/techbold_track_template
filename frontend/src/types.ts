export type RiskLevel =
  | "SAFE_READ_ONLY"
  | "LOW_RISK_CHANGE"
  | "MEDIUM_RISK_CHANGE"
  | "HIGH_RISK_BLOCKED";

export type SseEventType =
  | "run.started"
  | "agent.thought_summary"
  | "command.proposed"
  | "command.blocked"
  | "approval.required"
  | "command.executing"
  | "command.completed"
  | "observation.added"
  | "fix.proposed"
  | "validation.completed"
  | "activity.drafted"
  | "activity.submitted"
  | "run.completed"
  | "run.failed";

export interface SseEvent {
  type: SseEventType;
  runId: string;
  ts: string;
  payload: unknown;
}

export interface Ticket {
  id: number;
  title: string;
  priority: string;
  status: string;
  customer_name: string;
}

export interface CustomerSystem {
  ip: string;
  port: number;
  username: string;
  os: string;
}

export interface AuditEvent {
  id: string;
  run_id: string;
  type: string;
  actor: string;
  ts: string;
  payload_json: string;
}

export interface CommandApproval {
  id: string;
  run_id: string;
  proposed_command: string;
  edited_command: string | null;
  final_command: string | null;
  purpose: string;
  expected_signal: string;
  risk_level: RiskLevel;
  safety_notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "BLOCKED";
  technician_reason: string | null;
  created_at: string;
  decided_at: string | null;
  executed_at: string | null;
}

export interface ActivityDraft {
  summary: string;
  root_cause: string;
  actions_taken: string;
  commands_summary: string;
  validation_result: string;
}

export interface Run {
  runId: string;
  status: string;
  phase: string;
  timeline: AuditEvent[];
  pendingApproval: CommandApproval | null;
  activityDraft: ActivityDraft | null;
}

export interface CreateRunResult {
  runId: string;
  status: string;
  ticket: Ticket;
  customerSystem: CustomerSystem;
}
