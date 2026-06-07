import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { createPendingApproval } from "../store/audit.js";
import { getDb, makeJsonlAdapter, resetDb, setDb } from "../store/db.js";

// Force mock mode - no real env or Phoenix needed
vi.mock("../env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../env.js")>();
  return {
    ...actual,
    resolveClientMode: vi.fn().mockReturnValue("mock"),
    getEnv: vi.fn().mockReturnValue({
      PHOENIX_API_BASE_URL: "http://localhost",
      PHOENIX_API_TOKEN: "test",
      OPENAI_API_KEY: "test",
      LLM_PROVIDER: "openai",
      LLM_MODEL: "gpt-4o",
      SSH_KEY_PATH: "/keys/id_rsa",
      MOCK_MODE: true,
      MOCK_PHOENIX: true,
      MOCK_SSH: true,
      MOCK_LLM: true,
    }),
  };
});

beforeEach(() => {
  setDb(makeJsonlAdapter());
});

afterEach(() => {
  resetDb();
  vi.clearAllMocks();
});

describe("POST /api/runs", () => {
  it("returns 201 with status exactly LOADED_CONTEXT for a valid ticketId", async () => {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      runId: string;
      status: string;
      ticket: unknown;
      customerSystem: unknown;
    };
    expect(body.status).toBe("LOADED_CONTEXT");
    expect(typeof body.runId).toBe("string");
    expect(body.runId.length).toBeGreaterThan(0);
  });

  it("returns ticket and customerSystem in the 201 response", async () => {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = (await res.json()) as {
      ticket: {
        id: number;
        title: string;
        priority: string;
        status: string;
        customer_name: string;
      };
      customerSystem: { ip: string; port: number; username: string; os: string };
    };
    expect(body.ticket.id).toBe(1);
    expect(body.ticket.title).toBe("Service unavailable");
    expect(body.ticket.customer_name).toBe("Acme Corp");
    expect(body.customerSystem.ip).toBe("10.0.0.1");
    expect(body.customerSystem.port).toBe(22);
    expect(body.customerSystem.username).toBe("azureuser");
  });

  it("writes run.started to the audit log during POST /", async () => {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = (await res.json()) as { runId: string };
    const { getAuditEvents } = await import("../store/audit.js");
    const timeline = getAuditEvents(body.runId);
    expect(timeline.some((event) => event.type === "run.started")).toBe(true);
  });

  it("does NOT call advance() during POST /", async () => {
    const orchestratorModule = await import("../ai/orchestrator.js");
    const advanceSpy = vi.spyOn(orchestratorModule, "advance");

    await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });

    expect(advanceSpy).not.toHaveBeenCalled();
  });

  it("stores customerSystemId as username@ip:port (no protocol prefix)", async () => {
    const createRunSpy = vi.spyOn(await import("../store/runs.js"), "createRun");

    await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });

    expect(createRunSpy).toHaveBeenCalledOnce();
    const [, customerSystemId] = createRunSpy.mock.calls[0] as [number, string];
    expect(customerSystemId).toBe("azureuser@10.0.0.1:22");
    expect(customerSystemId).not.toMatch(/^https?:\/\//);
  });

  it("returns 400 for missing ticketId", async () => {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid request body");
  });

  it("returns 400 for non-integer ticketId", async () => {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: "abc" }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid request body");
  });

  it("returns 404 for unknown ticketId (no customer system in mock)", async () => {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 9999 }),
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("ticket or customer system not found");
  });
});

describe("GET /api/runs/:runId", () => {
  async function createRun(): Promise<string> {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = (await res.json()) as { runId: string };
    return body.runId;
  }

  it("returns 200 with runId, status, timeline, pendingApproval, activityDraft for a known run", async () => {
    const runId = await createRun();
    const res = await app.request(`/api/runs/${runId}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      runId: string;
      status: string;
      phase: string;
      timeline: unknown[];
      pendingApproval: unknown;
      activityDraft: unknown;
      ticketId: number;
      customerSystemId: string;
      ticket: {
        id: number;
        title: string;
        customer_name: string;
        source: string;
      } | null;
      target: { ip: string; port: number } | null;
      source: string;
    };
    expect(body.runId).toBe(runId);
    expect(typeof body.status).toBe("string");
    expect(typeof body.phase).toBe("string");
    expect(Array.isArray(body.timeline)).toBe(true);
    expect("pendingApproval" in body).toBe(true);
    expect("activityDraft" in body).toBe(true);
    expect(body.ticketId).toBe(1);
    expect(body.customerSystemId).toBe("azureuser@10.0.0.1:22");
    expect(body.target).toEqual(
      expect.objectContaining({ ip: "10.0.0.1", port: 22, username: "azureuser" }),
    );
    expect(body.ticket).toEqual(
      expect.objectContaining({
        id: 1,
        title: "Service unavailable",
        customer_name: "Acme Corp",
        source: "mock-backend",
      }),
    );
    expect(body.source).toBe("mock-backend");

    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("privateKey");
    expect(serialized).not.toContain("PHOENIX_API_TOKEN");
    expect(serialized).not.toContain("/keys");
  });

  it("keeps run detail available when Phoenix ticket lookup fails", async () => {
    const runId = await createRun();
    const phoenixModule = await import("../phoenix/mock.js");
    vi.spyOn(phoenixModule.default.prototype, "getTicket").mockRejectedValueOnce(
      new Error("PHOENIX_API_TOKEN should stay server-side"),
    );

    const res = await app.request(`/api/runs/${runId}`);

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      runId: string;
      ticket: unknown;
      ticketId: number;
      customerSystemId: string;
    };
    expect(body.runId).toBe(runId);
    expect(body.ticket).toBeNull();
    expect(body.ticketId).toBe(1);
    expect(body.customerSystemId).toBe("azureuser@10.0.0.1:22");
    expect(JSON.stringify(body)).not.toContain("PHOENIX_API_TOKEN");
  });

  it("returns 404 for unknown runId", async () => {
    const res = await app.request("/api/runs/run_nonexistent");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("run not found");
  });
});

describe("POST /api/runs/:runId/next", () => {
  async function createRun(): Promise<string> {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = (await res.json()) as { runId: string };
    return body.runId;
  }

  it("returns 200 with status and pendingApproval after advancing", async () => {
    const orchestratorModule = await import("../ai/orchestrator.js");
    vi.spyOn(orchestratorModule, "advance").mockResolvedValueOnce({
      runId: "run_test",
      phase: "WAITING_FOR_APPROVAL",
      status: "RUNNING",
      stepCount: 1,
      ticketId: 1,
      customerSystemId: "10.0.0.1:22",
    });

    const runId = await createRun();
    const approval = createPendingApproval(runId, {
      proposedCommand: "systemctl status nginx",
      purpose: "Check nginx status",
      expectedSignal: "service status output",
      riskLevel: "SAFE_READ_ONLY",
      safetyNotes: "",
    });
    const res = await app.request(`/api/runs/${runId}/next`, { method: "POST" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      status: string;
      phase: string;
      pendingApproval: { id: string; proposed_command: string } | null;
    };
    expect(typeof body.status).toBe("string");
    expect("pendingApproval" in body).toBe(true);
    expect(body.phase).toBe("WAITING_FOR_APPROVAL");
    expect(body.pendingApproval).toEqual(
      expect.objectContaining({
        id: approval.id,
        proposed_command: "systemctl status nginx",
      }),
    );
  });

  it("returns 404 for unknown runId", async () => {
    const res = await app.request("/api/runs/run_nonexistent/next", { method: "POST" });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("run not found");
  });
});

describe("GET /api/runs/:runId/events", () => {
  async function createRun(): Promise<string> {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = (await res.json()) as { runId: string };
    return body.runId;
  }

  it("keeps the SSE stream available", async () => {
    const runId = await createRun();

    const res = await app.request(`/api/runs/${runId}/events`);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
  });
});

describe("POST /api/runs/:runId/abort", () => {
  async function createRun(): Promise<string> {
    const res = await app.request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = (await res.json()) as { runId: string };
    return body.runId;
  }

  it("returns 200 with status ABORTED after aborting", async () => {
    const orchestratorModule = await import("../ai/orchestrator.js");
    vi.spyOn(orchestratorModule, "advance").mockResolvedValueOnce({
      runId: "run_test",
      phase: "ABORTED",
      status: "ABORTED",
      stepCount: 0,
      ticketId: 1,
      customerSystemId: "10.0.0.1:22",
    });

    const runId = await createRun();
    const res = await app.request(`/api/runs/${runId}/abort`, { method: "POST" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ABORTED");
  });

  it("returns 404 for unknown runId", async () => {
    const res = await app.request("/api/runs/run_nonexistent/abort", { method: "POST" });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("run not found");
  });

  it("marks pending approvals as rejected when aborting", async () => {
    const orchestratorModule = await import("../ai/orchestrator.js");
    vi.spyOn(orchestratorModule, "advance").mockResolvedValueOnce({
      runId: "run_abort_pending",
      phase: "ABORTED",
      status: "ABORTED",
      stepCount: 1,
      ticketId: 1,
      customerSystemId: "10.0.0.1:22",
    });

    const runId = await createRun();
    const approval = createPendingApproval(runId, {
      proposedCommand: "systemctl status nginx",
      purpose: "Check nginx",
      expectedSignal: "active",
      riskLevel: "SAFE_READ_ONLY",
      safetyNotes: "",
    });

    const res = await app.request(`/api/runs/${runId}/abort`, { method: "POST" });
    expect(res.status).toBe(200);

    const row = getDb().get<Record<string, unknown>>(
      "SELECT * FROM command_approvals WHERE id = ?",
      [approval.id],
    );
    expect(row?.status).toBe("REJECTED");
    expect(row?.technician_reason).toBe("Run aborted");
    expect(row?.decided_at).toBeTruthy();
  });
});
