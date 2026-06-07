import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Context } from "hono";
import { caseSourceStatus, setCaseSource } from "./caseSource";
import { config } from "./config";
import { ERPError, erp } from "./erp";
import * as runs from "./runs";

// Node build of the AI Service Desk Autopilot backend.
// Implements the SAME contract as backend-py — see ../../shared/api-contract.md.

const app = new Hono();
app.use("/*", cors());

async function handle(c: Context, fn: () => Promise<unknown> | unknown) {
  try {
    return c.json((await fn()) as object);
  } catch (e) {
    const err = e as Error;
    let status = 502;
    if (err instanceof ERPError) status = err.status || 502;
    else if (err instanceof runs.RunError) status = err.status;
    return c.json({ error: { code: "error", message: String(err.message || err) } }, status as 400);
  }
}

app.get("/health", (c) =>
  c.json({
    status: "ok",
    backend: "node",
    llm_provider: config.llmProvider,
    ...caseSourceStatus(),
  }),
);

app.get("/api/case-source", (c) => c.json(caseSourceStatus()));
app.post("/api/case-source", (c) =>
  handle(c, async () => {
    const body = await c.req.json();
    setCaseSource(String(body.source || ""));
    return {
      status: "ok",
      backend: "node",
      llm_provider: config.llmProvider,
      ...caseSourceStatus(),
    };
  }),
);

// ---- ERP passthrough ----
app.get("/api/me", (c) => handle(c, () => erp.me()));
app.get("/api/tickets", (c) =>
  handle(c, () =>
    erp.listTickets({ status: c.req.query("status"), priority: c.req.query("priority"), sort: c.req.query("sort") || "date" }),
  ),
);
app.get("/api/tickets/:id", (c) => handle(c, () => erp.getTicket(Number(c.req.param("id")))));
app.get("/api/tickets/:id/system", (c) =>
  handle(c, async () => {
    const data: any = await erp.getCustomerSystem(Number(c.req.param("id")));
    return data.system || data;
  }),
);
app.post("/api/reset", (c) => handle(c, () => erp.reset()));

// ---- runs / agent ----
app.post("/api/runs", (c) =>
  handle(c, async () => {
    const body = await c.req.json();
    return runs.createRun(Number(body.ticket_id));
  }),
);
app.get("/api/runs/:id", (c) => handle(c, () => runs.getRunDict(c.req.param("id"))));
app.post("/api/runs/:id/approve", (c) =>
  handle(c, async () => {
    const body = await c.req.json();
    return runs.approveStep(c.req.param("id"), body.step_id, body.edited_command);
  }),
);
app.post("/api/runs/:id/reject", (c) =>
  handle(c, async () => {
    const body = await c.req.json();
    return runs.rejectStep(c.req.param("id"), body.step_id, body.reason);
  }),
);
app.post("/api/runs/:id/abort", (c) => handle(c, () => runs.abort(c.req.param("id"))));
app.post("/api/runs/:id/activity/draft", (c) => handle(c, () => runs.draftActivity(c.req.param("id"))));
app.post("/api/runs/:id/activity/submit", (c) =>
  handle(c, async () => {
    const body = await c.req.json();
    return runs.submitActivity(c.req.param("id"), body);
  }),
);

serve({ fetch: app.fetch, port: config.port });
console.log(`backend-node listening on :${config.port}`);
