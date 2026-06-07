import { describe, it, expect } from 'vitest';
import { guardModelInput } from './input-guard.js';

describe('LLM input guard (guardModelInput)', () => {
  it('redacts secrets in a ticket description before it reaches the model', () => {
    const out = guardModelInput({
      ticketDescription: 'login broken, db url is postgres://app:hunter2@db:5432/app',
      observations: [],
    });
    expect(out).not.toContain('hunter2');
    expect(out).toContain('«redacted»');
  });

  it('redacts secrets nested inside arrays of observations', () => {
    const out = guardModelInput({
      ticketDescription: 'x',
      observations: ['normal line', 'Authorization: Bearer abcdef0123456789'],
    });
    expect(out).not.toContain('abcdef0123456789');
  });

  it('returns valid JSON with structure preserved', () => {
    const parsed = JSON.parse(
      guardModelInput({ ticketDescription: 'hi', observations: ['a', 'b'], runbook: 'rb' }),
    );
    expect(parsed.ticketDescription).toBe('hi');
    expect(parsed.observations).toEqual(['a', 'b']);
    expect(parsed.runbook).toBe('rb');
  });

  it('redacts a JWT and an api key field anywhere in the payload', () => {
    const out = guardModelInput({
      ticketDescription: 'token=eyJabc.eyJdef.sig api_key=SUPERSECRETKEY',
      observations: [],
    });
    expect(out).not.toContain('SUPERSECRETKEY');
    expect(out).not.toContain('eyJabc.eyJdef.sig');
  });
});
