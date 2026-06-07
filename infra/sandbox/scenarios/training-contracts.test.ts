import { describe, expect, it } from "bun:test";
import { validateCommandAgainstPolicy } from "../../../apps/backend/src/safety/command-policy.ts";
import { RiskLevel } from "../../../apps/backend/src/safety/risk-levels.ts";
import { SCENARIOS } from "./registry.ts";
import { TRAINING_CONTRACTS } from "./training-contracts.ts";

const MUTATING_DIAGNOSTIC_TERMS =
  /\b(restart|start|stop|enable|disable|reload|daemon-reload|sed\s+-i|chown|chmod|grant|revoke|drop|truncate|delete|rm\s+|mv\s+|cp\s+|mkdir|touch)\b/i;

describe("sandbox training contracts", () => {
  it("covers every runtime sandbox archetype", () => {
    expect(Object.keys(TRAINING_CONTRACTS).sort()).toEqual(
      SCENARIOS.map((scenario) => scenario.archetype).sort(),
    );
  });

  it("keeps diagnostic commands read-only and policy-allowed", () => {
    for (const contract of Object.values(TRAINING_CONTRACTS)) {
      for (const check of contract.safeChecks) {
        const policy = validateCommandAgainstPolicy(check.command);
        expect(policy.allowed).toBe(true);
        expect(policy.riskLevel).not.toBe(RiskLevel.HIGH_RISK_BLOCKED);
        expect(check.command).not.toMatch(MUTATING_DIAGNOSTIC_TERMS);
        expect(check.riskNotes.toLowerCase()).toContain("read-only");
      }
    }
  });

  it("requires reversible fixes and persistent validation evidence", () => {
    for (const contract of Object.values(TRAINING_CONTRACTS)) {
      expect(contract.fixes.length).toBeGreaterThan(0);
      for (const fix of contract.fixes) {
        expect(fix.command.trim()).not.toBe("");
        expect(fix.rollbackCommand.trim()).not.toBe("");
        expect(fix.persistenceNote.toLowerCase()).toContain("persist");
        expect(validateCommandAgainstPolicy(fix.command).allowed).toBe(true);
      }
      expect(contract.validation.persistenceCheck.toLowerCase()).toContain("persist");
      expect(contract.validation.evidence.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("includes unsafe request corrections without teaching forbidden commands", () => {
    for (const contract of Object.values(TRAINING_CONTRACTS)) {
      expect(contract.unsafeRequests.length).toBeGreaterThan(0);
      for (const example of contract.unsafeRequests) {
        expect(example.safeAlternative.trim()).not.toBe("");
        expect(example.warning.toLowerCase()).toMatch(/warning|broad|destroy|disrupt|security/);
      }
    }
  });
});
