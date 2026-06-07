import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Archetype } from "./types.ts";

export interface TrainingSafeCheck {
  command: string;
  purpose: string;
  expectedSignal: string;
  riskNotes: string;
  observations: string[];
}

export interface TrainingFix {
  command: string;
  rootCause: string;
  rationale: string;
  rollbackCommand: string;
  persistenceNote: string;
}

export interface TrainingValidation {
  fixApplied: string;
  observations: string[];
  benefitCheck: string;
  persistenceCheck: string;
  evidence: string[];
}

export interface TrainingUnsafeRequest {
  request: string;
  safeAlternative: string;
  warning: string;
}

export interface TrainingContract {
  diagnosis: string;
  evidence: string[];
  safeChecks: TrainingSafeCheck[];
  fixes: TrainingFix[];
  validation: TrainingValidation;
  unsafeRequests: TrainingUnsafeRequest[];
}

export type TrainingContracts = Record<Archetype, TrainingContract>;

const contractsPath = resolve(dirname(fileURLToPath(import.meta.url)), "training-contracts.json");

export const TRAINING_CONTRACTS = JSON.parse(
  readFileSync(contractsPath, "utf8"),
) as TrainingContracts;
