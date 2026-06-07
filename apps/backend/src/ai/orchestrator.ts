import { runEventBus } from "../events/run-event-bus.js";
import { retrieveSimilarStructured } from "../memory/retrieve.js";
import { formatSimilarSolutions } from "../memory/store.js";
import { validateCommandAgainstPolicy } from "../safety/command-policy.js";
import { redactSecrets } from "../safety/redaction.js";
import { createSshExecutor } from "../ssh/factory.js";
import { resolveSshKeyPaths } from "../ssh/keys.js";
import type { SshExecutor } from "../ssh/types.js";
import {
  appendAuditEvent,
  appendCommandResult,
  appendObservation,
  createPendingApproval,
  updateApprovalStatus,
} from "../store/audit.js";
import type { DbAdapter } from "../store/db.js";
import { getDb, setDb } from "../store/db.js";
import {
  getRunById,
  resolveSshTargetFromCustomerSystemId,
  updateRunPhase,
  updateRunStatus,
} from "../store/runs.js";
import type {
  AuditEvent,
  CommandResult,
  Observation,
  Run,
  RunPhaseValue,
  RunStatusValue,
} from "../store/schema.js";
import { runProblemAnalyzer, runProblemAnalyzerObserve } from "./agents/problem-analyzer.js";
import { runProblemSolver } from "./agents/problem-solver.js";
import { runValidator } from "./agents/validator.js";
import type { DiagnosticProposal, FixProposal, ValidationResult } from "./types.js";

export type { DiagnosticProposal, FixProposal, ValidationResult };

export const MAX_STEPS = 12;

export const ROOT_CAUSE_CONFIDENCE_THRESHOLD = 0.8;

type ObservationRow = { source: string; content: string };

function queryObservations(runId: string, db: DbAdapter): ObservationRow[] {
  return db.all<ObservationRow>("SELECT * FROM observations WHERE run_id = ?", [runId]);
}

function formatObservation(r: CommandResult): string {
  const parts = [
    `$ ${redactSecrets(r.command)}`,
    `exit_code: ${r.exit_code}${r.timed_out ? " (timed out)" : ""}`,
  ];
  if (r.stdout_redacted?.trim()) parts.push(`stdout:\n${redactSecrets(r.stdout_redacted)}`);
  if (r.stderr_redacted?.trim()) parts.push(`stderr:\n${redactSecrets(r.stderr_redacted)}`);
  return parts.join("\n");
}

function readTicketContext(state: OrchestratorState, db: DbAdapter): string {
  const ctx = queryObservations(state.runId, db).find((r) => r.source === "phoenix");
  if (ctx?.content.trim()) return ctx.content;
  return `Ticket #${state.ticketId} - system: ${state.customerSystemId}`;
}

export interface OrchestratorState {
  runId: string;
  phase: RunPhaseValue;
  status: RunStatusValue;
  stepCount: number;
  ticketId: number;
  customerSystemId: string;
  errorMessage?: string;
}

export type OrchestratorEvent =
  | { type: "diagnostic_proposal_ready"; proposal: DiagnosticProposal }
  | { type: "command_blocked"; reason: string; command: string }
  | { type: "command_approved"; approvalId: string; finalCommand: string }
  | { type: "command_rejected"; reason: string }
  | {
      type: "command_result";
      approvalId: string;
      result: CommandResult;
      wasFix?: boolean;
    }
  | { type: "root_cause_found"; hypothesis: string }
  | { type: "more_diagnosis_needed" }
  | { type: "fix_proposal_ready"; proposal: FixProposal }
  | { type: "validation_complete"; result: ValidationResult }
  | { type: "abort" }
  | { type: "unrecoverable_error"; message: string };

export type SideEffect =
  | { type: "createPendingApproval"; runId: string; proposal: DiagnosticProposal | FixProposal }
  | {
      type: "appendAuditEvent";
      runId: string;
      auditType: string;
      actor: AuditEvent["actor"];
      payload: unknown;
    }
  | { type: "appendObservation"; runId: string; source: Observation["source"]; content: string }
  | { type: "emitEvent"; runId: string; eventType: string; payload: unknown }
  | { type: "updateRunPhase"; runId: string; phase: RunPhaseValue }
  | { type: "updateRunStatus"; runId: string; status: RunStatusValue };

export interface ReducerResult {
  nextState: OrchestratorState;
  sideEffects: SideEffect[];
}

const TERMINAL_PHASES = new Set<RunPhaseValue>(["COMPLETED", "FAILED", "ABORTED"]);
const ABORTABLE_PHASES = new Set<RunPhaseValue>(["CREATED", "TRIAGING", "WAITING_FOR_APPROVAL"]);

function buildState(
  state: OrchestratorState,
  overrides: Partial<OrchestratorState>,
): OrchestratorState {
  return { ...state, ...overrides };
}

function auditEffect(
  state: OrchestratorState,
  auditType: string,
  actor: AuditEvent["actor"],
  payload: unknown,
): SideEffect {
  return { type: "appendAuditEvent", runId: state.runId, auditType, actor, payload };
}

function phaseEffect(state: OrchestratorState, phase: RunPhaseValue): SideEffect {
  return { type: "updateRunPhase", runId: state.runId, phase };
}

function statusEffect(state: OrchestratorState, status: RunStatusValue): SideEffect {
  return { type: "updateRunStatus", runId: state.runId, status };
}

export function reduce(state: OrchestratorState, event: OrchestratorEvent): ReducerResult {
  if (TERMINAL_PHASES.has(state.phase)) {
    return { nextState: state, sideEffects: [] };
  }

  if (event.type === "unrecoverable_error") {
    const nextState = buildState(state, {
      phase: "FAILED",
      status: "FAILED",
      errorMessage: event.message,
    });
    return {
      nextState,
      sideEffects: [
        auditEffect(state, "run.failed", "system", { message: event.message }),
        phaseEffect(state, "FAILED"),
        statusEffect(state, "FAILED"),
      ],
    };
  }

  if (event.type === "abort" && ABORTABLE_PHASES.has(state.phase)) {
    const nextState = buildState(state, { phase: "ABORTED", status: "ABORTED" });
    return {
      nextState,
      sideEffects: [
        auditEffect(state, "run.aborted", "technician", {}),
        phaseEffect(state, "ABORTED"),
        statusEffect(state, "ABORTED"),
      ],
    };
  }

  if (
    (event.type === "diagnostic_proposal_ready" || event.type === "fix_proposal_ready") &&
    state.stepCount >= MAX_STEPS
  ) {
    const nextState = buildState(state, { phase: "WAITING_FOR_ACTIVITY_REVIEW" });
    return {
      nextState,
      sideEffects: [
        auditEffect(state, "run.steps_capped", "system", { stepCount: state.stepCount }),
        phaseEffect(state, "WAITING_FOR_ACTIVITY_REVIEW"),
      ],
    };
  }

  switch (state.phase) {
    case "TRIAGING": {
      if (event.type === "diagnostic_proposal_ready") {
        const nextState = buildState(state, {
          phase: "WAITING_FOR_APPROVAL",
          stepCount: state.stepCount + 1,
        });
        return {
          nextState,
          sideEffects: [
            { type: "createPendingApproval", runId: state.runId, proposal: event.proposal },
            {
              type: "emitEvent",
              runId: state.runId,
              eventType: "approval.required",
              payload: { proposal: event.proposal },
            },
            phaseEffect(state, "WAITING_FOR_APPROVAL"),
          ],
        };
      }
      if (event.type === "command_blocked") {
        return {
          nextState: state,
          sideEffects: [
            auditEffect(state, "command.blocked", "system", {
              reason: event.reason,
              command: event.command,
            }),
          ],
        };
      }
      break;
    }

    case "WAITING_FOR_APPROVAL": {
      if (event.type === "command_rejected") {
        const nextState = buildState(state, { phase: "TRIAGING" });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, "command.rejected", "technician", { reason: event.reason }),
            phaseEffect(state, "TRIAGING"),
          ],
        };
      }
      if (event.type === "command_approved") {
        const nextState = buildState(state, { phase: "EXECUTING_COMMAND" });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, "command.approved", "technician", { approvalId: event.approvalId }),
            phaseEffect(state, "EXECUTING_COMMAND"),
          ],
        };
      }
      if (event.type === "command_blocked") {
        return {
          nextState: state,
          sideEffects: [
            auditEffect(state, "command.blocked", "system", {
              reason: event.reason,
              command: event.command,
            }),
          ],
        };
      }
      break;
    }

    case "EXECUTING_COMMAND": {
      if (event.type === "command_result") {
        const nextPhase: RunPhaseValue = event.wasFix ? "VALIDATING" : "OBSERVING";
        const nextState = buildState(state, { phase: nextPhase });
        return {
          nextState,
          sideEffects: [
            {
              type: "appendObservation",
              runId: state.runId,
              source: "ssh",
              content: formatObservation(event.result),
            },
            auditEffect(state, "command.completed", "ssh", {
              approvalId: event.approvalId,
              exitCode: event.result.exit_code,
            }),
            phaseEffect(state, nextPhase),
          ],
        };
      }
      break;
    }

    case "OBSERVING": {
      if (event.type === "root_cause_found") {
        const nextState = buildState(state, { phase: "PLANNING_FIX" });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, "diagnosis.root_cause_found", "agent", {
              hypothesis: event.hypothesis,
            }),
            phaseEffect(state, "PLANNING_FIX"),
          ],
        };
      }
      if (event.type === "more_diagnosis_needed") {
        const nextState = buildState(state, { phase: "TRIAGING" });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, "diagnosis.more_needed", "agent", {}),
            phaseEffect(state, "TRIAGING"),
          ],
        };
      }
      break;
    }

    case "PLANNING_FIX": {
      if (event.type === "fix_proposal_ready") {
        const nextState = buildState(state, {
          phase: "WAITING_FOR_APPROVAL",
          stepCount: state.stepCount + 1,
        });
        return {
          nextState,
          sideEffects: [
            { type: "createPendingApproval", runId: state.runId, proposal: event.proposal },
            {
              type: "emitEvent",
              runId: state.runId,
              eventType: "approval.required",
              payload: { proposal: event.proposal },
            },
            phaseEffect(state, "WAITING_FOR_APPROVAL"),
          ],
        };
      }
      if (event.type === "command_blocked") {
        const nextState = buildState(state, { phase: "TRIAGING" });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, "command.blocked", "system", {
              reason: event.reason,
              command: event.command,
            }),
            phaseEffect(state, "TRIAGING"),
          ],
        };
      }
      break;
    }

    case "VALIDATING": {
      if (event.type === "validation_complete") {
        const { status, benefitCheck, persistenceCheck, evidence } = event.result;
        const validationPayload = { status, benefitCheck, persistenceCheck, evidence };
        if (status === "VERIFIED_FIXED" || status === "LIKELY_FIXED") {
          const nextState = buildState(state, { phase: "DRAFTING_ACTIVITY" });
          return {
            nextState,
            sideEffects: [
              auditEffect(state, "validation.completed", "agent", validationPayload),
              phaseEffect(state, "DRAFTING_ACTIVITY"),
            ],
          };
        }
        if (status === "NOT_FIXED") {
          const nextState = buildState(state, { phase: "TRIAGING" });
          return {
            nextState,
            sideEffects: [
              auditEffect(state, "validation.completed", "agent", validationPayload),
              phaseEffect(state, "TRIAGING"),
            ],
          };
        }
      }
      break;
    }

    default:
      break;
  }

  return { nextState: state, sideEffects: [] };
}

const METADATA_SOURCE = "system" as const;
const STEP_COUNT_TYPE = "stepCount";
const PENDING_KIND_TYPE = "pendingKind";
type PendingKind = "diagnostic" | "fix";

function writeMetadata(runId: string, type: string, value: number | string, db: DbAdapter): void {
  const id = `obs_meta_${type}_${runId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  db.run(
    "INSERT INTO observations (id, run_id, source, content, created_at) VALUES (?, ?, ?, ?, ?)",
    [id, runId, METADATA_SOURCE, JSON.stringify({ type, value }), new Date().toISOString()],
  );
}

function readMetadata<T extends number | string>(
  runId: string,
  type: string,
  db: DbAdapter,
): T | undefined {
  const rows = queryObservations(runId, db);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].source !== METADATA_SOURCE) continue;
    try {
      const parsed = JSON.parse(rows[i].content) as { type?: string; value?: T };
      if (parsed.type === type) return parsed.value;
    } catch {}
  }
  return undefined;
}

function readStepCount(runId: string, db: DbAdapter): number {
  return readMetadata<number>(runId, STEP_COUNT_TYPE, db) ?? 0;
}

function readPendingKind(runId: string, db: DbAdapter): PendingKind {
  return readMetadata<string>(runId, PENDING_KIND_TYPE, db) === "fix" ? "fix" : "diagnostic";
}

function readAgentObservations(runId: string, db: DbAdapter): string[] {
  return queryObservations(runId, db)
    .filter((o) => o.source !== METADATA_SOURCE)
    .map((o) => o.content);
}

export function setStepCountForTest(runId: string, count: number, db: DbAdapter): void {
  writeMetadata(runId, STEP_COUNT_TYPE, count, db);
}

export function createInitialState(run: Run): OrchestratorState {
  return {
    runId: run.id,
    phase: run.current_phase,
    status: run.status,
    stepCount: 0,
    ticketId: run.ticket_id,
    customerSystemId: run.customer_system_id,
  };
}

function applySideEffects(effects: SideEffect[]): void {
  let lastCreatedApprovalId: string | null = null;

  for (const effect of effects) {
    switch (effect.type) {
      case "updateRunPhase":
        updateRunPhase(effect.runId, effect.phase);
        break;
      case "updateRunStatus":
        updateRunStatus(effect.runId, effect.status);
        break;
      case "appendAuditEvent":
        appendAuditEvent(effect.runId, effect.auditType, effect.actor, effect.payload);
        runEventBus.emit(effect.runId, effect.auditType, effect.payload);
        break;
      case "appendObservation":
        appendObservation(effect.runId, effect.source, effect.content);
        break;
      case "createPendingApproval": {
        const proposal = effect.proposal;
        const policyResult = validateCommandAgainstPolicy(proposal.command);
        const isDiagnostic = "hypotheses" in proposal;
        const approval = createPendingApproval(effect.runId, {
          proposedCommand: proposal.command,
          purpose: isDiagnostic ? proposal.purpose : proposal.rationale,
          expectedSignal: isDiagnostic ? proposal.expectedSignal : "Fix applied successfully",
          riskLevel: policyResult.riskLevel,
          safetyNotes: policyResult.reason ?? policyResult.matchedRule ?? "",
        });
        lastCreatedApprovalId = approval.id;
        break;
      }
      case "emitEvent": {
        const payload =
          effect.eventType === "approval.required" &&
          lastCreatedApprovalId &&
          effect.payload &&
          typeof effect.payload === "object"
            ? { ...(effect.payload as Record<string, unknown>), approvalId: lastCreatedApprovalId }
            : effect.payload;
        runEventBus.emit(effect.runId, effect.eventType, payload);
        appendAuditEvent(effect.runId, effect.eventType, "system", payload);
        break;
      }
    }
  }
}

function applyReduce(state: OrchestratorState, event: OrchestratorEvent): OrchestratorState {
  const { nextState, sideEffects } = reduce(state, event);
  applySideEffects(sideEffects);
  return nextState;
}

function blockedEvent(
  policyResult: ReturnType<typeof validateCommandAgainstPolicy>,
  command: string,
): OrchestratorEvent {
  return {
    type: "command_blocked",
    reason: policyResult.reason ?? policyResult.matchedRule ?? "blocked",
    command,
  };
}

const CAPPED_DIAGNOSTIC: DiagnosticProposal = {
  hypotheses: [{ cause: "", evidence: "", confidence: 0 }],
  command: "",
  purpose: "",
  expectedSignal: "",
  riskNotes: "",
  isReadOnly: true,
};
const CAPPED_FIX: FixProposal = {
  rootCause: "",
  command: "",
  rationale: "",
  rollbackCommand: "",
  isReversible: true,
  persistenceNote: "",
};

function proposeCommand(
  state: OrchestratorState,
  kind: PendingKind,
  proposal: DiagnosticProposal | FixProposal,
  db: DbAdapter,
): OrchestratorState {
  const policyResult = validateCommandAgainstPolicy(proposal.command);
  if (!policyResult.allowed) {
    return applyReduce(state, blockedEvent(policyResult, proposal.command));
  }
  const event: OrchestratorEvent =
    kind === "fix"
      ? { type: "fix_proposal_ready", proposal: proposal as FixProposal }
      : { type: "diagnostic_proposal_ready", proposal: proposal as DiagnosticProposal };
  const nextState = applyReduce(state, event);
  writeMetadata(state.runId, STEP_COUNT_TYPE, nextState.stepCount, db);
  writeMetadata(state.runId, PENDING_KIND_TYPE, kind, db);
  return nextState;
}

function handleAgentUnavailable(state: OrchestratorState, err: unknown): OrchestratorState {
  const baseMessage = err instanceof Error ? err.message : String(err);
  const cause =
    err instanceof Error && err.cause
      ? err.cause instanceof Error
        ? err.cause.message
        : String(err.cause)
      : undefined;
  const message = cause ? `${baseMessage} (${cause})` : baseMessage;
  appendAuditEvent(state.runId, "agent.unavailable", "system", { message });
  runEventBus.emit(state.runId, "agent.unavailable", { message });
  return { ...state, errorMessage: message };
}

async function agentDispatch(state: OrchestratorState, db: DbAdapter): Promise<OrchestratorState> {
  const currentState = { ...state, stepCount: readStepCount(state.runId, db) };

  switch (currentState.phase) {
    case "CREATED":
    case "LOADED_CONTEXT": {
      const ticketDescription = readTicketContext(currentState, db);
      const hasStarted = db
        .all<{ type: string }>("SELECT type FROM audit_events WHERE run_id = ?", [
          currentState.runId,
        ])
        .some((row) => row.type === "run.started");
      if (!hasStarted) {
        const startedPayload = { ticketDescription };
        appendAuditEvent(currentState.runId, "run.started", "system", startedPayload);
        runEventBus.emit(currentState.runId, "run.started", startedPayload);
      }
      updateRunStatus(currentState.runId, "RUNNING");
      updateRunPhase(currentState.runId, "TRIAGING");
      return agentDispatch({ ...currentState, phase: "TRIAGING", status: "RUNNING" }, db);
    }

    case "TRIAGING": {
      if (currentState.stepCount >= MAX_STEPS) {
        return applyReduce(currentState, {
          type: "diagnostic_proposal_ready",
          proposal: CAPPED_DIAGNOSTIC,
        });
      }
      try {
        const ticketDescription = readTicketContext(currentState, db);
        const observations = readAgentObservations(currentState.runId, db);
        const recalled = await retrieveSimilarStructured(ticketDescription, observations);
        if (recalled.length > 0) {
          const memoryPayload = {
            count: recalled.length,
            results: recalled.map((item) => ({
              id: item.id,
              source: item.source,
              symptom: item.symptom,
              rootCause: item.rootCause,
              fix: item.fix,
              score: item.score,
            })),
          };
          appendAuditEvent(currentState.runId, "memory.recalled", "system", memoryPayload);
          runEventBus.emit(currentState.runId, "memory.recalled", memoryPayload);
        }
        const proposal = await runProblemAnalyzer({
          ticketDescription,
          observations,
          similarSolutions: formatSimilarSolutions(recalled),
        });
        return proposeCommand(currentState, "diagnostic", proposal, db);
      } catch (err) {
        return handleAgentUnavailable(currentState, err);
      }
    }

    case "PLANNING_FIX": {
      if (currentState.stepCount >= MAX_STEPS) {
        return applyReduce(currentState, { type: "fix_proposal_ready", proposal: CAPPED_FIX });
      }
      try {
        const proposal = await runProblemSolver({
          ticketDescription: readTicketContext(currentState, db),
          observations: readAgentObservations(currentState.runId, db),
        });
        return proposeCommand(currentState, "fix", proposal, db);
      } catch (err) {
        return handleAgentUnavailable(currentState, err);
      }
    }

    case "VALIDATING": {
      try {
        const observations = readAgentObservations(currentState.runId, db);
        const result = await runValidator({
          ticketDescription: readTicketContext(currentState, db),
          observations,
          fixApplied: observations[observations.length - 1] ?? "",
        });
        return applyReduce(currentState, { type: "validation_complete", result });
      } catch (err) {
        return handleAgentUnavailable(currentState, err);
      }
    }

    case "OBSERVING": {
      try {
        const observation = await runProblemAnalyzerObserve({
          ticketDescription: readTicketContext(currentState, db),
          observations: readAgentObservations(currentState.runId, db),
        });
        const top = observation.hypotheses.reduce((a, b) => (b.confidence > a.confidence ? b : a));
        const hasEvidence = typeof top.evidence === "string" && top.evidence.trim().length > 0;
        const confident = top.confidence >= ROOT_CAUSE_CONFIDENCE_THRESHOLD && hasEvidence;
        return applyReduce(
          currentState,
          confident
            ? { type: "root_cause_found", hypothesis: top.cause }
            : { type: "more_diagnosis_needed" },
        );
      } catch (err) {
        return handleAgentUnavailable(currentState, err);
      }
    }

    case "DRAFTING_ACTIVITY": {
      updateRunPhase(currentState.runId, "WAITING_FOR_ACTIVITY_REVIEW");
      appendAuditEvent(currentState.runId, "activity.drafted", "system", {});
      return { ...currentState, phase: "WAITING_FOR_ACTIVITY_REVIEW" };
    }

    default:
      return currentState;
  }
}

export async function advance(
  runId: string,
  incomingEvent?: OrchestratorEvent,
  db?: DbAdapter,
  sshExecutor?: SshExecutor,
): Promise<OrchestratorState> {
  if (db) setDb(db);

  const activeDb = getDb();

  const run = getRunById(runId);
  if (!run) throw new Error(`Run not found: ${runId}`);

  const stepCount = readStepCount(runId, activeDb);
  const state: OrchestratorState = {
    runId,
    phase: run.current_phase,
    status: run.status,
    stepCount,
    ticketId: run.ticket_id,
    customerSystemId: run.customer_system_id,
    errorMessage: run.error_message ?? undefined,
  };

  if (incomingEvent) {
    if (incomingEvent.type === "command_approved") {
      const policyResult = validateCommandAgainstPolicy(incomingEvent.finalCommand);
      if (!policyResult.allowed) {
        return applyReduce(state, blockedEvent(policyResult, incomingEvent.finalCommand));
      }

      const wasFix = readPendingKind(runId, activeDb) === "fix";

      const { nextState: executingState, sideEffects: approvalEffects } = reduce(
        state,
        incomingEvent,
      );
      applySideEffects(approvalEffects);

      if (executingState.phase !== "EXECUTING_COMMAND") {
        return executingState;
      }

      const exec = sshExecutor ?? createSshExecutor();
      const sshTarget = resolveSshTargetFromCustomerSystemId(run.customer_system_id);
      if (!sshTarget) {
        return applyReduce(state, {
          type: "command_blocked",
          command: incomingEvent.finalCommand,
          reason: "Customer system target is malformed",
        });
      }
      const target = {
        ...sshTarget,
        privateKeyPaths: resolveSshKeyPaths(),
      };

      const cmdResult = await exec.executeApprovedCommand(
        incomingEvent.approvalId,
        incomingEvent.finalCommand,
        target,
      );

      const stdoutRedacted = redactSecrets(cmdResult.stdout);
      const stderrRedacted = redactSecrets(cmdResult.stderr);

      const approvalRow = activeDb.get<{ proposed_command: string }>(
        "SELECT proposed_command FROM command_approvals WHERE id = ?",
        [incomingEvent.approvalId],
      );
      const wasEdited = approvalRow
        ? approvalRow.proposed_command !== incomingEvent.finalCommand
        : false;

      const fixFailed = wasFix && (cmdResult.exitCode !== 0 || cmdResult.timedOut);

      const commandResultEvent = {
        type: "command_result" as const,
        approvalId: incomingEvent.approvalId,
        result: {
          id: `res_${incomingEvent.approvalId}`,
          run_id: runId,
          approval_id: incomingEvent.approvalId,
          command: incomingEvent.finalCommand,
          exit_code: cmdResult.exitCode,
          stdout_redacted: stdoutRedacted,
          stderr_redacted: stderrRedacted,
          duration_ms: cmdResult.durationMs,
          timed_out: cmdResult.timedOut ? 1 : 0,
          created_at: new Date().toISOString(),
        },
        wasFix,
      };

      const { nextState: postState, sideEffects: postEffects } = reduce(
        executingState,
        commandResultEvent,
      );

      activeDb.transaction(() => {
        appendCommandResult(runId, incomingEvent.approvalId, {
          command: incomingEvent.finalCommand,
          exitCode: cmdResult.exitCode,
          stdoutRedacted,
          stderrRedacted,
          durationMs: cmdResult.durationMs,
          timedOut: cmdResult.timedOut,
        });
        updateApprovalStatus(incomingEvent.approvalId, {
          status: "EXECUTED",
          editedCommand: wasEdited ? incomingEvent.finalCommand : undefined,
          finalCommand: incomingEvent.finalCommand,
          riskLevel: policyResult.riskLevel,
          executedAt: new Date().toISOString(),
        });
        applySideEffects(postEffects);
      });

      if (fixFailed && postState.phase === "VALIDATING") {
        updateRunPhase(runId, "TRIAGING");
        appendAuditEvent(runId, "fix.failed", "system", {
          approvalId: incomingEvent.approvalId,
          exitCode: cmdResult.exitCode,
          timedOut: cmdResult.timedOut,
        });
        return { ...postState, phase: "TRIAGING" };
      }

      return postState;
    }

    return applyReduce(state, incomingEvent);
  }

  return agentDispatch(state, activeDb);
}
