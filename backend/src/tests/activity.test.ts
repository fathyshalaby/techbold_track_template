import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { makeJsonlAdapter, setDb, resetDb } from '../store/db.js';
import { createRun } from '../store/runs.js';
import { updateRunPhase } from '../store/runs.js';
import { saveActivityDraft, getAuditEvents, appendAuditEvent } from '../store/audit.js';
import { activityRouter } from '../routes/activity.js';
import { AgentUnavailableError } from '../ai/agents/activity-log-generator.js';
import { PhoenixNetworkError } from '../phoenix/client.js';

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

const testApp = new Hono();
testApp.route('/api/runs', activityRouter);

const MOCK_DRAFT_OUTPUT = {
  summary: 'nginx was stopped due to port conflict',
  rootCause: 'Port 80 bound by another process',
  actionsTaken: 'Identified conflict, killed process, restarted nginx',
  commandsSummary: '$ systemctl status nginx (exit 1)\n$ systemctl restart nginx (exit 0)',
  validationResult: 'Service verified running; HTTP 200 returned',
};

beforeEach(() => {
  setDb(makeJsonlAdapter());
});

afterEach(() => {
  resetDb();
  vi.clearAllMocks();
});

describe('POST /api/runs/:runId/activity/draft', () => {
  it('Test 1 (happy path): returns 200 with all 5 fields for WAITING_FOR_ACTIVITY_REVIEW run', async () => {
    const agentModule = await import('../ai/agents/activity-log-generator.js');
    vi.spyOn(agentModule, 'runActivityLogGenerator').mockResolvedValueOnce(MOCK_DRAFT_OUTPUT);

    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/draft`,
      { method: 'POST' },
    );

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['id']).toBeDefined();
    expect(body['run_id']).toBe(run.id);
    expect(typeof body['summary']).toBe('string');
    expect((body['summary'] as string).length).toBeGreaterThan(0);
    expect(typeof body['root_cause']).toBe('string');
    expect((body['root_cause'] as string).length).toBeGreaterThan(0);
    expect(typeof body['actions_taken']).toBe('string');
    expect((body['actions_taken'] as string).length).toBeGreaterThan(0);
    expect(typeof body['commands_summary']).toBe('string');
    expect((body['commands_summary'] as string).length).toBeGreaterThan(0);
    expect(typeof body['validation_result']).toBe('string');
    expect((body['validation_result'] as string).length).toBeGreaterThan(0);
  });

  it('Test 2 (phase guard — too early): returns 409 for LOADED_CONTEXT run', async () => {
    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'LOADED_CONTEXT');

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/draft`,
      { method: 'POST' },
    );

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/phase/i);
  });

  it('Test 3 (COMPLETED allowed): returns 200 for COMPLETED run', async () => {
    const agentModule = await import('../ai/agents/activity-log-generator.js');
    vi.spyOn(agentModule, 'runActivityLogGenerator').mockResolvedValueOnce(MOCK_DRAFT_OUTPUT);

    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'COMPLETED');

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/draft`,
      { method: 'POST' },
    );

    expect(res.status).toBe(200);
  });

  it('Test 4 (agent unavailable): returns 502 when runActivityLogGenerator throws AgentUnavailableError', async () => {
    const agentModule = await import('../ai/agents/activity-log-generator.js');
    vi.spyOn(agentModule, 'runActivityLogGenerator').mockRejectedValueOnce(
      new AgentUnavailableError('agent unavailable: activity-log-generator'),
    );

    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/draft`,
      { method: 'POST' },
    );

    expect(res.status).toBe(502);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('agent unavailable');
  });

  it('Test 5 (unknown run): returns 404', async () => {
    const res = await testApp.request(
      '/api/runs/run_nonexistent/activity/draft',
      { method: 'POST' },
    );

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('run not found');
  });
});

describe('POST /api/runs/:runId/activity/submit', () => {
  it('Test 6 (happy path): returns 200 with Phoenix Activity record', async () => {
    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');

    saveActivityDraft(run.id, {
      summary: 'summary text',
      rootCause: 'root cause text',
      actionsTaken: 'actions taken text',
      commandsSummary: 'commands summary text',
      validationResult: 'validation result text',
    });

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/submit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['id']).toBeDefined();
    expect(body['ticket_id']).toBe(1);
  });

  it('Test 6b (idempotency): a second submit returns 409 (no duplicate ERP activity)', async () => {
    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');
    saveActivityDraft(run.id, {
      summary: 's', rootCause: 'rc', actionsTaken: 'a', commandsSummary: 'c', validationResult: 'v',
    });

    const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' };
    const first = await testApp.request(`/api/runs/${run.id}/activity/submit`, opts);
    expect(first.status).toBe(200); // run is now COMPLETED

    const second = await testApp.request(`/api/runs/${run.id}/activity/submit`, opts);
    expect(second.status).toBe(409);
    expect((await second.json() as Record<string, unknown>)['error']).toBe('activity already submitted');
  });

  it('Test 6c (ticket close): submit sets the ERP ticket status to DONE when the fix was validated', async () => {
    const phoenixModule = await import('../phoenix/mock.js');
    const setStatusSpy = vi.spyOn(phoenixModule.default.prototype, 'setStatus');

    const run = createRun(7, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');
    // A validated fix is what authorises closing the ticket.
    appendAuditEvent(run.id, 'validation.completed', 'agent', { status: 'VERIFIED_FIXED' });
    saveActivityDraft(run.id, {
      summary: 's', rootCause: 'rc', actionsTaken: 'a', commandsSummary: 'c', validationResult: 'v',
    });

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/submit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
    );

    expect(res.status).toBe(200);
    expect(setStatusSpy).toHaveBeenCalledWith(7, 'DONE');
    setStatusSpy.mockRestore();
  });

  it('Test 6c-2 (no over-claim): submit does NOT close the ticket when no fix was validated', async () => {
    const phoenixModule = await import('../phoenix/mock.js');
    const setStatusSpy = vi.spyOn(phoenixModule.default.prototype, 'setStatus');

    // Reached activity review via the MAX_STEPS cap without a validation.completed event.
    const run = createRun(8, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');
    saveActivityDraft(run.id, {
      summary: 's', rootCause: 'rc', actionsTaken: 'a', commandsSummary: 'c', validationResult: 'v',
    });

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/submit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
    );

    // The activity (scored record) is still created…
    expect(res.status).toBe(200);
    // …but the ticket is left OPEN — no DONE — and the trail records why.
    expect(setStatusSpy).not.toHaveBeenCalled();
    const left = getAuditEvents(run.id).some((e) => e.type === 'ticket.left_open_unvalidated');
    expect(left).toBe(true);
    setStatusSpy.mockRestore();
  });

  it('Test 7 (field overrides): uses technician-edited summary when provided', async () => {
    const runsModule = await import('../routes/activity.js');
    // Use the test app which has activityRouter mounted; spy on phoenix client via runs module
    const phoenixModule = await import('../phoenix/mock.js');
    const createActivitySpy = vi.spyOn(phoenixModule.default.prototype, 'createActivity');
    createActivitySpy.mockResolvedValueOnce({
      id: 42,
      team_id: 1,
      team_name: 'Support',
      employee_id: 1,
      ticket_id: 1,
      start_datetime: '2026-06-07T00:00:00.000Z',
      end_datetime: '2026-06-07T01:00:00.000Z',
      description: '',
      summary: 'technician edit',
    });

    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');

    saveActivityDraft(run.id, {
      summary: 'original summary',
      rootCause: 'root cause',
      actionsTaken: 'actions taken',
      commandsSummary: 'commands',
      validationResult: 'validation',
    });

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: 'technician edit' }),
      },
    );

    expect(res.status).toBe(200);
    expect(createActivitySpy).toHaveBeenCalledWith(
      expect.objectContaining({ summary: 'technician edit' }),
    );
  });

  it('Test 8 (no draft + no body): returns 409 with "no draft to submit"', async () => {
    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/submit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('no draft to submit');
  });

  it('Test 9 (Phoenix failure): returns 502 when createActivity throws PhoenixNetworkError', async () => {
    const phoenixModule = await import('../phoenix/mock.js');
    vi.spyOn(phoenixModule.default.prototype, 'createActivity').mockRejectedValueOnce(
      new PhoenixNetworkError('connection refused'),
    );

    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');

    saveActivityDraft(run.id, {
      summary: 'summary',
      rootCause: 'root cause',
      actionsTaken: 'actions',
      commandsSummary: 'commands',
      validationResult: 'validation',
    });

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/submit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(502);
    const body = await res.json() as { error: string };
    expect(typeof body.error).toBe('string');
  });

  it('Test 10 (unknown run): returns 404', async () => {
    const res = await testApp.request(
      '/api/runs/run_nonexistent/activity/submit',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('run not found');
  });

  it('Test 11 (audit event): after successful submit, audit log contains activity.submitted event', async () => {
    const run = createRun(1, '10.0.0.1:22');
    updateRunPhase(run.id, 'WAITING_FOR_ACTIVITY_REVIEW');

    saveActivityDraft(run.id, {
      summary: 'summary',
      rootCause: 'root cause',
      actionsTaken: 'actions',
      commandsSummary: 'commands',
      validationResult: 'validation',
    });

    const res = await testApp.request(
      `/api/runs/${run.id}/activity/submit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(200);

    const events = getAuditEvents(run.id);
    const submitted = events.find((e) => e.type === 'activity.submitted');
    expect(submitted).toBeDefined();
  });
});
