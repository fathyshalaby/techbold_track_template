import { describe, it, expect } from 'vitest';
import { parseEnv, resolveClientMode, isMockMode } from '../env.js';

const BASE_ENV = {
  PHOENIX_API_URL: 'https://phoenix.example.com',
  PHOENIX_API_TOKEN: 'tok_test',
  OPENAI_API_KEY: 'sk-test',
};

describe('parseEnv', () => {
  it('returns typed config when all required vars are present', () => {
    const result = parseEnv(BASE_ENV);
    expect(result.PHOENIX_API_URL).toBe('https://phoenix.example.com');
    expect(result.PHOENIX_API_TOKEN).toBe('tok_test');
    expect(result.OPENAI_API_KEY).toBe('sk-test');
    expect(result.LLM_PROVIDER).toBe('openai');
    expect(result.LLM_MODEL).toBe('gpt-4o');
    expect(result.SSH_KEY_PATH).toBe('/keys/id_rsa');
    expect(result.MOCK_MODE).toBe(false);
    expect(result.MOCK_PHOENIX).toBe(false);
    expect(result.MOCK_SSH).toBe(false);
    expect(result.MOCK_LLM).toBe(false);
  });

  it('throws with message containing "PHOENIX_API_URL" when missing', () => {
    const raw = { ...BASE_ENV };
    delete (raw as Record<string, string | undefined>).PHOENIX_API_URL;
    expect(() => parseEnv(raw)).toThrow(/PHOENIX_API_URL/);
  });

  it('throws with message containing "PHOENIX_API_TOKEN" when missing', () => {
    const raw = { ...BASE_ENV };
    delete (raw as Record<string, string | undefined>).PHOENIX_API_TOKEN;
    expect(() => parseEnv(raw)).toThrow(/PHOENIX_API_TOKEN/);
  });

  it('throws with message containing "OPENAI_API_KEY" when missing', () => {
    const raw = { ...BASE_ENV };
    delete (raw as Record<string, string | undefined>).OPENAI_API_KEY;
    expect(() => parseEnv(raw)).toThrow(/OPENAI_API_KEY/);
  });

  it('coerces MOCK_MODE "true" string to boolean true', () => {
    const result = parseEnv({ ...BASE_ENV, MOCK_MODE: 'true' });
    expect(result.MOCK_MODE).toBe(true);
  });

  it('defaults MOCK_MODE to false when absent', () => {
    const result = parseEnv(BASE_ENV);
    expect(result.MOCK_MODE).toBe(false);
  });

  it('coerces MOCK_PHOENIX "true" string to boolean true', () => {
    const result = parseEnv({ ...BASE_ENV, MOCK_PHOENIX: 'true' });
    expect(result.MOCK_PHOENIX).toBe(true);
  });

  it('does not include secret values in error messages (T-02-01)', () => {
    const raw = { PHOENIX_API_TOKEN: 'super-secret-value' } as Record<string, string | undefined>;
    let message = '';
    try {
      parseEnv(raw);
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).not.toContain('super-secret-value');
  });
});

describe('resolveClientMode', () => {
  it('returns "mock" for phoenix when MOCK_MODE=true', () => {
    const result = resolveClientMode('phoenix', parseEnv({ ...BASE_ENV, MOCK_MODE: 'true' }));
    expect(result).toBe('mock');
  });

  it('returns "mock" for ssh when MOCK_MODE=true', () => {
    const result = resolveClientMode('ssh', parseEnv({ ...BASE_ENV, MOCK_MODE: 'true' }));
    expect(result).toBe('mock');
  });

  it('returns "mock" for llm when MOCK_MODE=true', () => {
    const result = resolveClientMode('llm', parseEnv({ ...BASE_ENV, MOCK_MODE: 'true' }));
    expect(result).toBe('mock');
  });

  it('returns "mock" for phoenix when MOCK_MODE=false and MOCK_PHOENIX=true', () => {
    const result = resolveClientMode('phoenix', parseEnv({ ...BASE_ENV, MOCK_PHOENIX: 'true' }));
    expect(result).toBe('mock');
  });

  it('returns "real" for ssh when MOCK_MODE=false and MOCK_PHOENIX=true (per-service isolation)', () => {
    const result = resolveClientMode('ssh', parseEnv({ ...BASE_ENV, MOCK_PHOENIX: 'true' }));
    expect(result).toBe('real');
  });

  it('returns "mock" for llm when MOCK_MODE=false and MOCK_LLM=true', () => {
    const result = resolveClientMode('llm', parseEnv({ ...BASE_ENV, MOCK_LLM: 'true' }));
    expect(result).toBe('mock');
  });

  it('returns "real" for phoenix when all mock flags false', () => {
    const result = resolveClientMode('phoenix', parseEnv(BASE_ENV));
    expect(result).toBe('real');
  });

  it('returns "real" for ssh when all mock flags false', () => {
    const result = resolveClientMode('ssh', parseEnv(BASE_ENV));
    expect(result).toBe('real');
  });

  it('returns "real" for llm when all mock flags false', () => {
    const result = resolveClientMode('llm', parseEnv(BASE_ENV));
    expect(result).toBe('real');
  });
});

describe('isMockMode', () => {
  it('returns true when MOCK_MODE=true', () => {
    expect(isMockMode(parseEnv({ ...BASE_ENV, MOCK_MODE: 'true' }))).toBe(true);
  });

  it('returns true when any per-service flag is true', () => {
    expect(isMockMode(parseEnv({ ...BASE_ENV, MOCK_PHOENIX: 'true' }))).toBe(true);
    expect(isMockMode(parseEnv({ ...BASE_ENV, MOCK_SSH: 'true' }))).toBe(true);
    expect(isMockMode(parseEnv({ ...BASE_ENV, MOCK_LLM: 'true' }))).toBe(true);
  });

  it('returns false when all mock flags are false', () => {
    expect(isMockMode(parseEnv(BASE_ENV))).toBe(false);
  });
});
