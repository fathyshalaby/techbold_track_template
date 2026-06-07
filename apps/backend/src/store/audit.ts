import type {
  ActivityStateSummary,
  AuditEvidenceSummary,
  MemoryIncidentSummary,
  PendingApprovalSummary,
  SourceLabel,
} from "@techbold/contracts";
import { ulid } from "ulid";
import { redactSecrets } from "../safety/redaction.js";
import { getDb } from "./db.js";
import {
  type ActivityDraft,
  ActivityDraftSchema,
  type AuditEvent,
  AuditEventSchema,
  type CommandApproval,
  CommandApprovalSchema,
  type CommandResult,
  CommandResultSchema,
  type Observation,
  ObservationSchema,
  RunSchema,
} from "./schema.js";

export function appendAuditEvent(
  runId: string,
  type: string,
  actor: AuditEvent["actor"],
  payload: unknown,
): AuditEvent {
  const db = getDb();
  const id = `ev_${ulid()}`;
  const ts = new Date().toISOString();
  const payloadJson = redactSecrets(JSON.stringify(payload));
  db.run(
    "INSERT INTO audit_events (id, run_id, type, actor, ts, payload_json) VALUES (?, ?, ?, ?, ?, ?)",
    [id, runId, type, actor, ts, payloadJson],
  );
  return AuditEventSchema.parse(db.get("SELECT * FROM audit_events WHERE id = ?", [id]));
}

export function getAuditEvents(runId: string): AuditEvent[] {
  const rows = getDb().all<AuditEvent>(
    "SELECT * FROM audit_events WHERE run_id = ? ORDER BY ts ASC",
    [runId],
  );
  return rows.map((r) => AuditEventSchema.parse(r));
}

function normalizeLimit(limit: number | undefined): number {
  return Math.max(1, Math.min(50, limit ?? 20));
}

function summarizePayload(payloadJson: string): string {
  try {
    const parsed = JSON.parse(payloadJson) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return redactSecrets(String(parsed)).slice(0, 180);
    }

    const entries = Object.entries(parsed as Record<string, unknown>);
    const summary = entries
      .slice(0, 4)
      .map(([key, value]) => {
        if (/token|secret|private|key|password|error|message|detail/i.test(key)) {
          return "sensitive field: [redacted]";
        }
        if (value === null || value === undefined) return `${key}: ${value}`;
        if (typeof value === "object")
          return `${key}: ${Array.isArray(value) ? "array" : "object"}`;
        return `${key}: ${redactSecrets(String(value))}`;
      })
      .join("; ");
    return (summary || "empty payload").slice(0, 180);
  } catch {
    return "unparseable redacted payload";
  }
}

export function listPendingApprovalSummaries(
  limit?: number,
  source: SourceLabel = "live-backend",
): PendingApprovalSummary[] {
  const max = normalizeLimit(limit);
  const runs = new Map(
    getDb()
      .all<unknown>("SELECT * FROM runs")
      .map((row) => {
        const run = RunSchema.parse(row);
        return [run.id, run] as const;
      }),
  );

  return getDb()
    .all<unknown>(
      "SELECT * FROM command_approvals WHERE status = ? ORDER BY created_at DESC LIMIT ?",
      ["PENDING", max],
    )
    .map((row) => CommandApprovalSchema.parse(row))
    .filter((approval) => approval.status === "PENDING")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, max)
    .flatMap((approval) => {
      const run = runs.get(approval.run_id);
      if (!run) return [];
      return [
        {
          approvalId: approval.id,
          runId: approval.run_id,
          ticketId: run.ticket_id,
          ticketTitle: null,
          proposedCommand: redactSecrets(approval.proposed_command),
          riskLevel: approval.risk_level,
          createdAt: approval.created_at,
          source,
        },
      ];
    });
}

export function listAuditEvidenceSummaries(
  limit?: number,
  source: SourceLabel = "live-backend",
): AuditEvidenceSummary[] {
  const max = normalizeLimit(limit);
  return getDb()
    .all<unknown>("SELECT * FROM audit_events ORDER BY ts DESC LIMIT ?", [max])
    .map((row) => AuditEventSchema.parse(row))
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, max)
    .map((event) => ({
      id: event.id,
      runId: event.run_id,
      type: event.type,
      actor: event.actor,
      ts: event.ts,
      payloadSummary: summarizePayload(event.payload_json),
      source,
    }));
}

export function listActivityStateSummaries(
  limit?: number,
  source: SourceLabel = "live-backend",
): ActivityStateSummary[] {
  const max = normalizeLimit(limit);
  const latestDraftByRun = new Map<string, ActivityDraft>();
  for (const row of getDb().all<unknown>(
    "SELECT * FROM activity_drafts ORDER BY created_at DESC LIMIT ?",
    [max],
  )) {
    const draft = ActivityDraftSchema.parse(row);
    const existing = latestDraftByRun.get(draft.run_id);
    if (!existing || draft.created_at > existing.created_at) {
      latestDraftByRun.set(draft.run_id, draft);
    }
  }

  return getDb()
    .all<unknown>("SELECT * FROM runs ORDER BY updated_at DESC LIMIT ?", [max])
    .map((row) => RunSchema.parse(row))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, max)
    .map((run) => {
      const draft = latestDraftByRun.get(run.id);
      return {
        runId: run.id,
        ticketId: run.ticket_id,
        state: draft ? (draft.submitted === 1 ? "submitted" : "drafted") : "not-drafted",
        summary: draft ? redactSecrets(draft.summary) : null,
        validationResult: draft ? redactSecrets(draft.validation_result) : null,
        updatedAt: draft?.submitted_at ?? draft?.created_at ?? null,
        source,
      };
    });
}

const TERMINAL_RUN_STATUS = new Set(["COMPLETED", "FAILED", "ABORTED"]);

export function listResolvedIncidents(
  limit?: number,
  source: SourceLabel = "live-backend",
): MemoryIncidentSummary[] {
  const max = normalizeLimit(limit);
  const latestDraftByRun = new Map<string, ActivityDraft>();
  for (const row of getDb().all<unknown>(
    "SELECT * FROM activity_drafts ORDER BY created_at DESC",
  )) {
    const draft = ActivityDraftSchema.parse(row);
    if (!latestDraftByRun.has(draft.run_id)) {
      latestDraftByRun.set(draft.run_id, draft);
    }
  }

  return getDb()
    .all<unknown>("SELECT * FROM runs ORDER BY updated_at DESC")
    .map((row) => RunSchema.parse(row))
    .filter((run) => TERMINAL_RUN_STATUS.has(run.status))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, max)
    .map((run) => {
      const draft = latestDraftByRun.get(run.id);
      const state: MemoryIncidentSummary["state"] = draft
        ? draft.submitted === 1
          ? "submitted"
          : "drafted"
        : "not-drafted";
      return {
        runId: run.id,
        ticketId: run.ticket_id,
        ticketTitle: null,
        customerName: null,
        status: run.status,
        rootCause: draft ? redactSecrets(draft.root_cause) : null,
        durableFix: draft ? redactSecrets(draft.actions_taken) : null,
        validationResult: draft ? redactSecrets(draft.validation_result) : null,
        resolvedAt: run.completed_at ?? draft?.submitted_at ?? draft?.created_at ?? run.updated_at,
        state,
        source,
      };
    });
}

export function createPendingApproval(
  runId: string,
  proposal: {
    proposedCommand: string;
    purpose: string;
    expectedSignal: string;
    riskLevel: string;
    safetyNotes: string;
  },
): CommandApproval {
  const db = getDb();
  const id = `appr_${ulid()}`;
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO command_approvals (id, run_id, proposed_command, edited_command, final_command, purpose, expected_signal, risk_level, safety_notes, status, technician_reason, created_at, decided_at, executed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      runId,
      proposal.proposedCommand,
      null,
      null,
      proposal.purpose,
      proposal.expectedSignal,
      proposal.riskLevel,
      proposal.safetyNotes,
      "PENDING",
      null,
      now,
      null,
      null,
    ],
  );
  return CommandApprovalSchema.parse(db.get("SELECT * FROM command_approvals WHERE id = ?", [id]));
}

export function updateApprovalStatus(
  id: string,
  update: {
    status: string;
    editedCommand?: string;
    finalCommand?: string;
    riskLevel?: string;
    technicianReason?: string;
    decidedAt?: string;
    executedAt?: string;
  },
): void {
  const db = getDb();
  db.run(
    "UPDATE command_approvals SET status = ?, edited_command = COALESCE(?, edited_command), final_command = COALESCE(?, final_command), risk_level = COALESCE(?, risk_level), technician_reason = COALESCE(?, technician_reason), decided_at = COALESCE(?, decided_at), executed_at = COALESCE(?, executed_at) WHERE id = ?",
    [
      update.status,
      update.editedCommand ?? null,
      update.finalCommand ?? null,
      update.riskLevel ?? null,
      update.technicianReason ?? null,
      update.decidedAt ?? null,
      update.executedAt ?? null,
      id,
    ],
  );
}

export function appendCommandResult(
  runId: string,
  approvalId: string,
  result: {
    command: string;
    exitCode: number;
    stdoutRedacted: string;
    stderrRedacted: string;
    durationMs: number;
    timedOut: boolean;
  },
): CommandResult {
  const db = getDb();
  const id = `res_${ulid()}`;
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO command_results (id, run_id, approval_id, command, exit_code, stdout_redacted, stderr_redacted, duration_ms, timed_out, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      runId,
      approvalId,
      redactSecrets(result.command),
      result.exitCode,
      // Defence-in-depth: redact here too, not only at the caller. redactSecrets
      // is idempotent, so re-redacting already-clean text is harmless - but a
      // future caller that forgets to pre-redact can't leak a secret into the
      // audit DB (the C-score source of truth).
      redactSecrets(result.stdoutRedacted),
      redactSecrets(result.stderrRedacted),
      result.durationMs,
      result.timedOut ? 1 : 0,
      now,
    ],
  );
  return CommandResultSchema.parse(db.get("SELECT * FROM command_results WHERE id = ?", [id]));
}

export function appendObservation(
  runId: string,
  source: Observation["source"],
  content: string,
): Observation {
  const db = getDb();
  const id = `obs_${ulid()}`;
  const now = new Date().toISOString();
  // Defence-in-depth: redact here too. Observations feed the model and the
  // activity draft, so an un-redacted write would leak into both. Idempotent.
  db.run(
    "INSERT INTO observations (id, run_id, source, content, created_at) VALUES (?, ?, ?, ?, ?)",
    [id, runId, source, redactSecrets(content), now],
  );
  return ObservationSchema.parse(db.get("SELECT * FROM observations WHERE id = ?", [id]));
}

export function saveActivityDraft(
  runId: string,
  fields: {
    summary: string;
    rootCause: string;
    actionsTaken: string;
    commandsSummary: string;
    validationResult: string;
  },
): ActivityDraft {
  const db = getDb();
  const id = `act_${ulid()}`;
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO activity_drafts (id, run_id, summary, root_cause, actions_taken, commands_summary, validation_result, submitted, created_at, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      runId,
      redactSecrets(fields.summary),
      redactSecrets(fields.rootCause),
      redactSecrets(fields.actionsTaken),
      redactSecrets(fields.commandsSummary),
      redactSecrets(fields.validationResult),
      0,
      now,
      null,
    ],
  );
  return ActivityDraftSchema.parse(db.get("SELECT * FROM activity_drafts WHERE id = ?", [id]));
}

export function getActivityDraft(runId: string): ActivityDraft | undefined {
  const row = getDb().get<ActivityDraft>(
    "SELECT * FROM activity_drafts WHERE run_id = ? ORDER BY created_at DESC LIMIT 1",
    [runId],
  );
  if (!row) return undefined;
  return ActivityDraftSchema.parse(row);
}
