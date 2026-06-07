import { describe, expect, it, vi } from "vitest";
import { app } from "../app.js";

vi.mock("../env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../env.js")>();
  return {
    ...actual,
    resolveClientMode: vi.fn().mockReturnValue("mock"),
    getEnv: vi.fn().mockReturnValue({
      PHOENIX_API_BASE_URL: "http://localhost",
      PHOENIX_API_TOKEN: "test",
      SSH_PRIVATE_KEY_PATH: "/keys/id_rsa",
      SSH_PRIVATE_KEY_DIR: "/keys",
      MOCK_MODE: false,
      MOCK_PHOENIX: true,
      MOCK_SSH: true,
      MOCK_LLM: true,
      MOCK_SCENARIOS: false,
      SANDBOX_PROVISIONER_ENABLED: false,
    }),
  };
});

describe("ticket connection preflight", () => {
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

  it("GET /api/tickets/:id/system is an alias for customer-system", async () => {
    const a = await app.request("/api/tickets/1/system");
    const b = await app.request("/api/tickets/1/customer-system");
    expect(a.status).toBe(200);
    expect(await a.json()).toEqual(await b.json());
  });
});
