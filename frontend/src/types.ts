// Mirrors shared/api-contract.md §3.

export type TicketStatus = "OPEN" | "PENDING" | "DONE";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: TicketStatus;
  customer_id: number;
  customer_name: string;
  tags?: string[];
  sla_due_at?: string | null;
  created_at?: string | null;
}

export interface SystemInfo {
  ip: string;
  port: number;
  username: string;
  os: string;
  notes?: string;
}

export interface ConnectionCheck {
  status: "connected" | "unreachable";
  reachable: boolean;
  checked_at: string;
  latency_ms?: number;
  message?: string;
}

export interface StepResult {
  exit_code: number;
  stdout: string;
  stderr: string;
  duration_ms: number;
  truncated: boolean;
}

export interface SafetyVerdict {
  classification: "blocked" | "low_risk" | "needs_review";
  risk: string;
  matched_rule?: string | null;
  reason?: string | null;
}

export interface Step {
  id: string;
  index: number;
  kind: "diagnose" | "fix" | "validate";
  command: string;
  rationale: string;
  risk: string;
  safety: SafetyVerdict;
  status: string;
  edited_command?: string | null;
  result?: StepResult | null;
  created_at: string;
  decided_at?: string | null;
  ran_at?: string | null;
}

export interface AuditEntry {
  ts: string;
  actor: string;
  type: string;
  step_id?: string | null;
  command?: string | null;
  exit_code?: number | null;
  note?: string | null;
}

export interface Conclusion {
  root_cause: string;
  fixed: boolean;
  validation_result: string;
}

export interface ActivityDraft {
  ticket_id?: number;
  start_datetime?: string;
  end_datetime?: string;
  summary?: string;
  root_cause?: string;
  actions_taken?: string;
  commands_summary?: string;
  validation_result?: string;
  description?: string;
}

export interface Run {
  id: string;
  ticket_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  ticket: Ticket;
  system: SystemInfo;
  pending_step_id?: string | null;
  steps: Step[];
  audit: AuditEntry[];
  conclusion?: Conclusion | null;
  activity_draft?: ActivityDraft | null;
}

export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  teamname: string;
}
