import pg from "pg";
import { getEnv, memoryConfigured } from "../env.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let schemaReady = false;
let memoryAvailable = false;
let initAttempted = false;

function embeddingDim(): number {
  return getEnv().EMBEDDING_DIM;
}

function createSchemaSql(dim: number): string {
  return `
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS solution_memory (
      id text PRIMARY KEY,
      source text NOT NULL,
      symptom text NOT NULL,
      root_cause text NOT NULL,
      fix text NOT NULL,
      commands text NOT NULL DEFAULT '',
      validation_status text NOT NULL DEFAULT '',
      tags text[] NOT NULL DEFAULT '{}',
      ticket_id integer,
      run_id text,
      embedding vector(${dim}) NOT NULL,
      content text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS solution_memory_source_idx ON solution_memory (source);
    CREATE INDEX IF NOT EXISTS solution_memory_created_at_idx ON solution_memory (created_at DESC);
  `;
}

function createIndexSql(): string {
  return `
    CREATE INDEX IF NOT EXISTS solution_memory_embedding_hnsw_idx
    ON solution_memory USING hnsw (embedding vector_cosine_ops);
  `;
}

export function getMemoryPool(): pg.Pool | null {
  if (!memoryConfigured()) return null;
  if (pool) return pool;

  const url = getEnv().DATABASE_URL.trim();
  if (!url) return null;

  // connectionTimeoutMillis bounds the wait when Postgres is unreachable so a
  // dashboard request cannot hang. The 'error' handler is required: pg emits
  // 'error' on idle clients (e.g. the DB dropping the connection), and an
  // unhandled emitter 'error' event crashes the whole process.
  pool = new Pool({ connectionString: url, max: 10, connectionTimeoutMillis: 3000 });
  pool.on("error", (err) => {
    console.error("[memory] idle client error:", err.message);
  });
  return pool;
}

export async function ensureMemorySchema(): Promise<boolean> {
  if (schemaReady) return memoryAvailable;
  if (initAttempted) return memoryAvailable;
  initAttempted = true;

  const p = getMemoryPool();
  if (!p) return false;

  const dim = embeddingDim();
  // p.connect() must stay inside the try: a failed connection (e.g. Postgres
  // not running) rejects here, and an uncaught rejection would crash every
  // caller (the dashboard route). Treat any init failure as "unavailable".
  let client: pg.PoolClient | undefined;
  try {
    client = await p.connect();
    await client.query(createSchemaSql(dim));
    try {
      await client.query(createIndexSql());
    } catch (err) {
      // hnsw may fail on empty table in some pgvector versions; table queries still work.
      console.warn("[memory] hnsw index creation skipped:", (err as Error).message);
    }
    schemaReady = true;
    memoryAvailable = true;
    return true;
  } catch (err) {
    console.error("[memory] schema init failed:", (err as Error).message);
    memoryAvailable = false;
    return false;
  } finally {
    client?.release();
  }
}

export function isMemoryAvailable(): boolean {
  return memoryAvailable;
}

export async function closeMemoryPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
  schemaReady = false;
  memoryAvailable = false;
  initAttempted = false;
}

export function resetMemoryStateForTests(): void {
  pool = null;
  schemaReady = false;
  memoryAvailable = false;
  initAttempted = false;
}

export function setMemoryAvailableForTests(available: boolean): void {
  memoryAvailable = available;
  schemaReady = available;
  initAttempted = true;
}
