import { describe, expect, it } from "bun:test";
import { SCENARIOS, scenarioCustomerSystems, scenarioTickets } from "./registry.ts";

describe("sandbox scenario registry", () => {
  it("covers all five archetypes exactly once", () => {
    expect(SCENARIOS.map((scenario) => scenario.archetype).sort()).toEqual([
      "document-upload",
      "erp-write-path",
      "monitoring-data",
      "partner-sync",
      "service-health",
    ]);
  });

  it("uses unique Phoenix-like ticket and customer ids", () => {
    expect(new Set(SCENARIOS.map((scenario) => scenario.ticket.id)).size).toBe(SCENARIOS.length);
    expect(new Set(SCENARIOS.map((scenario) => scenario.ticket.customer_id)).size).toBe(
      SCENARIOS.length,
    );
    expect(
      SCENARIOS.every((scenario) => scenario.ticket.id >= 7101 && scenario.ticket.id <= 7199),
    ).toBe(true);
    expect(
      SCENARIOS.every(
        (scenario) => scenario.ticket.customer_id >= 5101 && scenario.ticket.customer_id <= 5199,
      ),
    ).toBe(true);
  });

  it("targets localhost-only SSH ports", () => {
    const systems = scenarioCustomerSystems();
    expect(
      Object.values(systems).every((customerSystem) => customerSystem.system.ip === "127.0.0.1"),
    ).toBe(true);
    expect(
      Object.values(systems)
        .map((customerSystem) => customerSystem.system.port)
        .sort(),
    ).toEqual([2201, 2202, 2203, 2204, 2205]);
  });

  it("keeps ticket descriptions symptom-only", () => {
    const forbidden =
      /(root cause|chown|chmod|grant|sequence|\/etc\/hosts|Environment=|enable --now|127\.0\.0\.2)/i;
    for (const ticket of scenarioTickets()) {
      expect(ticket.description).not.toMatch(forbidden);
      expect(ticket.description).toContain("## Customer report");
      expect(ticket.description).toContain("## Public validation");
      expect(ticket.description).toContain("## Reset");
    }
  });
});
