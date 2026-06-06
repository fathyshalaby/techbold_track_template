import { Hono } from 'hono';
import { z } from 'zod';
import { advance } from '../ai/orchestrator.js';
import { createRun, getRunById, updateRunPhase } from '../store/runs.js';
import { getAuditEvents, getActivityDraft } from '../store/audit.js';
import { getDb, makeJsonlAdapter, setDb } from '../store/db.js';
import { resolveClientMode, getEnv } from '../env.js';
import { PhoenixClient, PhoenixAuthError, PhoenixNotFoundError, PhoenixNetworkError } from '../phoenix/client.js';
import MockPhoenixClient from '../phoenix/mock.js';
import { CommandApprovalSchema } from '../store/schema.js';

export const runsRouter = new Hono();

export const CreateRunBodySchema = z.object({
  ticketId: z.number().int().positive(),
});

export function getPhoenixClient() {
  if (resolveClientMode('phoenix') === 'mock') {
    return new MockPhoenixClient();
  }
  const env = getEnv();
  return new PhoenixClient(env.PHOENIX_API_BASE_URL, env.PHOENIX_API_TOKEN);
}

function getPendingApproval(runId: string) {
  const db = getDb();
  const rows = db.all<Record<string, unknown>>(
    'SELECT * FROM command_approvals WHERE run_id = ?',
    [runId],
  );
  const pending = rows.find((r) => r['status'] === 'PENDING');
  if (!pending) return null;
  const parsed = CommandApprovalSchema.safeParse(pending);
  return parsed.success ? parsed.data : null;
}

runsRouter.post('/', async (c) => {
  const rawBody = await c.req.json().catch(() => null);
  const parsed = CreateRunBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return c.json({ error: 'invalid request body' }, 400);
  }
  const { ticketId } = parsed.data;

  const client = getPhoenixClient();
  let ticket: Awaited<ReturnType<typeof client.getTicket>>;
  let customerSystemData: Awaited<ReturnType<typeof client.getCustomerSystem>>;

  try {
    ticket = await client.getTicket(ticketId);
    customerSystemData = await client.getCustomerSystem(ticketId);
  } catch (err) {
    if (err instanceof PhoenixNotFoundError || err instanceof TypeError) {
      return c.json({ error: 'ticket or customer system not found' }, 404);
    }
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: 'upstream authentication failed' }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: 'ERP unavailable' }, 502);
    }
    throw err;
  }

  const { system } = customerSystemData;
  // Split on ':' in advance() at orchestrator.ts:576 — no protocol prefix
  const customerSystemId = `${system.ip}:${system.port}`;

  const run = createRun(ticketId, customerSystemId);
  // Transition CREATED → LOADED_CONTEXT synchronously without calling advance()
  // (advance() auto-recurses through LOADED_CONTEXT → TRIAGING → LLM agent call,
  // which violates the PRD §9 201-response contract)
  updateRunPhase(run.id, 'LOADED_CONTEXT');

  return c.json(
    {
      runId: run.id,
      status: 'LOADED_CONTEXT' as const,
      ticket: {
        id: ticket.id,
        title: ticket.title,
        priority: ticket.priority,
        status: ticket.status,
        customer_name: ticket.customer_name,
      },
      customerSystem: {
        ip: system.ip,
        port: system.port,
        username: system.username,
        os: system.os,
      },
    },
    201,
  );
});

runsRouter.get('/:runId', async (c) => {
  const { runId } = c.req.param();
  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: 'run not found' }, 404);
  }

  const timeline = getAuditEvents(runId);
  const pendingApproval = getPendingApproval(runId);
  const activityDraft = getActivityDraft(runId) ?? null;

  return c.json({
    runId: run.id,
    status: run.status,
    phase: run.current_phase,
    timeline,
    pendingApproval,
    activityDraft,
  });
});

runsRouter.post('/:runId/next', async (c) => {
  const { runId } = c.req.param();
  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: 'run not found' }, 404);
  }

  const state = await advance(runId);
  const pendingApproval = getPendingApproval(runId);

  return c.json({
    status: state.status,
    phase: state.phase,
    pendingApproval,
  });
});

runsRouter.post('/:runId/abort', async (c) => {
  const { runId } = c.req.param();
  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: 'run not found' }, 404);
  }

  const state = await advance(runId, { type: 'abort' });

  return c.json({
    status: state.status,
    phase: state.phase,
  });
});
