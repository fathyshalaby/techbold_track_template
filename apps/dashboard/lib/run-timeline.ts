import type { ToolStatus } from "@/components/ai-elements/tool";
import type { AuditEvent } from "@techbold/contracts";

export type { TranscriptMessage, TranscriptRole, TranscriptTone } from "@/lib/transcript";
export { auditEventToMessage, timelineToMessages } from "@/lib/transcript";

export interface Hypothesis {
  cause: string;
  evidence: string;
  confidence: number;
}

export type TimelineBlock =
  | SystemBlock
  | ToolBlock
  | ReasoningBlock
  | MessageBlock
  | ValidationBlock
  | FindingBlock
  | TaskBlock
  | MemoryBlock;

export interface RecalledSolution {
  id: string;
  source: string;
  symptom: string;
  rootCause: string;
  fix: string;
  score: number;
}

export interface MemoryBlock {
  kind: "memory";
  id: string;
  count: number;
  results: RecalledSolution[];
  ts: string;
}

export interface SystemBlock {
  kind: "system";
  id: string;
  title: string;
  body: string;
  tone: "default" | "danger" | "success" | "warning";
  ts: string;
}

export interface ToolBlock {
  kind: "tool";
  id: string;
  approvalId: string | null;
  command: string;
  purpose: string;
  status: ToolStatus;
  exitCode: number | null;
  blockReason: string | null;
  output: string | null;
  hypotheses: Hypothesis[];
  riskNotes: string | null;
  expectedSignal: string | null;
  rootCause: string | null;
  rationale: string | null;
  rollbackCommand: string | null;
  isReversible: boolean | null;
  persistenceNote: string | null;
  ts: string;
}

export interface ReasoningBlock {
  kind: "reasoning";
  id: string;
  title: string;
  content: string;
  ts: string;
}

export interface MessageBlock {
  kind: "message";
  id: string;
  title: string;
  body: string;
  ts: string;
}

export interface ValidationBlock {
  kind: "validation";
  id: string;
  status: string;
  body: string;
  benefitCheck: string | null;
  persistenceCheck: string | null;
  evidence: string[];
  ts: string;
}

export interface FindingBlock {
  kind: "finding";
  id: string;
  title: string;
  content: string;
  ts: string;
}

export interface TaskBlock {
  kind: "task";
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  detail: string;
  ts: string;
}

const SYSTEM_TYPES = new Set([
  "run.started",
  "run.completed",
  "run.failed",
  "run.aborted",
  "run.steps_capped",
  "activity.drafted",
  "activity.submitted",
  "agent.unavailable",
]);

const REASONING_TYPES = new Set(["agent.thought_summary", "diagnosis.more_needed"]);

const MESSAGE_TYPES = new Set(["observation.added", "fix.failed"]);

const COMMAND_TYPES = new Set([
  "approval.required",
  "command.proposed",
  "command.blocked",
  "command.approved",
  "command.rejected",
  "command.executing",
  "command.completed",
]);

const TERMINAL_COMMAND_TYPES = new Set([
  "command.completed",
  "command.blocked",
  "command.rejected",
]);

const SYSTEM_TITLE: Record<string, string> = {
  "run.started": "Run started",
  "run.completed": "Run completed",
  "run.failed": "Run failed",
  "run.aborted": "Run aborted",
  "run.steps_capped": "Step limit reached",
  "activity.drafted": "Resolution drafted",
  "activity.submitted": "Resolution submitted",
  "agent.unavailable": "Agent unavailable",
};

function parsePayload(payloadJson?: string): Record<string, unknown> {
  if (!payloadJson) return {};
  try {
    const parsed = JSON.parse(payloadJson) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function pickString(payload: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function pickProposal(payload: Record<string, unknown>): Record<string, unknown> | null {
  const proposal = payload.proposal;
  if (proposal && typeof proposal === "object") {
    return proposal as Record<string, unknown>;
  }
  return null;
}

function pickApprovalId(payload: Record<string, unknown>): string | null {
  if (typeof payload.approvalId === "string") return payload.approvalId;
  const proposal = pickProposal(payload);
  if (proposal && typeof proposal.approvalId === "string") return proposal.approvalId;
  return null;
}

function pickCommand(payload: Record<string, unknown>): string {
  const direct = pickString(payload, "command", "proposed_command", "finalCommand");
  if (direct) return direct;
  const proposal = pickProposal(payload);
  if (proposal) {
    const cmd = pickString(proposal, "command", "proposed_command");
    if (cmd) return cmd;
  }
  return "";
}

function pickPurpose(payload: Record<string, unknown>): string {
  const direct = pickString(payload, "purpose", "rationale", "message");
  if (direct) return direct;
  const proposal = pickProposal(payload);
  if (proposal) {
    const purpose = pickString(proposal, "purpose", "rationale");
    if (purpose) return purpose;
  }
  return "";
}

function parseHypotheses(payload: Record<string, unknown>): Hypothesis[] {
  const proposal = pickProposal(payload);
  const source = proposal ?? payload;
  const raw = source.hypotheses;
  if (!Array.isArray(raw)) return [];
  const hypotheses: Hypothesis[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const cause = typeof row.cause === "string" ? row.cause : "";
    const evidence = typeof row.evidence === "string" ? row.evidence : "";
    const confidence = typeof row.confidence === "number" ? row.confidence : 0;
    if (cause || evidence) {
      hypotheses.push({ cause, evidence, confidence });
    }
  }
  return hypotheses;
}

function parseProposalFields(payload: Record<string, unknown>) {
  const proposal = pickProposal(payload);
  const source = proposal ?? payload;
  return {
    hypotheses: parseHypotheses(payload),
    riskNotes: pickString(source, "riskNotes", "risk_notes") || null,
    expectedSignal: pickString(source, "expectedSignal", "expected_signal") || null,
    rootCause: pickString(source, "rootCause", "root_cause") || null,
    rationale: pickString(source, "rationale") || null,
    rollbackCommand: pickString(source, "rollbackCommand", "rollback_command") || null,
    isReversible:
      typeof source.isReversible === "boolean"
        ? source.isReversible
        : typeof source.is_reversible === "boolean"
          ? source.is_reversible
          : null,
    persistenceNote: pickString(source, "persistenceNote", "persistence_note") || null,
  };
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function systemTone(type: string): SystemBlock["tone"] {
  if (type === "run.failed" || type === "agent.unavailable") return "danger";
  if (type === "run.completed" || type === "activity.submitted") return "success";
  if (type === "run.aborted" || type === "run.steps_capped") return "warning";
  return "default";
}

function systemBody(type: string, payload: Record<string, unknown>): string {
  if (type === "run.started") {
    return pickString(payload, "ticketDescription", "message");
  }
  if (type === "run.steps_capped") {
    const stepCount = payload.stepCount;
    return typeof stepCount === "number" ? `Stopped after ${stepCount} steps` : "";
  }
  return pickString(payload, "message", "reason", "hypothesis", "status");
}

function messageBody(type: string, payload: Record<string, unknown>): string {
  if (type === "fix.failed") {
    const exitCode = payload.exitCode;
    const timedOut = payload.timedOut;
    const parts = ["Fix command did not succeed"];
    if (typeof exitCode === "number") parts.push(`exit ${exitCode}`);
    if (timedOut) parts.push("timed out");
    return parts.join(", ");
  }
  return pickString(payload, "hypothesis", "reason", "message", "status");
}

function reasoningContent(type: string, payload: Record<string, unknown>): string {
  if (type === "diagnosis.more_needed") {
    return "More diagnosis is needed before planning a fix.";
  }
  return pickString(payload, "message", "hypothesis", "reason");
}

function toolStatusFromEvents(
  events: { type: string; payload: Record<string, unknown> }[],
): ToolStatus {
  const types = new Set(events.map((e) => e.type));
  if (types.has("command.blocked")) return "blocked";
  if (types.has("command.rejected")) return "denied";
  if (types.has("command.completed")) {
    const completed = events.find((e) => e.type === "command.completed");
    const exitCode = completed?.payload.exitCode;
    if (typeof exitCode === "number" && exitCode !== 0) return "error";
    return "completed";
  }
  if (types.has("command.approved") || types.has("command.executing")) return "running";
  if (types.has("approval.required") || types.has("command.proposed")) {
    return "awaiting-approval";
  }
  return "pending";
}

function pickExitCode(events: { type: string; payload: Record<string, unknown> }[]): number | null {
  const completed = events.find((e) => e.type === "command.completed");
  const exitCode = completed?.payload.exitCode;
  return typeof exitCode === "number" ? exitCode : null;
}

function pickBlockReason(
  events: { type: string; payload: Record<string, unknown> }[],
): string | null {
  const blocked = events.find((e) => e.type === "command.blocked");
  if (!blocked) return null;
  const reason = pickString(blocked.payload, "reason");
  return reason || null;
}

function formatToolOutput(
  events: { type: string; payload: Record<string, unknown> }[],
): string | null {
  const completed = events.find((e) => e.type === "command.completed");
  if (!completed) return null;
  const exitCode = completed.payload.exitCode;
  const lines: string[] = [];
  if (typeof exitCode === "number") {
    lines.push(`exit_code: ${exitCode}`);
  }
  const stdout = completed.payload.stdout;
  if (typeof stdout === "string" && stdout.trim()) {
    lines.push(stdout.trim());
  }
  const rejected = events.find((e) => e.type === "command.rejected");
  if (rejected) {
    lines.push(`rejected: ${pickString(rejected.payload, "reason")}`);
  }
  return lines.length > 0 ? lines.join("\n") : "Command finished";
}

function buildToolBlock(id: string, events: AuditEvent[], ts: string): ToolBlock {
  const parsedEvents = events.map((e) => ({
    type: e.type,
    payload: parsePayload(e.payload_json),
  }));
  const proposalPayload =
    parsedEvents.find((e) => e.type === "approval.required" || e.type === "command.proposed")
      ?.payload ??
    parsedEvents[0]?.payload ??
    {};
  const proposalFields = parseProposalFields(proposalPayload);
  const firstPayload = parsedEvents[0]?.payload ?? {};
  return {
    kind: "tool",
    id,
    approvalId: pickApprovalId(proposalPayload) ?? pickApprovalId(firstPayload),
    command: pickCommand(proposalPayload) || pickCommand(firstPayload) || "command",
    purpose: pickPurpose(proposalPayload) || pickPurpose(firstPayload),
    status: toolStatusFromEvents(parsedEvents),
    exitCode: pickExitCode(parsedEvents),
    blockReason: pickBlockReason(parsedEvents),
    output: formatToolOutput(parsedEvents),
    hypotheses: proposalFields.hypotheses,
    riskNotes: proposalFields.riskNotes,
    expectedSignal: proposalFields.expectedSignal,
    rootCause: proposalFields.rootCause,
    rationale: proposalFields.rationale,
    rollbackCommand: proposalFields.rollbackCommand,
    isReversible: proposalFields.isReversible,
    persistenceNote: proposalFields.persistenceNote,
    ts,
  };
}

function phaseToTask(phase: string): TaskBlock | null {
  const map: Record<string, { title: string; status: TaskBlock["status"] }> = {
    LOADED_CONTEXT: { title: "Loading context", status: "in_progress" },
    TRIAGING: { title: "Diagnosing", status: "in_progress" },
    OBSERVING: { title: "Analyzing results", status: "in_progress" },
    PLANNING_FIX: { title: "Planning fix", status: "in_progress" },
    VALIDATING: { title: "Validating fix", status: "in_progress" },
    DRAFTING_ACTIVITY: { title: "Drafting resolution", status: "in_progress" },
    WAITING_FOR_ACTIVITY_REVIEW: { title: "Resolution review", status: "pending" },
    COMPLETED: { title: "Completed", status: "completed" },
    FAILED: { title: "Failed", status: "completed" },
    ABORTED: { title: "Aborted", status: "completed" },
  };
  const entry = map[phase];
  if (!entry) return null;
  return {
    kind: "task",
    id: `phase-${phase}`,
    title: entry.title,
    status: entry.status,
    detail: "",
    ts: new Date().toISOString(),
  };
}

export function timelineToBlocks(timeline: AuditEvent[], currentPhase?: string): TimelineBlock[] {
  const blocks: TimelineBlock[] = [];
  let openToolEvents: AuditEvent[] = [];

  function flushOpenTool() {
    if (openToolEvents.length === 0) return;
    const first = openToolEvents[0];
    blocks.push(buildToolBlock(first.id, openToolEvents, first.ts));
    openToolEvents = [];
  }

  for (const event of timeline) {
    if (COMMAND_TYPES.has(event.type)) {
      if (event.type === "approval.required" || event.type === "command.proposed") {
        flushOpenTool();
        openToolEvents = [event];
        continue;
      }

      if (openToolEvents.length > 0) {
        openToolEvents.push(event);
        if (TERMINAL_COMMAND_TYPES.has(event.type)) {
          flushOpenTool();
        }
        continue;
      }

      blocks.push(buildToolBlock(event.id, [event], event.ts));
      continue;
    }

    flushOpenTool();
    const payload = parsePayload(event.payload_json);

    if (SYSTEM_TYPES.has(event.type)) {
      blocks.push({
        kind: "system",
        id: event.id,
        title: SYSTEM_TITLE[event.type] ?? event.type,
        body: systemBody(event.type, payload),
        tone: systemTone(event.type),
        ts: event.ts,
      });
      continue;
    }

    if (event.type === "memory.recalled") {
      const rawResults = payload.results;
      const results: RecalledSolution[] = [];
      if (Array.isArray(rawResults)) {
        for (const item of rawResults) {
          if (!item || typeof item !== "object") continue;
          const row = item as Record<string, unknown>;
          const symptom = typeof row.symptom === "string" ? row.symptom : "";
          const rootCause =
            typeof row.rootCause === "string"
              ? row.rootCause
              : typeof row.root_cause === "string"
                ? row.root_cause
                : "";
          const fix = typeof row.fix === "string" ? row.fix : "";
          if (!symptom && !fix) continue;
          results.push({
            id: typeof row.id === "string" ? row.id : event.id,
            source: typeof row.source === "string" ? row.source : "unknown",
            symptom,
            rootCause,
            fix,
            score: typeof row.score === "number" ? row.score : 0,
          });
        }
      }
      const count = typeof payload.count === "number" ? payload.count : results.length;
      if (count > 0 || results.length > 0) {
        blocks.push({
          kind: "memory",
          id: event.id,
          count: count || results.length,
          results,
          ts: event.ts,
        });
      }
      continue;
    }

    if (event.type === "diagnosis.root_cause_found") {
      blocks.push({
        kind: "finding",
        id: event.id,
        title: "Root cause identified",
        content: pickString(payload, "hypothesis"),
        ts: event.ts,
      });
      continue;
    }

    if (event.type === "validation.completed") {
      blocks.push({
        kind: "validation",
        id: event.id,
        status: pickString(payload, "status") || "UNKNOWN",
        body: pickString(payload, "message", "status"),
        benefitCheck: pickString(payload, "benefitCheck") || null,
        persistenceCheck: pickString(payload, "persistenceCheck") || null,
        evidence: parseStringArray(payload.evidence),
        ts: event.ts,
      });
      continue;
    }

    if (REASONING_TYPES.has(event.type)) {
      blocks.push({
        kind: "reasoning",
        id: event.id,
        title: event.type === "diagnosis.more_needed" ? "More diagnosis needed" : "Reasoning",
        content: reasoningContent(event.type, payload),
        ts: event.ts,
      });
      continue;
    }

    if (MESSAGE_TYPES.has(event.type)) {
      blocks.push({
        kind: "message",
        id: event.id,
        title: event.type === "fix.failed" ? "Fix failed" : "Observation",
        body: messageBody(event.type, payload),
        ts: event.ts,
      });
    }
  }

  flushOpenTool();

  if (currentPhase) {
    const task = phaseToTask(currentPhase);
    if (task && !["COMPLETED", "FAILED", "ABORTED"].includes(currentPhase)) {
      blocks.push(task);
    }
  }

  return blocks;
}
