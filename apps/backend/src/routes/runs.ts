import { Hono } from "hono";
import { z } from "zod";
import { advance } from "../ai/orchestrator.js";
import { getEnv, resolveClientMode } from "../env.js";
import {
  PhoenixAuthError,
  PhoenixClient,
  PhoenixNetworkError,
  PhoenixNotFoundError,
} from "../phoenix/client.js";
import MockPhoenixClient from "../phoenix/mock.js";
import { appendObservation, getActivityDraft, getAuditEvents } from "../store/audit.js";
import { getDb, makeJsonlAdapter, setDb } from "../store/db.js";
import { createRun, getRunById, parseSafeTarget, updateRunPhase } from "../store/runs.js";
import { CommandApprovalSchema } from "../store/schema.js";

export const runsRouter = new Hono();

export const CreateRunBodySchema = z.object({
  ticketId: z.number().int().positive(),
});

export function getPhoenixClient() {
  if (resolveClientMode("phoenix") === "mock") {
    return new MockPhoenixClient({ seedScenarios: getEnv().MOCK_SCENARIOS });
  }
  const env = getEnv();
  return new PhoenixClient(env.PHOENIX_API_BASE_URL, env.PHOENIX_API_TOKEN);
}

function getPendingApproval(runId: string) {
  const db = getDb();
  const rows = db.all<Record<string, unknown>>("SELECT * FROM command_approvals WHERE run_id = ?", [
    runId,
  ]);
  // Pick the MOST RECENT pending approval. Normally only one is pending, but if a
  // stale row ever lingered, ordering avoids surfacing the wrong command to the UI.
  const pending = rows
    .filter((r) => r.status === "PENDING")
    .sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")))
    .at(-1);
  if (!pending) return null;
  const parsed = CommandApprovalSchema.safeParse(pending);
  return parsed.success ? parsed.data : null;
}

runsRouter.post("/", async (c) => {
  const rawBody = await c.req.json().catch(() => null);
  const parsed = CreateRunBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return c.json({ error: "invalid request body" }, 400);
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
      return c.json({ error: "ticket or customer system not found" }, 404);
    }
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    throw err;
  }

  const { system } = customerSystemData;
  // Split on ':' in advance() at orchestrator.ts:576 - no protocol prefix
  const customerSystemId = `${system.ip}:${system.port}`;

  const run = createRun(ticketId, customerSystemId);
  // Seed the customer's reported SYMPTOM as a 'phoenix'-source observation so
  // every agent (diagnose/fix/validate) and the activity generator reason about
  // the actual incident, not just an id. Redacted inside appendObservation.
  appendObservation(
    run.id,
    "phoenix",
    `Ticket #${ticket.id}: "${ticket.title}" [priority: ${ticket.priority}] for ${ticket.customer_name}. ` +
      `Reported symptom: ${ticket.description}`,
  );
  // Transition CREATED -> LOADED_CONTEXT synchronously without calling advance()
  // (advance() auto-recurses through LOADED_CONTEXT -> TRIAGING -> LLM agent call,
  // which violates the PRD §9 201-response contract)
  updateRunPhase(run.id, "LOADED_CONTEXT");

  return c.json(
    {
      runId: run.id,
      status: "LOADED_CONTEXT" as const,
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

runsRouter.get("/:runId", async (c) => {
  const { runId } = c.req.param();
  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: "run not found" }, 404);
  }

  const timeline = getAuditEvents(runId);
  const pendingApproval = getPendingApproval(runId);
  const activityDraft = getActivityDraft(runId) ?? null;
  const source = resolveClientMode("phoenix") === "mock" ? "mock-backend" : "live-backend";
  let ticket: {
    id: number;
    title: string;
    priority: string;
    status: string;
    customer_name: string;
    source: typeof source;
  } | null = null;

  try {
    const loaded = await getPhoenixClient().getTicket(run.ticket_id);
    ticket = {
      id: loaded.id,
      title: loaded.title,
      priority: loaded.priority,
      status: loaded.status,
      customer_name: loaded.customer_name,
      source,
    };
  } catch {
    ticket = null;
  }

  return c.json({
    runId: run.id,
    status: run.status,
    phase: run.current_phase,
    timeline,
    pendingApproval,
    activityDraft,
    ticketId: run.ticket_id,
    customerSystemId: run.customer_system_id,
    ticket,
    target: parseSafeTarget(run.customer_system_id),
    source,
  });
});

const TERMINAL_RUN_STATUS = new Set(["COMPLETED", "FAILED", "ABORTED"]);

runsRouter.post("/:runId/next", async (c) => {
  const { runId } = c.req.param();
  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: "run not found" }, 404);
  }
  if (TERMINAL_RUN_STATUS.has(run.status)) {
    return c.json({ error: "run has finished", status: run.status }, 409);
  }

  const state = await advance(runId);

  // An agent (LLM) failure carries a message back on the state without changing
  // phase. Surface it as a 502 so the technician sees "AI agent unavailable"
  // instead of a /next call that silently does nothing (a frozen-looking run).
  if (state.errorMessage) {
    return c.json(
      {
        error: "AI agent unavailable",
        detail: state.errorMessage,
        status: state.status,
        phase: state.phase,
      },
      502,
    );
  }

  const pendingApproval = getPendingApproval(runId);

  return c.json({
    status: state.status,
    phase: state.phase,
    pendingApproval,
  });
});

runsRouter.post("/:runId/abort", async (c) => {
  const { runId } = c.req.param();
  const run = getRunById(runId);
  if (!run) {
    return c.json({ error: "run not found" }, 404);
  }
  if (TERMINAL_RUN_STATUS.has(run.status)) {
    return c.json({ error: "run has already finished", status: run.status }, 409);
  }

  const state = await advance(runId, { type: "abort" });

  return c.json({
    status: state.status,
    phase: state.phase,
  });
});
