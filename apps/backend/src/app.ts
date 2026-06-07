import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { memoryRouter } from "./memory/routes.js";
import { activityRouter } from "./routes/activity.js";
import { approvalsRouter } from "./routes/approvals.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { eventsRouter } from "./routes/events.js";
import { healthRouter } from "./routes/health.js";
import { runsRouter } from "./routes/runs.js";
import { sandboxRouter } from "./routes/sandbox.js";
import { settingsRouter } from "./routes/settings.js";
import { ticketsRouter } from "./routes/tickets.js";

export function errorHandler(err: Error, c: Context) {
  console.error("[unhandled]", err);
  return c.json({ error: "Internal Server Error" }, 500);
}

export const app = new Hono();

app.use("*", cors());

app.route("/health", healthRouter);
app.route("/api/dashboard", dashboardRouter);
app.route("/api/memory", memoryRouter);
app.route("/api/tickets", ticketsRouter);
app.route("/api/sandbox", sandboxRouter);
app.route("/api/runs", runsRouter);
app.route("/api/runs", approvalsRouter);
app.route("/api/runs", eventsRouter);
app.route("/api/runs", activityRouter);
app.route("/api/settings", settingsRouter);

app.onError(errorHandler);
