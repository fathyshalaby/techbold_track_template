import { Hono } from "hono";
import { z } from "zod";
import { advance } from "../ai/orchestrator.js";
import { getDb } from "../store/db.js";
import { getRunById } from "../store/runs.js";
import { CommandApprovalSchema } from "../store/schema.js";

export const approvalsRouter = new Hono();

export const ApproveBodySchema = z.object({
  editedCommand: z.string().optional(),
  reason: z.string().optional(),
});

export const RejectBodySchema = z.object({
  reason: z.string().min(1),
});

// Approvals currently executing. The PENDING check + SSH execution span an
// await, so two near-simultaneous /approve POSTs could both pass the check and
// double-execute. Node is single-threaded, so this synchronous check-and-add
// between awaits is an atomic claim that prevents the double run.
const inFlightApprovals = new Set<string>();

function getApproval(approvalId: string) {
  const row = getDb().get("SELECT * FROM command_approvals WHERE id = ?", [approvalId]);
  if (!row) return undefined;
  const parsed = CommandApprovalSchema.safeParse(row);
  return parsed.success ? parsed.data : undefined;
}

function getLatestResult(approvalId: string) {
  return getDb().get(
    "SELECT * FROM command_results WHERE approval_id = ? ORDER BY created_at DESC LIMIT 1",
    [approvalId],
  );
}

approvalsRouter.post("/:runId/approvals/:approvalId/approve", async (c) => {
  const { runId, approvalId } = c.req.param();

  const run = getRunById(runId);
  if (!run) return c.json({ error: "run not found" }, 404);

  const approval = getApproval(approvalId);
  if (!approval) return c.json({ error: "approval not found" }, 404);
  if (approval.status !== "PENDING") {
    return c.json({ error: "approval already decided", status: approval.status }, 409);
  }

  const rawBody = await c.req.json().catch(() => ({}));
  const parsed = ApproveBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return c.json({ error: "invalid request body" }, 400);
  }

  // Atomically claim the approval so a concurrent duplicate can't double-execute.
  if (inFlightApprovals.has(approvalId)) {
    return c.json({ error: "approval is already being processed" }, 409);
  }
  inFlightApprovals.add(approvalId);

  const finalCommand = parsed.data.editedCommand ?? approval.proposed_command;
  let state: Awaited<ReturnType<typeof advance>>;
  try {
    state = await advance(runId, { type: "command_approved", approvalId, finalCommand });
  } finally {
    inFlightApprovals.delete(approvalId);
  }

  if (state.phase === "WAITING_FOR_APPROVAL") {
    return c.json(
      { error: "command blocked by safety policy", riskLevel: "HIGH_RISK_BLOCKED" },
      422,
    );
  }

  // Report the risk level of what ACTUALLY ran. advance() re-classified the
  // (possibly edited) command and persisted the recomputed level on the row.
  const executed = getApproval(approvalId);
  const result = getLatestResult(approvalId) ?? null;
  return c.json({
    status: state.status,
    phase: state.phase,
    approvalId,
    safetyRecheck: { riskLevel: executed?.risk_level ?? approval.risk_level, allowed: true },
    result,
  });
});

approvalsRouter.post("/:runId/approvals/:approvalId/reject", async (c) => {
  const { runId, approvalId } = c.req.param();

  const run = getRunById(runId);
  if (!run) return c.json({ error: "run not found" }, 404);

  const approval = getApproval(approvalId);
  if (!approval) return c.json({ error: "approval not found" }, 404);
  if (approval.status !== "PENDING") {
    return c.json({ error: "approval already decided", status: approval.status }, 409);
  }

  const rawBody = await c.req.json().catch(() => ({}));
  const parsed = RejectBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return c.json({ error: "reason is required" }, 400);
  }

  const state = await advance(runId, { type: "command_rejected", reason: parsed.data.reason });
  return c.json({ status: state.status, phase: state.phase });
});
