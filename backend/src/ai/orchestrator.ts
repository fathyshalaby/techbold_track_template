import type { RunPhaseValue, RunStatusValue, AuditEvent, Observation } from '../store/schema.js';
import type { DiagnosticProposal, FixProposal, ValidationResult } from './types.js';
import type { DbAdapter } from '../store/db.js';
import type { Run } from '../store/schema.js';
import { getDb, setDb } from '../store/db.js';
import { getRunById, updateRunPhase, updateRunStatus } from '../store/runs.js';
import {
  appendAuditEvent,
  appendObservation,
  createPendingApproval,
  appendCommandResult,
  updateApprovalStatus,
} from '../store/audit.js';
import { runEventBus } from '../events/run-event-bus.js';
import { validateCommandAgainstPolicy } from '../safety/command-policy.js';
import { redactSecrets } from '../safety/redaction.js';
import { runProblemAnalyzer } from './agents/problem-analyzer.js';
import { runProblemSolver } from './agents/problem-solver.js';
import { runValidator } from './agents/validator.js';
import { createSshExecutor } from '../ssh/factory.js';
import type { SshExecutor } from '../ssh/types.js';

export { type DiagnosticProposal, type FixProposal, type ValidationResult };

export const MAX_STEPS = 12;

// A technician stops diagnosing and moves to a fix once confident enough in the
// cause. We use the problem-analyzer's top-hypothesis confidence as that signal.
export const ROOT_CAUSE_CONFIDENCE_THRESHOLD = 0.8;

// Build the observation text an agent reads from a command result. A diagnosing
// technician needs the EXIT CODE and STDERR, not just stdout — many failures
// (nginx -t, OOM=137, "No such file") show only there. Empty streams omitted.
function formatObservation(r: import('../store/schema.js').CommandResult): string {
  const parts = [`$ ${r.command}`, `exit_code: ${r.exit_code}${r.timed_out ? ' (timed out)' : ''}`];
  if (r.stdout_redacted && r.stdout_redacted.trim()) parts.push(`stdout:\n${r.stdout_redacted}`);
  if (r.stderr_redacted && r.stderr_redacted.trim()) parts.push(`stderr:\n${r.stderr_redacted}`);
  return parts.join('\n');
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
  | { type: 'diagnostic_proposal_ready'; proposal: DiagnosticProposal }
  | { type: 'command_blocked'; reason: string; command: string }
  | { type: 'command_approved'; approvalId: string; finalCommand: string }
  | { type: 'command_rejected'; reason: string }
  | { type: 'command_result'; approvalId: string; result: import('../store/schema.js').CommandResult; wasFix?: boolean }
  | { type: 'root_cause_found'; hypothesis: string }
  | { type: 'more_diagnosis_needed' }
  | { type: 'fix_proposal_ready'; proposal: FixProposal }
  | { type: 'validation_complete'; result: ValidationResult }
  | { type: 'abort' }
  | { type: 'unrecoverable_error'; message: string };

export type SideEffect =
  | { type: 'createPendingApproval'; runId: string; proposal: DiagnosticProposal | FixProposal }
  | { type: 'appendAuditEvent'; runId: string; auditType: string; actor: AuditEvent['actor']; payload: unknown }
  | { type: 'appendObservation'; runId: string; source: Observation['source']; content: string }
  | { type: 'emitEvent'; runId: string; eventType: string; payload: unknown }
  | { type: 'updateRunPhase'; runId: string; phase: RunPhaseValue }
  | { type: 'updateRunStatus'; runId: string; status: RunStatusValue };

export interface ReducerResult {
  nextState: OrchestratorState;
  sideEffects: SideEffect[];
}

const TERMINAL_PHASES = new Set<RunPhaseValue>(['COMPLETED', 'FAILED', 'ABORTED']);
const ABORTABLE_PHASES = new Set<RunPhaseValue>(['CREATED', 'TRIAGING', 'WAITING_FOR_APPROVAL']);

function buildState(state: OrchestratorState, overrides: Partial<OrchestratorState>): OrchestratorState {
  return { ...state, ...overrides };
}

function auditEffect(state: OrchestratorState, auditType: string, actor: AuditEvent['actor'], payload: unknown): SideEffect {
  return { type: 'appendAuditEvent', runId: state.runId, auditType, actor, payload };
}

function phaseEffect(state: OrchestratorState, phase: RunPhaseValue): SideEffect {
  return { type: 'updateRunPhase', runId: state.runId, phase };
}

function statusEffect(state: OrchestratorState, status: RunStatusValue): SideEffect {
  return { type: 'updateRunStatus', runId: state.runId, status };
}

export function reduce(state: OrchestratorState, event: OrchestratorEvent): ReducerResult {
  if (TERMINAL_PHASES.has(state.phase)) {
    return { nextState: state, sideEffects: [] };
  }

  if (event.type === 'unrecoverable_error') {
    const nextState = buildState(state, { phase: 'FAILED', status: 'FAILED', errorMessage: event.message });
    return {
      nextState,
      sideEffects: [
        auditEffect(state, 'run.failed', 'system', { message: event.message }),
        phaseEffect(state, 'FAILED'),
        statusEffect(state, 'FAILED'),
      ],
    };
  }

  if (event.type === 'abort' && ABORTABLE_PHASES.has(state.phase)) {
    const nextState = buildState(state, { phase: 'ABORTED', status: 'ABORTED' });
    return {
      nextState,
      sideEffects: [
        auditEffect(state, 'run.aborted', 'technician', {}),
        phaseEffect(state, 'ABORTED'),
        statusEffect(state, 'ABORTED'),
      ],
    };
  }

  if (
    (event.type === 'diagnostic_proposal_ready' || event.type === 'fix_proposal_ready') &&
    state.stepCount >= MAX_STEPS
  ) {
    const nextState = buildState(state, { phase: 'WAITING_FOR_ACTIVITY_REVIEW' });
    return {
      nextState,
      sideEffects: [
        auditEffect(state, 'run.steps_capped', 'system', { stepCount: state.stepCount }),
        phaseEffect(state, 'WAITING_FOR_ACTIVITY_REVIEW'),
      ],
    };
  }

  switch (state.phase) {
    case 'TRIAGING': {
      if (event.type === 'diagnostic_proposal_ready') {
        const nextState = buildState(state, {
          phase: 'WAITING_FOR_APPROVAL',
          stepCount: state.stepCount + 1,
        });
        return {
          nextState,
          sideEffects: [
            { type: 'createPendingApproval', runId: state.runId, proposal: event.proposal },
            { type: 'emitEvent', runId: state.runId, eventType: 'approval.required', payload: { proposal: event.proposal } },
            phaseEffect(state, 'WAITING_FOR_APPROVAL'),
          ],
        };
      }
      if (event.type === 'command_blocked') {
        return {
          nextState: state,
          sideEffects: [
            auditEffect(state, 'command.blocked', 'system', { reason: event.reason, command: event.command }),
          ],
        };
      }
      break;
    }

    case 'WAITING_FOR_APPROVAL': {
      if (event.type === 'command_rejected') {
        const nextState = buildState(state, { phase: 'TRIAGING' });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, 'command.rejected', 'technician', { reason: event.reason }),
            phaseEffect(state, 'TRIAGING'),
          ],
        };
      }
      if (event.type === 'command_approved') {
        const nextState = buildState(state, { phase: 'EXECUTING_COMMAND' });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, 'command.approved', 'technician', { approvalId: event.approvalId }),
            phaseEffect(state, 'EXECUTING_COMMAND'),
          ],
        };
      }
      // Re-gate failure: the technician approved an EDITED command that the safety
      // policy now blocks. Execution is refused (the driver never calls the
      // executor) — audit it and stay in WAITING_FOR_APPROVAL so they can retry.
      if (event.type === 'command_blocked') {
        return {
          nextState: state,
          sideEffects: [
            auditEffect(state, 'command.blocked', 'system', { reason: event.reason, command: event.command }),
          ],
        };
      }
      break;
    }

    case 'EXECUTING_COMMAND': {
      if (event.type === 'command_result') {
        // A FIX command must be VALIDATED (verify it worked); a DIAGNOSTIC
        // command goes to OBSERVING (decide root cause). Without this split the
        // validator was unreachable and fixes were never verified.
        const nextPhase: RunPhaseValue = event.wasFix ? 'VALIDATING' : 'OBSERVING';
        const nextState = buildState(state, { phase: nextPhase });
        return {
          nextState,
          sideEffects: [
            { type: 'appendObservation', runId: state.runId, source: 'ssh', content: formatObservation(event.result) },
            auditEffect(state, 'command.completed', 'ssh', { approvalId: event.approvalId, exitCode: event.result.exit_code }),
            phaseEffect(state, nextPhase),
          ],
        };
      }
      break;
    }

    case 'OBSERVING': {
      if (event.type === 'root_cause_found') {
        const nextState = buildState(state, { phase: 'PLANNING_FIX' });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, 'diagnosis.root_cause_found', 'agent', { hypothesis: event.hypothesis }),
            phaseEffect(state, 'PLANNING_FIX'),
          ],
        };
      }
      if (event.type === 'more_diagnosis_needed') {
        const nextState = buildState(state, { phase: 'TRIAGING' });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, 'diagnosis.more_needed', 'agent', {}),
            phaseEffect(state, 'TRIAGING'),
          ],
        };
      }
      break;
    }

    case 'PLANNING_FIX': {
      if (event.type === 'fix_proposal_ready') {
        const nextState = buildState(state, {
          phase: 'WAITING_FOR_APPROVAL',
          stepCount: state.stepCount + 1,
        });
        return {
          nextState,
          sideEffects: [
            { type: 'createPendingApproval', runId: state.runId, proposal: event.proposal },
            { type: 'emitEvent', runId: state.runId, eventType: 'approval.required', payload: { proposal: event.proposal } },
            phaseEffect(state, 'WAITING_FOR_APPROVAL'),
          ],
        };
      }
      // A blocked fix command must be audited (C-score) AND must move the run back
      // to TRIAGING in the PERSISTED phase — emitting phaseEffect here is what
      // calls updateRunPhase; without it the DB stayed on PLANNING_FIX (desync).
      if (event.type === 'command_blocked') {
        const nextState = buildState(state, { phase: 'TRIAGING' });
        return {
          nextState,
          sideEffects: [
            auditEffect(state, 'command.blocked', 'system', { reason: event.reason, command: event.command }),
            phaseEffect(state, 'TRIAGING'),
          ],
        };
      }
      break;
    }

    case 'VALIDATING': {
      if (event.type === 'validation_complete') {
        const { status } = event.result;
        if (status === 'VERIFIED_FIXED' || status === 'LIKELY_FIXED') {
          const nextState = buildState(state, { phase: 'DRAFTING_ACTIVITY' });
          return {
            nextState,
            sideEffects: [
              auditEffect(state, 'validation.complete', 'agent', { status }),
              phaseEffect(state, 'DRAFTING_ACTIVITY'),
            ],
          };
        }
        if (status === 'NOT_FIXED') {
          const nextState = buildState(state, { phase: 'TRIAGING' });
          return {
            nextState,
            sideEffects: [
              auditEffect(state, 'validation.complete', 'agent', { status }),
              phaseEffect(state, 'TRIAGING'),
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

// ─── Step-count persistence ────────────────────────────────────────────────────

const STEP_COUNT_SOURCE = 'system' as const;
const STEP_COUNT_TYPE = 'stepCount';

function readStepCount(runId: string, db: DbAdapter): number {
  const rows = db.all<{ source: string; content: string }>(
    'SELECT * FROM observations WHERE run_id = ?',
    [runId],
  );
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    if (row.source !== STEP_COUNT_SOURCE) continue;
    try {
      const parsed = JSON.parse(row.content) as { type?: string; value?: number };
      if (parsed.type === STEP_COUNT_TYPE) return parsed.value ?? 0;
    } catch {
      // ignore malformed
    }
  }
  return 0;
}

function writeStepCount(runId: string, count: number, db: DbAdapter): void {
  const id = `obs_sc_${runId}_${count}_${Date.now()}`;
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO observations (id, run_id, source, content, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, runId, STEP_COUNT_SOURCE, JSON.stringify({ type: STEP_COUNT_TYPE, value: count }), now],
  );
}

export function setStepCountForTest(runId: string, count: number, db: DbAdapter): void {
  writeStepCount(runId, count, db);
}

// ─── Pending-command kind ('diagnostic' | 'fix') ───────────────────────────────
// Recorded when a proposal is created so the post-execution router knows whether
// to OBSERVE (diagnostic → decide root cause) or VALIDATE (fix → verify it
// worked). Persisted as a system observation (same mechanism as stepCount) —
// the command_approvals row has no kind column (and is .strict()).
const PENDING_KIND_TYPE = 'pendingKind';
type PendingKind = 'diagnostic' | 'fix';

function writePendingKind(runId: string, kind: PendingKind, db: DbAdapter): void {
  const id = `obs_pk_${runId}_${kind}_${Date.now()}`;
  db.run(
    'INSERT INTO observations (id, run_id, source, content, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, runId, STEP_COUNT_SOURCE, JSON.stringify({ type: PENDING_KIND_TYPE, value: kind }), new Date().toISOString()],
  );
}

function readPendingKind(runId: string, db: DbAdapter): PendingKind {
  const rows = db.all<{ source: string; content: string }>('SELECT * FROM observations WHERE run_id = ?', [runId]);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].source !== STEP_COUNT_SOURCE) continue;
    try {
      const parsed = JSON.parse(rows[i].content) as { type?: string; value?: string };
      if (parsed.type === PENDING_KIND_TYPE) return parsed.value === 'fix' ? 'fix' : 'diagnostic';
    } catch {
      /* ignore malformed */
    }
  }
  return 'diagnostic';
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

// ─── Side-effect performer ─────────────────────────────────────────────────────

async function performSideEffects(effects: SideEffect[], _db: DbAdapter): Promise<void> {
  for (const effect of effects) {
    switch (effect.type) {
      case 'updateRunPhase':
        updateRunPhase(effect.runId, effect.phase);
        break;
      case 'updateRunStatus':
        updateRunStatus(effect.runId, effect.status);
        break;
      case 'appendAuditEvent':
        appendAuditEvent(effect.runId, effect.auditType, effect.actor, effect.payload);
        break;
      case 'appendObservation':
        // content is already redacted by the driver before passing to the effect
        appendObservation(effect.runId, effect.source, effect.content);
        break;
      case 'createPendingApproval': {
        const proposal = effect.proposal;
        const policyResult = validateCommandAgainstPolicy(proposal.command);
        const isDiagnostic = 'hypotheses' in proposal;
        createPendingApproval(effect.runId, {
          proposedCommand: proposal.command,
          purpose: isDiagnostic ? proposal.purpose : proposal.rationale,
          expectedSignal: isDiagnostic ? proposal.expectedSignal : 'Fix applied successfully',
          riskLevel: policyResult.riskLevel,
          safetyNotes: policyResult.reason ?? policyResult.matchedRule ?? '',
        });
        break;
      }
      case 'emitEvent':
        runEventBus.emit(effect.runId, effect.eventType, effect.payload);
        // Mirror to audit log so the event is queryable alongside other audit events
        appendAuditEvent(effect.runId, effect.eventType, 'system', effect.payload);
        break;
    }
  }
}

// ─── Agent dispatch (auto-advance) ────────────────────────────────────────────

async function agentDispatch(
  state: OrchestratorState,
  db: DbAdapter,
): Promise<OrchestratorState> {
  const stepCount = readStepCount(state.runId, db);
  const currentState = { ...state, stepCount };

  switch (currentState.phase) {
    case 'CREATED': {
      appendAuditEvent(currentState.runId, 'run.started', 'system', {});
      updateRunPhase(currentState.runId, 'LOADED_CONTEXT');
      updateRunStatus(currentState.runId, 'RUNNING');
      updateRunPhase(currentState.runId, 'TRIAGING');
      const triagedState: OrchestratorState = {
        ...currentState,
        phase: 'TRIAGING',
        status: 'RUNNING',
      };
      return agentDispatch(triagedState, db);
    }

    case 'LOADED_CONTEXT': {
      updateRunPhase(currentState.runId, 'TRIAGING');
      return agentDispatch({ ...currentState, phase: 'TRIAGING' }, db);
    }

    case 'TRIAGING': {
      // Max-steps guard fires before calling the agent
      if (currentState.stepCount >= MAX_STEPS) {
        const { nextState, sideEffects } = reduce(currentState, {
          type: 'diagnostic_proposal_ready',
          // Dummy proposal — reducer will short-circuit to WAITING_FOR_ACTIVITY_REVIEW
          proposal: {
            hypotheses: [{ cause: '', evidence: '', confidence: 0 }],
            command: '',
            purpose: '',
            expectedSignal: '',
            riskNotes: '',
            isReadOnly: true,
          },
        });
        await performSideEffects(sideEffects, db);
        return nextState;
      }

      try {
        const observations = db
          .all<{ content: string; source: string }>('SELECT * FROM observations WHERE run_id = ?', [currentState.runId])
          .filter((o) => o.source !== STEP_COUNT_SOURCE)
          .map((o) => o.content);

        const proposal = await runProblemAnalyzer({
          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
          observations,
        });

        const policyResult = validateCommandAgainstPolicy(proposal.command);

        if (!policyResult.allowed) {
          const { nextState, sideEffects } = reduce(currentState, {
            type: 'command_blocked',
            reason: policyResult.reason ?? policyResult.matchedRule ?? 'blocked',
            command: proposal.command,
          });
          await performSideEffects(sideEffects, db);
          return nextState;
        }

        const { nextState, sideEffects } = reduce(currentState, {
          type: 'diagnostic_proposal_ready',
          proposal,
        });
        writeStepCount(currentState.runId, nextState.stepCount, db);
        writePendingKind(currentState.runId, 'diagnostic', db);
        await performSideEffects(sideEffects, db);
        return nextState;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendAuditEvent(currentState.runId, 'agent.unavailable', 'system', { message });
        return currentState;
      }
    }

    case 'PLANNING_FIX': {
      if (currentState.stepCount >= MAX_STEPS) {
        const { nextState, sideEffects } = reduce(currentState, {
          type: 'fix_proposal_ready',
          proposal: {
            rootCause: '',
            command: '',
            rationale: '',
            rollbackCommand: '',
            isReversible: true,
            persistenceNote: '',
          },
        });
        await performSideEffects(sideEffects, db);
        return nextState;
      }

      try {
        const observations = db
          .all<{ content: string; source: string }>('SELECT * FROM observations WHERE run_id = ?', [currentState.runId])
          .filter((o) => o.source !== STEP_COUNT_SOURCE)
          .map((o) => o.content);

        const proposal = await runProblemSolver({
          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
          observations,
        });

        const policyResult = validateCommandAgainstPolicy(proposal.command);

        if (!policyResult.allowed) {
          // reduce() now audits the block AND emits phaseEffect(TRIAGING), so the
          // persisted phase is updated — just apply its effects and return.
          const { nextState, sideEffects } = reduce(currentState, {
            type: 'command_blocked',
            reason: policyResult.reason ?? policyResult.matchedRule ?? 'blocked',
            command: proposal.command,
          });
          await performSideEffects(sideEffects, db);
          return nextState;
        }

        const { nextState, sideEffects } = reduce(currentState, {
          type: 'fix_proposal_ready',
          proposal,
        });
        writeStepCount(currentState.runId, nextState.stepCount, db);
        writePendingKind(currentState.runId, 'fix', db);
        await performSideEffects(sideEffects, db);
        return nextState;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendAuditEvent(currentState.runId, 'agent.unavailable', 'system', { message });
        return currentState;
      }
    }

    case 'VALIDATING': {
      try {
        const observations = db
          .all<{ content: string; source: string }>('SELECT * FROM observations WHERE run_id = ?', [currentState.runId])
          .filter((o) => o.source !== STEP_COUNT_SOURCE)
          .map((o) => o.content);

        const result = await runValidator({
          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
          observations,
          fixApplied: observations[observations.length - 1] ?? '',
        });

        const { nextState, sideEffects } = reduce(currentState, {
          type: 'validation_complete',
          result,
        });
        await performSideEffects(sideEffects, db);
        return nextState;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendAuditEvent(currentState.runId, 'agent.unavailable', 'system', { message });
        return currentState;
      }
    }

    case 'OBSERVING': {
      // Decide whether the accumulated evidence pins the root cause or more
      // diagnosis is needed. Reuses the problem-analyzer (no separate decision
      // agent): if its top hypothesis confidence ≥ threshold → root cause found
      // → PLANNING_FIX; otherwise → TRIAGING to propose the next probe. Mirrors
      // a technician deciding "I'm sure enough — fix it" vs "keep looking".
      try {
        const observations = db
          .all<{ content: string; source: string }>('SELECT * FROM observations WHERE run_id = ?', [currentState.runId])
          .filter((o) => o.source !== STEP_COUNT_SOURCE)
          .map((o) => o.content);

        const proposal = await runProblemAnalyzer({
          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
          observations,
        });

        const top = proposal.hypotheses.reduce((a, b) => (b.confidence > a.confidence ? b : a));

        if (top.confidence >= ROOT_CAUSE_CONFIDENCE_THRESHOLD) {
          const { nextState, sideEffects } = reduce(currentState, {
            type: 'root_cause_found',
            hypothesis: top.cause,
          });
          await performSideEffects(sideEffects, db);
          return nextState; // → PLANNING_FIX
        }

        const { nextState, sideEffects } = reduce(currentState, { type: 'more_diagnosis_needed' });
        await performSideEffects(sideEffects, db);
        return nextState; // → TRIAGING (re-propose next diagnostic command)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendAuditEvent(currentState.runId, 'agent.unavailable', 'system', { message });
        return currentState;
      }
    }

    case 'DRAFTING_ACTIVITY': {
      updateRunPhase(currentState.runId, 'WAITING_FOR_ACTIVITY_REVIEW');
      appendAuditEvent(currentState.runId, 'activity.draft_ready', 'system', {});
      return { ...currentState, phase: 'WAITING_FOR_ACTIVITY_REVIEW' };
    }

    default:
      return currentState;
  }
}

// ─── Async driver — public API ─────────────────────────────────────────────────

export async function advance(
  runId: string,
  incomingEvent?: OrchestratorEvent,
  db?: DbAdapter,
  // Injected for tests; in production defaults to the env-selected (mock|real)
  // executor — constructed lazily below ONLY when a command actually executes,
  // so non-executing transitions never touch env/config.
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
    if (incomingEvent.type === 'command_approved') {
      // T-05-13: re-validate finalCommand before any execution (defence-in-depth)
      const policyResult = validateCommandAgainstPolicy(incomingEvent.finalCommand);
      if (!policyResult.allowed) {
        const { nextState, sideEffects } = reduce(state, {
          type: 'command_blocked',
          reason: policyResult.reason ?? policyResult.matchedRule ?? 'blocked',
          command: incomingEvent.finalCommand,
        });
        await performSideEffects(sideEffects, activeDb);
        return nextState;
      }

      // Was the approved command a FIX? Determines post-execution routing
      // (fix → VALIDATING, diagnostic → OBSERVING). Read before the transition.
      const wasFix = readPendingKind(runId, activeDb) === 'fix';

      // Transition WAITING_FOR_APPROVAL → EXECUTING_COMMAND
      const { nextState: executingState, sideEffects: approvalEffects } = reduce(state, incomingEvent);
      await performSideEffects(approvalEffects, activeDb);

      // Env-selected executor (mock|real via resolveClientMode), unless a test
      // injected one. Target host:port comes from the ticket's customer system;
      // SSH user/key come from env (never hardcoded) with the documented defaults.
      const exec = sshExecutor ?? createSshExecutor();
      const [host, portStr] = run.customer_system_id.split(':');
      const target = {
        host: host ?? run.customer_system_id,
        port: parseInt(portStr ?? '22', 10),
        username: process.env.SSH_USERNAME ?? 'azureuser',
        privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH ?? '/keys/your-key.pem',
      };

      const cmdResult = await exec.executeApprovedCommand(
        incomingEvent.approvalId,
        incomingEvent.finalCommand,
        target,
      );

      const stdoutRedacted = redactSecrets(cmdResult.stdout);
      const stderrRedacted = redactSecrets(cmdResult.stderr);

      appendCommandResult(runId, incomingEvent.approvalId, {
        command: incomingEvent.finalCommand,
        exitCode: cmdResult.exitCode,
        stdoutRedacted,
        stderrRedacted,
        durationMs: cmdResult.durationMs,
        timedOut: cmdResult.timedOut,
      });

      updateApprovalStatus(incomingEvent.approvalId, {
        status: 'EXECUTED',
        executedAt: new Date().toISOString(),
      });

      // Transition EXECUTING_COMMAND → OBSERVING
      const commandResultEvent = {
        type: 'command_result' as const,
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
        wasFix, // route a fix to VALIDATING, a diagnostic to OBSERVING
      };

      const { nextState: postState, sideEffects: postEffects } = reduce(executingState, commandResultEvent);
      await performSideEffects(postEffects, activeDb);
      return postState;
    }

    // All other incoming events
    const { nextState, sideEffects } = reduce(state, incomingEvent);
    await performSideEffects(sideEffects, activeDb);
    return nextState;
  }

  return agentDispatch(state, activeDb);
}
