import { getEnv } from "../env.js";
import { formatSimilarSolutions, searchSimilar } from "./store.js";
import type { SimilarSolution } from "./types.js";

export async function retrieveSimilarStructured(
  ticketDescription: string,
  observations: string[],
  options?: { minScore?: number; topK?: number },
): Promise<SimilarSolution[]> {
  const query = `${ticketDescription} ${observations.join(" ")}`.trim();
  if (!query) return [];

  try {
    const minScore = options?.minScore ?? getEnv().MEMORY_DISPLAY_MIN_SCORE;
    const topK = options?.topK ?? getEnv().MEMORY_TOP_K;
    return await searchSimilar(query, topK, minScore);
  } catch (err) {
    console.warn("[memory] structured retrieval failed:", (err as Error).message);
    return [];
  }
}

export async function retrieveSimilarSolutions(
  ticketDescription: string,
  observations: string[],
): Promise<string> {
  const query = `${ticketDescription} ${observations.join(" ")}`.trim();
  if (!query) return "";

  try {
    const results = await searchSimilar(query, getEnv().MEMORY_TOP_K, getEnv().MEMORY_MIN_SCORE);
    return formatSimilarSolutions(results);
  } catch (err) {
    console.warn("[memory] retrieval failed:", (err as Error).message);
    return "";
  }
}
