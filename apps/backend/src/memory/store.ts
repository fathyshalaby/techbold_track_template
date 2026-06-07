import { createHash } from "node:crypto";
import { getEnv, memoryConfigured } from "../env.js";
import { redactSecrets } from "../safety/redaction.js";
import { embedText, toPgVector } from "./embeddings.js";
import {
  inMemoryListEmbeddings,
  inMemoryListRecent,
  inMemorySearch,
  inMemoryStats,
  inMemoryUpsert,
} from "./in-memory-store.js";
import { ensureMemorySchema, getMemoryPool, isMemoryAvailable } from "./pg.js";
import { normalizePreview, parsePgVector, projectTo2D, samplePreview } from "./project.js";
import type {
  MemoryStats,
  MemoryStatus,
  MemoryVectorPoint,
  SimilarSolution,
  SolutionDoc,
  SolutionSource,
} from "./types.js";

function stableId(source: string, symptom: string, fix: string): string {
  return createHash("sha256").update(`${source}:${symptom}:${fix}`).digest("hex").slice(0, 32);
}

function buildContent(doc: SolutionDoc): string {
  const parts = [`Symptom: ${doc.symptom}`, `Root cause: ${doc.rootCause}`, `Fix: ${doc.fix}`];
  if (doc.commands?.trim()) parts.push(`Commands: ${doc.commands}`);
  if (doc.validationStatus?.trim()) parts.push(`Validation: ${doc.validationStatus}`);
  if (doc.tags?.length) parts.push(`Tags: ${doc.tags.join(", ")}`);
  return parts.join("\n");
}

function redactDoc(doc: SolutionDoc): SolutionDoc {
  return {
    ...doc,
    symptom: redactSecrets(doc.symptom),
    rootCause: redactSecrets(doc.rootCause),
    fix: redactSecrets(doc.fix),
    commands: redactSecrets(doc.commands ?? ""),
    validationStatus: redactSecrets(doc.validationStatus ?? ""),
  };
}

function emptyStats(): MemoryStats {
  return {
    total: 0,
    bySource: {
      run: 0,
      runbook: 0,
      "training-contract": 0,
      "public-seed": 0,
    },
  };
}

function useInMemoryStore(): boolean {
  return !memoryConfigured();
}

export async function getMemoryStatus(): Promise<MemoryStatus> {
  if (useInMemoryStore()) {
    const memoryStats = inMemoryStats();
    return { available: true, count: memoryStats.total, stats: memoryStats };
  }

  const available = await ensureMemorySchema();
  if (!available) {
    return { available: false, count: 0, stats: null };
  }
  const memoryStats = await stats();
  return { available: true, count: memoryStats.total, stats: memoryStats };
}

export async function upsertSolution(doc: SolutionDoc): Promise<string | null> {
  const redacted = redactDoc(doc);

  if (useInMemoryStore()) {
    return inMemoryUpsert(redacted);
  }

  if (!(await ensureMemorySchema())) return null;

  const pool = getMemoryPool();
  if (!pool) return null;

  const id = redacted.id ?? stableId(redacted.source, redacted.symptom, redacted.fix);
  const content = buildContent(redacted);
  const embedding = await embedText(content);
  const vector = toPgVector(embedding);

  await pool.query(
    `INSERT INTO solution_memory (
      id, source, symptom, root_cause, fix, commands, validation_status,
      tags, ticket_id, run_id, embedding, content
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::vector, $12)
    ON CONFLICT (id) DO UPDATE SET
      source = EXCLUDED.source,
      symptom = EXCLUDED.symptom,
      root_cause = EXCLUDED.root_cause,
      fix = EXCLUDED.fix,
      commands = EXCLUDED.commands,
      validation_status = EXCLUDED.validation_status,
      tags = EXCLUDED.tags,
      ticket_id = EXCLUDED.ticket_id,
      run_id = EXCLUDED.run_id,
      embedding = EXCLUDED.embedding,
      content = EXCLUDED.content`,
    [
      id,
      redacted.source,
      redacted.symptom,
      redacted.rootCause,
      redacted.fix,
      redacted.commands ?? "",
      redacted.validationStatus ?? "",
      redacted.tags ?? [],
      redacted.ticketId ?? null,
      redacted.runId ?? null,
      vector,
      content,
    ],
  );

  return id;
}

export async function searchSimilar(
  queryText: string,
  k = getEnv().MEMORY_TOP_K,
  minScore = getEnv().MEMORY_MIN_SCORE,
): Promise<SimilarSolution[]> {
  if (useInMemoryStore()) {
    return inMemorySearch(queryText, k, minScore);
  }

  if (!(await ensureMemorySchema()) || !isMemoryAvailable()) return [];

  const pool = getMemoryPool();
  if (!pool) return [];

  const embedding = await embedText(queryText);
  const vector = toPgVector(embedding);

  const result = await pool.query<{
    id: string;
    source: SolutionSource;
    symptom: string;
    root_cause: string;
    fix: string;
    commands: string;
    score: number;
  }>(
    `SELECT
      id,
      source,
      symptom,
      root_cause,
      fix,
      commands,
      1 - (embedding <=> $1::vector) AS score
    FROM solution_memory
    ORDER BY embedding <=> $1::vector ASC, created_at DESC, id ASC
    LIMIT $2`,
    [vector, k],
  );

  return result.rows
    .filter((row) => row.score >= minScore)
    .map((row) => ({
      id: row.id,
      source: row.source,
      symptom: row.symptom,
      rootCause: row.root_cause,
      fix: row.fix,
      commands: row.commands,
      score: row.score,
    }));
}

export async function stats(): Promise<MemoryStats> {
  if (useInMemoryStore()) {
    return inMemoryStats();
  }

  if (!(await ensureMemorySchema())) {
    return emptyStats();
  }

  const pool = getMemoryPool();
  if (!pool) {
    return emptyStats();
  }

  const result = await pool.query<{ source: SolutionSource; count: string }>(
    "SELECT source, COUNT(*)::text AS count FROM solution_memory GROUP BY source",
  );

  const bySource: MemoryStats["bySource"] = {
    run: 0,
    runbook: 0,
    "training-contract": 0,
    "public-seed": 0,
  };

  for (const row of result.rows) {
    bySource[row.source] = Number.parseInt(row.count, 10);
  }

  const total = Object.values(bySource).reduce((sum, count) => sum + count, 0);
  return { total, bySource };
}

export async function listRecent(limit = 20): Promise<SimilarSolution[]> {
  if (useInMemoryStore()) {
    return inMemoryListRecent(limit);
  }

  if (!(await ensureMemorySchema())) return [];

  const pool = getMemoryPool();
  if (!pool) return [];

  const result = await pool.query<{
    id: string;
    source: SolutionSource;
    symptom: string;
    root_cause: string;
    fix: string;
    commands: string;
  }>(
    `SELECT id, source, symptom, root_cause, fix, commands
     FROM solution_memory
     ORDER BY created_at DESC, id ASC
     LIMIT $1`,
    [limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    source: row.source,
    symptom: row.symptom,
    rootCause: row.root_cause,
    fix: row.fix,
    commands: row.commands,
    score: 1,
  }));
}

const PRIOR_ART_HEADER =
  "PRIOR ART (generic): service names, paths, and ports below are placeholders from runbooks or past incidents. Verify targets on the live system before using them.";

export function formatSimilarSolutions(results: SimilarSolution[]): string {
  if (results.length === 0) return "";
  const body = results
    .map(
      (item, index) =>
        `[${index + 1}] (${item.source}, score ${item.score.toFixed(2)})\nSymptom: ${item.symptom}\nRoot cause: ${item.rootCause}\nFix: ${item.fix}${item.commands ? `\nCommands: ${item.commands}` : ""}`,
    )
    .join("\n\n");
  return `${PRIOR_ART_HEADER}\n\n${body}`;
}

type RawEmbeddingRow = {
  id: string;
  source: SolutionSource;
  symptom: string;
  rootCause: string;
  fix: string;
  embedding: number[];
};

async function loadEmbeddingRows(limit: number): Promise<RawEmbeddingRow[]> {
  if (useInMemoryStore()) {
    return inMemoryListEmbeddings(limit);
  }

  if (!(await ensureMemorySchema())) return [];

  const pool = getMemoryPool();
  if (!pool) return [];

  const result = await pool.query<{
    id: string;
    source: SolutionSource;
    symptom: string;
    root_cause: string;
    fix: string;
    embedding: string;
  }>(
    `SELECT id, source, symptom, root_cause, fix, embedding::text AS embedding
     FROM solution_memory
     ORDER BY created_at DESC, id ASC
     LIMIT $1`,
    [limit],
  );

  return result.rows
    .map((row) => ({
      id: row.id,
      source: row.source,
      symptom: row.symptom,
      rootCause: row.root_cause,
      fix: row.fix,
      embedding: parsePgVector(row.embedding),
    }))
    .filter((row) => row.embedding.length > 0);
}

function buildVectorPoints(
  rows: RawEmbeddingRow[],
  scoresById?: Map<string, number>,
): MemoryVectorPoint[] {
  if (rows.length === 0) return [];
  const projections = projectTo2D(rows.map((row) => row.embedding));
  return rows.map((row, index) => ({
    id: row.id,
    source: row.source,
    symptom: row.symptom,
    rootCause: row.rootCause,
    fix: row.fix,
    x: projections[index]?.x ?? 0,
    y: projections[index]?.y ?? 0,
    preview: normalizePreview(samplePreview(row.embedding)),
    score: scoresById?.get(row.id),
  }));
}

export async function listVectorMap(query?: string, limit = 200): Promise<MemoryVectorPoint[]> {
  const rows = await loadEmbeddingRows(limit);
  if (rows.length === 0) return [];

  let scoresById: Map<string, number> | undefined;
  if (query?.trim()) {
    const matches = await searchSimilar(query.trim(), Math.min(limit, 20), 0.05);
    scoresById = new Map(matches.map((match) => [match.id, match.score]));
  }

  const points = buildVectorPoints(rows, scoresById);
  if (!scoresById) return points;

  const matched = points.filter((point) => scoresById?.has(point.id));
  const rest = points.filter((point) => !scoresById?.has(point.id));
  return [...matched, ...rest];
}
