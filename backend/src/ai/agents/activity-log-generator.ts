import type { ActivityDraftFields } from '../types.js';

export type ActivityLogGeneratorInput = {
  auditEvents: Array<{ type: string; actor: string; ts: string; payload_json: string }>;
  commandResults: Array<{ command: string; exitCode: number; stdoutRedacted: string; stderrRedacted: string }>;
  observations: string[];
  ticketDescription: string;
};

export const MOCK_ACTIVITY_DRAFT: ActivityDraftFields = {} as ActivityDraftFields;

export async function runActivityLogGenerator(
  _input: ActivityLogGeneratorInput,
): Promise<ActivityDraftFields> {
  throw new Error('not implemented');
}
