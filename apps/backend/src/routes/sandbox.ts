import { Hono } from "hono";
import { z } from "zod";
import { isSandboxProvisionerEnabled } from "../env.js";
import { getPhoenixClient } from "../phoenix/factory.js";
import type { Ticket } from "../phoenix/types.js";
import {
  addDynamicScenario,
  dynamicTickets,
  findAnyScenarioByTicketId,
  isDynamicTicketId,
  listDynamicScenarios,
  removeDynamicScenario,
  updateDynamicTicketStatus,
} from "../sandbox/dynamic-store.js";
import {
  MAX_GENERATE_COUNT,
  collectUsedIdsAndPorts,
  generateScenarios,
} from "../sandbox/generator.js";
import {
  ensureBaseImage,
  injectFault,
  provisionScenario,
  readBenchPublicKey,
  removeScenarioContainer,
  resetScenarioFault,
} from "../sandbox/provisioner.js";
import type { Archetype } from "../sandbox/types.js";

export const sandboxRouter = new Hono();

// Run `worker` over `items` with at most `limit` in flight at once.
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      if (item !== undefined) await worker(item);
    }
  });
  await Promise.all(runners);
}

const ArchetypeSchema = z.enum([
  "service-health",
  "document-upload",
  "partner-sync",
  "erp-write-path",
  "monitoring-data",
]);

const CreateVmsBodySchema = z.object({
  count: z.number().int().min(1).max(MAX_GENERATE_COUNT),
  archetypes: z.array(ArchetypeSchema).optional(),
  randomize: z.boolean().optional(),
});

sandboxRouter.get("/vms", (c) => {
  if (!isSandboxProvisionerEnabled()) {
    return c.json({ error: "sandbox provisioner is disabled" }, 403);
  }
  const items = listDynamicScenarios().map((scenario) => ({
    ticketId: scenario.ticket.id,
    archetype: scenario.archetype,
    title: scenario.ticket.title,
    status: scenario.ticket.status,
    sshTarget: `${scenario.system.ip}:${scenario.system.port}`,
    customerName: scenario.ticket.customer_name,
  }));
  return c.json({ items }, 200);
});

sandboxRouter.post("/vms", async (c) => {
  if (!isSandboxProvisionerEnabled()) {
    return c.json({ error: "sandbox provisioner is disabled" }, 403);
  }

  const parsed = CreateVmsBodySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "invalid request body" }, 400);
  }

  const { count, archetypes, randomize } = parsed.data;
  const host = process.env.SANDBOX_SSH_HOST?.trim() || "127.0.0.1";
  const used = collectUsedIdsAndPorts(host);
  for (const scenario of listDynamicScenarios()) {
    used.ticketIds.add(scenario.ticket.id);
    used.ports.add(scenario.system.port);
  }

  const generated = generateScenarios({
    count,
    archetypes: archetypes as Archetype[] | undefined,
    randomize,
    host,
    usedTicketIds: used.ticketIds,
    usedPorts: used.ports,
  });

  let publicKey: string;
  try {
    publicKey = readBenchPublicKey();
  } catch (err) {
    const message = err instanceof Error ? err.message : "missing sandbox SSH public key";
    return c.json({ error: message }, 503);
  }

  const created: Array<{
    ticketId: number;
    archetype: string;
    title: string;
    sshTarget: string;
  }> = [];
  const errors: Array<{ ticketId: number; error: string }> = [];

  // Build the shared base image once up front so the per-VM builds that follow
  // are fast and a base-build failure surfaces clearly instead of N times.
  try {
    await ensureBaseImage(publicKey);
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "failed to build sandbox base image" },
      503,
    );
  }

  // VMs are independent (own image tag, own SSH port), so provision them
  // concurrently with a small cap to keep Docker Desktop responsive.
  await mapWithConcurrency(generated, 4, async (scenario) => {
    try {
      await provisionScenario(scenario, publicKey);
      addDynamicScenario(scenario);
      created.push({
        ticketId: scenario.ticket.id,
        archetype: scenario.archetype,
        title: scenario.ticket.title,
        sshTarget: `${scenario.system.ip}:${scenario.system.port}`,
      });
    } catch (err) {
      await removeScenarioContainer(scenario);
      errors.push({
        ticketId: scenario.ticket.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  const status = created.length === 0 ? 502 : errors.length > 0 ? 207 : 201;
  return c.json({ created, errors, tickets: dynamicTickets() }, status);
});

sandboxRouter.post("/vms/:ticketId/reset", async (c) => {
  if (!isSandboxProvisionerEnabled()) {
    return c.json({ error: "sandbox provisioner is disabled" }, 403);
  }

  const ticketId = Number.parseInt(c.req.param("ticketId"), 10);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return c.json({ error: "invalid ticket id" }, 400);
  }

  const host = process.env.SANDBOX_SSH_HOST?.trim() || "127.0.0.1";
  const scenario = findAnyScenarioByTicketId(ticketId, host);
  if (!scenario) {
    return c.json({ error: "ticket not found" }, 404);
  }

  try {
    await resetScenarioFault(scenario);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "failed to reset VM fault" }, 500);
  }

  let ticket: Ticket;
  if (isDynamicTicketId(ticketId)) {
    updateDynamicTicketStatus(ticketId, "OPEN");
    const dynamic = findAnyScenarioByTicketId(ticketId, host);
    if (!dynamic) {
      return c.json({ error: "ticket not found" }, 404);
    }
    ticket = { ...dynamic.ticket };
  } else {
    const client = getPhoenixClient();
    ticket = await client.setStatus(ticketId, "OPEN");
  }

  return c.json({ ticket, sshTarget: `${scenario.system.ip}:${scenario.system.port}` }, 200);
});

sandboxRouter.delete("/vms/:ticketId", async (c) => {
  if (!isSandboxProvisionerEnabled()) {
    return c.json({ error: "sandbox provisioner is disabled" }, 403);
  }

  const ticketId = Number.parseInt(c.req.param("ticketId"), 10);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return c.json({ error: "invalid ticket id" }, 400);
  }

  if (!isDynamicTicketId(ticketId)) {
    return c.json({ error: "only generated VMs can be deleted" }, 400);
  }

  const scenario = findAnyScenarioByTicketId(ticketId);
  if (!scenario) {
    return c.json({ error: "ticket not found" }, 404);
  }

  await removeScenarioContainer(scenario);
  removeDynamicScenario(ticketId);
  return c.json({ deleted: ticketId }, 200);
});

// Exported for tests.
export { injectFault };
