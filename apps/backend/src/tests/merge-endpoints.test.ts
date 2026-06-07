import { describe, expect, it, vi } from "vitest";
import { app } from "../app.js";

// Force mock mode so the merged endpoints use the mock Phoenix + mock SSH.
vi.mock("../env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../env.js")>();
  return {
    ...actual,
    resolveClientMode: vi.fn().mockReturnValue("mock"),
    getEnv: vi.fn().mockReturnValue({
      PHOENIX_API_BASE_URL: "http://localhost",
      PHOENIX_API_TOKEN: "test",
      SSH_PRIVATE_KEY_PATH: "/keys/id_rsa",
      SSH_KEY_DIR: "/keys",
      MOCK_MODE: false,
      MOCK_PHOENIX: true,
      MOCK_SSH: true,
      MOCK_LLM: true,
      MOCK_SCENARIOS: false,
    }),
  };
});

describe("merged endpoints (multi-key SSH preflight + reset)", () => {
  it("GET /api/tickets/:id/connection reports reachability (mock)", async () => {
    const res = await app.request("/api/tickets/1/connection");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { reachable: boolean; latencyMs: number };
    expect(body.reachable).toBe(true);
    expect(typeof body.latencyMs).toBe("number");
  });

  it("GET /api/tickets/:id/connection rejects an invalid id", async () => {
    const res = await app.request("/api/tickets/abc/connection");
    expect(res.status).toBe(400);
  });

  it("POST /api/reset clears activities + reboots VMs (mock)", async () => {
    const res = await app.request("/api/reset", { method: "POST" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { message?: string };
    expect(body.message).toBeDefined();
  });

  it("GET /api/me returns the logged-in technician (Phoenix parity)", async () => {
    const res = await app.request("/api/me");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: number; username: string };
    expect(body.id).toBeGreaterThan(0);
    expect(typeof body.username).toBe("string");
  });

  it("GET /api/tickets/:id/system is an alias for customer-system (path parity)", async () => {
    const a = await app.request("/api/tickets/1/system");
    const b = await app.request("/api/tickets/1/customer-system");
    expect(a.status).toBe(200);
    expect(await a.json()).toEqual(await b.json());
  });

  it("GET /api/case-source reports the ticket source (parity)", async () => {
    const res = await app.request("/api/case-source");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { case_source: string; sandbox_available: boolean };
    expect(["sandbox_cases", "real_erp"]).toContain(body.case_source);
    expect(typeof body.sandbox_available).toBe("boolean");
  });
});
