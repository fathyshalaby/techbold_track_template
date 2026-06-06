// Safety layer (mirror of backend-py/app/safety.py) — loads the SAME shared/safety-rules.json
// so both backends classify identically. blocked = never runs; low_risk = read-only;
// needs_review = default. ALL non-blocked still require human approval.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config";

function sharedDir(): string {
  if (existsSync(join(config.sharedDir, "safety-rules.json"))) return config.sharedDir;
  const here = dirname(fileURLToPath(import.meta.url)); // backend-node/src
  return join(here, "..", "..", "shared"); // -> repo_root/shared
}

interface RawRule {
  id: string;
  reason?: string;
  pattern: string;
}

const rules = JSON.parse(readFileSync(join(sharedDir(), "safety-rules.json"), "utf8"));
const DENY: Array<[string, string, RegExp]> = rules.deny.map((r: RawRule) => [
  r.id,
  r.reason || "",
  new RegExp(r.pattern, "i"),
]);
const ALLOW: Array<[string, RegExp]> = rules.readonly_allow.map((r: RawRule) => [r.id, new RegExp(r.pattern, "i")]);

export interface Verdict {
  classification: "blocked" | "low_risk" | "needs_review";
  risk: string;
  matched_rule: string | null;
  reason: string | null;
}

export function classify(command: string): Verdict {
  const cmd = (command || "").trim();
  for (const [id, reason, rx] of DENY) {
    if (rx.test(cmd)) return { classification: "blocked", risk: "blocked", matched_rule: id, reason };
  }
  for (const [id, rx] of ALLOW) {
    if (rx.test(cmd)) return { classification: "low_risk", risk: "low", matched_rule: id, reason: null };
  }
  return { classification: "needs_review", risk: "needs_review", matched_rule: null, reason: null };
}

export function isBlocked(command: string): boolean {
  return classify(command).classification === "blocked";
}

const SECRET_PATTERNS: RegExp[] = [
  /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,
  /(password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key)\s*[:=]\s*\S+/gi,
  /\bBearer\s+[A-Za-z0-9._\-]{8,}/gi,
  /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g, // emails (PII)
  /\bAKIA[0-9A-Z]{16}\b/g, // AWS access key id
  /\beyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g, // JWT
  /\bgh[posru]_[A-Za-z0-9]{20,}\b/g, // GitHub tokens
];

export function redact(text?: string | null): string {
  if (!text) return text || "";
  let s = String(text);
  for (const v of [config.phoenixToken, config.azureApiKey, config.openrouterApiKey]) {
    if (v && v.length >= 6) s = s.split(v).join("***REDACTED***");
  }
  // connection strings: scheme://user:password@host -> scheme://user:***@host
  s = s.replace(/([A-Za-z][A-Za-z0-9+.\-]*:\/\/[^\s:@/]+):[^\s:@/]+@/g, "$1:***@");
  for (const rx of SECRET_PATTERNS) s = s.replace(rx, "***REDACTED***");
  return s;
}
