import { tool } from "ai";
import { z } from "zod";

export const proposeSshCommand = tool({
  description:
    "Propose exactly ONE shell command to run on the target VM to diagnose or fix the incident. " +
    "This does NOT execute the command - the technician reviews, may edit, and approves it first.",
  parameters: z.object({
    command: z
      .string()
      .describe("The single shell command to run (avoid chaining unless required)."),
    purpose: z
      .string()
      .describe("What this command checks or changes, and the signal expected from its output."),
    isReadOnly: z
      .boolean()
      .describe("True if the command only observes state (no change), false if it mutates."),
  }),
});
