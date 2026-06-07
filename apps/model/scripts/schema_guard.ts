import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  ActivityDraftFieldsSchema,
  DiagnosticProposalSchema,
  FixProposalSchema,
  ValidationResultSchema,
} from "../../backend/src/ai/types.ts";

type RecordMeta = {
  source?: string;
  role?: string;
};

type ChatRecord = {
  messages?: Array<{ role?: string; content?: string }>;
  meta?: RecordMeta;
};

const schemaByRole = {
  activity_log_generator: ActivityDraftFieldsSchema,
  problem_analyzer: DiagnosticProposalSchema,
  problem_solver: FixProposalSchema,
  validator: ValidationResultSchema,
} as const;

const skipRoles = new Set(["freeform", "unsafe_correction", "unknown", "general", ""]);

function option(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function readJsonl(path: string): ChatRecord[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      try {
        return JSON.parse(line) as ChatRecord;
      } catch (error) {
        throw new Error(`${path}:${idx + 1}: invalid JSONL row: ${String(error)}`);
      }
    });
}

function assistantContent(record: ChatRecord): string {
  const last = record.messages?.at(-1);
  if (!last || last.role !== "assistant" || typeof last.content !== "string") {
    throw new Error(`${record.meta?.source ?? "unknown"}: last message is not assistant text`);
  }
  return last.content;
}

function main() {
  const sourceDir = resolve(option("--source-dir", "data/source"));
  const outFile = resolve(option("--out-file", "outputs/schema_guard.json"));
  const files = readdirSync(sourceDir)
    .filter((name) => name.endsWith(".jsonl"))
    .sort()
    .map((name) => join(sourceDir, name));

  const failures: Array<{ source: string; role: string; reason: string }> = [];
  const counts: Record<string, number> = {};
  let checked = 0;
  let skipped = 0;

  for (const file of files) {
    for (const record of readJsonl(file)) {
      const role = record.meta?.role ?? "unknown";
      counts[role] = (counts[role] ?? 0) + 1;
      const schema = schemaByRole[role as keyof typeof schemaByRole];
      if (!schema) {
        if (skipRoles.has(role)) {
          skipped += 1;
          continue;
        }
        const content = assistantContent(record).trim();
        if (content.startsWith("{")) {
          failures.push({
            source: record.meta?.source ?? "unknown",
            role,
            reason: "JSON assistant row has no schema mapping",
          });
        } else {
          skipped += 1;
        }
        continue;
      }

      checked += 1;
      try {
        schema.parse(JSON.parse(assistantContent(record)));
      } catch (error) {
        failures.push({
          source: record.meta?.source ?? "unknown",
          role,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const report = {
    checked,
    skipped,
    passed: failures.length === 0,
    counts,
    failures,
  };
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (failures.length > 0) process.exit(1);
}

main();
