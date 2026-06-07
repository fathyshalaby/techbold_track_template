import { createHash } from "node:crypto";
import { cosineSimilarity, embedText } from "./embeddings.js";
import type { MemoryStats, SimilarSolution, SolutionDoc } from "./types.js";

type StoredEntry = {
  id: string;
  doc: SolutionDoc;
  embedding: number[];
  createdAt: number;
};

const entries: StoredEntry[] = [];
let seeded = false;

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

export function isInMemorySeeded(): boolean {
  return seeded;
}

export function resetInMemoryStoreForTests(): void {
  entries.length = 0;
  seeded = false;
}

export function markInMemorySeeded(): void {
  seeded = true;
}

export async function inMemoryUpsert(doc: SolutionDoc): Promise<string> {
  const id = doc.id ?? stableId(doc.source, doc.symptom, doc.fix);
  const content = buildContent(doc);
  const embedding = await embedText(content);
  const existingIndex = entries.findIndex((entry) => entry.id === id);
  const stored: StoredEntry = {
    id,
    doc: { ...doc, id },
    embedding,
    createdAt: Date.now(),
  };
  if (existingIndex >= 0) {
    entries[existingIndex] = stored;
  } else {
    entries.push(stored);
  }
  return id;
}

export async function inMemorySearch(
  queryText: string,
  k: number,
  minScore: number,
): Promise<SimilarSolution[]> {
  if (entries.length === 0) return [];
  const queryEmbedding = await embedText(queryText);
  const ranked = entries
    .map((entry) => ({
      id: entry.id,
      source: entry.doc.source,
      symptom: entry.doc.symptom,
      rootCause: entry.doc.rootCause,
      fix: entry.doc.fix,
      commands: entry.doc.commands ?? "",
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }))
    .sort((a, b) => b.score - a.score || b.id.localeCompare(a.id))
    .slice(0, k)
    .filter((row) => row.score >= minScore);
  return ranked;
}

export function inMemoryListRecent(limit: number): SimilarSolution[] {
  return [...entries]
    .sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      source: entry.doc.source,
      symptom: entry.doc.symptom,
      rootCause: entry.doc.rootCause,
      fix: entry.doc.fix,
      commands: entry.doc.commands ?? "",
      score: 1,
    }));
}

export function inMemoryStats(): MemoryStats {
  const bySource: MemoryStats["bySource"] = {
    run: 0,
    runbook: 0,
    "training-contract": 0,
    "public-seed": 0,
  };
  for (const entry of entries) {
    bySource[entry.doc.source] += 1;
  }
  const total = entries.length;
  return { total, bySource };
}

export function inMemoryTruncate(): void {
  entries.length = 0;
  seeded = false;
}

export function inMemoryListEmbeddings(limit: number): Array<{
  id: string;
  source: SolutionDoc["source"];
  symptom: string;
  rootCause: string;
  fix: string;
  embedding: number[];
}> {
  return [...entries]
    .sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      source: entry.doc.source,
      symptom: entry.doc.symptom,
      rootCause: entry.doc.rootCause,
      fix: entry.doc.fix,
      embedding: entry.embedding,
    }));
}
