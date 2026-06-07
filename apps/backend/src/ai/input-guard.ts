import { redactSecrets } from "../safety/redaction.js";

// LLM input guard - redact secrets/PII from EVERY payload before it reaches the
// model. Main already redacts command OUTPUT at the audit/UI sink, but the
// ticket description (authored in Phoenix, outside our control) and the
// assembled prompt also flow to the model. A credential pasted into a ticket
// would otherwise reach the LLM provider verbatim. This closes that gap with the
// SAME redactSecrets() used at the sink - defense-in-depth on the inbound side.
//
// Redaction is applied per string field (not over the serialized blob) so the
// 16 KB redaction cap can never silently truncate a structurally-valid prompt.
function deepRedact(value: unknown): unknown {
  if (typeof value === "string") return redactSecrets(value);
  if (Array.isArray(value)) return value.map(deepRedact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, deepRedact(v)]),
    );
  }
  return value;
}

// Guard a structured prompt payload: returns a JSON string with every string
// field redacted, ready to hand to generateObject's `prompt`.
export function guardModelInput(payload: unknown): string {
  return JSON.stringify(deepRedact(payload));
}
