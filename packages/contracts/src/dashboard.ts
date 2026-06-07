import type {
  ActivityStateSummary,
  AuditEvidenceSummary,
  DashboardRunSummary,
  PendingApprovalSummary,
} from "./runs.js";
import type { SourceLabel, TicketSummary } from "./tickets.js";

export interface DashboardDataSource {
  type: SourceLabel;
  label: "Live backend" | "Mock backend" | "Seed data" | "Deferred";
}

export interface HealthSummary {
  status: "ok" | "degraded" | "down";
  mode: "mock" | "real";
  store: {
    mode: string;
    durable: boolean;
  };
  source: SourceLabel;
}

export interface DashboardMemoryStatus {
  status: "deferred" | "unavailable" | "available";
  label: "Deferred" | "Unavailable" | "Live backend";
  message: "Memory evidence is deferred to Phase 3 and Phase 4." | string;
  source: SourceLabel;
}

export interface DashboardObservabilityStatus {
  status: "deferred" | "health-only" | "available";
  label: "Deferred" | "Live backend";
  message: "Operational signals are deferred to Phase 5." | string;
  source: SourceLabel;
}

export interface DashboardResponse {
  generatedAt: string;
  source: DashboardDataSource;
  health: HealthSummary;
  tickets: {
    items: TicketSummary[];
    counts: {
      open: number;
      pending: number;
      done: number;
      total: number;
    };
  };
  runs: {
    active: DashboardRunSummary[];
    terminal: DashboardRunSummary[];
  };
  pendingApprovals: PendingApprovalSummary[];
  auditEvidence: AuditEvidenceSummary[];
  activityStates: ActivityStateSummary[];
  memory: DashboardMemoryStatus;
  observability: DashboardObservabilityStatus;
}
