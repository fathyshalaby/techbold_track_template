import { generateObject } from "ai";
import type { LanguageModelV1 } from "ai";
import { z } from "zod";
import { guardModelInput } from "../input-guard.js";
import { getModel } from "../model.js";
import { CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT } from "../prompts.js";
import { AgentUnavailableError, runAgentObject } from "./resilience.js";

export { AgentUnavailableError };

export const CustomerSystemContextSchema = z.object({
  summary: z.string().min(1),
});

export type CustomerSystemContext = z.infer<typeof CustomerSystemContextSchema>;

export type CustomerSystemAnalyzerInput = {
  ticketDescription: string;
  observations: string[];
};

export async function runCustomerSystemAnalyzer(
  input: CustomerSystemAnalyzerInput,
  model?: LanguageModelV1,
): Promise<CustomerSystemContext> {
  const resolvedModel = model ?? getModel();
  return runAgentObject("customer_system_analyzer", async () => {
    const result = await generateObject({
      model: resolvedModel,
      schema: CustomerSystemContextSchema,
      system: CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT,
      prompt: guardModelInput({
        ticketDescription: input.ticketDescription,
        observations: input.observations,
      }),
      maxTokens: 1024,
    });
    return result.object;
  });
}
