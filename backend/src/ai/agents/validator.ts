import { generateObject } from 'ai';
import type { LanguageModelV1 } from 'ai';
import { getModel } from '../model.js';
import { VALIDATOR_SYSTEM_PROMPT } from '../prompts.js';
import { ValidationResultSchema } from '../types.js';
import type { ValidationResult } from '../types.js';
import { AgentUnavailableError } from './problem-analyzer.js';

export { AgentUnavailableError };
export { ValidationResultSchema };
export type { ValidationResult };

export type ValidatorInput = {
  ticketDescription: string;
  observations: string[];
  fixApplied: string;
};

export const MOCK_VALIDATION_RESULT_LIKELY: ValidationResult = {
  status: 'LIKELY_FIXED',
  benefitCheck: 'curl -s -o /dev/null -w "%{http_code}" localhost:80 returned 200',
  persistenceCheck: null,
  evidence: ['nginx service is active', 'HTTP 200 returned from localhost:80'],
};

export async function runValidator(
  input: ValidatorInput,
  model?: LanguageModelV1,
): Promise<ValidationResult> {
  const resolvedModel = model ?? getModel();
  try {
    const result = await Promise.race([
      generateObject({
        model: resolvedModel,
        schema: ValidationResultSchema,
        system: VALIDATOR_SYSTEM_PROMPT,
        prompt: JSON.stringify({
          ticketDescription: input.ticketDescription,
          observations: input.observations,
          fixApplied: input.fixApplied,
        }),
        maxTokens: 1024,
      }),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('timeout')), 30_000),
      ),
    ]);
    return result.object;
  } catch {
    throw new AgentUnavailableError('agent unavailable: validator');
  }
}
