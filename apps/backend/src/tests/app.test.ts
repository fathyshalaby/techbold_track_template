// App-level tests: health endpoint + the error handler must never leak details.
// MOCK_MODE=true is set so isMockMode()->getEnv() resolves without real creds
// (and never process.exit(1) during the test run).
process.env.MOCK_MODE = "true";

import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { app, errorHandler } from "../app.js";

describe("GET /health", () => {
  it("returns 200 with status ok and the current mode", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.mode).toBe("mock");
    expect(body.store).toEqual({ mode: "sqlite", durable: true });
  });
});

describe("errorHandler regression", () => {
  it("returns a generic 500 and never the thrown message/stack", async () => {
    const SENTINEL = "SECRET_LEAK_SENTINEL_xyz";
    // Fresh app wired with the REAL exported handler, so we test the actual logic.
    const probe = new Hono();
    probe.onError(errorHandler);
    probe.get("/boom", () => {
      throw new Error(SENTINEL);
    });
    const res = await probe.request("/boom");
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toContain(SENTINEL);
    expect(JSON.parse(text)).toEqual({ error: "Internal Server Error" });
  });
});
