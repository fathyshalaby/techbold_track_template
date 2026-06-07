import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CustomerSystemFixture, Scenario, TicketFixture } from './types.ts';

export const DEFAULT_SANDBOX_SSH_HOST = '127.0.0.1';

const scenariosPath = resolve(dirname(fileURLToPath(import.meta.url)), 'scenarios.json');
const BASE_SCENARIOS = JSON.parse(readFileSync(scenariosPath, 'utf8')) as Scenario[];
export const MAX_SANDBOX_CASES = BASE_SCENARIOS.length;

function hostFromEnv(): string {
  return process.env.SANDBOX_SSH_HOST?.trim() || DEFAULT_SANDBOX_SSH_HOST;
}

export function parseSandboxCaseCount(value = process.env.SANDBOX_CASE_COUNT, fallback = MAX_SANDBOX_CASES): number {
  const raw = value?.trim();
  if (!raw) return fallback;
  const count = Number(raw);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`SANDBOX_CASE_COUNT must be a non-negative integer, got ${value}`);
  }
  return Math.min(count, MAX_SANDBOX_CASES);
}

export function scenariosForHost(host = hostFromEnv(), count = MAX_SANDBOX_CASES): Scenario[] {
  return BASE_SCENARIOS.slice(0, count).map((scenario) => ({
    ...scenario,
    ticket: { ...scenario.ticket },
    params: { ...scenario.params } as Scenario['params'],
    system: {
      ...scenario.system,
      ip: host,
    },
  })) as Scenario[];
}

export const SCENARIOS: Scenario[] = scenariosForHost(DEFAULT_SANDBOX_SSH_HOST);

export function scenarioTickets(host?: string, count = MAX_SANDBOX_CASES): TicketFixture[] {
  return scenariosForHost(host, count).map((scenario) => ({ ...scenario.ticket }));
}

export function scenarioCustomerSystems(host?: string, count = MAX_SANDBOX_CASES): Record<number, CustomerSystemFixture> {
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

export function getScenarioByTicketId(ticketId: number, host?: string, count = MAX_SANDBOX_CASES): Scenario | undefined {
  return scenariosForHost(host, count).find((scenario) => scenario.ticket.id === ticketId);
}
