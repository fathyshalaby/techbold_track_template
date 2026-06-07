function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function meanVector(vectors: number[][]): number[] {
  const dim = vectors[0]?.length ?? 0;
  const mean = new Array<number>(dim).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < dim; i++) mean[i] += vector[i];
  }
  return mean.map((value) => value / vectors.length);
}

function centerVectors(vectors: number[][], mean: number[]): number[][] {
  return vectors.map((vector) => vector.map((value, index) => value - mean[index]));
}

function normalize(vector: number[]): number[] {
  const norm = Math.sqrt(dot(vector, vector)) || 1;
  return vector.map((value) => value / norm);
}

function matVec(rows: number[][], vector: number[]): number[] {
  const dim = vector.length;
  const projection = new Array<number>(rows.length).fill(0);
  for (let i = 0; i < rows.length; i++) projection[i] = dot(rows[i], vector);

  const result = new Array<number>(dim).fill(0);
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < dim; j++) result[j] += rows[i][j] * projection[i];
  }
  return result.map((value) => value / rows.length);
}

function powerIteration(rows: number[][], iterations = 24): number[] {
  let axis = rows[0]?.map(() => Math.random() - 0.5) ?? [];
  axis = normalize(axis);
  for (let i = 0; i < iterations; i++) {
    axis = normalize(matVec(rows, axis));
  }
  return axis;
}

function deflate(rows: number[][], axis: number[], scores: number[]): number[][] {
  return rows.map((row, index) => {
    const scale = scores[index];
    return row.map((value, dim) => value - scale * axis[dim]);
  });
}

function scaleAxis(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value) => ((value - min) / range) * 2 - 1);
}

export function projectTo2D(vectors: number[][]): Array<{ x: number; y: number }> {
  if (vectors.length === 0) return [];
  if (vectors.length === 1) return [{ x: 0, y: 0 }];

  const mean = meanVector(vectors);
  const centered = centerVectors(vectors, mean);
  const axisX = powerIteration(centered);
  const scoresX = centered.map((row) => dot(row, axisX));
  const deflated = deflate(centered, axisX, scoresX);
  const axisY = powerIteration(deflated);
  const scoresY = deflated.map((row) => dot(row, axisY));
  const xs = scaleAxis(scoresX);
  const ys = scaleAxis(scoresY);
  return xs.map((x, index) => ({ x, y: ys[index] }));
}

export function samplePreview(embedding: number[], count = 48): number[] {
  if (embedding.length === 0) return [];
  const step = Math.max(1, Math.floor(embedding.length / count));
  const preview: number[] = [];
  for (let i = 0; i < embedding.length && preview.length < count; i += step) {
    preview.push(embedding[i]);
  }
  return preview;
}

export function normalizePreview(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value) => (value - min) / range);
}

export function parsePgVector(raw: string): number[] {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  return trimmed
    .slice(1, -1)
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
    .filter((value) => Number.isFinite(value));
}
