import { describe, expect, it } from "vitest";
import { normalizePreview, parsePgVector, projectTo2D, samplePreview } from "../memory/project.js";

describe("memory projection", () => {
  it("projects distinct vectors into 2D coordinates", () => {
    const vectors = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
    ];
    const points = projectTo2D(vectors);
    expect(points).toHaveLength(4);
    expect(points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(
      true,
    );
    expect(new Set(points.map((point) => `${point.x}:${point.y}`)).size).toBeGreaterThan(1);
  });

  it("parses pgvector text and samples preview stripes", () => {
    const parsed = parsePgVector("[0.1,0.5,0.9,0.2]");
    expect(parsed).toEqual([0.1, 0.5, 0.9, 0.2]);
    const preview = samplePreview(parsed, 2);
    expect(preview.length).toBeGreaterThan(0);
    expect(normalizePreview(preview).every((value) => value >= 0 && value <= 1)).toBe(true);
  });
});
