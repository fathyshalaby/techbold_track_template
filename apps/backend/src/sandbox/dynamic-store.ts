import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getScenarioByTicketId } from "./registry.js";
import type { CustomerSystemFixture, Scenario, TicketFixture } from "./types.js";

const backendDir = dirname(fileURLToPath(import.meta.url));
const storePath = resolve(backendDir, "../../data/generated-vms.json");

let scenarios: Scenario[] = loadFromDisk();

function loadFromDisk(): Scenario[] {
  if (!existsSync(storePath)) return [];
  try {
    const raw = readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as Scenario[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, `${JSON.stringify(scenarios, null, 2)}\n`, "utf8");
}

export function listDynamicScenarios(): Scenario[] {
  return scenarios.map((scenario) => ({
    ...scenario,
    ticket: { ...scenario.ticket },
    params: { ...scenario.params } as Scenario["params"],
    system: { ...scenario.system },
  })) as Scenario[];
}

export function getDynamicScenarioByTicketId(ticketId: number): Scenario | undefined {
  return scenarios.find((scenario) => scenario.ticket.id === ticketId);
}

export function isDynamicTicketId(ticketId: number): boolean {
  return scenarios.some((scenario) => scenario.ticket.id === ticketId);
}

export function addDynamicScenario(scenario: Scenario) {
  if (scenarios.some((entry) => entry.ticket.id === scenario.ticket.id)) {
    throw new Error(`Ticket ${scenario.ticket.id} already exists in dynamic store`);
  }
  scenarios.push(scenario);
  persist();
}

export function removeDynamicScenario(ticketId: number): boolean {
  const before = scenarios.length;
  scenarios = scenarios.filter((scenario) => scenario.ticket.id !== ticketId);
  if (scenarios.length === before) return false;
  persist();
  return true;
}

export function updateDynamicTicketStatus(ticketId: number, status: TicketFixture["status"]) {
  const idx = scenarios.findIndex((scenario) => scenario.ticket.id === ticketId);
  if (idx === -1) return false;
  scenarios[idx] = {
    ...scenarios[idx],
    ticket: { ...scenarios[idx].ticket, status },
  };
  persist();
  return true;
}

export function dynamicTickets(): TicketFixture[] {
  return listDynamicScenarios().map((scenario) => ({ ...scenario.ticket }));
}

export function dynamicCustomerSystems(): Record<number, CustomerSystemFixture> {
  return Object.fromEntries(
    listDynamicScenarios().map((scenario) => [
      scenario.ticket.id,
      {
        ticket_id: scenario.ticket.id,
        customer_id: scenario.ticket.customer_id,
        system: { ...scenario.system },
      },
    ]),
  );
}

export function findAnyScenarioByTicketId(ticketId: number, host?: string): Scenario | undefined {
  const dynamic = getDynamicScenarioByTicketId(ticketId);
  if (dynamic) return dynamic;
  return getScenarioByTicketId(ticketId, host);
}

// For tests: reset in-memory state without touching disk.
export function _resetDynamicStoreForTests(entries: Scenario[] = []) {
  scenarios = entries;
}
