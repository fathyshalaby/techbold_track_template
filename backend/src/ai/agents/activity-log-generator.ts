import { generateObject } from 'ai';
import type { LanguageModelV1 } from 'ai';
import { getModel } from '../model.js';
import { ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT } from '../prompts.js';
import { ActivityDraftFieldsSchema } from '../types.js';
import type { ActivityDraftFields } from '../types.js';
import { AgentUnavailableError } from './problem-analyzer.js';

export { AgentUnavailableError };
export { ActivityDraftFieldsSchema };
export type { ActivityDraftFields };

export type ActivityLogGeneratorInput = {
  auditEvents: Array<{ type: string; actor: string; ts: string; payload_json: string }>;
  commandResults: Array<{ command: string; exitCode: number; stdoutRedacted: string; stderrRedacted: string }>;
  observations: string[];
  ticketDescription: string;
};

export const MOCK_ACTIVITY_DRAFT: ActivityDraftFields = {
  summary: 'The nginx service was found stopped due to a port conflict on port 80. The service was restarted and verified operational.',
  rootCause: 'Port 80 was already bound by a conflicting process, preventing nginx from starting.',
  actionsTaken: 'Ran systemctl status nginx to confirm service failure, identified port conflict via ss -tulpn, terminated the conflicting process, and restarted nginx.',
  commandsSummary: '$ systemctl status nginx (exit 1)\n$ ss -tulpn (exit 0)\n$ systemctl restart nginx (exit 0)',
  validationResult: 'Service verified running after restart; curl localhost returned HTTP 200.',
};

export async function runActivityLogGenerator(
  input: ActivityLogGeneratorInput,
  model?: LanguageModelV1,
): Promise<ActivityDraftFields> {
  const resolvedModel = model ?? getModel();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      generateObject({
        model: resolvedModel,
        schema: ActivityDraftFieldsSchema,
        system: ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT,
        prompt: JSON.stringify(input),
        maxTokens: 2048,
      }),
      new Promise<never>((_, rej) => {
        timer = setTimeout(() => rej(new Error('timeout')), 30_000);
      }),
    ]);
    return result.object;
  } catch {
    throw new AgentUnavailableError('agent unavailable: activity-log-generator');
  } finally {
    // Cancel the timeout once the race settles — no orphan 30s timer left pending
    // after the model resolves (avoids keeping the loop alive / late rejections).
    if (timer) clearTimeout(timer);
  }
}
