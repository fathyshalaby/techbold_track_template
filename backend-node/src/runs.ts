// Runs — the human-in-the-loop state machine (mirror of backend-py/app/runs.py).
// Agent proposes ONE command; the run pauses until the technician approves (optionally edited),
// rejects, or aborts. Approved commands pass the safety layer, run over SSH, and the redacted
// result is fed back so the agent proposes the next step — until it concludes.
import { randomUUID } from "node:crypto";
import type { ModelMessage } from "ai";
import * as activityMod from "./activity";
import * as agent from "./agent";
import { config } from "./config";
import { erp } from "./erp";
import * as safety from "./safety";
import { SSHRunner } from "./ssh";

const MAX_AUTO_ADVANCE = 6;
const now = () => new Date().toISOString();

export class RunError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface Step {
  id: string;
  index: number;
  kind: string;
  command: string;
  rationale: string;
  tool_call_id: string;
  tool_name: string;
  risk: string;
  safety: safety.Verdict | Record<string, unknown>;
  status: string;
  edited_command: string | null;
  result: Record<string, unknown> | null;
  created_at: string;
  decided_at: string | null;
  ran_at: string | null;
}

interface AuditEntry {
  ts: string;
  actor: string;
  type: string;
  step_id?: string;
  command?: string;
  exit_code?: number;
  note?: string;
}

class Run {
  id = "run_" + randomUUID().slice(0, 8);
  ticket_id: number;
  status = "analyzing";
  created_at = now();
  updated_at = this.created_at;
  steps: Step[] = [];
  audit: AuditEntry[] = [];
  messages: ModelMessage[] = [];
  conclusion: any = null;
  activity_draft: any = null;
  pending_step_id: string | null = null;
  ssh: SSHRunner | null = null;
  auto = 0;

  constructor(public ticket: any, public system: any) {
    this.ticket_id = ticket.id;
  }

  log(actor: string, type: string, extra: Partial<AuditEntry> = {}): void {
    this.audit.push({ ts: now(), actor, type, ...extra });
    this.updated_at = now();
  }

  toDict(): any {
    return {
      id: this.id,
      ticket_id: this.ticket_id,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      ticket: this.ticket,
      system: this.system,
      pending_step_id: this.pending_step_id,
      steps: this.steps,
      audit: this.audit,
      conclusion: this.conclusion,
      activity_draft: this.activity_draft,
    };
  }
}

const RUNS = new Map<string, Run>();

function getRun(id: string): Run {
  const run = RUNS.get(id);
  if (!run) throw new RunError(`run ${id} not found`, 404);
  return run;
}

function findStep(run: Run, stepId: string): Step | undefined {
  return run.steps.find((s) => s.id === stepId);
}

// Run an approved (or auto-approved read-only) command over SSH; feed the redacted result back.
async function execute(run: Run, step: Step, command: string, auto: boolean): Promise<void> {
  step.status = "running";
  step.decided_at = now();
  run.status = "running";
  run.pending_step_id = null;
  run.log(auto ? "agent" : "technician", auto ? "auto_executed" : "approved", {
    step_id: step.id,
    command: safety.redact(command),
  });
  try {
    const result = await run.ssh!.run(command);
    step.ran_at = now();
    const redacted = {
      exit_code: result.exit_code,
      stdout: safety.redact(result.stdout),
      stderr: safety.redact(result.stderr),
      duration_ms: result.duration_ms,
      truncated: result.truncated,
    };
    step.result = redacted;
    step.status = result.exit_code === 0 ? "succeeded" : "failed";
    run.log("system", "executed", { step_id: step.id, command: safety.redact(command), exit_code: result.exit_code });
    const toolContent = `exit_code=${result.exit_code}\nstdout:\n${redacted.stdout}\nstderr:\n${redacted.stderr}`;
    run.messages.push(agent.toolResultMessage(step.tool_call_id, step.tool_name, toolContent.slice(0, 8000)));
  } catch (e) {
    step.status = "failed";
    step.result = { exit_code: 255, stdout: "", stderr: String((e as Error).message || e), duration_ms: 0, truncated: false };
    run.log("system", "error", { step_id: step.id, note: `ssh error: ${(e as Error).message}` });
    run.messages.push(agent.toolResultMessage(step.tool_call_id, step.tool_name, `SSH ERROR: ${(e as Error).message}`));
  }
}

async function advance(run: Run): Promise<void> {
  run.auto = 0;
  while (true) {
    if (["done", "aborted", "error"].includes(run.status)) return;
    if (run.auto >= MAX_AUTO_ADVANCE) {
      run.status = "error";
      run.log("system", "error", { note: "too many automatic advances without a human-approvable step" });
      return;
    }
    run.auto++;

    let action: agent.NextAction;
    try {
      action = await agent.nextAction(run.messages);
    } catch (e) {
      run.status = "error";
      run.log("system", "error", { note: String((e as Error).message || e) });
      return;
    }

    // Resolve any extra tool calls so there are no dangling (unanswered) calls.
    for (const d of action.deferred) {
      run.messages.push(
        agent.toolResultMessage(d.toolCallId, d.toolName, "Only one command at a time; not run. Re-propose if still needed."),
      );
    }

    if (action.type === "conclude") {
      run.conclusion = action.args || {};
      run.status = "done";
      run.pending_step_id = null;
      run.log("agent", "validated", { note: safety.redact(run.conclusion.validation_result || "") });
      run.ssh?.close();
      return;
    }

    if (action.type === "run_command") {
      const args = action.args || {};
      const command = String(args.command || "").trim();
      const step: Step = {
        id: `step_${run.steps.length}`,
        index: run.steps.length,
        kind: args.purpose || "diagnose",
        command,
        rationale: args.rationale || "",
        tool_call_id: action.toolCallId!,
        tool_name: action.toolName!,
        risk: "needs_review",
        safety: {},
        status: "pending_approval",
        edited_command: null,
        result: null,
        created_at: now(),
        decided_at: null,
        ran_at: null,
      };
      const verdict = safety.classify(command);
      step.safety = verdict;
      step.risk = verdict.risk;
      run.steps.push(step);

      if (verdict.classification === "blocked") {
        step.status = "blocked";
        run.log("system", "blocked", { step_id: step.id, command: safety.redact(command), note: verdict.reason || "" });
        run.messages.push(
          agent.toolResultMessage(
            step.tool_call_id,
            step.tool_name,
            `BLOCKED by safety layer: ${verdict.reason}. This command will NOT run. Propose a safer, more targeted approach.`,
          ),
        );
        continue;
      }

      run.log("agent", "proposed", { step_id: step.id, command: safety.redact(command), note: step.rationale });

      // Selective human-in-the-loop: auto-run READ-ONLY diagnostics; gate every write.
      if (verdict.classification === "low_risk" && config.autoRunReadonly && run.auto < MAX_AUTO_ADVANCE) {
        await execute(run, step, command, true);
        continue;
      }

      step.status = "pending_approval";
      run.pending_step_id = step.id;
      run.status = "awaiting_approval";
      return;
    }

    // message (no tool call) -> nudge back to the tools
    run.messages.push({ role: "user", content: "Use the run_command tool to propose ONE command, or call conclude." });
  }
}

export async function createRun(ticketId: number): Promise<any> {
  const ticket = await erp.getTicket(ticketId);
  const cs: any = await erp.getCustomerSystem(ticketId);
  const system = cs.system || cs;
  const run = new Run(ticket, system);
  RUNS.set(run.id, run);
  run.messages = agent.initialMessages(ticket, system);
  run.ssh = new SSHRunner(system.ip, system.username, Number(system.port || 22));
  run.log("system", "run_created", { note: `ticket ${ticketId}` });
  await advance(run);
  return run.toDict();
}

export function getRunDict(id: string): any {
  return getRun(id).toDict();
}

export async function approveStep(runId: string, stepId: string, editedCommand?: string): Promise<any> {
  const run = getRun(runId);
  const step = findStep(run, stepId);
  if (!step || step.status !== "pending_approval" || run.pending_step_id !== stepId) {
    throw new RunError("no pending step with that id", 409);
  }

  const command = (editedCommand || step.command).trim();
  if (editedCommand && command !== step.command) {
    step.edited_command = command;
    run.log("technician", "edited", { step_id: step.id, command: safety.redact(command) });
  }

  const verdict = safety.classify(command);
  step.safety = verdict;
  step.risk = verdict.risk;
  if (verdict.classification === "blocked") {
    step.status = "blocked";
    run.pending_step_id = null;
    run.status = "analyzing";
    run.log("system", "blocked", { step_id: step.id, command: safety.redact(command), note: verdict.reason || "" });
    run.messages.push(
      agent.toolResultMessage(step.tool_call_id, step.tool_name, `BLOCKED by safety layer: ${verdict.reason}. Propose a safer approach.`),
    );
    await advance(run);
    return run.toDict();
  }

  await execute(run, step, command, false);
  await advance(run);
  return run.toDict();
}

export async function rejectStep(runId: string, stepId: string, reason?: string): Promise<any> {
  const run = getRun(runId);
  const step = findStep(run, stepId);
  if (!step || step.status !== "pending_approval") throw new RunError("no pending step with that id", 409);
  step.status = "rejected";
  step.decided_at = now();
  run.pending_step_id = null;
  run.status = "analyzing";
  run.log("technician", "rejected", { step_id: step.id, note: reason || "" });
  run.messages.push(
    agent.toolResultMessage(
      step.tool_call_id,
      step.tool_name,
      `REJECTED by technician: ${reason || "no reason given"}. Propose a different approach.`,
    ),
  );
  await advance(run);
  return run.toDict();
}

export function abort(runId: string): any {
  const run = getRun(runId);
  run.ssh?.close();
  run.status = "aborted";
  run.pending_step_id = null;
  run.log("technician", "aborted");
  return run.toDict();
}

export async function draftActivity(runId: string): Promise<any> {
  const run = getRun(runId);
  const draft = await activityMod.generate(run);
  run.activity_draft = draft;
  run.updated_at = now();
  return draft;
}

export async function submitActivity(runId: string, draft: any): Promise<any> {
  const run = getRun(runId);
  const payload = activityMod.toPayload(run, draft);
  const created = await erp.createActivity(payload);
  try {
    await erp.setStatus(run.ticket_id, "DONE");
  } catch (e) {
    run.log("system", "error", { note: `set_status DONE failed: ${(e as Error).message}` });
  }
  run.activity_draft = draft;
  run.log("technician", "activity_submitted", { note: `activity created for ticket ${run.ticket_id}` });
  run.ssh?.close();
  return { activity: created, submitted: payload };
}
