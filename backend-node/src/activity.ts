// Activity generator (mirror of backend-py/app/activity.py) — drafts the graded ERP
// documentation from the run's audit log, then redacts secrets again on the way out.
import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "./llm";
import { redact } from "./safety";

const schema = z.object({
  summary: z.string().describe("One sentence on what was restored."),
  root_cause: z.string().describe("The technical root cause, not the symptom."),
  actions_taken: z.string().describe("Diagnosis + fix steps, in order."),
  commands_summary: z.string().describe("Relevant commands / command classes, no secret output."),
  validation_result: z.string().describe("Concrete proof the customer benefit is restored."),
  description: z.string().describe("2-4 sentence free-text combining the above."),
});

const FIELDS = ["summary", "root_cause", "actions_taken", "commands_summary", "validation_result", "description"] as const;

function digest(run: any): string {
  const lines: string[] = [];
  for (const s of run.steps) {
    if (s.status === "succeeded" || s.status === "failed") {
      const cmd = redact(s.edited_command || s.command);
      const r = s.result || {};
      lines.push(`[${s.kind}] $ ${cmd}\n  exit=${r.exit_code}\n  ${(r.stdout || "").trim().slice(0, 500)}`);
    } else if (s.status === "rejected") {
      lines.push(`[rejected by technician] ${redact(s.command)}`);
    } else if (s.status === "blocked") {
      lines.push(`[blocked by safety] ${redact(s.command)}`);
    }
  }
  return lines.join("\n") || "(no commands executed)";
}

export async function generate(run: any): Promise<any> {
  const concl = run.conclusion || {};
  const prompt =
    "You are documenting a completed IT support incident for the ERP. Write a precise, technically useful activity log. Use ONLY the evidence below. No secrets, no invented details.\n\n" +
    `Ticket #${run.ticket_id}: ${run.ticket.title}\n` +
    `Customer report (symptom): ${run.ticket.description}\n` +
    `Agent root-cause note: ${concl.root_cause || ""}\n` +
    `Agent validation note: ${concl.validation_result || ""}\n` +
    `Fixed: ${concl.fixed}\n\n` +
    `Ordered actions (commands + results):\n${digest(run)}`;

  let data: Record<string, unknown> = {};
  try {
    const { output } = await generateText({
      model: getModel(),
      system: "You write clean, accurate IT incident documentation.",
      prompt,
      output: Output.object({ schema }),
    });
    data = (output as Record<string, unknown>) || {};
  } catch {
    data = {};
  }

  const draft: Record<string, any> = {};
  for (const k of FIELDS) draft[k] = redact(String(data[k] || ""));
  draft.ticket_id = run.ticket_id;
  draft.start_datetime = run.created_at;
  draft.end_datetime = new Date().toISOString();
  if (!String(draft.description).trim()) draft.description = `${draft.summary} ${draft.validation_result}`.trim();
  return draft;
}

export function toPayload(run: any, draft: any): any {
  return {
    ticket_id: run.ticket_id,
    start_datetime: draft.start_datetime || run.created_at,
    end_datetime: draft.end_datetime || new Date().toISOString(),
    description: redact(draft.description || "") || redact(draft.summary || ""),
    summary: redact(draft.summary || ""),
    root_cause: redact(draft.root_cause || ""),
    actions_taken: redact(draft.actions_taken || ""),
    commands_summary: redact(draft.commands_summary || ""),
    validation_result: redact(draft.validation_result || ""),
  };
}
