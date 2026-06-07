import { afterEach, describe, expect, it } from "vitest";

process.env.MOCK_MODE = "true";
process.env.MOCK_LLM = "true";
process.env.DATABASE_URL = "";

import { cosineSimilarity, embedText } from "../memory/embeddings.js";
import { resetInMemoryStoreForTests } from "../memory/in-memory-store.js";
import { retrieveSimilarStructured } from "../memory/retrieve.js";
import { runMemorySeed } from "../memory/seed/index.js";
import { formatSimilarSolutions, getMemoryStatus, searchSimilar } from "../memory/store.js";

afterEach(() => {
  resetInMemoryStoreForTests();
});

describe("memory embeddings fallback", () => {
  it("returns deterministic normalized vectors without Gemini key", async () => {
    const first = await embedText("nginx 502 after deploy");
    const second = await embedText("nginx 502 after deploy");
    const different = await embedText("postgres connection refused");

    expect(first).toHaveLength(1536);
    expect(second).toEqual(first);
    expect(different).not.toEqual(first);
    expect(cosineSimilarity(first, first)).toBeCloseTo(1, 5);
  });
});

describe("formatSimilarSolutions", () => {
  it("formats retrieval results for prompt injection", async () => {
    const formatted = formatSimilarSolutions([
      {
        id: "abc",
        source: "public-seed",
        symptom: "nginx 502",
        rootCause: "upstream down",
        fix: "restart upstream",
        commands: "systemctl restart app",
        score: 0.91,
      },
    ]);

    expect(formatted).toContain("nginx 502");
    expect(formatted).toContain("score 0.91");
    expect(formatted).toContain("restart upstream");
    expect(formatted).toContain("PRIOR ART (generic)");
  });
});

describe("in-memory vector store", () => {
  it("seeds and returns ranked results without DATABASE_URL", async () => {
    await runMemorySeed(true);
    const status = await getMemoryStatus();
    expect(status.available).toBe(true);
    expect(status.count).toBeGreaterThan(100);

    const results = await searchSimilar("nginx 502 bad gateway upstream", 4, 0.1);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((row) => row.symptom.length > 0)).toBe(true);
  });

  it("retrieveSimilarStructured uses display score floor", async () => {
    await runMemorySeed(true);
    const results = await retrieveSimilarStructured("port 8080 already bound systemd service", []);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.score).toBeGreaterThanOrEqual(0);
  });

  it("returns projected vector map points", async () => {
    await runMemorySeed(true);
    const { listVectorMap } = await import("../memory/store.js");
    const points = await listVectorMap(undefined, 50);
    expect(points.length).toBeGreaterThan(0);
    expect(points[0]).toMatchObject({
      id: expect.any(String),
      source: expect.any(String),
      symptom: expect.any(String),
      x: expect.any(Number),
      y: expect.any(Number),
      preview: expect.any(Array),
    });
  });
});
