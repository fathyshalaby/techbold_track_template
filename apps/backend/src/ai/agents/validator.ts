import { generateObject } from "ai";
import type { LanguageModelV1 } from "ai";
import { guardModelInput } from "../input-guard.js";
import { getModel, isBuiltInMockModel } from "../model.js";
import { VALIDATOR_SYSTEM_PROMPT } from "../prompts.js";
import { ValidationResultSchema } from "../types.js";
import type { ValidationResult } from "../types.js";
import { AgentUnavailableError, runAgentObject } from "./resilience.js";

export { AgentUnavailableError };
export { ValidationResultSchema };
export type { ValidationResult };

export type ValidatorInput = {
  ticketDescription: string;
  observations: string[];
  fixApplied: string;
};

export const MOCK_VALIDATION_RESULT_LIKELY: ValidationResult = {
  status: "LIKELY_FIXED",
  benefitCheck: 'curl -s -o /dev/null -w "%{http_code}" localhost:8080 returned 200',
  persistenceCheck: null,
  evidence: ["status-api service is active", "HTTP 200 returned from localhost:8080"],
};

export async function runValidator(
  input: ValidatorInput,
  model?: LanguageModelV1,
): Promise<ValidationResult> {
  const resolvedModel = model ?? getModel();
  if (isBuiltInMockModel(resolvedModel)) {
    return MOCK_VALIDATION_RESULT_LIKELY;
  }
  return runAgentObject("validator", async () => {
    const result = await generateObject({
      model: resolvedModel,
      schema: ValidationResultSchema,
      system: VALIDATOR_SYSTEM_PROMPT,
      prompt: guardModelInput({
        ticketDescription: input.ticketDescription,
        observations: input.observations,
        fixApplied: input.fixApplied,
      }),
      maxTokens: 1024,
    });
    return result.object;
  });
}
