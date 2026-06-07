import { generateObject } from "ai";
import type { LanguageModelV1 } from "ai";
import { guardModelInput } from "../input-guard.js";
import { getModel, isBuiltInMockModel } from "../model.js";
import { ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT } from "../prompts.js";
import { ActivityDraftFieldsSchema } from "../types.js";
import type { ActivityDraftFields } from "../types.js";
import { AgentUnavailableError, runAgentObject } from "./resilience.js";

export { AgentUnavailableError };
export { ActivityDraftFieldsSchema };
export type { ActivityDraftFields };

export type ActivityLogGeneratorInput = {
  auditEvents: Array<{ type: string; actor: string; ts: string; payload_json: string }>;
  commandResults: Array<{
    command: string;
    exitCode: number;
    stdoutRedacted: string;
    stderrRedacted: string;
  }>;
  observations: string[];
  ticketDescription: string;
};

export const MOCK_ACTIVITY_DRAFT: ActivityDraftFields = {
  summary:
    "The status-api service was found failed after restart and was restarted through systemd.",
  rootCause: "The service did not recover after reboot and required an operator-approved restart.",
  actionsTaken:
    "Checked status-api service status, restarted the service, and validated the endpoint response.",
  commandsSummary:
    "$ systemctl status status-api --no-pager (exit 3)\n$ sudo systemctl restart status-api (exit 0)",
  validationResult:
    "Service verified running after restart; curl localhost:8080 returned HTTP 200.",
};

export async function runActivityLogGenerator(
  input: ActivityLogGeneratorInput,
  model?: LanguageModelV1,
): Promise<ActivityDraftFields> {
  const resolvedModel = model ?? getModel();
  if (isBuiltInMockModel(resolvedModel)) {
    return MOCK_ACTIVITY_DRAFT;
  }
  return runAgentObject("activity-log-generator", async () => {
    const result = await generateObject({
      model: resolvedModel,
      schema: ActivityDraftFieldsSchema,
      system: ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT,
      prompt: guardModelInput(input),
      maxTokens: 2048,
    });
    return result.object;
  });
}
