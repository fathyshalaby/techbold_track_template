import scenariosData from "./scenarios.json" with { type: "json" };
import type { CustomerSystemFixture, Scenario, TicketFixture } from "./types.js";

// Offline scenario catalog for mock Phoenix and tests.

export const DEFAULT_SANDBOX_SSH_HOST = "127.0.0.1";

const BASE_SCENARIOS = scenariosData as unknown as Scenario[];
export const MAX_SANDBOX_CASES = BASE_SCENARIOS.length;

// Return scenarios with the SSH host overridden (the Docker sandbox binds each
// archetype to a localhost port; a real host can be substituted).
export function scenariosForHost(
  host: string = DEFAULT_SANDBOX_SSH_HOST,
  count: number = MAX_SANDBOX_CASES,
): Scenario[] {
  return BASE_SCENARIOS.slice(0, count).map((scenario) => ({
    ...scenario,
    ticket: { ...scenario.ticket },
    params: { ...scenario.params } as Scenario["params"],
    system: { ...scenario.system, ip: host },
  })) as Scenario[];
}

export const SCENARIOS: Scenario[] = scenariosForHost();

// Phoenix-shaped ticket fixtures - ready to seed the Phoenix mock.
export function scenarioTickets(host?: string, count = MAX_SANDBOX_CASES): TicketFixture[] {
  return scenariosForHost(host, count).map((scenario) => ({ ...scenario.ticket }));
}

// Phoenix-shaped customer-system fixtures keyed by ticket id.
export function scenarioCustomerSystems(
  host?: string,
  count = MAX_SANDBOX_CASES,
): Record<number, CustomerSystemFixture> {
  return Object.fromEntries(
    scenariosForHost(host, count).map((scenario) => [
      scenario.ticket.id,
      {
        ticket_id: scenario.ticket.id,
        customer_id: scenario.ticket.customer_id,
        system: { ...scenario.system },
      },
    ]),
  );
}

export function getScenarioByTicketId(ticketId: number, host?: string): Scenario | undefined {
  return scenariosForHost(host).find((scenario) => scenario.ticket.id === ticketId);
}
