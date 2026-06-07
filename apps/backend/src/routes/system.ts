import { Hono } from "hono";
import { getEnv, resolveClientMode } from "../env.js";
import {
  PhoenixAuthError,
  PhoenixNetworkError,
  PhoenixValidationError,
} from "../phoenix/client.js";
import { MAX_SANDBOX_CASES } from "../sandbox/registry.js";
import { getPhoenixClient } from "./runs.js";

export const systemRouter = new Hono();

// GET /api/case-source — reports whether tickets come from the sandbox catalog or
// the real ERP (parity with the python backend's status endpoint). Node selects
// the source via env (MOCK_MODE/MOCK_PHOENIX + MOCK_SCENARIOS), not a runtime toggle.
systemRouter.get("/case-source", (c) => {
  const env = getEnv();
  const sandbox = resolveClientMode("phoenix") === "mock" && env.MOCK_SCENARIOS;
  return c.json(
    {
      case_source: sandbox ? "sandbox_cases" : "real_erp",
      erp_source: resolveClientMode("phoenix") === "mock" ? "local_or_mock" : "real_erp",
      sandbox_case_count: sandbox ? MAX_SANDBOX_CASES : 0,
      sandbox_available: sandbox,
    },
    200,
  );
});

// GET /api/me — the logged-in technician (Phoenix /api/v1/me). Completes the
// ERP surface so the UI can show "who am I" (A/D), matching the python backend.
systemRouter.get("/me", async (c) => {
  try {
    const me = await getPhoenixClient().getMe();
    return c.json(me, 200);
  } catch (err) {
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: "ERP returned an unexpected response" }, 502);
    }
    throw err;
  }
});

// Reset: clear this team's activities and REBOOT the VMs via Phoenix
// POST /api/v1/me/reset (merged from the python backend). This is the grader's
// persistence mirror — use it to retest that a fix survives a reboot (scoring B).
systemRouter.post("/reset", async (c) => {
  try {
    const result = await getPhoenixClient().reset();
    return c.json(result, 200);
  } catch (err) {
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: "upstream authentication failed" }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: "ERP unavailable" }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: "ERP returned an unexpected response" }, 502);
    }
    throw err;
  }
});
