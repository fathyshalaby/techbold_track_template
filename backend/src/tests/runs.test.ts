import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from '../app.js';
import { makeJsonlAdapter, setDb, resetDb } from '../store/db.js';

// Force mock mode — no real env or Phoenix needed
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

beforeEach(() => {
  setDb(makeJsonlAdapter());
});

afterEach(() => {
  resetDb();
  vi.clearAllMocks();
});

describe('POST /api/runs', () => {
  it('returns 201 with status exactly LOADED_CONTEXT for a valid ticketId', async () => {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 1 }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { runId: string; status: string; ticket: unknown; customerSystem: unknown };
    expect(body.status).toBe('LOADED_CONTEXT');
    expect(typeof body.runId).toBe('string');
    expect(body.runId.length).toBeGreaterThan(0);
  });

  it('returns ticket and customerSystem in the 201 response', async () => {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = await res.json() as {
      ticket: { id: number; title: string; priority: string; status: string; customer_name: string };
      customerSystem: { ip: string; port: number; username: string; os: string };
    };
    expect(body.ticket.id).toBe(1);
    expect(body.ticket.title).toBe('Service unavailable');
    expect(body.ticket.customer_name).toBe('Acme Corp');
    expect(body.customerSystem.ip).toBe('10.0.0.1');
    expect(body.customerSystem.port).toBe(22);
    expect(body.customerSystem.username).toBe('azureuser');
  });

  it('does NOT call advance() during POST /', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    const advanceSpy = vi.spyOn(orchestratorModule, 'advance');

    await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 1 }),
    });

    expect(advanceSpy).not.toHaveBeenCalled();
  });

  it('stores customerSystemId as ip:port (colon-separated, no protocol prefix)', async () => {
    const { createRun } = await import('../store/runs.js');
    const createRunSpy = vi.spyOn(await import('../store/runs.js'), 'createRun');

    await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 1 }),
    });

    expect(createRunSpy).toHaveBeenCalledOnce();
    const [, customerSystemId] = createRunSpy.mock.calls[0] as [number, string];
    expect(customerSystemId).toBe('10.0.0.1:22');
    expect(customerSystemId).not.toMatch(/^https?:\/\//);
  });

  it('returns 400 for missing ticketId', async () => {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('invalid request body');
  });

  it('returns 400 for non-integer ticketId', async () => {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 'abc' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('invalid request body');
  });

  it('returns 404 for unknown ticketId (no customer system in mock)', async () => {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 9999 }),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('ticket or customer system not found');
  });
});

describe('GET /api/runs/:runId', () => {
  async function createRun(): Promise<string> {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = await res.json() as { runId: string };
    return body.runId;
  }

  it('returns 200 with runId, status, timeline, pendingApproval, activityDraft for a known run', async () => {
    const runId = await createRun();
    const res = await app.request(`/api/runs/${runId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as {
      runId: string;
      status: string;
      phase: string;
      timeline: unknown[];
      pendingApproval: unknown;
      activityDraft: unknown;
    };
    expect(body.runId).toBe(runId);
    expect(typeof body.status).toBe('string');
    expect(typeof body.phase).toBe('string');
    expect(Array.isArray(body.timeline)).toBe(true);
    expect('pendingApproval' in body).toBe(true);
    expect('activityDraft' in body).toBe(true);
  });

  it('returns 404 for unknown runId', async () => {
    const res = await app.request('/api/runs/run_nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('run not found');
  });
});

describe('POST /api/runs/:runId/next', () => {
  async function createRun(): Promise<string> {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = await res.json() as { runId: string };
    return body.runId;
  }

  it('returns 200 with status and pendingApproval after advancing', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce({
      runId: 'run_test',
      phase: 'WAITING_FOR_APPROVAL',
      status: 'RUNNING',
      stepCount: 1,
      ticketId: 1,
      customerSystemId: '10.0.0.1:22',
    });

    const runId = await createRun();
    const res = await app.request(`/api/runs/${runId}/next`, { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; phase: string; pendingApproval: unknown };
    expect(typeof body.status).toBe('string');
    expect('pendingApproval' in body).toBe(true);
  });

  it('returns 404 for unknown runId', async () => {
    const res = await app.request('/api/runs/run_nonexistent/next', { method: 'POST' });
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('run not found');
  });
});

describe('POST /api/runs/:runId/abort', () => {
  async function createRun(): Promise<string> {
    const res = await app.request('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 1 }),
    });
    const body = await res.json() as { runId: string };
    return body.runId;
  }

  it('returns 200 with status ABORTED after aborting', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce({
      runId: 'run_test',
      phase: 'ABORTED',
      status: 'ABORTED',
      stepCount: 0,
      ticketId: 1,
      customerSystemId: '10.0.0.1:22',
    });

    const runId = await createRun();
    const res = await app.request(`/api/runs/${runId}/abort`, { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('ABORTED');
  });

  it('returns 404 for unknown runId', async () => {
    const res = await app.request('/api/runs/run_nonexistent/abort', { method: 'POST' });
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('run not found');
  });
});
