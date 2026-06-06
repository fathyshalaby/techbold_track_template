import { z } from 'zod';
import { RiskLevel } from '../safety/risk-levels.js';

export const RunStatus = z.enum(['CREATED', 'RUNNING', 'COMPLETED', 'FAILED', 'ABORTED']);
export const RunPhase = z.enum([
  'CREATED',
  'LOADED_CONTEXT',
  'TRIAGING',
  'WAITING_FOR_APPROVAL',
  'EXECUTING_COMMAND',
  'OBSERVING',
  'PLANNING_FIX',
  'VALIDATING',
  'DRAFTING_ACTIVITY',
  'WAITING_FOR_ACTIVITY_REVIEW',
  'SUBMITTING_ACTIVITY',
  'COMPLETED',
  'FAILED',
  'ABORTED',
]);

export const RunSchema = z.object({
  id: z.string(),
  ticket_id: z.number(),
  customer_system_id: z.string(),
  status: RunStatus,
  current_phase: RunPhase,
  started_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable(),
  error_message: z.string().nullable(),
}).strict();

export const AuditEventSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  type: z.string(),
  actor: z.enum(['system', 'technician', 'agent', 'phoenix', 'ssh']),
  ts: z.string(),
  payload_json: z.string(),
}).strict();

export const CommandApprovalSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  proposed_command: z.string(),
  edited_command: z.string().nullable(),
  final_command: z.string().nullable(),
  purpose: z.string(),
  expected_signal: z.string(),
  risk_level: z.nativeEnum(RiskLevel),
  safety_notes: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'BLOCKED']),
  technician_reason: z.string().nullable(),
  created_at: z.string(),
  decided_at: z.string().nullable(),
  executed_at: z.string().nullable(),
}).strict();

export const CommandResultSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  approval_id: z.string(),
  command: z.string(),
  exit_code: z.number(),
  stdout_redacted: z.string(),
  stderr_redacted: z.string(),
  duration_ms: z.number(),
  timed_out: z.number().int(),
  created_at: z.string(),
}).strict();

export const ObservationSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  source: z.enum(['ssh', 'phoenix', 'agent', 'technician']),
  content: z.string(),
  created_at: z.string(),
}).strict();

export const ActivityDraftSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  summary: z.string(),
  root_cause: z.string(),
  actions_taken: z.string(),
  commands_summary: z.string(),
  validation_result: z.string(),
  submitted: z.number().int(),
  created_at: z.string(),
  submitted_at: z.string().nullable(),
}).strict();

export type Run = z.infer<typeof RunSchema>;
export type RunStatusValue = z.infer<typeof RunStatus>;
export type RunPhaseValue = z.infer<typeof RunPhase>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type CommandApproval = z.infer<typeof CommandApprovalSchema>;
export type CommandResult = z.infer<typeof CommandResultSchema>;
export type Observation = z.infer<typeof ObservationSchema>;
export type ActivityDraft = z.infer<typeof ActivityDraftSchema>;
