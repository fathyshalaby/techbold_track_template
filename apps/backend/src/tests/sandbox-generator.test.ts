import { describe, expect, it } from "vitest";
import {
  DYNAMIC_SSH_PORT_MIN,
  DYNAMIC_TICKET_ID_MIN,
  MAX_GENERATE_COUNT,
  collectUsedIdsAndPorts,
  generateScenarios,
} from "../sandbox/generator.js";

describe("generateScenarios", () => {
  it("creates unique ticket ids and ssh ports", () => {
    const used = collectUsedIdsAndPorts("127.0.0.1");
    const scenarios = generateScenarios({
      count: 3,
      host: "127.0.0.1",
      seed: 42,
      usedTicketIds: used.ticketIds,
      usedPorts: used.ports,
    });

    expect(scenarios).toHaveLength(3);
    const ids = scenarios.map((scenario) => scenario.ticket.id);
    const ports = scenarios.map((scenario) => scenario.system.port);
    expect(new Set(ids).size).toBe(3);
    expect(new Set(ports).size).toBe(3);
    for (const id of ids) expect(id).toBeGreaterThanOrEqual(DYNAMIC_TICKET_ID_MIN);
    for (const port of ports) expect(port).toBeGreaterThanOrEqual(DYNAMIC_SSH_PORT_MIN);
  });

  it("respects archetype filter", () => {
    const used = collectUsedIdsAndPorts("127.0.0.1");
    const scenarios = generateScenarios({
      count: 4,
      archetypes: ["service-health"],
      seed: 7,
      usedTicketIds: used.ticketIds,
      usedPorts: used.ports,
    });
    expect(scenarios.every((scenario) => scenario.archetype === "service-health")).toBe(true);
  });

  it("caps count at MAX_GENERATE_COUNT", () => {
    const used = collectUsedIdsAndPorts("127.0.0.1");
    const scenarios = generateScenarios({
      count: 99,
      seed: 1,
      usedTicketIds: used.ticketIds,
      usedPorts: used.ports,
    });
    expect(scenarios).toHaveLength(MAX_GENERATE_COUNT);
  });

  it("does not leak fix instructions in ticket descriptions", () => {
    const used = collectUsedIdsAndPorts("127.0.0.1");
    const scenarios = generateScenarios({
      count: 5,
      seed: 99,
      usedTicketIds: used.ticketIds,
      usedPorts: used.ports,
    });
    for (const scenario of scenarios) {
      expect(scenario.ticket.description).toContain("public-test.sh");
      expect(scenario.ticket.description.toLowerCase()).not.toContain("systemctl enable");
    }
  });
});
