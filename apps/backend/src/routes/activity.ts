import { Hono } from "hono";
import { z } from "zod";
import {
  AgentUnavailableError,
  runActivityLogGenerator,
} from "../ai/agents/activity-log-generator.js";
import type { ActivityLogGeneratorInput } from "../ai/agents/activity-log-generator.js";
import { runEventBus } from "../events/run-event-bus.js";
import { upsertSolution } from "../memory/store.js";
import {
  PhoenixAuthError,
  PhoenixNetworkError,
  PhoenixValidationError,
} from "../phoenix/client.js";
import { getPhoenixClient } from "../phoenix/factory.js";
import { redactSecrets } from "../safety/redaction.js";
import {
  appendAuditEvent,
  getActivityDraft,
  getAuditEvents,
  saveActivityDraft,
} from "../store/audit.js";
import { getDb } from "../store/db.js";
import { getRunById, markRunCompleted } from "../store/runs.js";

export const activityRouter = new Hono();

export const SubmitBodySchema = z.object({
  summary: z.string().optional(),
  rootCause: z.string().optional(),
  actionsTaken: z.string().optional(),
  commandsSummary: z.string().optional(),
  validationResult: z.string().optional(),
});

const DRAFT_ALLOWED_PHASES = new Set([
  "WAITING_FOR_ACTIVITY_REVIEW",
  "DRAFTING_ACTIVITY",
  "COMPLETED",
]);

function parseAuditPayload(payloadJson: string): Record<string, unknown> | null {
  try {
    const payload = JSON.parse(payloadJson) as unknown;
    return payload !== null && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

activityRouter.post("/:runId/activity/draft", async (c) => {
  const { runId } = c.req.param();

  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: "run not found" }, 404);
  }

  if (!DRAFT_ALLOWED_PHASES.has(run.current_phase)) {
    return c.json({ error: "run has not reached activity review phase" }, 409);
  }

  const auditEvents = getAuditEvents(runId);

  const db = getDb();
  const commandResultRows = db.all<{
    command: string;
    exit_code: number;
    stdout_redacted: string;
    stderr_redacted: string;
  }>(
    "SELECT command, exit_code, stdout_redacted, stderr_redacted FROM command_results WHERE run_id = ? ORDER BY created_at ASC",
    [runId],
  );

  const observationRows = db.all<{ content: string; source: string }>(
    "SELECT content, source FROM observations WHERE run_id = ? ORDER BY created_at ASC",
    [runId],
  );

  const startedEvent = auditEvents.find((e) => e.type === "run.started");
  let ticketDescription = "";
  const phoenixObservation = observationRows.find((row) => row.source === "phoenix");
  if (phoenixObservation?.content.trim()) {
    ticketDescription = phoenixObservation.content;
  } else if (startedEvent) {
    const payload = parseAuditPayload(startedEvent.payload_json);
    ticketDescription =
      typeof payload?.ticketDescription === "string" ? payload.ticketDescription : "";
  }

  const input: ActivityLogGeneratorInput = {
    auditEvents: auditEvents.map((e) => ({
      type: e.type,
      actor: e.actor,
      ts: e.ts,
      payload_json: e.payload_json,
    })),
    commandResults: commandResultRows.map((r) => ({
      command: r.command,
      exitCode: r.exit_code,
      stdoutRedacted: r.stdout_redacted,
      stderrRedacted: r.stderr_redacted,
    })),
    observations: observationRows.map((r) => r.content),
    ticketDescription,
  };

  let fields: Awaited<ReturnType<typeof runActivityLogGenerator>>;
  try {
    fields = await runActivityLogGenerator(input);
  } catch (err) {
    if (err instanceof AgentUnavailableError) {
      return c.json({ error: "agent unavailable" }, 502);
    }
    throw err;
  }

  const redacted = {
    summary: redactSecrets(fields.summary),
    rootCause: redactSecrets(fields.rootCause),
    actionsTaken: redactSecrets(fields.actionsTaken),
    commandsSummary: redactSecrets(fields.commandsSummary),
    validationResult: redactSecrets(fields.validationResult),
  };

  const draft = saveActivityDraft(runId, redacted);
  return c.json(draft, 200);
});

activityRouter.post("/:runId/activity/submit", async (c) => {
  const { runId } = c.req.param();

  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: "run not found" }, 404);
  }

  // Idempotency: a submitted run is COMPLETED. Refuse a second submit so a
  // double-click can't create duplicate ERP activities for one incident.
  if (run.status === "COMPLETED") {
    return c.json({ error: "activity already submitted" }, 409);
  }

  const rawBody = await c.req.json().catch(() => ({}));
  const parsed = SubmitBodySchema.safeParse(rawBody);
  const overrides = parsed.success ? parsed.data : {};

  const draft = getActivityDraft(runId);

  const overriddenFields = (Object.keys(overrides) as (keyof typeof overrides)[]).filter(
    (k) => overrides[k] !== undefined,
  );
  const hasOverrides = overriddenFields.length > 0;
  if (!draft && !hasOverrides) {
    return c.json({ error: "no draft to submit" }, 409);
  }

  // Record any technician edits that diverge from the audit-grounded draft, so the
  // trail explains why a submitted field differs from what the generator produced.
  if (hasOverrides) {
    appendAuditEvent(runId, "activity.fields_overridden", "technician", {
      fields: overriddenFields,
    });
  }

  const summary = redactSecrets(overrides.summary ?? draft?.summary ?? "");
  const rootCause = redactSecrets(overrides.rootCause ?? draft?.root_cause ?? "");
  const actionsTaken = redactSecrets(overrides.actionsTaken ?? draft?.actions_taken ?? "");
  const commandsSummary = redactSecrets(overrides.commandsSummary ?? draft?.commands_summary ?? "");
  const validationResult = redactSecrets(
    overrides.validationResult ?? draft?.validation_result ?? "",
  );

  const auditEvents = getAuditEvents(runId);
  const startDatetime = auditEvents.length > 0 ? auditEvents[0].ts : new Date().toISOString();
  const endDatetime = new Date().toISOString();

  const client = getPhoenixClient();
  let activity: Awaited<ReturnType<typeof client.createActivity>>;
  try {
    activity = await client.createActivity({
      ticket_id: run.ticket_id,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      description: summary || rootCause || "Service desk activity",
      summary,
      root_cause: rootCause,
      actions_taken: actionsTaken,
      commands_summary: commandsSummary,
      validation_result: validationResult,
    });
  } catch (err) {
    if (
      err instanceof PhoenixNetworkError ||
      err instanceof PhoenixAuthError ||
      err instanceof PhoenixValidationError
    ) {
      return c.json({ error: "failed to create Phoenix activity" }, 502);
    }
    throw err;
  }

  appendAuditEvent(runId, "activity.submitted", "system", { activityId: activity.id });
  runEventBus.emit(runId, "activity.submitted", { activityId: activity.id });

  // Close the ERP ticket ONLY when the fix was actually validated. The run can
  // reach activity review WITHOUT a validated fix (the MAX_STEPS cap jumps
  // straight to WAITING_FOR_ACTIVITY_REVIEW, and NOT_FIXED loops can hit it too).
  // Marking such a ticket DONE would be an over-claim of resolution: the exact
  // failure the safety/audit rubric punishes. So gate on a recorded validation.
  const validated = auditEvents.some((e) => {
    if (e.type !== "validation.completed") return false;
    const p = parseAuditPayload(e.payload_json);
    return p?.status === "VERIFIED_FIXED" || p?.status === "LIKELY_FIXED";
  });

  if (validated) {
    // Best-effort: the activity (the scored record) is already created, so a
    // failed status PATCH must NOT fail the submit (which would risk a duplicate
    // activity on retry), so audit it and continue.
    try {
      await client.setStatus(run.ticket_id, "DONE");
      appendAuditEvent(runId, "ticket.status_updated", "system", {
        ticketId: run.ticket_id,
        status: "DONE",
      });
    } catch {
      appendAuditEvent(runId, "ticket.status_update_failed", "system", { ticketId: run.ticket_id });
    }
  } else {
    // No validated fix: leave the ticket OPEN/PENDING and record why.
    appendAuditEvent(runId, "ticket.left_open_unvalidated", "system", { ticketId: run.ticket_id });
  }

  // Mark the specific draft submitted. UPDATE ORDER BY LIMIT is non-portable
  // (only some SQLite builds support it, and the JSONL adapter can't parse it),
  // so target the draft by id.
  if (draft) {
    const now = new Date().toISOString();
    getDb().run("UPDATE activity_drafts SET submitted = 1, submitted_at = ? WHERE id = ?", [
      now,
      draft.id,
    ]);
  }

  markRunCompleted(runId);

  if (validated) {
    try {
      const commandRows = getDb().all<{ command: string; exit_code: number }>(
        "SELECT command, exit_code FROM command_results WHERE run_id = ? ORDER BY created_at ASC",
        [runId],
      );
      const commands = commandRows
        .map((row) => `$ ${row.command} (exit ${row.exit_code})`)
        .join("\n");
      const startedEvent = auditEvents.find((e) => e.type === "run.started");
      const startedPayload = startedEvent ? parseAuditPayload(startedEvent.payload_json) : null;
      const symptom =
        typeof startedPayload?.ticketDescription === "string"
          ? startedPayload.ticketDescription
          : `Ticket #${run.ticket_id}`;

      await upsertSolution({
        source: "run",
        runId,
        ticketId: run.ticket_id,
        symptom,
        rootCause,
        fix: actionsTaken,
        commands: commandsSummary || commands,
        validationStatus: validationResult,
        tags: ["validated", "run"],
      });
      appendAuditEvent(runId, "memory.indexed", "system", { runId });
    } catch (err) {
      appendAuditEvent(runId, "memory.index_failed", "system", {
        message: (err as Error).message,
      });
    }
  }

  return c.json(activity, 200);
});
