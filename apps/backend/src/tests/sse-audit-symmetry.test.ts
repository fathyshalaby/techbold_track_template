// Audit↔runEventBus symmetry test for PRD §9 SSE event set.
// Drives a run to WAITING_FOR_APPROVAL and asserts that emitEvent-based events
// appear in both the audit log (getAuditEvents) and the runEventBus.
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../env.js", () => ({
  getEnv: () => ({
    PHOENIX_API_BASE_URL: "http://mock-phoenix",
    PHOENIX_API_TOKEN: "mock-token",
    SSH_MOCK_MODE: "true",
    PHOENIX_MOCK_MODE: "true",
    PORT: "8000",
  }),
  resolveClientMode: () => "mock",
}));

const MOCK_DIAGNOSTIC = {
  hypotheses: [{ cause: "service crashed", evidence: "systemctl output", confidence: 0.85 }],
  command: "systemctl status svc --no-pager",
  purpose: "Check service state",
  expectedSignal: "Active: failed",
  riskNotes: "read-only",
  isReadOnly: true,
};

describe("SSE audit↔bus symmetry", () => {
  let analyzerSpy: MockInstance;

  beforeEach(async () => {
    const analyzerMod = await import("../ai/agents/problem-analyzer.js");
    analyzerSpy = vi.spyOn(analyzerMod, "runProblemAnalyzer").mockResolvedValue(MOCK_DIAGNOSTIC);

    const { makeJsonlAdapter, setDb } = await import("../store/db.js");
    setDb(makeJsonlAdapter());
  });

  afterEach(() => {
    analyzerSpy.mockRestore();
  });

  it("audit↔bus symmetry: approval.required appears in both audit log and runEventBus emissions", async () => {
    const { advance } = await import("../ai/orchestrator.js");
    const { createRun } = await import("../store/runs.js");
    const { getAuditEvents } = await import("../store/audit.js");
    const { runEventBus } = await import("../events/run-event-bus.js");

    const run = createRun(1, "10.0.0.1:22");
    const runId = run.id;

    const emitted = new Map<string, unknown[]>();

    // approval.required is emitted via runEventBus.emit inside performSideEffects.
    // run.started is written directly via appendAuditEvent (not via the event bus),
    // so it is present in the audit log but not emitted on the bus - excluded from
    // the bus assertion below.
    // command.completed is only emitted after EXECUTING_COMMAND; the run stops at
    // WAITING_FOR_APPROVAL before any command runs - also excluded from bus assertion.
    const busEventTypes = ["approval.required"] as const;

    const listeners = new Map<string, (payload: unknown) => void>();
    for (const eventType of busEventTypes) {
      const payloads: unknown[] = [];
      emitted.set(eventType, payloads);
      const listener = (payload: unknown) => {
        payloads.push(payload);
      };
      listeners.set(eventType, listener);
      runEventBus.on(runId, eventType, listener);
    }

    const state = await advance(runId);
    expect(state.phase).toBe("WAITING_FOR_APPROVAL");

    // Cleanup listeners
    for (const [eventType, listener] of listeners) {
      runEventBus.off(runId, eventType, listener);
    }

    const auditEvents = getAuditEvents(runId);
    const auditTypes = new Set(auditEvents.map((e) => e.type));

    // run.started: present in audit (direct write), not on bus
    expect(auditTypes.has("run.started")).toBe(true);

    // approval.required: present in BOTH audit (via emitEvent mirror) AND bus
    expect(auditTypes.has("approval.required")).toBe(true);
    expect((emitted.get("approval.required") ?? []).length).toBeGreaterThanOrEqual(1);
  });
});
