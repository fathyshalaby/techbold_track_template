// Agent (mirror of backend-py/app/agent.py) — builds prompt + tools, asks the LLM for the
// NEXT single action via the Vercel AI SDK. Tools have NO execute, so generateText returns the
// tool call and we manage the human-in-the-loop + execution ourselves. Keep in sync with
// shared/agent-spec.md.
import { generateText, type ModelMessage, tool } from "ai";
import { z } from "zod";
import { getModel } from "./llm";

export const SYSTEM_PROMPT = `You are an expert Linux service-desk technician's copilot. You troubleshoot ONE customer incident on a remote Ubuntu server over SSH, under the technician's control.

You never run anything yourself. You propose ONE command at a time via the run_command tool. A human approves, edits, or rejects each one; you only see a command's output after it has been approved and executed. Work strictly from the evidence you have — never assume a command ran.

Method (diagnosis-first):
1. Start with READ-ONLY diagnostics (status, logs, ports, configs) to find the technical ROOT CAUSE, not just the symptom. Briefly state your leading hypothesis before acting.
2. Propose the SMALLEST, most targeted fix that addresses the root cause. Prefer editing the real config / enabling the unit over a runtime-only patch.
3. Ensure PERSISTENCE: the fix must survive a reboot or service restart (systemctl enable --now, persisted config, correct permissions/fstab) — the grader reboots.
4. VALIDATE with concrete proof the customer benefit is restored (service active, port listening, endpoint returns 200, etc.).
5. When resolved (or blocked), call conclude.

Safety contract (non-negotiable):
- One command per run_command call. Avoid chaining with ; && | $() or backticks unless truly required and justified.
- Minimal changes. No unnecessary installs, no broad filesystem changes, restarts kept proportionate.
- NEVER propose: deleting/reinitialising databases or customer data; chmod -R 777 on system dirs; deleting /etc, /home, /var/lib/postgresql; disabling the firewall/audit/security controls; clearing logs or history; running the app as root to dodge DB permissions.
- NEVER read, echo, or exfiltrate secrets (keys, passwords, tokens). Inspect structure/permissions, not secret contents.
- Give a one-or-two-sentence rationale a technician can verify for every command.

Be decisive and economical — fewer, well-targeted commands score better. You are facing an incident you have never seen; reason from first principles.`;

export const tools = {
  run_command: tool({
    description:
      "Propose ONE shell command to run on the customer's Ubuntu VM over SSH. A human approves, edits, or rejects it before it runs; you only see output after approval.",
    inputSchema: z.object({
      command: z.string().describe("One shell command. No secrets. No chaining unless justified."),
      purpose: z.enum(["diagnose", "fix", "validate"]),
      rationale: z.string().describe("Why this command, in one or two sentences."),
    }),
    // no execute -> the tool call is forwarded to us for the human-in-the-loop gate.
  }),
  conclude: tool({
    description: "Call when the incident is resolved (or you are blocked). Ends the session.",
    inputSchema: z.object({
      root_cause: z.string().describe("The technical root cause, not the symptom."),
      fixed: z.boolean(),
      validation_result: z.string().describe("Concrete proof, or why still blocked."),
    }),
  }),
};

export function initialMessages(ticket: any, system: any): ModelMessage[] {
  const user =
    `Ticket #${ticket.id}: ${ticket.title}\n` +
    `Customer: ${ticket.customer_name}\n` +
    `Priority: ${ticket.priority}\n` +
    `Customer report (symptom only): ${ticket.description}\n\n` +
    `Customer system: ${system.os} at ${system.ip}:${system.port} as user ${system.username}.\n` +
    `Notes: ${system.notes || "(none)"}\n\n` +
    "Begin with read-only diagnostics to find the technical root cause, then propose a minimal, persistent fix, then validate. Propose ONE command at a time via run_command; call conclude when done.";
  return [{ role: "user", content: user }];
}

export interface NextAction {
  type: "run_command" | "conclude" | "message";
  toolCallId?: string;
  toolName?: string;
  args?: any;
  content?: string;
  deferred: Array<{ toolCallId: string; toolName: string }>;
}

export async function nextAction(messages: ModelMessage[]): Promise<NextAction> {
  const result = await generateText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages,
    tools,
    toolChoice: "auto",
  });
  messages.push(...(result.response.messages as ModelMessage[]));

  const calls = result.toolCalls ?? [];
  if (calls.length === 0) {
    return { type: "message", content: result.text, deferred: [] };
  }
  const first = calls[0];
  if (!first) return { type: "message", content: result.text, deferred: [] };
  const rest = calls.slice(1);
  const deferred = rest.map((c) => ({ toolCallId: c.toolCallId, toolName: c.toolName }));
  const type = first.toolName === "run_command" || first.toolName === "conclude" ? first.toolName : "message";
  return {
    type,
    toolCallId: first.toolCallId,
    toolName: first.toolName,
    args: (first as any).input,
    content: result.text,
    deferred,
  };
}

export function toolResultMessage(toolCallId: string, toolName: string, value: string): ModelMessage {
  return {
    role: "tool",
    content: [{ type: "tool-result", toolCallId, toolName, output: { type: "text", value } }],
  };
}
