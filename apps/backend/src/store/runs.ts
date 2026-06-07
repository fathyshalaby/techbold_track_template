import type { DashboardRunSummary, SafeTarget, SourceLabel } from "@techbold/contracts";
import { ulid } from "ulid";
import { getDb } from "./db.js";
import { type Run, RunSchema } from "./schema.js";

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

export function parseSafeTarget(customerSystemId: string): SafeTarget | null {
  const match = customerSystemId.match(/^([^:]+):(\d{1,5})$/);
  if (!match) return null;

  const port = Number(match[2]);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) return null;

  return {
    ip: match[1],
    port,
    username: "",
    os: "",
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
