import type {
  DashboardDataSource,
  DashboardResponse,
  SourceLabel,
  TicketSummary,
} from "@techbold/contracts";
import { Hono } from "hono";
import { z } from "zod";
import { isMockMode, resolveClientMode } from "../env.js";
import {
  PhoenixAuthError,
  PhoenixNetworkError,
  PhoenixNotFoundError,
  PhoenixValidationError,
} from "../phoenix/client.js";
import {
  listActivityStateSummaries,
  listAuditEvidenceSummaries,
  listPendingApprovalSummaries,
} from "../store/audit.js";
import { getStoreStatus } from "../store/db.js";
import { listRunSummaries } from "../store/runs.js";
import { getPhoenixClient } from "./runs.js";

export const dashboardRouter = new Hono();

const LimitQuerySchema = z.object({
  // Query params arrive as strings; coerce, clamp the range, default to 20.
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const TERMINAL_RUN_STATUS = new Set(["COMPLETED", "FAILED", "ABORTED"]);

function sourceLabel(): SourceLabel {
  return isMockMode() || resolveClientMode("phoenix") === "mock" ? "mock-backend" : "live-backend";
}

function dataSource(source: SourceLabel): DashboardDataSource {
  return {
    type: source,
    label: source === "mock-backend" ? "Mock backend" : "Live backend",
  };
}

function summarizeTicket(ticket: {
  id: number;
  title: string;
  priority: string;
  status: string;
  customer_name: string;
}): TicketSummary {
  return {
    id: ticket.id,
    title: ticket.title,
    priority: ticket.priority,
    status: ticket.status,
    customer_name: ticket.customer_name,
    source: sourceLabel(),
  };
}

dashboardRouter.get("/", async (c) => {
  const parsed = LimitQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "invalid query parameters" }, 400);
  }

  const { limit } = parsed.data;
  const source = sourceLabel();
  let tickets: TicketSummary[] = [];

  try {
    tickets = (await getPhoenixClient().listTickets({})).map(summarizeTicket);
  } catch (err) {
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNetworkError || err instanceof PhoenixValidationError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    if (err instanceof PhoenixNotFoundError) {
      tickets = [];
    } else {
      throw err;
    }
  }

  const ticketsById = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const pendingApprovals = listPendingApprovalSummaries(limit, source);
  const auditEvidence = listAuditEvidenceSummaries(limit, source);
  const activityStates = listActivityStateSummaries(limit, source);
  const runs = listRunSummaries(limit, source).map((run) => {
    const ticket = ticketsById.get(run.ticketId);
    const latestAuditAt =
      auditEvidence.find((event) => event.runId === run.runId)?.ts ?? run.latestAuditAt;
    return {
      ...run,
      ticketTitle: ticket?.title ?? run.ticketTitle,
      customerName: ticket?.customer_name ?? run.customerName,
      latestAuditAt,
      hasPendingApproval: pendingApprovals.some((approval) => approval.runId === run.runId),
    };
  });

  const response: DashboardResponse = {
    generatedAt: new Date().toISOString(),
    source: dataSource(source),
    health: {
      status: "ok",
      mode: isMockMode() ? "mock" : "real",
      store: getStoreStatus(),
      source,
    },
    tickets: {
      items: tickets,
      counts: {
        open: tickets.filter((ticket) => ticket.status === "OPEN").length,
        pending: tickets.filter((ticket) => ticket.status === "PENDING").length,
        done: tickets.filter((ticket) => ticket.status === "DONE").length,
        total: tickets.length,
      },
    },
    runs: {
      active: runs.filter((run) => !TERMINAL_RUN_STATUS.has(run.status)),
      terminal: runs.filter((run) => TERMINAL_RUN_STATUS.has(run.status)),
    },
    pendingApprovals,
    auditEvidence,
    activityStates,
    memory: {
      status: "deferred",
      label: "Deferred",
      message: "Memory evidence is deferred to Phase 3 and Phase 4.",
      source: "deferred",
    },
    observability: {
      status: "deferred",
      label: "Deferred",
      message: "Operational signals are deferred to Phase 5.",
      source: "deferred",
    },
  };

  return c.json(response, 200);
});
