// Orchestrator tests: mocked SSH + model — full happy path + reject path
import { describe, it, expect } from 'vitest';
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
