import { Hono } from 'hono';
import { z } from 'zod';
import { runActivityLogGenerator, AgentUnavailableError } from '../ai/agents/activity-log-generator.js';
import { getRunById, markRunCompleted } from '../store/runs.js';
import {
  saveActivityDraft,
  getActivityDraft,
  appendAuditEvent,
  getAuditEvents,
} from '../store/audit.js';
import { getDb } from '../store/db.js';
import { redactSecrets } from '../safety/redaction.js';
import { getPhoenixClient } from './runs.js';
import {
  PhoenixNetworkError,
  PhoenixAuthError,
  PhoenixValidationError,
} from '../phoenix/client.js';
import { runEventBus } from '../events/run-event-bus.js';
import type { ActivityLogGeneratorInput } from '../ai/agents/activity-log-generator.js';

export const activityRouter = new Hono();

export const SubmitBodySchema = z.object({
  summary: z.string().optional(),
  rootCause: z.string().optional(),
  actionsTaken: z.string().optional(),
  commandsSummary: z.string().optional(),
  validationResult: z.string().optional(),
});

const DRAFT_ALLOWED_PHASES = new Set([
  'WAITING_FOR_ACTIVITY_REVIEW',
  'DRAFTING_ACTIVITY',
  'COMPLETED',
]);

activityRouter.post('/:runId/activity/draft', async (c) => {
  const { runId } = c.req.param();

  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: 'run not found' }, 404);
  }

  if (!DRAFT_ALLOWED_PHASES.has(run.current_phase)) {
    return c.json({ error: 'run has not reached activity review phase' }, 409);
  }

  const auditEvents = getAuditEvents(runId);

  const db = getDb();
  const commandResultRows = db.all<{
    command: string;
    exit_code: number;
    stdout_redacted: string;
    stderr_redacted: string;
  }>('SELECT command, exit_code, stdout_redacted, stderr_redacted FROM command_results WHERE run_id = ? ORDER BY created_at ASC', [runId]);

  const observationRows = db.all<{ content: string }>(
    'SELECT content FROM observations WHERE run_id = ? ORDER BY created_at ASC',
    [runId],
  );

  const startedEvent = auditEvents.find((e) => e.type === 'run.started');
  let ticketDescription = '';
  if (startedEvent) {
    try {
      const payload = JSON.parse(startedEvent.payload_json) as Record<string, unknown>;
      ticketDescription = typeof payload['ticketDescription'] === 'string'
        ? payload['ticketDescription']
        : '';
    } catch {
      ticketDescription = '';
    }
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
      return c.json({ error: 'agent unavailable' }, 502);
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

activityRouter.post('/:runId/activity/submit', async (c) => {
  const { runId } = c.req.param();

  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: 'run not found' }, 404);
  }

  // Idempotency: a submitted run is COMPLETED. Refuse a second submit so a
  // double-click can't create duplicate ERP activities for one incident.
  if (run.status === 'COMPLETED') {
    return c.json({ error: 'activity already submitted' }, 409);
  }

  const rawBody = await c.req.json().catch(() => ({}));
  const parsed = SubmitBodySchema.safeParse(rawBody);
  const overrides = parsed.success ? parsed.data : {};

  const draft = getActivityDraft(runId);

  const hasOverrides = Object.values(overrides).some((v) => v !== undefined);
  if (!draft && !hasOverrides) {
    return c.json({ error: 'no draft to submit' }, 409);
  }

  const summary = redactSecrets(overrides.summary ?? draft?.summary ?? '');
  const rootCause = redactSecrets(overrides.rootCause ?? draft?.root_cause ?? '');
  const actionsTaken = redactSecrets(overrides.actionsTaken ?? draft?.actions_taken ?? '');
  const commandsSummary = redactSecrets(overrides.commandsSummary ?? draft?.commands_summary ?? '');
  const validationResult = redactSecrets(overrides.validationResult ?? draft?.validation_result ?? '');

  const auditEvents = getAuditEvents(runId);
  const startDatetime = auditEvents.length > 0
    ? auditEvents[0].ts
    : new Date().toISOString();
  const endDatetime = new Date().toISOString();

  const client = getPhoenixClient();
  let activity: Awaited<ReturnType<typeof client.createActivity>>;
  try {
    activity = await client.createActivity({
      ticket_id: run.ticket_id,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
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
      return c.json({ error: 'failed to create Phoenix activity' }, 502);
    }
    throw err;
  }

  appendAuditEvent(runId, 'activity.submitted', 'system', { activityId: activity.id });
  runEventBus.emit(runId, 'activity.submitted', { activityId: activity.id });

  // Mark the specific draft submitted. UPDATE … ORDER BY … LIMIT is non-portable
  // (only some SQLite builds support it, and the JSONL adapter can't parse it),
  // so target the draft by id — works on every backend.
  if (draft) {
    const now = new Date().toISOString();
    getDb().run(
      'UPDATE activity_drafts SET submitted = 1, submitted_at = ? WHERE id = ?',
      [now, draft.id],
    );
  }

  markRunCompleted(runId);

  return c.json(activity, 200);
});
