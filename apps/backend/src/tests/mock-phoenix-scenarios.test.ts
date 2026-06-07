import { afterEach, describe, expect, it } from "vitest";
import MockPhoenixClient, { MOCK_TICKETS } from "../phoenix/mock.js";
import { _resetDynamicStoreForTests } from "../sandbox/dynamic-store.js";
import { MAX_SANDBOX_CASES, scenarioTickets } from "../sandbox/registry.js";

// MOCK_SCENARIOS demo path: the mock client serves the realistic sandbox
// incident catalog when seeded, and the plain 4-ticket fixtures otherwise.

afterEach(() => {
  _resetDynamicStoreForTests([]);
});

describe("MockPhoenixClient - scenario seeding (MOCK_SCENARIOS demo)", () => {
  it("default (no opts) serves the 4-ticket fixture set - unchanged behaviour", async () => {
    const client = new MockPhoenixClient();
    expect(await client.listTickets()).toHaveLength(MOCK_TICKETS.length);
  });

  it("seeded serves the realistic scenario catalog", async () => {
    const client = new MockPhoenixClient({ seedScenarios: true });
    const tickets = await client.listTickets();
    expect(tickets).toHaveLength(MAX_SANDBOX_CASES);
    const ids = tickets.map((t) => t.id).sort();
    expect(ids).toEqual(
      scenarioTickets()
        .map((t) => t.id)
        .sort(),
    );
  });

  it("seeded resolves each scenario ticket and its customer system", async () => {
    const client = new MockPhoenixClient({ seedScenarios: true });
    for (const fixture of scenarioTickets()) {
      const ticket = await client.getTicket(fixture.id);
      expect(ticket.title).toBe(fixture.title);
      const cs = await client.getCustomerSystem(fixture.id);
      expect(cs.ticket_id).toBe(fixture.id);
      expect(cs.system.username).toBe("azureuser");
    }
  });

  it("seeded setStatus persists across separate client instances (shared store)", async () => {
    const id = scenarioTickets()[0].id;
    await new MockPhoenixClient({ seedScenarios: true }).setStatus(id, "DONE");
    const reread = await new MockPhoenixClient({ seedScenarios: true }).getTicket(id);
    expect(reread.status).toBe("DONE");
  });

  it("merges dynamically generated tickets into the scenario catalog", async () => {
    _resetDynamicStoreForTests([
      {
        archetype: "service-health",
        ticket: {
          id: 7205,
          title: "Status endpoint unavailable after restart",
          description: "generated ticket",
          priority: "high",
          status: "OPEN",
          customer_id: 5205,
          customer_name: "Generated GmbH",
          tags: ["generated"],
          created_at: "2026-06-07T08:00:00.000Z",
        },
        system: {
          ip: "127.0.0.1",
          port: 2215,
          username: "azureuser",
          os: "Ubuntu 22.04 LTS",
        },
        params: {
          serviceName: "status-beacon",
          port: 8080,
          healthPath: "/health",
        },
      },
    ]);

    const client = new MockPhoenixClient({ seedScenarios: true });
    const tickets = await client.listTickets();
    expect(tickets.some((ticket) => ticket.id === 7205)).toBe(true);
    const cs = await client.getCustomerSystem(7205);
    expect(cs.system.port).toBe(2215);
  });
});
