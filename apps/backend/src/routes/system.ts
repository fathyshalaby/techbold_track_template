import { Hono } from "hono";
import {
  PhoenixAuthError,
  PhoenixNetworkError,
  PhoenixValidationError,
} from "../phoenix/client.js";
import { getPhoenixClient } from "./runs.js";

export const systemRouter = new Hono();

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
