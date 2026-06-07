import { describe, expect, it } from "vitest";
import { DIAGNOSTIC_METHOD, RUNBOOK_IDS, selectRunbooks } from "../ai/knowledge.js";
import {
  PROBLEM_ANALYZER_SYSTEM_PROMPT,
  PROBLEM_SOLVER_SYSTEM_PROMPT,
  VALIDATOR_SYSTEM_PROMPT,
} from "../ai/prompts.js";

describe("encoded knowledge - diagnostic method", () => {
  it("encodes the core SRE method (USE, root-cause, persistence, recent-changes)", () => {
    expect(DIAGNOSTIC_METHOD.length).toBeGreaterThan(400);
    expect(DIAGNOSTIC_METHOD).toMatch(/USE/);
    expect(DIAGNOSTIC_METHOD).toMatch(/Utilization, Saturation, Errors/);
    expect(DIAGNOSTIC_METHOD).toMatch(/Root cause != symptom/i);
    expect(DIAGNOSTIC_METHOD).toMatch(/does NOT survive/i); // persistence rule
    expect(DIAGNOSTIC_METHOD).toMatch(/Recent changes first/i);
    expect(DIAGNOSTIC_METHOD).toMatch(/customer-benefit functional test/i);
  });

  it("exposes exactly the four runbook domains", () => {
    expect(RUNBOOK_IDS).toEqual([
      "systemd-services",
      "networking-web-tls",
      "resource-exhaustion",
      "data-access-scheduling",
    ]);
  });
});

describe("encoded knowledge - runbook routing (selectRunbooks)", () => {
  const cases: Array<[string, string]> = [
    ["nginx returns 502 and the cert may be expired", "networking / web / TLS"],
    ["the api.service won't start and keeps crash-looping", "systemd & service lifecycle"],
    ["disk is full, filesystem went read-only, OOM in dmesg", "resource exhaustion"],
    ["postgres permission denied and the cron timer never runs", "data / access / scheduling"],
  ];
  it.each(cases)("routes %j to the right runbook", (symptom, expectedHeader) => {
    const picked = selectRunbooks(symptom);
    expect(picked).toContain(expectedHeader);
  });

  it("returns at most two runbooks (retrieve the slice, do not dump all four)", () => {
    const picked = selectRunbooks("service nginx disk postgres cron tls memory", 2);
    const headers = (picked.match(/^RUNBOOK /gm) ?? []).length;
    expect(headers).toBeLessThanOrEqual(2);
    expect(headers).toBeGreaterThanOrEqual(1);
  });

  it("returns empty string when nothing matches (method alone applies)", () => {
    expect(selectRunbooks("the quick brown fox jumps over")).toBe("");
  });
});

describe("encoded knowledge - generalisation (no incident-specific hardcoding)", () => {
  // The whole corpus (method + every runbook digest) must contain no fixture
  // identifiers - grading uses fresh VMs and penalises hardcoding.
  const FORBIDDEN = /\b(status-api|vm-01|localhost:8080|EADDRINUSE|ticket[_-]?\d+|azureuser)\b/i;
  const allDigests = selectRunbooks(
    "service nginx disk postgres cron tls memory port permission",
    4,
  );

  it("the diagnostic method has no incident fixtures", () => {
    expect(DIAGNOSTIC_METHOD).not.toMatch(FORBIDDEN);
  });

  it("every runbook digest has no incident fixtures", () => {
    expect(allDigests).not.toMatch(FORBIDDEN);
    expect((allDigests.match(/^RUNBOOK /gm) ?? []).length).toBe(4);
  });
});

describe("encoded knowledge - wired into the diagnostic prompts", () => {
  it("the method is embedded in the analyzer, solver, and validator prompts", () => {
    const marker = "TROUBLESHOOTING METHOD";
    expect(PROBLEM_ANALYZER_SYSTEM_PROMPT).toContain(marker);
    expect(PROBLEM_SOLVER_SYSTEM_PROMPT).toContain(marker);
    expect(VALIDATOR_SYSTEM_PROMPT).toContain(marker);
  });
});
