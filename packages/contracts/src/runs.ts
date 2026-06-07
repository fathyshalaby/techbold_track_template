import type { SafeTarget, SourceLabel, TicketSummary } from "./tickets.js";

export type RiskLevel =
  | "SAFE_READ_ONLY"
  | "LOW_RISK_CHANGE"
  | "MEDIUM_RISK_CHANGE"
  | "HIGH_RISK_BLOCKED";

export type CommandApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "BLOCKED";

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
  status: CommandApprovalStatus;
  technician_reason: string | null;
  created_at: string;
  decided_at: string | null;
  executed_at: string | null;
}

export interface ActivityDraft {
  id?: string;
  run_id?: string;
  summary: string;
  root_cause: string;
  actions_taken: string;
  commands_summary: string;
  validation_result: string;
  submitted?: number;
  created_at?: string;
  submitted_at?: string | null;
}

export interface AuditEvent {
  id: string;
  run_id: string;
  type: string;
  actor: string;
  ts: string;
  payload_json: string;
}

export interface RunDetail {
  runId: string;
  status: string;
  phase: string;
  timeline: AuditEvent[];
  pendingApproval: CommandApproval | null;
  activityDraft: ActivityDraft | null;
  ticketId: number;
  customerSystemId: string;
  ticket: TicketSummary | null;
  target: SafeTarget | null;
  source: SourceLabel;
}

export interface CreateRunResult {
  runId: string;
  status: string;
  ticket: TicketSummary;
  customerSystem: SafeTarget;
}

export interface DashboardRunSummary {
  runId: string;
  ticketId: number;
  ticketTitle: string | null;
  customerName: string | null;
  status: string;
  phase: string;
  updatedAt: string;
  latestAuditAt: string | null;
  hasPendingApproval: boolean;
  source: SourceLabel;
}

export interface PendingApprovalSummary {
  approvalId: string;
  runId: string;
  ticketId: number;
  ticketTitle: string | null;
  proposedCommand: string;
  riskLevel: RiskLevel;
  createdAt: string;
  source: SourceLabel;
}

export interface AuditEvidenceSummary {
  id: string;
  runId: string;
  type: string;
  actor: string;
  ts: string;
  payloadSummary: string;
  source: SourceLabel;
}

export interface ActivityStateSummary {
  runId: string;
  ticketId: number;
  state: "not-drafted" | "drafted" | "submitted";
  summary: string | null;
  validationResult: string | null;
  updatedAt: string | null;
  source: SourceLabel;
}

export interface MemoryIncidentSummary {
  runId: string;
  ticketId: number;
  ticketTitle: string | null;
  customerName: string | null;
  status: string;
  rootCause: string | null;
  durableFix: string | null;
  validationResult: string | null;
  resolvedAt: string | null;
  state: "not-drafted" | "drafted" | "submitted";
  source: SourceLabel;
}
