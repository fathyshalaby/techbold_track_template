import { generateObject } from "ai";
import type { LanguageModelV1 } from "ai";
import { z } from "zod";
import { retrieveSimilarSolutions } from "../../memory/retrieve.js";
import { guardModelInput } from "../input-guard.js";
import { selectRunbooks } from "../knowledge.js";
import { getModel, isBuiltInMockModel } from "../model.js";
import { PROBLEM_ANALYZER_SYSTEM_PROMPT } from "../prompts.js";
import { DiagnosticProposalSchema } from "../types.js";
import { AgentUnavailableError, runAgentObject } from "./resilience.js";

export { DiagnosticProposalSchema };
export type { DiagnosticProposal } from "../types.js";
export { AgentUnavailableError };

export type ProblemAnalyzerInput = {
  ticketDescription: string;
  observations: string[];
  similarSolutions?: string;
  attemptedCommands?: string;
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

export const ObserveResultSchema = z.object({
  hypotheses: DiagnosticProposalSchema.shape.hypotheses,
});

export type ObserveResult = z.infer<typeof ObserveResultSchema>;

const OBSERVE_SYSTEM_PROMPT = `${PROBLEM_ANALYZER_SYSTEM_PROMPT}

You are re-evaluating hypotheses after a diagnostic command ran. Return ONLY updated hypotheses with cause, evidence, and confidence. Do not propose a new command.

If the latest observation shows exit_code 4 or messages like "not found", "does not exist", or \
"could not be found" for a systemd unit you named in the command, that DISPROVES any hypothesis \
that treats that unit as the root cause. Drop its confidence below 0.5 and pivot to discovery \
(find what actually listens on the reported port or which units exist).`;

export async function runProblemAnalyzerObserve(
  input: ProblemAnalyzerInput,
  model?: LanguageModelV1,
): Promise<ObserveResult> {
  const resolvedModel = model ?? getModel();
  if (isBuiltInMockModel(resolvedModel)) {
    return { hypotheses: MOCK_DIAGNOSTIC_PROPOSAL.hypotheses };
  }
  const runbook = selectRunbooks(`${input.ticketDescription} ${input.observations.join(" ")}`);
  const similarSolutions =
    input.similarSolutions ??
    (await retrieveSimilarSolutions(input.ticketDescription, input.observations));
  return runAgentObject("problem_analyzer", async () => {
    const result = await generateObject({
      model: resolvedModel,
      schema: ObserveResultSchema,
      system: OBSERVE_SYSTEM_PROMPT,
      prompt: guardModelInput({
        ticketDescription: input.ticketDescription,
        observations: input.observations,
        ...(runbook ? { runbook } : {}),
        ...(similarSolutions ? { similarSolutions } : {}),
        ...(input.attemptedCommands ? { attemptedCommands: input.attemptedCommands } : {}),
      }),
      maxTokens: 512,
    });
    return result.object;
  });
}

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
  const similarSolutions =
    input.similarSolutions ??
    (await retrieveSimilarSolutions(input.ticketDescription, input.observations));
  return runAgentObject("problem_analyzer", async () => {
    const result = await generateObject({
      model: resolvedModel,
      schema: DiagnosticProposalSchema,
      system: PROBLEM_ANALYZER_SYSTEM_PROMPT,
      prompt: guardModelInput({
        ticketDescription: input.ticketDescription,
        observations: input.observations,
        ...(runbook ? { runbook } : {}),
        ...(similarSolutions ? { similarSolutions } : {}),
        ...(input.attemptedCommands ? { attemptedCommands: input.attemptedCommands } : {}),
      }),
      maxTokens: 1024,
    });
    return result.object;
  });
}
