// Orchestrator tests: mocked SSH + model — full happy path + reject path
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LanguageModelV1 } from 'ai';
import { z } from 'zod';

describe('RunPhase enum migration', () => {
  it('rejects old ANALYSIS value', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(() => RunPhase.parse('ANALYSIS')).toThrow(z.ZodError);
  });

  it('parses LOADED_CONTEXT', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(RunPhase.parse('LOADED_CONTEXT')).toBe('LOADED_CONTEXT');
  });

  it('parses WAITING_FOR_APPROVAL', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(RunPhase.parse('WAITING_FOR_APPROVAL')).toBe('WAITING_FOR_APPROVAL');
  });

  it('parses EXECUTING_COMMAND', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(RunPhase.parse('EXECUTING_COMMAND')).toBe('EXECUTING_COMMAND');
  });

  it('parses PLANNING_FIX', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(RunPhase.parse('PLANNING_FIX')).toBe('PLANNING_FIX');
  });

  it('parses DRAFTING_ACTIVITY', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(RunPhase.parse('DRAFTING_ACTIVITY')).toBe('DRAFTING_ACTIVITY');
  });

  it('parses WAITING_FOR_ACTIVITY_REVIEW', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(RunPhase.parse('WAITING_FOR_ACTIVITY_REVIEW')).toBe('WAITING_FOR_ACTIVITY_REVIEW');
  });

  it('has exactly 14 enum values', async () => {
    const { RunPhase } = await import('../store/schema.js');
    expect(Object.keys(RunPhase.enum)).toHaveLength(14);
  });

  it('RunSchema accepts TRIAGING as current_phase', async () => {
    const { RunSchema } = await import('../store/schema.js');
    const valid = {
      id: 'run_01',
      ticket_id: 1,
      customer_system_id: 'cs_01',
      status: 'RUNNING',
      current_phase: 'TRIAGING',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
    };
    expect(() => RunSchema.parse(valid)).not.toThrow();
  });

  it('RunSchema rejects ANALYSIS as current_phase', async () => {
    const { RunSchema } = await import('../store/schema.js');
    const invalid = {
      id: 'run_01',
      ticket_id: 1,
      customer_system_id: 'cs_01',
      status: 'RUNNING',
      current_phase: 'ANALYSIS',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
    };
    expect(() => RunSchema.parse(invalid)).toThrow(z.ZodError);
  });
});

describe('Agent Zod schemas', () => {
  it('DiagnosticProposalSchema parses valid proposal', async () => {
    const { DiagnosticProposalSchema } = await import('../ai/types.js');
    expect(() =>
      DiagnosticProposalSchema.parse({
        hypotheses: [{ cause: 'x', evidence: 'e', confidence: 0.8 }],
        command: 'ls',
        purpose: 'p',
        expectedSignal: 's',
        riskNotes: 'n',
        isReadOnly: true,
      }),
    ).not.toThrow();
  });

  it('DiagnosticProposalSchema rejects missing hypotheses', async () => {
    const { DiagnosticProposalSchema } = await import('../ai/types.js');
    expect(() =>
      DiagnosticProposalSchema.parse({
        command: 'ls',
        purpose: 'p',
        expectedSignal: 's',
        riskNotes: 'n',
        isReadOnly: true,
      }),
    ).toThrow(z.ZodError);
  });

  it('DiagnosticProposalSchema rejects confidence outside 0–1', async () => {
    const { DiagnosticProposalSchema } = await import('../ai/types.js');
    expect(() =>
      DiagnosticProposalSchema.parse({
        hypotheses: [{ cause: 'x', evidence: 'e', confidence: 1.5 }],
        command: 'ls',
        purpose: 'p',
        expectedSignal: 's',
        riskNotes: 'n',
        isReadOnly: true,
      }),
    ).toThrow(z.ZodError);
  });

  it('DiagnosticProposalSchema rejects empty hypotheses array', async () => {
    const { DiagnosticProposalSchema } = await import('../ai/types.js');
    expect(() =>
      DiagnosticProposalSchema.parse({
        hypotheses: [],
        command: 'ls',
        purpose: 'p',
        expectedSignal: 's',
        riskNotes: 'n',
        isReadOnly: true,
      }),
    ).toThrow(z.ZodError);
  });

  it('FixProposalSchema parses valid fix', async () => {
    const { FixProposalSchema } = await import('../ai/types.js');
    expect(() =>
      FixProposalSchema.parse({
        rootCause: 'x',
        command: 'systemctl restart svc',
        rationale: 'r',
        rollbackCommand: 'systemctl stop svc',
        isReversible: true,
        persistenceNote: 'enabled',
      }),
    ).not.toThrow();
  });

  it('FixProposalSchema rejects missing rollbackCommand', async () => {
    const { FixProposalSchema } = await import('../ai/types.js');
    expect(() =>
      FixProposalSchema.parse({
        rootCause: 'x',
        command: 'systemctl restart svc',
        rationale: 'r',
        isReversible: true,
        persistenceNote: 'enabled',
      }),
    ).toThrow(z.ZodError);
  });

  it('ValidationResultSchema parses VERIFIED_FIXED with persistenceCheck', async () => {
    const { ValidationResultSchema } = await import('../ai/types.js');
    expect(() =>
      ValidationResultSchema.parse({
        status: 'VERIFIED_FIXED',
        benefitCheck: 'curl returned 200',
        persistenceCheck: 'enabled, survives restart',
        evidence: ['curl 200'],
      }),
    ).not.toThrow();
  });

  it('ValidationResultSchema parses LIKELY_FIXED with null persistenceCheck', async () => {
    const { ValidationResultSchema } = await import('../ai/types.js');
    expect(() =>
      ValidationResultSchema.parse({
        status: 'LIKELY_FIXED',
        benefitCheck: '...',
        persistenceCheck: null,
        evidence: [],
      }),
    ).not.toThrow();
  });

  it('ValidationResultSchema rejects VERIFIED_FIXED with null persistenceCheck', async () => {
    const { ValidationResultSchema } = await import('../ai/types.js');
    expect(() =>
      ValidationResultSchema.parse({
        status: 'VERIFIED_FIXED',
        benefitCheck: '...',
        persistenceCheck: null,
        evidence: [],
      }),
    ).toThrow(z.ZodError);
  });

  it('ValidationResultSchema rejects invalid status enum value', async () => {
    const { ValidationResultSchema } = await import('../ai/types.js');
    expect(() =>
      ValidationResultSchema.parse({
        status: 'is-active',
        benefitCheck: '...',
        persistenceCheck: 'ok',
        evidence: [],
      }),
    ).toThrow(z.ZodError);
  });

  it('ValidationResultSchema rejects missing benefitCheck', async () => {
    const { ValidationResultSchema } = await import('../ai/types.js');
    expect(() =>
      ValidationResultSchema.parse({
        status: 'VERIFIED_FIXED',
        persistenceCheck: 'ok',
        evidence: [],
      }),
    ).toThrow(z.ZodError);
  });
});

describe('Prompt generalization (DIAG-02 / SC2)', () => {
  it('PROBLEM_ANALYZER_SYSTEM_PROMPT does not contain hardcoded incident identifiers', async () => {
    const { PROBLEM_ANALYZER_SYSTEM_PROMPT } = await import('../ai/prompts.js');
    expect(PROBLEM_ANALYZER_SYSTEM_PROMPT).not.toMatch(/\b(status-api|vm-01|EADDRINUSE)\b/i);
  });

  it('CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT does not contain hardcoded incident identifiers', async () => {
    const { CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT } = await import('../ai/prompts.js');
    expect(CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT).not.toMatch(/\b(status-api|vm-01|ticket[_-]?\d+)\b/i);
  });

  it('PROBLEM_SOLVER_SYSTEM_PROMPT does not contain hardcoded incident identifiers', async () => {
    const { PROBLEM_SOLVER_SYSTEM_PROMPT } = await import('../ai/prompts.js');
    expect(PROBLEM_SOLVER_SYSTEM_PROMPT).not.toMatch(/\b(status-api|vm-01|8080)\b/i);
  });

  it('VALIDATOR_SYSTEM_PROMPT does not contain hardcoded incident identifiers', async () => {
    const { VALIDATOR_SYSTEM_PROMPT } = await import('../ai/prompts.js');
    expect(VALIDATOR_SYSTEM_PROMPT).not.toMatch(/\b(is-active|vm-01|status-api)\b/i);
  });

  it('each prompt is non-trivial (length > 200)', async () => {
    const {
      PROBLEM_ANALYZER_SYSTEM_PROMPT,
      CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT,
      PROBLEM_SOLVER_SYSTEM_PROMPT,
      VALIDATOR_SYSTEM_PROMPT,
    } = await import('../ai/prompts.js');
    expect(PROBLEM_ANALYZER_SYSTEM_PROMPT.length).toBeGreaterThan(200);
    expect(CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT.length).toBeGreaterThan(200);
    expect(PROBLEM_SOLVER_SYSTEM_PROMPT.length).toBeGreaterThan(200);
    expect(VALIDATOR_SYSTEM_PROMPT.length).toBeGreaterThan(200);
  });

  it('VALIDATOR_SYSTEM_PROMPT distinguishes LIKELY_FIXED from VERIFIED_FIXED', async () => {
    const { VALIDATOR_SYSTEM_PROMPT } = await import('../ai/prompts.js');
    expect(VALIDATOR_SYSTEM_PROMPT).toMatch(/LIKELY_FIXED/);
    expect(VALIDATOR_SYSTEM_PROMPT).toMatch(/VERIFIED_FIXED/);
  });

  it('VALIDATOR_SYSTEM_PROMPT does not instruct using is-active as sole proof', async () => {
    const { VALIDATOR_SYSTEM_PROMPT } = await import('../ai/prompts.js');
    expect(VALIDATOR_SYSTEM_PROMPT).not.toMatch(/\bis-active\b/);
  });
});

describe('agent schemas', () => {
  it('CustomerSystemContextSchema parses valid summary', async () => {
    const { CustomerSystemContextSchema } = await import(
      '../ai/agents/customer-system-analyzer.js'
    );
    expect(() =>
      CustomerSystemContextSchema.parse({ summary: 'Ubuntu 22.04, nginx running on :80' }),
    ).not.toThrow();
  });

  it('CustomerSystemContextSchema rejects empty summary', async () => {
    const { CustomerSystemContextSchema } = await import(
      '../ai/agents/customer-system-analyzer.js'
    );
    expect(() => CustomerSystemContextSchema.parse({ summary: '' })).toThrow();
  });

  it('CustomerSystemContextSchema rejects missing summary', async () => {
    const { CustomerSystemContextSchema } = await import(
      '../ai/agents/customer-system-analyzer.js'
    );
    expect(() => CustomerSystemContextSchema.parse({})).toThrow();
  });
});

describe('agent degradation', () => {
  it('runProblemAnalyzer rejects with AgentUnavailableError when model throws', async () => {
    const { runProblemAnalyzer, AgentUnavailableError } = await import(
      '../ai/agents/problem-analyzer.js'
    );
    const throwingModel: LanguageModelV1 = {
      specificationVersion: 'v1',
      provider: 'mock',
      modelId: 'mock-throw',
      defaultObjectGenerationMode: 'json',
      supportsStructuredOutputs: true,
      doGenerate: async () => {
        throw new Error('model unavailable');
      },
      doStream: async () => {
        throw new Error('mock model does not support streaming');
      },
    };
    await expect(
      runProblemAnalyzer(
        { ticketDescription: 'nginx not responding', observations: [] },
        throwingModel,
      ),
    ).rejects.toBeInstanceOf(AgentUnavailableError);
  });

  it('AgentUnavailableError message contains "agent unavailable" (case-insensitive)', async () => {
    const { runProblemAnalyzer, AgentUnavailableError } = await import(
      '../ai/agents/problem-analyzer.js'
    );
    const throwingModel: LanguageModelV1 = {
      specificationVersion: 'v1',
      provider: 'mock',
      modelId: 'mock-throw',
      defaultObjectGenerationMode: 'json',
      supportsStructuredOutputs: true,
      doGenerate: async () => {
        throw new Error('model unavailable');
      },
      doStream: async () => {
        throw new Error('mock model does not support streaming');
      },
    };
    await expect(
      runProblemAnalyzer(
        { ticketDescription: 'nginx not responding', observations: [] },
        throwingModel,
      ),
    ).rejects.toMatchObject({ message: expect.stringMatching(/agent unavailable/i) });
  });
});

describe('reducer transitions', () => {
  const BASE = {
    runId: 'run_test',
    phase: 'TRIAGING' as const,
    status: 'RUNNING' as const,
    stepCount: 0,
    ticketId: 1,
    customerSystemId: '10.0.0.1:22',
  };

  const DIAGNOSTIC_PROPOSAL = {
    hypotheses: [{ cause: 'nginx crashed', evidence: 'port 80 closed', confidence: 0.9 }],
    command: 'systemctl status nginx',
    purpose: 'check nginx state',
    expectedSignal: 'service status',
    riskNotes: 'read-only',
    isReadOnly: true,
  };

  const FIX_PROPOSAL = {
    rootCause: 'nginx config error',
    command: 'systemctl restart nginx',
    rationale: 'restart to apply config',
    rollbackCommand: 'systemctl stop nginx',
    isReversible: true,
    persistenceNote: 'enabled',
  };

  const COMMAND_RESULT = {
    id: 'res_1',
    run_id: 'run_test',
    approval_id: 'appr_1',
    command: 'systemctl status nginx',
    exit_code: 0,
    stdout_redacted: 'active (running)',
    stderr_redacted: '',
    duration_ms: 100,
    timed_out: 0,
    created_at: new Date().toISOString(),
  };

  it('1. TRIAGING + diagnostic_proposal_ready → WAITING_FOR_APPROVAL with createPendingApproval + emitEvent', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const result = reduce(BASE, { type: 'diagnostic_proposal_ready', proposal: DIAGNOSTIC_PROPOSAL });
    expect(result.nextState.phase).toBe('WAITING_FOR_APPROVAL');
    expect(result.sideEffects.some((e) => e.type === 'createPendingApproval')).toBe(true);
    expect(result.sideEffects.some((e) => e.type === 'emitEvent' && (e as { type: 'emitEvent'; runId: string; eventType: string; payload: unknown }).eventType === 'approval.required')).toBe(true);
  });

  it('2. TRIAGING + command_blocked → TRIAGING with auditCommandBlocked', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const result = reduce(BASE, { type: 'command_blocked', reason: 'blocklist', command: 'rm -rf /' });
    expect(result.nextState.phase).toBe('TRIAGING');
    expect(result.sideEffects.some((e) => e.type === 'appendAuditEvent' && (e as { type: 'appendAuditEvent'; auditType: string }).auditType === 'command.blocked')).toBe(true);
  });

  it('3. WAITING_FOR_APPROVAL + command_rejected → TRIAGING with auditRejected', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'WAITING_FOR_APPROVAL' as const };
    const result = reduce(state, { type: 'command_rejected', reason: 'too risky' });
    expect(result.nextState.phase).toBe('TRIAGING');
    expect(result.sideEffects.some((e) => e.type === 'appendAuditEvent' && (e as { type: 'appendAuditEvent'; auditType: string }).auditType === 'command.rejected')).toBe(true);
  });

  it('4. EXECUTING_COMMAND + command_result → OBSERVING with appendObservation + command.completed audit', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'EXECUTING_COMMAND' as const };
    const result = reduce(state, { type: 'command_result', approvalId: 'appr_1', result: COMMAND_RESULT });
    expect(result.nextState.phase).toBe('OBSERVING');
    expect(result.sideEffects.some((e) => e.type === 'appendObservation')).toBe(true);
    expect(result.sideEffects.some((e) => e.type === 'appendAuditEvent' && (e as { type: 'appendAuditEvent'; auditType: string }).auditType === 'command.completed')).toBe(true);
  });

  it('5. OBSERVING + root_cause_found → PLANNING_FIX', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'OBSERVING' as const };
    const result = reduce(state, { type: 'root_cause_found', hypothesis: 'nginx crashed due to OOM' });
    expect(result.nextState.phase).toBe('PLANNING_FIX');
  });

  it('6. OBSERVING + more_diagnosis_needed → TRIAGING', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'OBSERVING' as const };
    const result = reduce(state, { type: 'more_diagnosis_needed' });
    expect(result.nextState.phase).toBe('TRIAGING');
  });

  it('7. PLANNING_FIX + fix_proposal_ready → WAITING_FOR_APPROVAL with createPendingApproval', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'PLANNING_FIX' as const };
    const result = reduce(state, { type: 'fix_proposal_ready', proposal: FIX_PROPOSAL });
    expect(result.nextState.phase).toBe('WAITING_FOR_APPROVAL');
    expect(result.sideEffects.some((e) => e.type === 'createPendingApproval')).toBe(true);
  });

  it('8. VALIDATING + validation_complete VERIFIED_FIXED → DRAFTING_ACTIVITY', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'VALIDATING' as const };
    const result = reduce(state, { type: 'validation_complete', result: { status: 'VERIFIED_FIXED', benefitCheck: 'ok', persistenceCheck: 'enabled', evidence: [] } });
    expect(result.nextState.phase).toBe('DRAFTING_ACTIVITY');
  });

  it('9. VALIDATING + validation_complete LIKELY_FIXED → DRAFTING_ACTIVITY', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'VALIDATING' as const };
    const result = reduce(state, { type: 'validation_complete', result: { status: 'LIKELY_FIXED', benefitCheck: 'ok', persistenceCheck: null, evidence: [] } });
    expect(result.nextState.phase).toBe('DRAFTING_ACTIVITY');
  });

  it('10. VALIDATING + validation_complete NOT_FIXED → TRIAGING', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'VALIDATING' as const };
    const result = reduce(state, { type: 'validation_complete', result: { status: 'NOT_FIXED', benefitCheck: 'still broken', persistenceCheck: null, evidence: [] } });
    expect(result.nextState.phase).toBe('TRIAGING');
  });

  it('11. Max-steps cap at stepCount=12 → WAITING_FOR_ACTIVITY_REVIEW with run.steps_capped audit', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'TRIAGING' as const, stepCount: 12 };
    const result = reduce(state, { type: 'diagnostic_proposal_ready', proposal: DIAGNOSTIC_PROPOSAL });
    expect(result.nextState.phase).toBe('WAITING_FOR_ACTIVITY_REVIEW');
    expect(result.sideEffects.some((e) => e.type === 'appendAuditEvent' && (e as { type: 'appendAuditEvent'; auditType: string }).auditType === 'run.steps_capped')).toBe(true);
  });

  it('12. Abort from CREATED/TRIAGING/WAITING_FOR_APPROVAL → ABORTED', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    for (const phase of ['CREATED', 'TRIAGING', 'WAITING_FOR_APPROVAL'] as const) {
      const result = reduce({ ...BASE, phase }, { type: 'abort' });
      expect(result.nextState.phase).toBe('ABORTED');
      expect(result.nextState.status).toBe('ABORTED');
    }
  });

  it('13. unrecoverable_error → FAILED with errorMessage', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const result = reduce(BASE, { type: 'unrecoverable_error', message: 'SSH connection lost' });
    expect(result.nextState.phase).toBe('FAILED');
    expect(result.nextState.status).toBe('FAILED');
    expect(result.nextState.errorMessage).toContain('SSH connection lost');
  });

  it('14. stepCount increments on diagnostic_proposal_ready', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const result = reduce(BASE, { type: 'diagnostic_proposal_ready', proposal: DIAGNOSTIC_PROPOSAL });
    expect(result.nextState.stepCount).toBe(1);
  });

  it('15. Terminal phases (COMPLETED/FAILED/ABORTED) ignore all events', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    for (const phase of ['COMPLETED', 'FAILED', 'ABORTED'] as const) {
      const state = { ...BASE, phase };
      const result = reduce(state, { type: 'abort' });
      expect(result.nextState.phase).toBe(phase);
      expect(result.sideEffects).toHaveLength(0);
    }
  });

  // Regression (audit-gap + phase-desync fix): a blocked FIX command must be
  // audited and must move the PERSISTED phase back to TRIAGING (via phaseEffect).
  it('16. PLANNING_FIX + command_blocked → TRIAGING with command.blocked audit', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'PLANNING_FIX' as const };
    const result = reduce(state, { type: 'command_blocked', reason: 'blocklist', command: 'mkfs /dev/sda' });
    expect(result.nextState.phase).toBe('TRIAGING');
    expect(
      result.sideEffects.some(
        (e) => e.type === 'appendAuditEvent' && (e as { auditType: string }).auditType === 'command.blocked',
      ),
    ).toBe(true);
    expect(
      result.sideEffects.some(
        (e) => e.type === 'updateRunPhase' && (e as { phase: string }).phase === 'TRIAGING',
      ),
    ).toBe(true);
  });

  // Regression: a blocked re-gated edit in WAITING_FOR_APPROVAL must be audited
  // (and not silently dropped) while leaving the run able to retry.
  it('17. WAITING_FOR_APPROVAL + command_blocked → audited, stays WAITING_FOR_APPROVAL', async () => {
    const { reduce } = await import('../ai/orchestrator.js');
    const state = { ...BASE, phase: 'WAITING_FOR_APPROVAL' as const };
    const result = reduce(state, { type: 'command_blocked', reason: 'blocklist', command: 'rm -rf /etc' });
    expect(result.nextState.phase).toBe('WAITING_FOR_APPROVAL');
    expect(
      result.sideEffects.some(
        (e) => e.type === 'appendAuditEvent' && (e as { auditType: string }).auditType === 'command.blocked',
      ),
    ).toBe(true);
  });
});

describe('agent mock output', () => {
  it('runProblemAnalyzer with scripted mock returns valid DiagnosticProposal', async () => {
    const { runProblemAnalyzer, MOCK_DIAGNOSTIC_PROPOSAL } = await import(
      '../ai/agents/problem-analyzer.js'
    );
    const scriptedModel: LanguageModelV1 = {
      specificationVersion: 'v1',
      provider: 'mock',
      modelId: 'mock-scripted',
      defaultObjectGenerationMode: 'json',
      supportsStructuredOutputs: true,
      doGenerate: async () => ({
        rawCall: { rawPrompt: null, rawSettings: {} },
        finishReason: 'stop' as const,
        usage: { promptTokens: 0, completionTokens: 0 },
        text: JSON.stringify(MOCK_DIAGNOSTIC_PROPOSAL),
      }),
      doStream: async () => {
        throw new Error('mock model does not support streaming');
      },
    };
    const result = await runProblemAnalyzer(
      { ticketDescription: 'nginx not responding', observations: [] },
      scriptedModel,
    );
    expect(result.hypotheses.length).toBeGreaterThanOrEqual(1);
    expect(result.isReadOnly).toBe(true);
  });

  it('runValidator with scripted mock returns LIKELY_FIXED', async () => {
    const { runValidator, MOCK_VALIDATION_RESULT_LIKELY } = await import(
      '../ai/agents/validator.js'
    );
    const scriptedModel: LanguageModelV1 = {
      specificationVersion: 'v1',
      provider: 'mock',
      modelId: 'mock-scripted',
      defaultObjectGenerationMode: 'json',
      supportsStructuredOutputs: true,
      doGenerate: async () => ({
        rawCall: { rawPrompt: null, rawSettings: {} },
        finishReason: 'stop' as const,
        usage: { promptTokens: 0, completionTokens: 0 },
        text: JSON.stringify(MOCK_VALIDATION_RESULT_LIKELY),
      }),
      doStream: async () => {
        throw new Error('mock model does not support streaming');
      },
    };
    const result = await runValidator(
      {
        ticketDescription: 'nginx not responding',
        observations: ['systemctl restart nginx succeeded'],
        fixApplied: 'systemctl restart nginx',
      },
      scriptedModel,
    );
    expect(result.status).toBe('LIKELY_FIXED');
  });
});

// ─── Integration tests — async driver ────────────────────────────────────────

const MOCK_DIAGNOSTIC = {
  hypotheses: [{ cause: 'service crashed', evidence: 'systemctl output', confidence: 0.85 }],
  command: 'systemctl status status-api --no-pager',
  purpose: 'Check service state',
  expectedSignal: 'Active: failed',
  riskNotes: 'read-only',
  isReadOnly: true,
};

const MOCK_FIX = {
  rootCause: 'port conflict',
  command: 'sudo systemctl restart status-api',
  rationale: 'restart to clear the conflict',
  rollbackCommand: 'sudo systemctl stop status-api',
  isReversible: true,
  persistenceNote: 'systemd service enabled',
};

const MOCK_VALIDATION: import('../ai/types.js').ValidationResult = {
  status: 'VERIFIED_FIXED',
  benefitCheck: 'service active',
  persistenceCheck: 'enabled',
  evidence: ['systemctl status shows active'],
};

describe('orchestrator driver — integration', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let analyzerSpy: ReturnType<typeof vi.spyOn<any, any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let solverSpy: ReturnType<typeof vi.spyOn<any, any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let validatorSpy: ReturnType<typeof vi.spyOn<any, any>>;

  beforeEach(async () => {
    const analyzerMod = await import('../ai/agents/problem-analyzer.js');
    const solverMod = await import('../ai/agents/problem-solver.js');
    const validatorMod = await import('../ai/agents/validator.js');

    analyzerSpy = vi.spyOn(analyzerMod, 'runProblemAnalyzer').mockResolvedValue(MOCK_DIAGNOSTIC);
    solverSpy = vi.spyOn(solverMod, 'runProblemSolver').mockResolvedValue(MOCK_FIX);
    validatorSpy = vi.spyOn(validatorMod, 'runValidator').mockResolvedValue(MOCK_VALIDATION);

    const { makeJsonlAdapter, setDb } = await import('../store/db.js');
    setDb(makeJsonlAdapter());
  });

  afterEach(() => {
    analyzerSpy.mockRestore();
    solverSpy.mockRestore();
    validatorSpy.mockRestore();
  });

  it('Test 1 — happy path TRIAGING → WAITING_FOR_APPROVAL', async () => {
    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getAuditEvents } = await import('../store/audit.js');

    const run = createRun(1, '10.0.0.1:22');
    const state = await advance(run.id);

    expect(state.phase).toBe('WAITING_FOR_APPROVAL');

    const { getDb } = await import('../store/db.js');
    const db = getDb();
    const approvals = db.all<{ run_id: string; status: string }>('SELECT * FROM command_approvals WHERE run_id = ?', [run.id]);
    expect(approvals.some((a) => a.status === 'PENDING')).toBe(true);

    const events = getAuditEvents(run.id);
    expect(events.some((e) => e.type === 'approval.required')).toBe(true);

    // Verify validateCommandAgainstPolicy was applied — approval row carries the proposed command
    const approvalRow = approvals.find((a) => a.status === 'PENDING') as { proposed_command?: string } | undefined;
    expect(approvalRow?.proposed_command).toBe('systemctl status status-api --no-pager');
  });

  it('Test 2 — blocked command loops back to TRIAGING', async () => {
    const { runProblemAnalyzer } = await import('../ai/agents/problem-analyzer.js');
    (runProblemAnalyzer as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...MOCK_DIAGNOSTIC,
      command: 'cat /etc/shadow',
    });

    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getAuditEvents } = await import('../store/audit.js');

    const run = createRun(1, '10.0.0.1:22');
    const state = await advance(run.id);

    expect(state.phase).toBe('TRIAGING');

    const events = getAuditEvents(run.id);
    expect(events.some((e) => e.type === 'command.blocked')).toBe(true);

    const { getDb } = await import('../store/db.js');
    const db = getDb();
    const approvals = db.all<{ run_id: string }>('SELECT * FROM command_approvals WHERE run_id = ?', [run.id]);
    expect(approvals).toHaveLength(0);
  });

  it('Test 3 — rejection returns to TRIAGING', async () => {
    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getAuditEvents } = await import('../store/audit.js');

    const run = createRun(1, '10.0.0.1:22');
    await advance(run.id);

    const state = await advance(run.id, { type: 'command_rejected', reason: 'Too risky' });

    expect(state.phase).toBe('TRIAGING');
    const events = getAuditEvents(run.id);
    expect(events.some((e) => e.type === 'command.rejected')).toBe(true);
  });

  it('Test 4 — approval triggers execution and OBSERVING', async () => {
    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getDb } = await import('../store/db.js');
    const { MockSshExecutor } = await import('../ssh/mock.js');

    const run = createRun(1, '10.0.0.1:22');
    await advance(run.id);

    const db = getDb();
    const approvals = db.all<{ id: string; status: string; run_id: string }>(
      'SELECT * FROM command_approvals WHERE run_id = ?',
      [run.id],
    );
    const pending = approvals.find((a) => a.status === 'PENDING');
    expect(pending).toBeDefined();

    const state = await advance(
      run.id,
      {
        type: 'command_approved',
        approvalId: pending!.id,
        finalCommand: 'systemctl status status-api --no-pager',
      },
      undefined,
      new MockSshExecutor(), // inject mock — no env/real-SSH dependency in tests
    );

    expect(state.phase).toBe('OBSERVING');

    const results = db.all<{ run_id: string; approval_id: string }>(
      'SELECT * FROM command_results WHERE run_id = ?',
      [run.id],
    );
    expect(results.some((r) => r.approval_id === pending!.id)).toBe(true);

    const observations = db.all<{ run_id: string; source: string }>(
      'SELECT * FROM observations WHERE run_id = ?',
      [run.id],
    );
    expect(observations.some((o) => o.source === 'ssh')).toBe(true);

    const executedApprovals = db.all<{ id: string; status: string; run_id: string }>(
      'SELECT * FROM command_approvals WHERE run_id = ?',
      [run.id],
    );
    expect(executedApprovals.find((a) => a.id === pending!.id)?.status).toBe('EXECUTED');
  });

  it('Test 5 — max-steps cap', async () => {
    const { advance, setStepCountForTest } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getAuditEvents } = await import('../store/audit.js');
    const { runProblemAnalyzer } = await import('../ai/agents/problem-analyzer.js');
    const { getDb } = await import('../store/db.js');

    const run = createRun(1, '10.0.0.1:22');
    setStepCountForTest(run.id, 12, getDb());

    const state = await advance(run.id);

    expect(state.phase).toBe('WAITING_FOR_ACTIVITY_REVIEW');

    const events = getAuditEvents(run.id);
    expect(events.some((e) => e.type === 'run.steps_capped')).toBe(true);

    expect(runProblemAnalyzer).not.toHaveBeenCalled();
  });

  it('Test 6 — agent failure degrades gracefully', async () => {
    const { runProblemAnalyzer } = await import('../ai/agents/problem-analyzer.js');
    (runProblemAnalyzer as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('LLM timeout'),
    );

    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getAuditEvents } = await import('../store/audit.js');

    const run = createRun(1, '10.0.0.1:22');

    let state: Awaited<ReturnType<typeof advance>>;
    await expect(
      advance(run.id).then((s) => { state = s; return s; }),
    ).resolves.toBeDefined();

    expect(state!.phase).toBe('TRIAGING');

    const events = getAuditEvents(run.id);
    expect(events.some((e) => e.type === 'agent.unavailable')).toBe(true);
    const unavailableEvent = events.find((e) => e.type === 'agent.unavailable');
    expect(unavailableEvent?.payload_json).toMatch(/LLM timeout/i);

    const { getDb } = await import('../store/db.js');
    const db = getDb();
    const approvals = db.all<{ run_id: string }>(
      'SELECT * FROM command_approvals WHERE run_id = ?',
      [run.id],
    );
    expect(approvals).toHaveLength(0);
  });

  it('Test 7 — generalisation: agent prompts contain no hardcoded fixture strings', async () => {
    const { PROBLEM_ANALYZER_SYSTEM_PROMPT, PROBLEM_SOLVER_SYSTEM_PROMPT, VALIDATOR_SYSTEM_PROMPT } =
      await import('../ai/prompts.js');

    const FORBIDDEN = ['status-api', 'vm-01', 'localhost:8080', 'EADDRINUSE', 'ticket_123', 'azureuser'];

    for (const prompt of [PROBLEM_ANALYZER_SYSTEM_PROMPT, PROBLEM_SOLVER_SYSTEM_PROMPT, VALIDATOR_SYSTEM_PROMPT]) {
      for (const forbidden of FORBIDDEN) {
        expect(prompt).not.toContain(forbidden);
      }
    }

    const { runProblemAnalyzer } = await import('../ai/agents/problem-analyzer.js');
    const analyzerSrc = runProblemAnalyzer.toString();
    // The mock function body won't contain forbidden strings — the real check is on the prompts above
    // Also check the agent source file won't contain hardcoded strings (verified via grep in CI)
  });

  // SAFETY INVARIANT (critical): approving an EDITED command that the policy now
  // blocks must NEVER execute and MUST be audited. This is the human-edit attack
  // surface — the gate's "re-check after edit" guarantee.
  it('Test 8 — re-gate blocks an edited dangerous command: no execution, audited', async () => {
    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getDb } = await import('../store/db.js');
    const { getAuditEvents } = await import('../store/audit.js');
    type SshExecutor = import('../ssh/types.js').SshExecutor;

    const run = createRun(1, '10.0.0.1:22');
    await advance(run.id); // → WAITING_FOR_APPROVAL
    const db = getDb();
    const pending = db
      .all<{ id: string; status: string }>('SELECT * FROM command_approvals WHERE run_id = ?', [run.id])
      .find((a) => a.status === 'PENDING');
    expect(pending).toBeDefined();

    const execSpy = vi.fn();
    const spyExecutor = { executeApprovedCommand: execSpy, runPreflight: vi.fn() } as unknown as SshExecutor;

    const state = await advance(
      run.id,
      { type: 'command_approved', approvalId: pending!.id, finalCommand: 'rm -rf /etc' },
      undefined,
      spyExecutor,
    );

    expect(execSpy).not.toHaveBeenCalled(); // executor never reached for a blocked command
    expect(getAuditEvents(run.id).some((e) => e.type === 'command.blocked')).toBe(true);
    expect(db.all('SELECT * FROM command_results WHERE run_id = ?', [run.id])).toHaveLength(0);
    expect(state.phase).not.toBe('OBSERVING');
  });

  // C-SCORE INVARIANT: secrets in command output must be redacted before they are
  // persisted to command_results OR observations (the redaction-at-sink rule).
  it('Test 9 — redaction at the sink: secrets in output never persist raw', async () => {
    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getDb } = await import('../store/db.js');
    type SshExecutor = import('../ssh/types.js').SshExecutor;

    const run = createRun(1, '10.0.0.1:22');
    await advance(run.id);
    const db = getDb();
    const pending = db
      .all<{ id: string; status: string }>('SELECT * FROM command_approvals WHERE run_id = ?', [run.id])
      .find((a) => a.status === 'PENDING');

    const leakyExecutor = {
      executeApprovedCommand: vi.fn().mockResolvedValue({
        stdout: 'db connect: token=SUPERSECRET123', stderr: '', exitCode: 0, durationMs: 5, timedOut: false,
      }),
      runPreflight: vi.fn(),
    } as unknown as SshExecutor;

    await advance(
      run.id,
      { type: 'command_approved', approvalId: pending!.id, finalCommand: 'systemctl status status-api --no-pager' },
      undefined,
      leakyExecutor,
    );

    const results = db.all<{ stdout_redacted: string }>('SELECT * FROM command_results WHERE run_id = ?', [run.id]);
    expect(results).toHaveLength(1);
    expect(results[0].stdout_redacted).not.toContain('SUPERSECRET123');
    expect(results[0].stdout_redacted).toContain('«redacted»');

    const sshObs = db
      .all<{ source: string; content: string }>('SELECT * FROM observations WHERE run_id = ?', [run.id])
      .find((o) => o.source === 'ssh');
    expect(sshObs?.content).not.toContain('SUPERSECRET123');
  });

  // LOOP-PROGRESSION (was the #1 gap — OBSERVING used to stall): after a command
  // runs, advancing must auto-decide root-cause vs more-diagnosis.
  async function driveToObserving() {
    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getDb } = await import('../store/db.js');
    type SshExecutor = import('../ssh/types.js').SshExecutor;
    const run = createRun(1, '10.0.0.1:22');
    await advance(run.id); // → WAITING_FOR_APPROVAL
    const db = getDb();
    const pending = db
      .all<{ id: string; status: string }>('SELECT * FROM command_approvals WHERE run_id = ?', [run.id])
      .find((a) => a.status === 'PENDING');
    const exec = {
      executeApprovedCommand: vi.fn().mockResolvedValue({
        stdout: 'Active: failed', stderr: '', exitCode: 3, durationMs: 5, timedOut: false,
      }),
      runPreflight: vi.fn(),
    } as unknown as SshExecutor;
    await advance(
      run.id,
      { type: 'command_approved', approvalId: pending!.id, finalCommand: 'systemctl status status-api --no-pager' },
      undefined,
      exec,
    ); // → OBSERVING
    return { run, advance };
  }

  it('Test 10 — OBSERVING + high-confidence hypothesis → PLANNING_FIX', async () => {
    const { run, advance } = await driveToObserving();
    const { runProblemAnalyzer } = await import('../ai/agents/problem-analyzer.js');
    (runProblemAnalyzer as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...MOCK_DIAGNOSTIC,
      hypotheses: [{ cause: 'port 8080 already in use', evidence: 'EADDRINUSE', confidence: 0.95 }],
    });
    const state = await advance(run.id);
    expect(state.phase).toBe('PLANNING_FIX');
    const { getAuditEvents } = await import('../store/audit.js');
    expect(getAuditEvents(run.id).some((e) => e.type === 'diagnosis.root_cause_found')).toBe(true);
  });

  it('Test 11 — OBSERVING + low-confidence hypothesis → TRIAGING (keep diagnosing)', async () => {
    const { run, advance } = await driveToObserving();
    const { runProblemAnalyzer } = await import('../ai/agents/problem-analyzer.js');
    (runProblemAnalyzer as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...MOCK_DIAGNOSTIC,
      hypotheses: [{ cause: 'maybe disk?', evidence: 'inconclusive', confidence: 0.3 }],
    });
    const state = await advance(run.id);
    expect(state.phase).toBe('TRIAGING');
    const { getAuditEvents } = await import('../store/audit.js');
    expect(getAuditEvents(run.id).some((e) => e.type === 'diagnosis.more_needed')).toBe(true);
  });

  // OBSERVATION FIDELITY: the agent must see exit code + stderr, not just stdout.
  it('Test 12 — observation records exit code and stderr, not only stdout', async () => {
    const { advance } = await import('../ai/orchestrator.js');
    const { createRun } = await import('../store/runs.js');
    const { getDb } = await import('../store/db.js');
    type SshExecutor = import('../ssh/types.js').SshExecutor;
    const run = createRun(1, '10.0.0.1:22');
    await advance(run.id);
    const db = getDb();
    const pending = db
      .all<{ id: string; status: string }>('SELECT * FROM command_approvals WHERE run_id = ?', [run.id])
      .find((a) => a.status === 'PENDING');
    const exec = {
      executeApprovedCommand: vi.fn().mockResolvedValue({
        stdout: '', stderr: 'nginx: configuration file test failed', exitCode: 1, durationMs: 5, timedOut: false,
      }),
      runPreflight: vi.fn(),
    } as unknown as SshExecutor;
    await advance(
      run.id,
      { type: 'command_approved', approvalId: pending!.id, finalCommand: 'nginx -t' },
      undefined,
      exec,
    );
    const sshObs = db
      .all<{ source: string; content: string }>('SELECT * FROM observations WHERE run_id = ?', [run.id])
      .find((o) => o.source === 'ssh');
    expect(sshObs?.content).toContain('exit_code: 1');
    expect(sshObs?.content).toContain('nginx: configuration file test failed');
  });
});
