import { readFileSync } from "node:fs";
import type { DashboardResponse } from "@techbold/contracts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { PhoenixNetworkError } from "../phoenix/client.js";
import { appendAuditEvent, createPendingApproval, saveActivityDraft } from "../store/audit.js";
import { makeJsonlAdapter, resetDb, setDb } from "../store/db.js";
import { createRun, updateRunPhase } from "../store/runs.js";

let mockMode = true;
let phoenixMode: "mock" | "real" = "mock";

vi.mock("../env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../env.js")>();
  return {
    ...actual,
    isMockMode: vi.fn(() => mockMode),
    resolveClientMode: vi.fn((service: "phoenix" | "ssh" | "llm") => {
      if (service === "phoenix") return phoenixMode;
      return mockMode ? "mock" : "real";
    }),
    getEnv: vi.fn().mockReturnValue({
      PHOENIX_API_BASE_URL: "http://localhost",
      PHOENIX_API_TOKEN: "test",
      OPENAI_API_KEY: "test",
      LLM_PROVIDER: "openai",
      LLM_MODEL: "gpt-4o",
      SSH_PRIVATE_KEY_PATH: "/keys/id_rsa",
      MOCK_MODE: true,
      MOCK_PHOENIX: true,
      MOCK_SSH: true,
      MOCK_LLM: true,
      MOCK_SCENARIOS: false,
    }),
  };
});

beforeEach(() => {
  mockMode = true;
  phoenixMode = "mock";
  setDb(makeJsonlAdapter());
});

afterEach(() => {
  resetDb();
  vi.restoreAllMocks();
});

describe("GET /api/dashboard", () => {
  it("returns dashboard data in mock mode", async () => {
    const run = createRun(1, "10.0.0.1:22");
    updateRunPhase(run.id, "WAITING_FOR_APPROVAL");
    createPendingApproval(run.id, {
      proposedCommand: "systemctl status nginx",
      purpose: "Check nginx status",
      expectedSignal: "service status output",
      riskLevel: "SAFE_READ_ONLY",
      safetyNotes: "",
    });
    appendAuditEvent(run.id, "approval.required", "agent", {
      command: "systemctl status nginx",
      privateKey: "/keys/id_rsa",
    });
    saveActivityDraft(run.id, {
      summary: "Draft summary",
      rootCause: "Unknown",
      actionsTaken: "Checked service",
      commandsSummary: "systemctl status nginx",
      validationResult: "Pending validation",
    });

    const res = await app.request("/api/dashboard");

    expect(res.status).toBe(200);
    const body = (await res.json()) as DashboardResponse;
    expect(body.source.type).toBe("mock-backend");
    expect(body.health.status).toBe("ok");
    expect(body.tickets.items.length).toBeGreaterThan(0);
    expect(body.runs.active[0]).toEqual(
      expect.objectContaining({
        runId: run.id,
        ticketId: 1,
        ticketTitle: "Service unavailable",
        customerName: "Acme Corp",
        hasPendingApproval: true,
        source: "mock-backend",
      }),
    );
    expect(body.pendingApprovals).toHaveLength(1);
    expect(body.auditEvidence).toHaveLength(1);
    expect(body.activityStates).toHaveLength(1);
  });

  it("labels dashboard data as live backend when backend mode is live", async () => {
    mockMode = false;
    phoenixMode = "real";
    const phoenixModule = await import("../phoenix/client.js");
    vi.spyOn(phoenixModule.PhoenixClient.prototype, "listTickets").mockResolvedValueOnce([
      {
        id: 42,
        title: "Live ticket",
        description: "Live backend fixture",
        priority: "high",
        status: "OPEN",
        customer_id: 7,
        customer_name: "Live Customer",
      },
    ]);

    const res = await app.request("/api/dashboard");

    expect(res.status).toBe(200);
    const body = (await res.json()) as DashboardResponse;
    expect(body.source.type).toBe("live-backend");
    expect(body.source.label).toBe("Live backend");
    expect(body.tickets.items[0]?.source).toBe("live-backend");
  });

  it("returns 400 for invalid limit", async () => {
    const res = await app.request("/api/dashboard?limit=0");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid query parameters" });
  });

  it("returns a sanitized 502 when Phoenix is unavailable", async () => {
    const phoenixModule = await import("../phoenix/mock.js");
    vi.spyOn(phoenixModule.default.prototype, "listTickets").mockRejectedValueOnce(
      new PhoenixNetworkError("PHOENIX_API_TOKEN and /keys/id_rsa must not leak"),
    );

    const res = await app.request("/api/dashboard");

    expect(res.status).toBe(502);
    const text = await res.text();
    expect(text).toBe(JSON.stringify({ error: "ERP unavailable" }));
    expect(text).not.toContain("PHOENIX_API_TOKEN");
    expect(text).not.toContain("/keys");
  });

  it("returns deferred memory and observability statuses without live claims", async () => {
    const res = await app.request("/api/dashboard");

    expect(res.status).toBe(200);
    const body = (await res.json()) as DashboardResponse;
    expect(body.memory).toEqual({
      status: "deferred",
      label: "Deferred",
      message: "Memory evidence is deferred to Phase 3 and Phase 4.",
      source: "deferred",
    });
    expect(body.observability).toEqual({
      status: "deferred",
      label: "Deferred",
      message: "Operational signals are deferred to Phase 5.",
      source: "deferred",
    });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("pgvector");
    expect(serialized).not.toContain("RAG");
    expect(serialized).not.toContain("traces");
    expect(serialized).not.toContain("metrics");
    expect(serialized).not.toContain("live observability");
  });

  it("does not expose secret-looking fields in serialized output", async () => {
    appendAuditEvent("run_missing", "agent.unavailable", "agent", {
      message: "PHOENIX_API_TOKEN=/secret and SSH_PRIVATE_KEY_PATH=/keys/id_rsa",
      token: "secret",
    });

    const res = await app.request("/api/dashboard");

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain("token");
    expect(text).not.toContain("privateKey");
    expect(text).not.toContain("PHOENIX_API_TOKEN");
    expect(text).not.toContain("SSH_PRIVATE_KEY_PATH");
    expect(text).not.toContain("/keys");
  });

  it("keeps the dashboard route read-only", () => {
    const source = readFileSync(new URL("../routes/dashboard.ts", import.meta.url), "utf8");

    expect(source).not.toContain("advance(");
    expect(source).not.toContain("approve(");
    expect(source).not.toContain("reject(");
    expect(source).not.toContain("abort(");
    expect(source).not.toContain("draftActivity");
    expect(source).not.toContain("submitActivity");
    expect(source).not.toContain("createActivity");
    expect(source).not.toContain("setStatus");
  });
});
