import type { DashboardRunSummary, SafeTarget, SourceLabel } from "@techbold/contracts";
import type { ObservabilityMetrics, RiskLevel } from "@techbold/contracts";
import { ulid } from "ulid";
import { getDb } from "./db.js";
import { CommandApprovalSchema, CommandResultSchema, type Run, RunSchema } from "./schema.js";

const TERMINAL_RUN_STATUS = new Set(["COMPLETED", "FAILED", "ABORTED"]);

const EMPTY_RISK_COUNTS: Record<RiskLevel, number> = {
  SAFE_READ_ONLY: 0,
  LOW_RISK_CHANGE: 0,
  MEDIUM_RISK_CHANGE: 0,
  HIGH_RISK_BLOCKED: 0,
};

export function createRun(ticketId: number, customerSystemId: string): Run {
  const db = getDb();
  const id = `run_${ulid()}`;
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO runs (id, ticket_id, customer_system_id, status, current_phase, started_at, updated_at, completed_at, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, ticketId, customerSystemId, "CREATED", "CREATED", now, now, null, null],
  );
  return RunSchema.parse(db.get("SELECT * FROM runs WHERE id = ?", [id]));
}

export function getRunById(id: string): Run | undefined {
  const row = getDb().get("SELECT * FROM runs WHERE id = ?", [id]);
  if (!row) return undefined;
  return RunSchema.parse(row);
}

const CUSTOMER_SYSTEM_ID = /^(?:(?<username>[^@:]+)@)?(?<ip>[^:]+):(?<port>\d{1,5})$/;

export function parseSafeTarget(customerSystemId: string): SafeTarget | null {
  const match = customerSystemId.match(CUSTOMER_SYSTEM_ID);
  if (!match?.groups?.ip || !match.groups.port) return null;

  const port = Number(match.groups.port);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) return null;

  return {
    ip: match.groups.ip,
    port,
    username: match.groups.username ?? "",
    os: "",
  };
}

export function resolveSshTargetFromCustomerSystemId(customerSystemId: string): {
  host: string;
  port: number;
  username: string;
} | null {
  const parsed = parseSafeTarget(customerSystemId);
  if (!parsed) return null;

  const envUsername = (process.env.SSH_USERNAME ?? "").trim();
  return {
    host: parsed.ip,
    port: parsed.port,
    username: parsed.username.trim() || envUsername || "azureuser",
  };
}

export function listRunSummaries(
  limit = 20,
  source: SourceLabel = "live-backend",
): DashboardRunSummary[] {
  const rows = getDb().all<unknown>("SELECT * FROM runs ORDER BY updated_at DESC LIMIT ?", [
    Math.max(1, limit),
  ]);

  return rows
    .map((row) => RunSchema.parse(row))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, Math.max(1, limit))
    .map((run) => ({
      runId: run.id,
      ticketId: run.ticket_id,
      ticketTitle: null,
      customerName: null,
      status: run.status,
      phase: run.current_phase,
      updatedAt: run.updated_at,
      latestAuditAt: null,
      hasPendingApproval: false,
      source,
    }));
}

export function updateRunPhase(id: string, phase: string): void {
  getDb().run("UPDATE runs SET current_phase = ?, updated_at = ? WHERE id = ?", [
    phase,
    new Date().toISOString(),
    id,
  ]);
}

export function updateRunStatus(id: string, status: string): void {
  getDb().run("UPDATE runs SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    new Date().toISOString(),
    id,
  ]);
}

export function markRunCompleted(id: string): void {
  const now = new Date().toISOString();
  getDb().run(
    "UPDATE runs SET status = ?, current_phase = ?, completed_at = ?, updated_at = ? WHERE id = ?",
    ["COMPLETED", "COMPLETED", now, now, id],
  );
}

export function markRunFailed(id: string, errorMessage: string): void {
  getDb().run("UPDATE runs SET status = ?, error_message = ?, updated_at = ? WHERE id = ?", [
    "FAILED",
    errorMessage,
    new Date().toISOString(),
    id,
  ]);
}

export function markRunAborted(id: string): void {
  getDb().run("UPDATE runs SET status = ?, updated_at = ? WHERE id = ?", [
    "ABORTED",
    new Date().toISOString(),
    id,
  ]);
}

export function getObservabilityMetrics(): ObservabilityMetrics {
  const db = getDb();
  const runs = db.all<unknown>("SELECT * FROM runs").map((row) => RunSchema.parse(row));
  const active = runs.filter((run) => !TERMINAL_RUN_STATUS.has(run.status)).length;
  const completed = runs.filter((run) => run.status === "COMPLETED").length;
  const failed = runs.filter((run) => run.status === "FAILED").length;
  const aborted = runs.filter((run) => run.status === "ABORTED").length;
  const terminal = completed + failed + aborted;
  const successRate = terminal > 0 ? completed / terminal : null;

  const approvals = db
    .all<unknown>("SELECT * FROM command_approvals")
    .map((row) => CommandApprovalSchema.parse(row));
  const byRisk = { ...EMPTY_RISK_COUNTS };
  for (const approval of approvals) {
    byRisk[approval.risk_level as RiskLevel] += 1;
  }

  const commandResults = db
    .all<unknown>("SELECT * FROM command_results")
    .map((row) => CommandResultSchema.parse(row));
  const executed = commandResults.length;
  const failedCommands = commandResults.filter((result) => result.exit_code !== 0).length;
  const timedOut = commandResults.filter((result) => result.timed_out === 1).length;
  const avgDurationMs =
    executed > 0
      ? commandResults.reduce((sum, result) => sum + result.duration_ms, 0) / executed
      : null;

  const auditByActor: Record<string, number> = {};
  for (const event of db.all<{ actor: string }>("SELECT actor FROM audit_events")) {
    auditByActor[event.actor] = (auditByActor[event.actor] ?? 0) + 1;
  }

  return {
    runs: {
      total: runs.length,
      active,
      completed,
      failed,
      aborted,
      successRate,
    },
    approvals: {
      total: approvals.length,
      pending: approvals.filter((approval) => approval.status === "PENDING").length,
      approved: approvals.filter((approval) => approval.status === "APPROVED").length,
      rejected: approvals.filter((approval) => approval.status === "REJECTED").length,
      byRisk,
    },
    commands: {
      executed,
      failed: failedCommands,
      timedOut,
      avgDurationMs,
    },
    auditByActor,
  };
}
