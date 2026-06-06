import { describe, it, expect } from 'vitest';
import { makeJsonlAdapter } from '../store/db.js';

describe('JSONL adapter — UPDATE with COALESCE', () => {
  it('aligns params correctly across COALESCE expressions (id is last param)', () => {
    const db = makeJsonlAdapter();
    db.run(
      'INSERT INTO command_approvals (id, run_id, status, edited_command, final_command, technician_reason, decided_at, executed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['appr_1', 'run_1', 'PENDING', null, null, null, null, null],
    );

    // Same SET shape as updateApprovalStatus: COALESCE(?, col) with internal commas
    db.run(
      'UPDATE command_approvals SET status = ?, edited_command = COALESCE(?, edited_command), final_command = COALESCE(?, final_command), technician_reason = COALESCE(?, technician_reason), decided_at = COALESCE(?, decided_at), executed_at = COALESCE(?, executed_at) WHERE id = ?',
      ['APPROVED', 'ls -la /tmp', 'ls -la /tmp', 'looks safe', '2026-06-06T00:00:00Z', null, 'appr_1'],
    );

    const row = db.get<Record<string, unknown>>(
      'SELECT * FROM command_approvals WHERE id = ?',
      ['appr_1'],
    );
    expect(row?.['status']).toBe('APPROVED');
    expect(row?.['final_command']).toBe('ls -la /tmp');
    expect(row?.['technician_reason']).toBe('looks safe');
    expect(row?.['decided_at']).toBe('2026-06-06T00:00:00Z');
  });

  it('COALESCE with null param preserves the existing value', () => {
    const db = makeJsonlAdapter();
    db.run(
      'INSERT INTO command_approvals (id, status, final_command) VALUES (?, ?, ?)',
      ['appr_2', 'PENDING', 'original-cmd'],
    );
    db.run(
      'UPDATE command_approvals SET status = ?, final_command = COALESCE(?, final_command) WHERE id = ?',
      ['REJECTED', null, 'appr_2'],
    );
    const row = db.get<Record<string, unknown>>(
      'SELECT * FROM command_approvals WHERE id = ?',
      ['appr_2'],
    );
    expect(row?.['status']).toBe('REJECTED');
    expect(row?.['final_command']).toBe('original-cmd');
  });

  it('rejects UPDATE and DELETE on audit_events (append-only)', () => {
    const db = makeJsonlAdapter();
    expect(() => db.run('UPDATE audit_events SET type = ? WHERE id = ?', ['x', 'ev_1'])).toThrow(
      /append-only/,
    );
    expect(() => db.run('DELETE FROM audit_events WHERE id = ?', ['ev_1'])).toThrow(/append-only/);
  });
});
