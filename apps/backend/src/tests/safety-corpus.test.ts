import { describe, expect, it } from "vitest";
import { classifyCommand } from "../safety/classifier.js";
import { validateCommandAgainstPolicy } from "../safety/command-policy.js";
import { RiskLevel } from "../safety/risk-levels.js";
import cases from "./fixtures/safety-cases.json" with { type: "json" };

// Independent, data-driven safety corpus (absorbed from the original
// implementation's shared/tests/safety-cases.json). It exercises main's
// deterministic policy + classifier against a curated set of commands, mapping
// its 3-class taxonomy onto main's gate:
//   blocked      -> validateCommandAgainstPolicy().allowed === false
//   low_risk     -> allowed === true AND classifyCommand === SAFE_READ_ONLY
//   needs_review -> NOT classified SAFE_READ_ONLY (must require review; main may
//                  also block it - stricter is still safe)
//
// Assertions are written in the SAFETY-CRITICAL direction so a regression that
// weakens the gate fails the build:
//   - every "blocked" case MUST block (hard-fail prevention),
//   - every "low_risk" case MUST be recognised read-only (no false-blocking of
//     legitimate diagnostics - protects B/troubleshooting),
//   - no "needs_review" case may ever be auto-classified SAFE_READ_ONLY.

type Case = { command: string; expect: "blocked" | "low_risk" | "needs_review" };
const corpus = cases as Case[];

describe("safety corpus (data-driven, B+C regression net)", () => {
  it("has a non-trivial number of cases across all three classes", () => {
    expect(corpus.length).toBeGreaterThanOrEqual(20);
    const classes = new Set(corpus.map((c) => c.expect));
    expect(classes).toEqual(new Set(["blocked", "low_risk", "needs_review"]));
  });

  for (const c of corpus) {
    it(`[${c.expect}] ${c.command}`, () => {
      const verdict = validateCommandAgainstPolicy(c.command);
      const risk = classifyCommand(c.command);

      if (c.expect === "blocked") {
        expect(verdict.allowed, `expected BLOCKED: ${c.command}`).toBe(false);
        expect(verdict.riskLevel).toBe(RiskLevel.HIGH_RISK_BLOCKED);
      } else if (c.expect === "low_risk") {
        expect(verdict.allowed, `must not false-block: ${c.command}`).toBe(true);
        expect(risk, `expected SAFE_READ_ONLY: ${c.command}`).toBe(RiskLevel.SAFE_READ_ONLY);
      } else {
        // needs_review - must never be treated as auto-safe read-only.
        expect(risk, `must require review, not auto-safe: ${c.command}`).not.toBe(
          RiskLevel.SAFE_READ_ONLY,
        );
      }
    });
  }
});
