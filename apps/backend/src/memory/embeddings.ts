import { createHash } from "node:crypto";
import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";
import { effectiveGeminiApiKey, getEnv, isMockMode, resolveClientMode } from "../env.js";
import { redactSecrets } from "../safety/redaction.js";

function useFallbackEmbeddings(): boolean {
  if (isMockMode() || resolveClientMode("llm") === "mock") return true;
  return effectiveGeminiApiKey().trim() === "";
}

function hashEmbed(text: string, dim: number): number[] {
  const vec = new Array<number>(dim).fill(0);
  const normalized = text.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const slice = normalized.slice(0, i + 1);
    const hash = createHash("sha256").update(slice).digest();
    for (let j = 0; j < hash.length; j++) {
      const idx = hash[j] % dim;
      vec[idx] += (hash[j] + 1) / 256;
    }
  }
  const norm = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vec.map((value) => value / norm);
}

function embeddingModel() {
  const env = getEnv();
  if (effectiveGeminiApiKey()) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = effectiveGeminiApiKey();
  }
  return google.textEmbeddingModel(env.EMBEDDING_MODEL, {
    outputDimensionality: env.EMBEDDING_DIM,
  });
}

export function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}

export async function embedText(text: string): Promise<number[]> {
  const redacted = redactSecrets(text);
  if (useFallbackEmbeddings()) {
    return hashEmbed(redacted, getEnv().EMBEDDING_DIM);
  }
  const { embedding } = await embed({
    model: embeddingModel(),
    value: redacted,
  });
  return embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const redacted = texts.map((text) => redactSecrets(text));
  if (useFallbackEmbeddings()) {
    return redacted.map((text) => hashEmbed(text, getEnv().EMBEDDING_DIM));
  }
  const { embeddings } = await embedMany({
    model: embeddingModel(),
    values: redacted,
  });
  return embeddings;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}
