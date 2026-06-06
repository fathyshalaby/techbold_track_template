import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from '../app.js';

// Force mock mode so routes use MockPhoenixClient without real env vars
vi.mock('../env.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../env.js')>();
  return {
    ...actual,
    resolveClientMode: vi.fn().mockReturnValue('mock'),
    getEnv: vi.fn().mockReturnValue({
      PHOENIX_API_URL: 'http://localhost',
      PHOENIX_API_TOKEN: 'test',
      OPENAI_API_KEY: 'test',
      LLM_PROVIDER: 'openai',
      LLM_MODEL: 'gpt-4o',
      SSH_KEY_PATH: '/keys/id_rsa',
      MOCK_MODE: false,
      MOCK_PHOENIX: true,
      MOCK_SSH: false,
      MOCK_LLM: false,
    }),
  };
});

// Reset mock ticket statuses between tests (setStatus mutates MOCK_TICKETS in place)
beforeEach(async () => {
  const { MOCK_TICKETS } = await import('../phoenix/mock.js');
  // Restore original statuses: ids 1,2 => OPEN, 3 => PENDING, 4 => DONE
  const origStatuses: Record<number, 'OPEN' | 'PENDING' | 'DONE'> = { 1: 'OPEN', 2: 'OPEN', 3: 'PENDING', 4: 'DONE' };
  for (const t of MOCK_TICKETS) {
    t.status = origStatuses[t.id] ?? t.status;
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/tickets', () => {
  it('returns 200 with an array of 4 tickets in mock mode', async () => {
    const res = await app.request('/api/tickets');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(4);
  });

  it('filters by status=OPEN — returns only OPEN tickets', async () => {
    const res = await app.request('/api/tickets?status=OPEN');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<{ status: string }>;
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((t) => t.status === 'OPEN')).toBe(true);
  });

  it('sorts by priority when sort=priority', async () => {
    const res = await app.request('/api/tickets?sort=priority');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<{ priority: string }>;
    const order = { high: 0, medium: 1, low: 2 } as Record<string, number>;
    for (let i = 1; i < body.length; i++) {
      expect((order[body[i].priority] ?? 99)).toBeGreaterThanOrEqual(order[body[i - 1].priority] ?? 0);
    }
  });

  it('returns 200 [] when upstream returns empty (filter that matches nothing)', async () => {
    const res = await app.request('/api/tickets?status=PENDING&priority=low');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
  });
});

describe('GET /api/tickets/:id', () => {
  it('returns 200 with a single ticket for a valid id', async () => {
    const res = await app.request('/api/tickets/1');
    expect(res.status).toBe(200);
    const body = await res.json() as { id: number };
    expect(body.id).toBe(1);
  });

  it('returns 404 for an unknown ticket id', async () => {
    const res = await app.request('/api/tickets/9999');
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBeDefined();
  });

  it('returns 400 for a non-integer id', async () => {
    const res = await app.request('/api/tickets/abc');
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBeDefined();
  });
});

describe('GET /api/tickets/:id/customer-system', () => {
  it('returns 200 with CustomerSystem for a valid ticket id', async () => {
    const res = await app.request('/api/tickets/1/customer-system');
    expect(res.status).toBe(200);
    const body = await res.json() as { ticket_id: number; system: { port: number } };
    expect(body.ticket_id).toBe(1);
    expect(body.system.port).toBe(22);
  });

  it('returns 404 for an unknown ticket id', async () => {
    const res = await app.request('/api/tickets/9999/customer-system');
    expect(res.status).toBe(404);
  });

  it('returns 400 for a non-integer id', async () => {
    const res = await app.request('/api/tickets/abc/customer-system');
    expect(res.status).toBe(400);
  });
});

describe('Error mapping — PhoenixAuthError → 502', () => {
  it('returns 502 when upstream throws PhoenixAuthError', async () => {
    const { PhoenixAuthError } = await import('../phoenix/client.js');
    const mockModule = await import('../phoenix/mock.js');
    const spy = vi.spyOn(mockModule.default.prototype, 'listTickets').mockRejectedValueOnce(
      new PhoenixAuthError('401 from upstream'),
    );
    const res = await app.request('/api/tickets');
    expect(res.status).toBe(502);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('upstream authentication failed');
    spy.mockRestore();
  });
});

describe('Error mapping — PhoenixValidationError → 502', () => {
  it('returns 502 with opaque message when listTickets throws PhoenixValidationError', async () => {
    const { PhoenixValidationError } = await import('../phoenix/client.js');
    const mockModule = await import('../phoenix/mock.js');
    const spy = vi.spyOn(mockModule.default.prototype, 'listTickets').mockRejectedValueOnce(
      new PhoenixValidationError('Response shape mismatch: unexpected field'),
    );
    const res = await app.request('/api/tickets');
    expect(res.status).toBe(502);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('ERP returned an unexpected response');
    spy.mockRestore();
  });
});
