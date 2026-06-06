// Orchestrator tests: mocked SSH + model — full happy path + reject path
import { describe, it, expect, vi } from 'vitest';
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
