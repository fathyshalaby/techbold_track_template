import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { Database } from 'better-sqlite3';

export type StoreMode = 'sqlite' | 'jsonl';

export type StoreStatus = {
  mode: StoreMode;
  durable: boolean;
};

export type DbAdapter = {
  run(sql: string, params?: unknown[]): void;
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
  // Run fn atomically: on SQLite all writes commit together or roll back on
  // throw, so a crash mid-sequence can't leave a half-written audit trail.
  transaction(fn: () => void): void;
  mode: StoreMode;
};

const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    ticket_id INTEGER,
    customer_system_id TEXT,
    status TEXT,
    current_phase TEXT,
    started_at TEXT,
    updated_at TEXT,
    completed_at TEXT,
    error_message TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    type TEXT,
    actor TEXT,
    ts TEXT,
    payload_json TEXT
  );

  CREATE TABLE IF NOT EXISTS command_approvals (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    proposed_command TEXT,
    edited_command TEXT,
    final_command TEXT,
    purpose TEXT,
    expected_signal TEXT,
    risk_level TEXT,
    safety_notes TEXT,
    status TEXT,
    technician_reason TEXT,
    created_at TEXT,
    decided_at TEXT,
    executed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS command_results (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    approval_id TEXT,
    command TEXT,
    exit_code INTEGER,
    stdout_redacted TEXT,
    stderr_redacted TEXT,
    duration_ms INTEGER,
    timed_out INTEGER,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS observations (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    source TEXT,
    content TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_drafts (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    summary TEXT,
    root_cause TEXT,
    actions_taken TEXT,
    commands_summary TEXT,
    validation_result TEXT,
    submitted INTEGER,
    created_at TEXT,
    submitted_at TEXT
  );

  CREATE TRIGGER IF NOT EXISTS audit_events_no_update
  BEFORE UPDATE ON audit_events
  BEGIN
    SELECT RAISE(ABORT, 'audit_events is append-only');
  END;

  CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
  BEFORE DELETE ON audit_events
  BEGIN
    SELECT RAISE(ABORT, 'audit_events is append-only');
  END;

  -- The real evidence (command output + agent-visible observations) is as
  -- load-bearing for the audit trail as the metadata events, so it is
  -- append-only too. activity_drafts stays mutable (the submit flag).
  CREATE TRIGGER IF NOT EXISTS command_results_no_update
  BEFORE UPDATE ON command_results
  BEGIN
    SELECT RAISE(ABORT, 'command_results is append-only');
  END;

  CREATE TRIGGER IF NOT EXISTS command_results_no_delete
  BEFORE DELETE ON command_results
  BEGIN
    SELECT RAISE(ABORT, 'command_results is append-only');
  END;

  CREATE TRIGGER IF NOT EXISTS observations_no_update
  BEFORE UPDATE ON observations
  BEGIN
    SELECT RAISE(ABORT, 'observations is append-only');
  END;

  CREATE TRIGGER IF NOT EXISTS observations_no_delete
  BEFORE DELETE ON observations
  BEGIN
    SELECT RAISE(ABORT, 'observations is append-only');
  END;
`;

const require = createRequire(import.meta.url);

export function makeJsonlAdapter(): DbAdapter {
  const tables = new Map<string, Record<string, unknown>[]>();

  function getTable(name: string): Record<string, unknown>[] {
    if (!tables.has(name)) tables.set(name, []);
    return tables.get(name)!;
  }

  function extractTableName(sql: string): string | undefined {
    // Match INSERT INTO <table> or UPDATE <table>
    const m = sql.match(/(?:INSERT\s+INTO|UPDATE)\s+(\w+)/i);
    return m?.[1];
  }

  function extractWhere(sql: string, params: unknown[]): string | undefined {
    // Only handle simple WHERE id = ? patterns
    const m = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
    if (!m) return undefined;
    const col = m[1].toLowerCase();
    if (col === 'id') return params[0] as string;
    return undefined;
  }

  return {
    mode: 'jsonl',

    // In-memory + synchronous, so a "transaction" is just running fn; mutations
    // are already all-or-nothing within a single JS tick.
    transaction(fn: () => void): void {
      fn();
    },

    run(sql: string, params: unknown[] = []): void {
      // Enforce append-only at the adapter level for the evidence tables.
      if (/^\s*(?:UPDATE|DELETE\s+FROM)\s+(audit_events|command_results|observations)\b/i.test(sql)) {
        const m = sql.match(/(audit_events|command_results|observations)/i);
        throw new Error(`${m?.[1] ?? 'table'} is append-only`);
      }

      const table = extractTableName(sql);
      if (!table) throw new Error(`JSONL adapter: cannot parse table from SQL: ${sql}`);
      const rows = getTable(table);

      if (/^\s*INSERT/i.test(sql)) {
        // Build a record from positional params
        const colMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
        if (!colMatch) throw new Error(`JSONL adapter: cannot parse columns from SQL: ${sql}`);
        const cols = colMatch[1].split(',').map((c) => c.trim());
        const record: Record<string, unknown> = {};
        cols.forEach((col, i) => { record[col] = params[i] ?? null; });
        rows.push(record);
      } else if (/^\s*UPDATE/i.test(sql)) {
        // In UPDATE statements the WHERE id is the LAST param (SET params come first).
        const m = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
        if (!m || m[1].toLowerCase() !== 'id') return;
        const id = params[params.length - 1] as string;
        const idx = rows.findIndex((r) => r['id'] === id);
        if (idx === -1) return;

        // Parse SET clause by matching each `col = <expr with one ?>` assignment.
        // Naive comma-splitting breaks on COALESCE(?, col). Its internal comma
        // produces phantom fragments and misaligns params. Match assignments
        // directly instead: each consumes exactly one positional param, in order.
        const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/is);
        if (!setMatch) return;
        const assignRe = /(\w+)\s*=\s*(COALESCE\s*\(\s*\?\s*,\s*\w+\s*\)|\?)/gi;
        const updated = { ...rows[idx] };
        let paramIdx = 0;
        let am: RegExpExecArray | null;
        while ((am = assignRe.exec(setMatch[1])) !== null) {
          const col = am[1];
          const value = params[paramIdx++];
          const isCoalesce = /^COALESCE/i.test(am[2]);
          // COALESCE(?, col): a null/undefined param keeps the existing value.
          if (isCoalesce && (value === null || value === undefined)) continue;
          updated[col] = value ?? null;
        }
        rows[idx] = updated;
      }
    },

    get<T>(sql: string, params: unknown[] = []): T | undefined {
      const tableMatch = sql.match(/FROM\s+(\w+)/i);
      if (!tableMatch) return undefined;
      const rows = getTable(tableMatch[1]);
      const id = extractWhere(sql, params);
      if (id !== undefined) {
        return rows.find((r) => r['id'] === id) as T | undefined;
      }
      // ORDER BY run_id + most recent (for getActivityDraft)
      const orderMatch = sql.match(/WHERE\s+run_id\s*=\s*\?/i);
      if (orderMatch) {
        const matches = rows.filter((r) => r['run_id'] === params[0]);
        return matches[matches.length - 1] as T | undefined;
      }
      return undefined;
    },

    all<T>(sql: string, params: unknown[] = []): T[] {
      const tableMatch = sql.match(/FROM\s+(\w+)/i);
      if (!tableMatch) return [];
      const rows = getTable(tableMatch[1]);
      const runIdMatch = sql.match(/WHERE\s+run_id\s*=\s*\?/i);
      if (runIdMatch) {
        return rows.filter((r) => r['run_id'] === params[0]) as T[];
      }
      return rows as T[];
    },
  };
}

let adapter: DbAdapter | undefined;

export function setDb(db: DbAdapter): void {
  adapter = db;
}

export function resetDb(): void {
  adapter = undefined;
}

export function getStoreStatus(): StoreStatus {
  const db = getDb();
  return {
    mode: db.mode,
    durable: db.mode === 'sqlite',
  };
}

export function getDb(dbPath?: string): DbAdapter {
  if (adapter) return adapter;

  try {
    // Dynamic require so the module loads even when native bindings are absent.
    const BetterSqlite3 = require('better-sqlite3') as typeof import('better-sqlite3');
    const resolvedPath = dbPath ?? process.env['DB_PATH'] ?? './data/autopilot.db';
    if (resolvedPath !== ':memory:') {
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    }
    const db: Database = new BetterSqlite3(resolvedPath);
    db.pragma('journal_mode = WAL');
    db.exec(CREATE_TABLES);

    adapter = {
      mode: 'sqlite',
      run(sql: string, params: unknown[] = []): void {
        db.prepare(sql).run(params);
      },
      get<T>(sql: string, params: unknown[] = []): T | undefined {
        return db.prepare(sql).get(params) as T | undefined;
      },
      all<T>(sql: string, params: unknown[] = []): T[] {
        return db.prepare(sql).all(params) as T[];
      },
      transaction(fn: () => void): void {
        db.transaction(fn)();
      },
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    // The JSONL fallback is IN-MEMORY (non-durable). That is acceptable only for
    // offline/mock runs and tests. In a real run the audit trail is the C-score
    // source of truth, so silently degrading to a store that evaporates on
    // restart is worse than failing. Refuse to boot instead of pretending.
    const mockEnv = ['MOCK_MODE', 'MOCK_PHOENIX', 'MOCK_SSH', 'MOCK_LLM'];
    const anyMock = mockEnv.some((k) => {
      const v = (process.env[k] ?? '').trim().toLowerCase();
      return ['true', '1', 'yes', 'on'].includes(v);
    });
    if (!anyMock) {
      throw new Error(
        `[store] SQLite unavailable (${reason}) and not in mock mode. The in-memory ` +
          'fallback is non-durable and would lose the audit trail. Refusing to start. ' +
          'Fix the native better-sqlite3 build or mount a writable data dir.',
      );
    }
    console.warn(
      `[store] SQLite unavailable (${reason}). Falling back to an IN-MEMORY store ` +
        '(mock mode). Run state and the audit trail will NOT survive a restart.',
    );
    adapter = makeJsonlAdapter();
  }

  return adapter;
}
