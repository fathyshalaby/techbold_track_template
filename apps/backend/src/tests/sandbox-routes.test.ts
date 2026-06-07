import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MockPhoenixClient from "../phoenix/mock.js";
import { sandboxRouter } from "../routes/sandbox.js";
import { _resetDynamicStoreForTests } from "../sandbox/dynamic-store.js";
import * as provisioner from "../sandbox/provisioner.js";

let provisionerEnabled = true;
let mockMode = true;

vi.mock("../env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../env.js")>();
  return {
    ...actual,
    isMockMode: vi.fn(() => mockMode),
    isSandboxProvisionerEnabled: vi.fn(() => provisionerEnabled),
    resolveClientMode: vi.fn(() => "mock" as const),
    getEnv: vi.fn().mockReturnValue({
      MOCK_MODE: true,
      MOCK_PHOENIX: true,
      MOCK_SSH: true,
      MOCK_LLM: true,
      MOCK_SCENARIOS: true,
      SANDBOX_PROVISIONER_ENABLED: true,
    }),
  };
});

vi.mock("../phoenix/factory.js", () => ({
  getPhoenixClient: () => new MockPhoenixClient({ seedScenarios: true }),
}));

const app = new Hono();
app.route("/api/sandbox", sandboxRouter);

beforeEach(() => {
  provisionerEnabled = true;
  mockMode = true;
  _resetDynamicStoreForTests([]);
});

afterEach(() => {
  _resetDynamicStoreForTests([]);
  vi.restoreAllMocks();
});

describe("sandbox routes gating", () => {
  it("returns 403 when provisioner is disabled", async () => {
    provisionerEnabled = false;
    const res = await app.request("/api/sandbox/vms");
    expect(res.status).toBe(403);
  });

  it("returns 503 with a clear message when the sandbox public key is missing", async () => {
    vi.spyOn(provisioner, "readBenchPublicKey").mockImplementation(() => {
      throw new Error("Missing keys/bench_incident_key.pub");
    });
    const res = await app.request("/api/sandbox/vms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 1 }),
    });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("bench_incident_key.pub");
  });

  it("lists generated VMs", async () => {
    _resetDynamicStoreForTests([
      {
        archetype: "service-health",
        ticket: {
          id: 7201,
          title: "Status endpoint unavailable after restart",
          description: "test",
          priority: "high",
          status: "OPEN",
          customer_id: 5201,
          customer_name: "Test GmbH",
          tags: ["generated"],
          created_at: "2026-06-07T08:00:00.000Z",
        },
        system: {
          ip: "127.0.0.1",
          port: 2210,
          username: "azureuser",
          os: "Ubuntu 22.04 LTS",
        },
        params: {
          serviceName: "status-beacon",
          port: 8080,
          healthPath: "/health",
        },
      },
    ]);

    const res = await app.request("/api/sandbox/vms");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ ticketId: number }> };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.ticketId).toBe(7201);
  });
});

describe("POST /api/sandbox/vms/:ticketId/reset", () => {
  it("re-injects fault and reopens ticket", async () => {
    const resetSpy = vi.spyOn(provisioner, "resetScenarioFault").mockImplementation(async () => {});

    const res = await app.request("/api/sandbox/vms/7101/reset", { method: "POST" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ticket: { id: number; status: string } };
    expect(body.ticket.id).toBe(7101);
    expect(body.ticket.status).toBe("OPEN");
    expect(resetSpy).toHaveBeenCalledOnce();
  });

  it("returns 404 for unknown ticket", async () => {
    const res = await app.request("/api/sandbox/vms/99999/reset", { method: "POST" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/sandbox/vms/:ticketId", () => {
  it("rejects deleting static sandbox tickets", async () => {
    const res = await app.request("/api/sandbox/vms/7101", { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  it("deletes generated VMs", async () => {
    _resetDynamicStoreForTests([
      {
        archetype: "service-health",
        ticket: {
          id: 7202,
          title: "Status endpoint unavailable after restart",
          description: "test",
          priority: "high",
          status: "OPEN",
          customer_id: 5202,
          customer_name: "Test GmbH",
          tags: ["generated"],
          created_at: "2026-06-07T08:00:00.000Z",
        },
        system: {
          ip: "127.0.0.1",
          port: 2211,
          username: "azureuser",
          os: "Ubuntu 22.04 LTS",
        },
        params: {
          serviceName: "status-beacon",
          port: 8080,
          healthPath: "/health",
        },
      },
    ]);
    const removeSpy = vi
      .spyOn(provisioner, "removeScenarioContainer")
      .mockImplementation(async () => {});

    const res = await app.request("/api/sandbox/vms/7202", { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(removeSpy).toHaveBeenCalledOnce();
  });
});
