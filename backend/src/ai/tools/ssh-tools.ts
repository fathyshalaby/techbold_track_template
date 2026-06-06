import { tool } from 'ai';
import { z } from 'zod';
import type { CommandResult, SshExecutor, SshTarget } from '../../ssh/types.js';
import {
  executeApprovedCommand as executeReal,
  runPreflight as runPreflightReal,
  createSshExecutor as createRealSshExecutor,
} from '../../ssh/executor.js';
import { createMockSshExecutor } from '../../ssh/mock.js';
import { resolveClientMode } from '../../env.js';

export const proposeSshCommand = tool({
  description:
    'Propose ONE shell command to run on the customer VM for human approval. Does NOT execute.',
  parameters: z.object({
    command: z.string().describe('The exact shell command to run'),
    purpose: z.string().describe('Why this command is needed for diagnosis'),
    expectedSignal: z.string().describe('What output or exit code indicates the hypothesis is confirmed'),
    riskNotes: z.string().describe('Any destructive or side-effect risks the technician should know'),
    isReadOnly: z.boolean().describe('True if the command only reads state and cannot modify the system'),
  }),
});

export function createSshExecutor(): SshExecutor {
  if (resolveClientMode('ssh') === 'mock') {
    return createMockSshExecutor();
  }
  return createRealSshExecutor();
}

// Backend-only — NOT a model tool (ARCHITECTURE.md anti-pattern A1). Never pass to tool().
export async function executeApprovedCommand(
  approvalId: string,
  command: string,
  target: SshTarget,
): Promise<CommandResult> {
  return createSshExecutor().executeApprovedCommand(approvalId, command, target);
}
