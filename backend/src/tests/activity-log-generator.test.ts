import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LanguageModelV1 } from 'ai';
import { makeJsonlAdapter, setDb, resetDb } from '../store/db.js';

vi.mock('../env.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../env.js')>();
  return {
    ...actual,
    resolveClientMode: vi.fn().mockReturnValue('mock'),
    getEnv: vi.fn().mockReturnValue({
      PHOENIX_API_BASE_URL: 'http://localhost',
      PHOENIX_API_TOKEN: 'test',
      OPENAI_API_KEY: 'test',
      LLM_PROVIDER: 'openai',
      LLM_MODEL: 'gpt-4o',
      SSH_KEY_PATH: '/keys/id_rsa',
      MOCK_MODE: true,
      MOCK_PHOENIX: true,
      MOCK_SSH: true,
      MOCK_LLM: true,
    }),
  };
});

const SCRIPTED_DRAFT = {
  summary: 'The nginx service was down due to a misconfigured port binding.',
  rootCause: 'Port 80 was already in use by another process.',
  actionsTaken: 'Identified the conflicting process and restarted nginx with the corrected config.',
  commandsSummary: 'systemctl status nginx (exit 3); fuser -k 80/tcp (exit 0); systemctl start nginx (exit 0)',
  validationResult: 'curl localhost returned HTTP 200; service confirmed active after restart.',
};

function makeScriptedModel(output: Record<string, string>): LanguageModelV1 {
  return {
    specificationVersion: 'v1',
    provider: 'mock',
    modelId: 'mock-scripted',
    defaultObjectGenerationMode: 'json',
    supportsStructuredOutputs: true,
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: 'stop' as const,
      usage: { promptTokens: 0, completionTokens: 0 },
      text: JSON.stringify(output),
    }),
    doStream: async () => {
      throw new Error('mock model does not support streaming');
    },
  };
}

function makeThrowingModel(): LanguageModelV1 {
  return {
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
}

function makeCapturingModel(output: Record<string, string>, captured: { prompt?: string }) {
  return {
    specificationVersion: 'v1' as const,
    provider: 'mock',
    modelId: 'mock-capture',
    defaultObjectGenerationMode: 'json' as const,
    supportsStructuredOutputs: true,
    doGenerate: async (opts: { prompt: unknown }) => {
      captured.prompt = JSON.stringify(opts.prompt);
      return {
        rawCall: { rawPrompt: null, rawSettings: {} },
        finishReason: 'stop' as const,
        usage: { promptTokens: 0, completionTokens: 0 },
        text: JSON.stringify(output),
      };
    },
    doStream: async () => {
      throw new Error('mock model does not support streaming');
    },
  };
}

const SAMPLE_INPUT = {
  auditEvents: [
    { type: 'run.started', actor: 'system', ts: '2026-06-07T10:00:00Z', payload_json: '{}' },
    { type: 'command.executed', actor: 'ssh', ts: '2026-06-07T10:01:00Z', payload_json: '{"command":"systemctl status nginx"}' },
  ],
  commandResults: [
    { command: 'systemctl status nginx', exitCode: 3, stdoutRedacted: 'Active: inactive', stderrRedacted: '' },
    { command: 'systemctl start nginx', exitCode: 0, stdoutRedacted: '', stderrRedacted: '' },
  ],
  observations: ['nginx was inactive', 'nginx started successfully'],
  ticketDescription: 'Customer reports nginx is not responding on port 80.',
};

beforeEach(() => {
  setDb(makeJsonlAdapter());
});

afterEach(() => {
  resetDb();
  vi.clearAllMocks();
});

describe('runActivityLogGenerator', () => {
  it('happy path: returns all 5 fields populated from scripted model output', async () => {
    const { runActivityLogGenerator } = await import('../ai/agents/activity-log-generator.js');
    const model = makeScriptedModel(SCRIPTED_DRAFT);
    const result = await runActivityLogGenerator(SAMPLE_INPUT, model);

    expect(result.summary).toBe(SCRIPTED_DRAFT.summary);
    expect(result.rootCause).toBe(SCRIPTED_DRAFT.rootCause);
    expect(result.actionsTaken).toBe(SCRIPTED_DRAFT.actionsTaken);
    expect(result.commandsSummary).toBe(SCRIPTED_DRAFT.commandsSummary);
    expect(result.validationResult).toBe(SCRIPTED_DRAFT.validationResult);
  });

  it('MOCK_ACTIVITY_DRAFT has all 5 non-empty string fields', async () => {
    const { MOCK_ACTIVITY_DRAFT } = await import('../ai/agents/activity-log-generator.js');

    expect(typeof MOCK_ACTIVITY_DRAFT.summary).toBe('string');
    expect(MOCK_ACTIVITY_DRAFT.summary.length).toBeGreaterThan(0);
    expect(typeof MOCK_ACTIVITY_DRAFT.rootCause).toBe('string');
    expect(MOCK_ACTIVITY_DRAFT.rootCause.length).toBeGreaterThan(0);
    expect(typeof MOCK_ACTIVITY_DRAFT.actionsTaken).toBe('string');
    expect(MOCK_ACTIVITY_DRAFT.actionsTaken.length).toBeGreaterThan(0);
    expect(typeof MOCK_ACTIVITY_DRAFT.commandsSummary).toBe('string');
    expect(MOCK_ACTIVITY_DRAFT.commandsSummary.length).toBeGreaterThan(0);
    expect(typeof MOCK_ACTIVITY_DRAFT.validationResult).toBe('string');
    expect(MOCK_ACTIVITY_DRAFT.validationResult.length).toBeGreaterThan(0);
  });

  it('throws AgentUnavailableError when the model rejects', async () => {
    const { runActivityLogGenerator } = await import('../ai/agents/activity-log-generator.js');
    const { AgentUnavailableError } = await import('../ai/agents/problem-analyzer.js');
    const model = makeThrowingModel();

    await expect(runActivityLogGenerator(SAMPLE_INPUT, model)).rejects.toBeInstanceOf(AgentUnavailableError);
  });

  it('throws AgentUnavailableError on timeout (fake timers advance 31s)', async () => {
    vi.useFakeTimers();
    const { runActivityLogGenerator } = await import('../ai/agents/activity-log-generator.js');
    const { AgentUnavailableError } = await import('../ai/agents/problem-analyzer.js');

    const neverModel: LanguageModelV1 = {
      specificationVersion: 'v1',
      provider: 'mock',
      modelId: 'mock-never',
      defaultObjectGenerationMode: 'json',
      supportsStructuredOutputs: true,
      doGenerate: () => new Promise<never>(() => { /* never resolves */ }),
      doStream: async () => {
        throw new Error('mock model does not support streaming');
      },
    };

    const assertion = expect(runActivityLogGenerator(SAMPLE_INPUT, neverModel)).rejects.toBeInstanceOf(AgentUnavailableError);
    await vi.advanceTimersByTimeAsync(31_000);

    await assertion;
    vi.useRealTimers();
  });

  it('commandsSummary grounding: input commandResults appear in the prompt passed to the model', async () => {
    const { runActivityLogGenerator } = await import('../ai/agents/activity-log-generator.js');
    const captured: { prompt?: string } = {};
    const model = makeCapturingModel(SCRIPTED_DRAFT, captured) as unknown as LanguageModelV1;

    await runActivityLogGenerator(SAMPLE_INPUT, model);

    expect(captured.prompt).toBeDefined();
    expect(captured.prompt).toContain('systemctl status nginx');
    expect(captured.prompt).toContain('systemctl start nginx');
  });
});
