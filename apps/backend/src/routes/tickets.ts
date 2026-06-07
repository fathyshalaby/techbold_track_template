import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { getEnv, resolveClientMode } from "../env.js";
import {
  PhoenixAuthError,
  PhoenixClient,
  PhoenixNetworkError,
  PhoenixNotFoundError,
  PhoenixValidationError,
} from "../phoenix/client.js";
import {
  getOverlayCustomerSystem,
  getOverlayTicket,
  mergeDynamicTickets,
} from "../phoenix/dynamic-overlay.js";
import MockPhoenixClient from "../phoenix/mock.js";
import { TicketStatusSchema } from "../phoenix/types.js";
import { createSshExecutor } from "../ssh/factory.js";

export const ticketsRouter = new Hono();

const ListQuerySchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: z.string().optional(),
  sort: z.enum(["date", "priority", "status"]).optional(),
});

function getClient() {
  if (resolveClientMode("phoenix") === "mock") {
    return new MockPhoenixClient({ seedScenarios: getEnv().MOCK_SCENARIOS });
  }
  const env = getEnv();
  return new PhoenixClient(env.PHOENIX_API_BASE_URL, env.PHOENIX_API_TOKEN);
}

ticketsRouter.get("/", async (c) => {
  const parsed = ListQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "invalid query parameters" }, 400);
  }
  const query = parsed.data;

  try {
    const tickets = mergeDynamicTickets(await getClient().listTickets(query));
    return c.json(tickets, 200);
  } catch (err) {
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNotFoundError) {
      return c.json([], 200);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: "ERP returned an unexpected response" }, 502);
    }
    throw err;
  }
});

// Customer-system handler, registered at both /customer-system (Phoenix-aligned)
// and /system (python-backend path) so the two backends expose identical routes.
const customerSystemHandler = async (c: Context) => {
  // Number() (not parseInt) rejects trailing garbage like "5abc"/"5.9" -> NaN.
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "invalid ticket id" }, 400);
  }

  const overlaySystem = getOverlayCustomerSystem(id);
  if (overlaySystem) return c.json(overlaySystem, 200);

  try {
    const customerSystem = await getClient().getCustomerSystem(id);
    return c.json(customerSystem, 200);
  } catch (err) {
    if (err instanceof PhoenixNotFoundError || err instanceof TypeError) {
      return c.json({ error: "customer system not found" }, 404);
    }
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: "ERP returned an unexpected response" }, 502);
    }
    throw err;
  }
};
ticketsRouter.get("/:id/customer-system", customerSystemHandler);
ticketsRouter.get("/:id/system", customerSystemHandler);

// SSH connectivity preflight for a ticket's VM (merged from the python backend):
// loads the customer system, then opens+closes an SSH connection and reports
// {reachable, latencyMs}. Lets the UI surface VM reachability before a run.
ticketsRouter.get("/:id/connection", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "invalid ticket id" }, 400);
  }
  try {
    const cs = await getClient().getCustomerSystem(id);
    const env = getEnv();
    const result = await createSshExecutor().testConnection({
      host: cs.system.ip,
      port: cs.system.port,
      username: cs.system.username,
      privateKeyPath: env.SSH_PRIVATE_KEY_PATH,
      keyDir: env.SSH_KEY_DIR || undefined,
    });
    return c.json(result, 200);
  } catch (err) {
    if (err instanceof PhoenixNotFoundError || err instanceof TypeError) {
      return c.json({ error: "customer system not found" }, 404);
    }
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: "ERP returned an unexpected response" }, 502);
    }
    throw err;
  }
});

ticketsRouter.get("/:id", async (c) => {
  // Number() (not parseInt) rejects trailing garbage like "5abc"/"5.9" -> NaN.
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ error: "invalid ticket id" }, 400);
  }

  const overlayTicket = getOverlayTicket(id);
  if (overlayTicket) return c.json(overlayTicket, 200);

  try {
    const ticket = await getClient().getTicket(id);
    return c.json(ticket, 200);
  } catch (err) {
    if (err instanceof PhoenixNotFoundError || err instanceof TypeError) {
      return c.json({ error: "ticket not found" }, 404);
    }
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: "ERP returned an unexpected response" }, 502);
    }
    throw err;
  }
});
