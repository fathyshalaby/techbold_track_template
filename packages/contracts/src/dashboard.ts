import type {
  ActivityStateSummary,
  AuditEvidenceSummary,
  DashboardRunSummary,
  MemoryIncidentSummary,
  PendingApprovalSummary,
  RiskLevel,
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

export interface ObservabilityMetrics {
  runs: {
    total: number;
    active: number;
    completed: number;
    failed: number;
    aborted: number;
    successRate: number | null;
  };
  approvals: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byRisk: Record<RiskLevel, number>;
  };
  commands: {
    executed: number;
    failed: number;
    timedOut: number;
    avgDurationMs: number | null;
  };
  auditByActor: Record<string, number>;
}

export interface MemoryEntrySummary {
  id: string;
  source: "run" | "runbook" | "training-contract" | "public-seed";
  symptom: string;
  rootCause: string;
  fix: string;
  score: number;
}

export interface MemoryStatsSummary {
  total: number;
  bySource: Record<MemoryEntrySummary["source"], number>;
}

export interface DashboardMemoryStatus {
  status: "deferred" | "unavailable" | "available";
  label: "Deferred" | "Unavailable" | "Live backend";
  message: string;
  source: SourceLabel;
  incidents?: MemoryIncidentSummary[];
  stats?: MemoryStatsSummary;
  entries?: MemoryEntrySummary[];
}

export interface DashboardObservabilityStatus {
  status: "deferred" | "health-only" | "available";
  label: "Deferred" | "Live backend";
  message: string;
  source: SourceLabel;
  metrics?: ObservabilityMetrics;
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
