import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from '../app.js';
import { makeJsonlAdapter, setDb, resetDb } from '../store/db.js';
import { createRun } from '../store/runs.js';
import { createPendingApproval, updateApprovalStatus } from '../store/audit.js';
import { RiskLevel } from '../safety/risk-levels.js';

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

function makeObservingState(runId: string) {
  return {
    runId,
    phase: 'OBSERVING' as const,
    status: 'RUNNING' as const,
    stepCount: 1,
    ticketId: 1,
    customerSystemId: '10.0.0.1:22',
  };
}

function makeTriagingState(runId: string) {
  return {
    runId,
    phase: 'TRIAGING' as const,
    status: 'RUNNING' as const,
    stepCount: 0,
    ticketId: 1,
    customerSystemId: '10.0.0.1:22',
  };
}

function makeWaitingState(runId: string) {
  return {
    runId,
    phase: 'WAITING_FOR_APPROVAL' as const,
    status: 'RUNNING' as const,
    stepCount: 1,
    ticketId: 1,
    customerSystemId: '10.0.0.1:22',
  };
}

async function seedRunWithApproval(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'BLOCKED' = 'PENDING', riskLevel = RiskLevel.SAFE_READ_ONLY) {
  const run = createRun(1, '10.0.0.1:22');
  const approval = createPendingApproval(run.id, {
    proposedCommand: 'systemctl status nginx',
    purpose: 'Check nginx status',
    expectedSignal: 'service status output',
    riskLevel,
    safetyNotes: '',
  });
  if (status !== 'PENDING') {
    updateApprovalStatus(approval.id, { status, decidedAt: new Date().toISOString() });
  }
  return { run, approval };
}

beforeEach(() => {
  setDb(makeJsonlAdapter());
});

afterEach(() => {
  resetDb();
  vi.clearAllMocks();
});

describe('POST /api/runs/:runId/approvals/:approvalId/approve', () => {
  it('returns 200 with phase OBSERVING when no editedCommand', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    const { run, approval } = await seedRunWithApproval();

    vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce(makeObservingState(run.id));

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/approve`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { phase: string; status: string; approvalId: string };
    expect(body.phase).toBe('OBSERVING');
    expect(body.approvalId).toBe(approval.id);
  });

  it('calls advance with finalCommand = editedCommand when editedCommand is provided', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    const { run, approval } = await seedRunWithApproval();

    const advanceSpy = vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce(makeObservingState(run.id));

    await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedCommand: 'systemctl status nginx --no-pager' }),
      },
    );

    expect(advanceSpy).toHaveBeenCalledWith(
      run.id,
      expect.objectContaining({ type: 'command_approved', finalCommand: 'systemctl status nginx --no-pager' }),
    );
  });

  it('returns 422 with riskLevel when advance returns WAITING_FOR_APPROVAL (blocked command)', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    const { run, approval } = await seedRunWithApproval('PENDING', RiskLevel.SAFE_READ_ONLY);

    vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce(makeWaitingState(run.id));

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/approve`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ editedCommand: 'rm -rf /' }) },
    );

    expect(res.status).toBe(422);
    const body = await res.json() as { error: string; riskLevel: string };
    expect(body.error).toBe('command blocked by safety policy');
    expect(body.riskLevel).toBe('HIGH_RISK_BLOCKED');
  });

  it('returns 409 when approval is already EXECUTED', async () => {
    const { run, approval } = await seedRunWithApproval('EXECUTED');

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/approve`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string; status: string };
    expect(body.error).toBe('approval already decided');
    expect(body.status).toBe('EXECUTED');
  });

  it('returns 409 when approval is APPROVED', async () => {
    const { run, approval } = await seedRunWithApproval('APPROVED');

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/approve`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(409);
  });

  it('safetyRecheck.riskLevel equals the stored approval.risk_level (not hardcoded)', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    const { run, approval } = await seedRunWithApproval('PENDING', RiskLevel.LOW_RISK_CHANGE);

    vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce(makeObservingState(run.id));

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/approve`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );

    expect(res.status).toBe(200);
    const body = await res.json() as { safetyRecheck: { riskLevel: string; allowed: boolean } };
    expect(body.safetyRecheck.riskLevel).toBe(RiskLevel.LOW_RISK_CHANGE);
    expect(body.safetyRecheck.allowed).toBe(true);
  });

  it('returns 404 for unknown runId', async () => {
    const res = await app.request(
      '/api/runs/run_nonexistent/approvals/appr_abc/approve',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('run not found');
  });

  it('returns 404 for unknown approvalId', async () => {
    const { run } = await seedRunWithApproval();

    const res = await app.request(
      `/api/runs/${run.id}/approvals/appr_nonexistent/approve`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
    );
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('approval not found');
  });
});

describe('POST /api/runs/:runId/approvals/:approvalId/reject', () => {
  it('returns 200 with status TRIAGING when rejected with reason', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    const { run, approval } = await seedRunWithApproval();

    vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce(makeTriagingState(run.id));

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'command looks risky' }),
      },
    );

    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; phase: string };
    expect(body.status).toBe('RUNNING');
    expect(body.phase).toBe('TRIAGING');
  });

  it('calls advance with command_rejected event and the reason', async () => {
    const orchestratorModule = await import('../ai/orchestrator.js');
    const { run, approval } = await seedRunWithApproval();

    const advanceSpy = vi.spyOn(orchestratorModule, 'advance').mockResolvedValueOnce(makeTriagingState(run.id));

    await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'too dangerous' }),
      },
    );

    expect(advanceSpy).toHaveBeenCalledWith(
      run.id,
      expect.objectContaining({ type: 'command_rejected', reason: 'too dangerous' }),
    );
  });

  it('returns 400 when reason is empty string', async () => {
    const { run, approval } = await seedRunWithApproval();

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '' }),
      },
    );

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('reason is required');
  });

  it('returns 400 when reason is missing', async () => {
    const { run, approval } = await seedRunWithApproval();

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('reason is required');
  });

  it('returns 409 when approval is not PENDING', async () => {
    const { run, approval } = await seedRunWithApproval('REJECTED');

    const res = await app.request(
      `/api/runs/${run.id}/approvals/${approval.id}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'try again' }),
      },
    );

    expect(res.status).toBe(409);
    const body = await res.json() as { error: string; status: string };
    expect(body.error).toBe('approval already decided');
    expect(body.status).toBe('REJECTED');
  });

  it('returns 404 for unknown runId', async () => {
    const res = await app.request(
      '/api/runs/run_nonexistent/approvals/appr_abc/reject',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'nope' }),
      },
    );
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('run not found');
  });

  it('returns 404 for unknown approvalId', async () => {
    const { run } = await seedRunWithApproval();

    const res = await app.request(
      `/api/runs/${run.id}/approvals/appr_nonexistent/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'nope' }),
      },
    );

    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('approval not found');
  });
});
