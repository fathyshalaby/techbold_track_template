import { generateObject } from "ai";
import type { LanguageModelV1 } from "ai";
import { retrieveSimilarSolutions } from "../../memory/retrieve.js";
import { guardModelInput } from "../input-guard.js";
import { selectRunbooks } from "../knowledge.js";
import { getModel, isBuiltInMockModel } from "../model.js";
import { PROBLEM_SOLVER_SYSTEM_PROMPT } from "../prompts.js";
import { FixProposalSchema } from "../types.js";
import type { FixProposal } from "../types.js";
import { AgentUnavailableError, runAgentObject } from "./resilience.js";

export { AgentUnavailableError };
export { FixProposalSchema };
export type { FixProposal };

export type ProblemSolverInput = {
  ticketDescription: string;
  observations: string[];
  similarSolutions?: string;
  attemptedCommands?: string;
};

export const MOCK_FIX_PROPOSAL: FixProposal = {
  rootCause:
    "status-api could not restart because port 8080 was already occupied by a stale process",
  command: "sudo systemctl restart status-api",
  rationale: "Restart the managed service after diagnostics identified the service as failed",
  rollbackCommand: "sudo systemctl stop status-api",
  isReversible: true,
  persistenceNote: "systemd restart preserves the existing enabled service configuration",
};

export async function runProblemSolver(
  input: ProblemSolverInput,
  model?: LanguageModelV1,
): Promise<FixProposal> {
  const resolvedModel = model ?? getModel();
  if (isBuiltInMockModel(resolvedModel)) {
    return MOCK_FIX_PROPOSAL;
  }
  const runbook = selectRunbooks(`${input.ticketDescription} ${input.observations.join(" ")}`);
  const similarSolutions =
    input.similarSolutions ??
    (await retrieveSimilarSolutions(input.ticketDescription, input.observations));
  return runAgentObject("problem_solver", async () => {
    const result = await generateObject({
      model: resolvedModel,
      schema: FixProposalSchema,
      system: PROBLEM_SOLVER_SYSTEM_PROMPT,
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
