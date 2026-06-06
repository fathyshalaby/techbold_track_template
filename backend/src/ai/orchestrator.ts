import type { RunPhaseValue, RunStatusValue, AuditEvent, Observation } from '../store/schema.js';
import type { DiagnosticProposal, FixProposal, ValidationResult } from './types.js';

export { type DiagnosticProposal, type FixProposal, type ValidationResult };

export const MAX_STEPS = 12;

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
  | { type: 'command_result'; approvalId: string; result: import('../store/schema.js').CommandResult }
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

  // Global: unrecoverable_error transitions any non-terminal phase to FAILED
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

  // Global: abort from abortable phases
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

  // Max-steps guard: fires before advancing on proposal events
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
      break;
    }

    case 'EXECUTING_COMMAND': {
      if (event.type === 'command_result') {
        const nextState = buildState(state, { phase: 'OBSERVING' });
        return {
          nextState,
          sideEffects: [
            { type: 'appendObservation', runId: state.runId, source: 'ssh', content: event.result.stdout_redacted },
            auditEffect(state, 'command.completed', 'ssh', { approvalId: event.approvalId, exitCode: event.result.exit_code }),
            phaseEffect(state, 'OBSERVING'),
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
