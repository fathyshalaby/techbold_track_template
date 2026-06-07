import { z } from "zod";

export const SolutionSourceSchema = z.enum(["run", "runbook", "training-contract", "public-seed"]);

export type SolutionSource = z.infer<typeof SolutionSourceSchema>;

export type SolutionDoc = {
  id?: string;
  source: SolutionSource;
  symptom: string;
  rootCause: string;
  fix: string;
  commands?: string;
  validationStatus?: string;
  tags?: string[];
  ticketId?: number | null;
  runId?: string | null;
};

export type SimilarSolution = {
  id: string;
  source: SolutionSource;
  symptom: string;
  rootCause: string;
  fix: string;
  commands: string;
  score: number;
};

export type MemoryStats = {
  total: number;
  bySource: Record<SolutionSource, number>;
};

export type MemoryStatus = {
  available: boolean;
  count: number;
  stats: MemoryStats | null;
};

export type MemoryVectorPoint = {
  id: string;
  source: SolutionSource;
  symptom: string;
  rootCause: string;
  fix: string;
  x: number;
  y: number;
  preview: number[];
  score?: number;
};
