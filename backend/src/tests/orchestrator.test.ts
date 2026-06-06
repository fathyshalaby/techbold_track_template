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
