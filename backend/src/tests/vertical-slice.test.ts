import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from '../app.js';
import { makeJsonlAdapter, resetDb, setDb, getDb } from '../store/db.js';
import { getAuditEvents } from '../store/audit.js';

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
      SSH_PRIVATE_KEY_PATH: '/keys/id_rsa',
      SSH_USERNAME: 'azureuser',
      PORT: 8000,
      MOCK_MODE: true,
      MOCK_PHOENIX: true,
      MOCK_SSH: true,
      MOCK_LLM: true,
      MOCK_SCENARIOS: false,
    }),
  };
});

type PendingApproval = {
  id: string;
  proposed_command: string;
  risk_level: string;
};

type RunStepResponse = {
  status: string;
  phase: string;
  pendingApproval: PendingApproval | null;
};

type ApprovalResponse = {
  status: string;
  phase: string;
  approvalId: string;
  safetyRecheck: {
    riskLevel: string;
    allowed: boolean;
  };
  result: {
    command: string;
    exit_code: number;
  } | null;
};

type ActivityDraftResponse = {
  summary: string;
  root_cause: string;
  actions_taken: string;
  commands_summary: string;
  validation_result: string;
};

beforeEach(() => {
  setDb(makeJsonlAdapter());
});

afterEach(() => {
  resetDb();
  vi.clearAllMocks();
});

async function postJson<T>(path: string, body: unknown): Promise<{ status: number; body: T }> {
  const res = await app.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() as T };
}

async function advanceRun(runId: string): Promise<RunStepResponse> {
  const res = await app.request(`/api/runs/${runId}/next`, { method: 'POST' });
  expect(res.status).toBe(200);
  return await res.json() as RunStepResponse;
}

async function readSseUntil(runId: string, eventType: string): Promise<string> {
  const controller = new AbortController();
  const res = await app.request(`/api/runs/${runId}/events`, { signal: controller.signal });
  expect(res.status).toBe(200);
  expect(res.headers.get('content-type')).toContain('text/event-stream');

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('SSE response body is missing');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  const deadline = Date.now() + 2_000;

  try {
    while (Date.now() < deadline) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      if (buffer.includes(`event: ${eventType}`)) {
        return buffer;
      }
    }
  } finally {
    controller.abort();
    await reader.cancel();
  }

  throw new Error(`SSE event ${eventType} not found. Received: ${buffer}`);
}

function expectLatestCommandResult(approvalId: string, command: string) {
  const row = getDb().get<{ command: string; exit_code: number }>(
    'SELECT command, exit_code FROM command_results WHERE approval_id = ? ORDER BY created_at DESC LIMIT 1',
    [approvalId],
  );
  expect(row).toEqual(expect.objectContaining({ command }));
  return row;
}

describe('vertical service-desk slice', () => {
  it('covers run creation, SSE consumption, edited approval execution, validation, and activity submission', async () => {
    const create = await postJson<{
      runId: string;
      status: string;
      ticket: { id: number; title: string };
      customerSystem: { ip: string; port: number; username: string };
    }>('/api/runs', { ticketId: 1 });

    expect(create.status).toBe(201);
    expect(create.body.status).toBe('LOADED_CONTEXT');
    expect(create.body.ticket).toEqual(expect.objectContaining({
      id: 1,
      title: 'Service unavailable',
    }));
    expect(create.body.customerSystem).toEqual(expect.objectContaining({
      ip: '10.0.0.1',
      port: 22,
      username: 'azureuser',
    }));

    const runId = create.body.runId;
    const diagnosticStep = await advanceRun(runId);
    expect(diagnosticStep.phase).toBe('WAITING_FOR_APPROVAL');
    expect(diagnosticStep.pendingApproval).toEqual(expect.objectContaining({
      proposed_command: 'systemctl status status-api --no-pager',
    }));

    const sseBackfill = await readSseUntil(runId, 'approval.required');
    expect(sseBackfill).toContain('event: approval.required');
    expect(sseBackfill).toContain('systemctl status status-api --no-pager');

    const diagnosticApproval = diagnosticStep.pendingApproval;
    expect(diagnosticApproval).not.toBeNull();
    const diagnosticCommand = 'systemctl status status-api';
    const diagnosticApprovalRes = await postJson<ApprovalResponse>(
      `/api/runs/${runId}/approvals/${diagnosticApproval!.id}/approve`,
      { editedCommand: diagnosticCommand },
    );
    expect(diagnosticApprovalRes.status).toBe(200);
    expect(diagnosticApprovalRes.body.phase).toBe('OBSERVING');
    expect(diagnosticApprovalRes.body.safetyRecheck.allowed).toBe(true);
    expect(diagnosticApprovalRes.body.result).toEqual(expect.objectContaining({
      command: diagnosticCommand,
      exit_code: 0,
    }));
    expectLatestCommandResult(diagnosticApproval!.id, diagnosticCommand);

    const rootCauseStep = await advanceRun(runId);
    expect(rootCauseStep.phase).toBe('PLANNING_FIX');

    const fixStep = await advanceRun(runId);
    expect(fixStep.phase).toBe('WAITING_FOR_APPROVAL');
    expect(fixStep.pendingApproval).toEqual(expect.objectContaining({
      proposed_command: 'sudo systemctl restart status-api',
    }));

    const fixApproval = fixStep.pendingApproval;
    expect(fixApproval).not.toBeNull();
    const fixApprovalRes = await postJson<ApprovalResponse>(
      `/api/runs/${runId}/approvals/${fixApproval!.id}/approve`,
      {},
    );
    expect(fixApprovalRes.status).toBe(200);
    expect(fixApprovalRes.body.phase).toBe('VALIDATING');
    expect(fixApprovalRes.body.result).toEqual(expect.objectContaining({
      command: 'sudo systemctl restart status-api',
      exit_code: 0,
    }));

    const validationStep = await advanceRun(runId);
    expect(validationStep.phase).toBe('DRAFTING_ACTIVITY');

    const activityReviewStep = await advanceRun(runId);
    expect(activityReviewStep.phase).toBe('WAITING_FOR_ACTIVITY_REVIEW');

    const draftRes = await app.request(`/api/runs/${runId}/activity/draft`, { method: 'POST' });
    expect(draftRes.status).toBe(200);
    const draft = await draftRes.json() as ActivityDraftResponse;
    expect(draft).toEqual(expect.objectContaining({
      summary: expect.stringContaining('status-api'),
      actions_taken: expect.stringContaining('restarted'),
      commands_summary: expect.stringContaining('sudo systemctl restart status-api'),
      validation_result: expect.stringContaining('verified'),
    }));

    const submit = await postJson<{ id: number }>(`/api/runs/${runId}/activity/submit`, {});
    expect(submit.status).toBe(200);
    expect(submit.body.id).toBeTypeOf('number');

    const finalRunRes = await app.request(`/api/runs/${runId}`);
    expect(finalRunRes.status).toBe(200);
    const finalRun = await finalRunRes.json() as { status: string; phase: string; activityDraft: { submitted: number } };
    expect(finalRun.status).toBe('COMPLETED');
    expect(finalRun.phase).toBe('COMPLETED');
    expect(finalRun.activityDraft.submitted).toBe(1);

    const eventTypes = getAuditEvents(runId).map((event) => event.type);
    expect(eventTypes).toContain('approval.required');
    expect(eventTypes).toContain('command.approved');
    expect(eventTypes).toContain('command.completed');
    expect(eventTypes).toContain('validation.completed');
    expect(eventTypes).toContain('activity.drafted');
    expect(eventTypes).toContain('activity.submitted');
    expect(eventTypes).toContain('ticket.status_updated');
  });
});
