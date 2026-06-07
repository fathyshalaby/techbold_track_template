import { generateObject } from "ai";
import type { LanguageModelV1 } from "ai";
import { guardModelInput } from "../input-guard.js";
import { selectRunbooks } from "../knowledge.js";
import { getModel, isBuiltInMockModel } from "../model.js";
import { PROBLEM_ANALYZER_SYSTEM_PROMPT } from "../prompts.js";
import { DiagnosticProposalSchema } from "../types.js";

export { DiagnosticProposalSchema };
export type { DiagnosticProposal } from "../types.js";

export class AgentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentUnavailableError";
  }
}

export type ProblemAnalyzerInput = {
  ticketDescription: string;
  observations: string[];
};

export const MOCK_DIAGNOSTIC_PROPOSAL = {
  hypotheses: [
    {
      cause: "status-api service failed because another process is already bound to port 8080",
      evidence:
        "systemctl status and journal entries point to service startup failure after restart",
      confidence: 0.8,
    },
  ],
  command: "systemctl status status-api --no-pager",
  purpose: "Confirm status-api service state and surface the exact error message",
  expectedSignal: "Output shows the status-api unit failed and includes the exit status",
  riskNotes: "Read-only; no changes to system state",
  isReadOnly: true,
};

export async function runProblemAnalyzer(
  input: ProblemAnalyzerInput,
  model?: LanguageModelV1,
): Promise<import("../types.js").DiagnosticProposal> {
  const resolvedModel = model ?? getModel();
  if (isBuiltInMockModel(resolvedModel)) {
    return MOCK_DIAGNOSTIC_PROPOSAL;
  }
  // Route the relevant runbook slice by symptom (ticket + observations). The
  // method lives in the system prompt; the matched runbook is per-incident context.
  const runbook = selectRunbooks(`${input.ticketDescription} ${input.observations.join(" ")}`);
  try {
    const result = await Promise.race([
      generateObject({
        model: resolvedModel,
        schema: DiagnosticProposalSchema,
        system: PROBLEM_ANALYZER_SYSTEM_PROMPT,
        prompt: guardModelInput({
          ticketDescription: input.ticketDescription,
          observations: input.observations,
          ...(runbook ? { runbook } : {}),
        }),
        maxTokens: 1024,
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 30_000)),
    ]);
    return result.object;
  } catch {
    throw new AgentUnavailableError("agent unavailable: problem_analyzer");
  }
}
