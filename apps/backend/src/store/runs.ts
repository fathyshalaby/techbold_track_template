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
