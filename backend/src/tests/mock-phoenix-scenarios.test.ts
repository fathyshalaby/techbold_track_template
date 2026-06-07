import { describe, it, expect } from 'vitest';
import MockPhoenixClient, { MOCK_TICKETS } from '../phoenix/mock.js';
import { MAX_SANDBOX_CASES, scenarioTickets } from '../sandbox/registry.js';

// MOCK_SCENARIOS demo path: the mock client serves the realistic sandbox
// incident catalog when seeded, and the plain 4-ticket fixtures otherwise.

describe('MockPhoenixClient — scenario seeding (MOCK_SCENARIOS demo)', () => {
  it('default (no opts) serves the 4-ticket fixture set — unchanged behaviour', async () => {
    const client = new MockPhoenixClient();
    expect(await client.listTickets()).toHaveLength(MOCK_TICKETS.length);
  });

  it('seeded serves the realistic scenario catalog', async () => {
    const client = new MockPhoenixClient({ seedScenarios: true });
    const tickets = await client.listTickets();
    expect(tickets).toHaveLength(MAX_SANDBOX_CASES);
    const ids = tickets.map((t) => t.id).sort();
    expect(ids).toEqual(scenarioTickets().map((t) => t.id).sort());
  });

  it('seeded resolves each scenario ticket and its customer system', async () => {
    const client = new MockPhoenixClient({ seedScenarios: true });
    for (const fixture of scenarioTickets()) {
      const ticket = await client.getTicket(fixture.id);
      expect(ticket.title).toBe(fixture.title);
      const cs = await client.getCustomerSystem(fixture.id);
      expect(cs.ticket_id).toBe(fixture.id);
      expect(cs.system.username).toBe('azureuser');
    }
  });

  it('seeded setStatus persists across separate client instances (shared store)', async () => {
    const id = scenarioTickets()[0].id;
    await new MockPhoenixClient({ seedScenarios: true }).setStatus(id, 'DONE');
    const reread = await new MockPhoenixClient({ seedScenarios: true }).getTicket(id);
    expect(reread.status).toBe('DONE');
  });
});
