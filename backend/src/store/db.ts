import type { Database } from 'better-sqlite3';

export type StoreMode = 'sqlite' | 'jsonl';

export type DbAdapter = {
  run(sql: string, params?: unknown[]): void;
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
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
`;

function makeJsonlAdapter(): DbAdapter {
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

    run(sql: string, params: unknown[] = []): void {
      const table = extractTableName(sql);
      if (!table) return;
      const rows = getTable(table);

      if (/^\s*INSERT/i.test(sql)) {
        // Build a record from positional params
        const colMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
        if (!colMatch) return;
        const cols = colMatch[1].split(',').map((c) => c.trim());
        const record: Record<string, unknown> = {};
        cols.forEach((col, i) => { record[col] = params[i] ?? null; });
        rows.push(record);
      } else if (/^\s*UPDATE/i.test(sql)) {
        const id = extractWhere(sql, params);
        if (!id) return;
        const idx = rows.findIndex((r) => r['id'] === id);
        if (idx === -1) return;

        // Parse SET clause: col = ?, col2 = ?, ...
        const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/is);
        if (!setMatch) return;
        const setParts = setMatch[1].split(',').map((p) => p.trim());
        // params for SET come before the WHERE param
        const setParams = params.slice(0, setParts.length);
        const updated = { ...rows[idx] };
        setParts.forEach((part, i) => {
          const colMatch2 = part.match(/^(\w+)\s*=/i);
          if (colMatch2) updated[colMatch2[1]] = setParams[i] ?? null;
        });
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

export function getDb(dbPath?: string): DbAdapter {
  if (adapter) return adapter;

  try {
    // Dynamic import so the module loads even when native bindings are absent
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const BetterSqlite3 = require('better-sqlite3') as typeof import('better-sqlite3');
    const db: Database = new BetterSqlite3(dbPath ?? ':memory:');
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
    };
  } catch {
    console.warn('[store] SQLite unavailable — using JSONL fallback');
    adapter = makeJsonlAdapter();
  }

  return adapter;
}
