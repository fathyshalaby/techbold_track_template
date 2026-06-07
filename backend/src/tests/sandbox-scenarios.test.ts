import { describe, it, expect } from 'vitest';
import {
  SCENARIOS,
  MAX_SANDBOX_CASES,
  scenarioTickets,
  scenarioCustomerSystems,
  getScenarioByTicketId,
} from '../sandbox/registry.js';
import { TicketSchema, CustomerSystemSchema } from '../phoenix/types.js';

// The offline scenario catalog must stay Phoenix-compatible so it can seed the
// mock for a realistic demo/test of the full loop without a live VM.

describe('sandbox scenario catalog', () => {
  it('exposes the five incident archetypes', () => {
    expect(MAX_SANDBOX_CASES).toBe(5);
    const archetypes = SCENARIOS.map((s) => s.archetype).sort();
    expect(archetypes).toEqual(
      ['document-upload', 'erp-write-path', 'monitoring-data', 'partner-sync', 'service-health'].sort(),
    );
  });

  it('every scenario ticket validates against the Phoenix Ticket schema', () => {
    for (const ticket of scenarioTickets()) {
      expect(() => TicketSchema.parse(ticket), `ticket ${ticket.id}`).not.toThrow();
    }
  });

  it('every customer-system fixture validates against the Phoenix CustomerSystem schema', () => {
    const systems = scenarioCustomerSystems();
    for (const cs of Object.values(systems)) {
      expect(() => CustomerSystemSchema.parse(cs), `system for ticket ${cs.ticket_id}`).not.toThrow();
    }
  });

  it('applies a host override to the SSH target', () => {
    const tickets = scenarioTickets();
    const cs = scenarioCustomerSystems('10.1.2.3');
    expect(cs[tickets[0].id].system.ip).toBe('10.1.2.3');
  });

  it('looks up a scenario by ticket id', () => {
    const first = SCENARIOS[0];
    expect(getScenarioByTicketId(first.ticket.id)?.archetype).toBe(first.archetype);
    expect(getScenarioByTicketId(-1)).toBeUndefined();
  });

  it('ticket descriptions are non-trivial (drive realistic diagnosis)', () => {
    for (const t of scenarioTickets()) {
      expect(t.title.length).toBeGreaterThan(5);
      expect(t.description.length).toBeGreaterThan(40);
    }
  });
});
