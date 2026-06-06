// SSH tools — proposeSshCommand only; execution is backend-only (never a model tool).
// Anti-pattern A1: executeApprovedCommand must NEVER be registered as a model tool
// (ARCHITECTURE.md §A1). It is intentionally NOT imported in this file — the
// orchestrator imports it directly from ssh/executor (or via ssh/factory).
import { tool } from 'ai';
import { z } from 'zod';

// The ONLY SSH-related model tool. It has NO `execute` callback: the model
// proposes exactly one command; the backend runs it through the safety gate
// after human approval. This is what enforces "the model never executes".
export const proposeSshCommand = tool({
  description:
    'Propose exactly ONE shell command to run on the target VM to diagnose or fix the incident. ' +
    'This does NOT execute the command — the technician reviews, may edit, and approves it first.',
  parameters: z.object({
    command: z.string().describe('The single shell command to run (avoid chaining unless required).'),
    purpose: z.string().describe('What this command checks or changes, and the signal expected from its output.'),
    isReadOnly: z.boolean().describe('True if the command only observes state (no change), false if it mutates.'),
  }),
});
