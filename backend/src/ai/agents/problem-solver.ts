import { generateObject } from 'ai';
import type { LanguageModelV1 } from 'ai';
import { getModel } from '../model.js';
import { PROBLEM_SOLVER_SYSTEM_PROMPT } from '../prompts.js';
import { FixProposalSchema } from '../types.js';
import type { FixProposal } from '../types.js';
import { AgentUnavailableError } from './problem-analyzer.js';
import { selectRunbooks } from '../knowledge.js';
import { guardModelInput } from '../input-guard.js';

export { AgentUnavailableError };
export { FixProposalSchema };
export type { FixProposal };

export type ProblemSolverInput = {
  ticketDescription: string;
  observations: string[];
};

export async function runProblemSolver(
  input: ProblemSolverInput,
  model?: LanguageModelV1,
): Promise<FixProposal> {
  const resolvedModel = model ?? getModel();
  const runbook = selectRunbooks(
    `${input.ticketDescription} ${input.observations.join(' ')}`,
  );
  try {
    const result = await Promise.race([
      generateObject({
        model: resolvedModel,
        schema: FixProposalSchema,
        system: PROBLEM_SOLVER_SYSTEM_PROMPT,
        prompt: guardModelInput({
          ticketDescription: input.ticketDescription,
          observations: input.observations,
          ...(runbook ? { runbook } : {}),
        }),
        maxTokens: 1024,
      }),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('timeout')), 30_000),
      ),
    ]);
    return result.object;
  } catch {
    throw new AgentUnavailableError('agent unavailable: problem_solver');
  }
}
