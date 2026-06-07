import { generateObject } from 'ai';
import type { LanguageModelV1 } from 'ai';
import { getModel } from '../model.js';
import { DiagnosticProposalSchema } from '../types.js';
import { PROBLEM_ANALYZER_SYSTEM_PROMPT } from '../prompts.js';
import { selectRunbooks } from '../knowledge.js';

export { DiagnosticProposalSchema };
export type { DiagnosticProposal } from '../types.js';

export class AgentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentUnavailableError';
  }
}

export type ProblemAnalyzerInput = {
  ticketDescription: string;
  observations: string[];
};

export const MOCK_DIAGNOSTIC_PROPOSAL = {
  hypotheses: [
    {
      cause: 'nginx service failed to start due to misconfigured port binding',
      evidence: 'service reports active (exited) or failed in systemctl status',
      confidence: 0.8,
    },
  ],
  command: 'systemctl status nginx --no-pager',
  purpose: 'Confirm nginx service state and surface the exact error message',
  expectedSignal: 'Output shows "failed" or "active (exited)" with an error code',
  riskNotes: 'Read-only; no changes to system state',
  isReadOnly: true,
};

export async function runProblemAnalyzer(
  input: ProblemAnalyzerInput,
  model?: LanguageModelV1,
): Promise<import('../types.js').DiagnosticProposal> {
  const resolvedModel = model ?? getModel();
  // Route the relevant runbook slice by symptom (ticket + observations) — the
  // method lives in the system prompt; the matched runbook is per-incident context.
  const runbook = selectRunbooks(
    `${input.ticketDescription} ${input.observations.join(' ')}`,
  );
  try {
    const result = await Promise.race([
      generateObject({
        model: resolvedModel,
        schema: DiagnosticProposalSchema,
        system: PROBLEM_ANALYZER_SYSTEM_PROMPT,
        prompt: JSON.stringify({
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
    throw new AgentUnavailableError('agent unavailable: problem_analyzer');
  }
}
