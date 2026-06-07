import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getEnv, memoryConfigured } from "../../env.js";
import { inMemoryTruncate, isInMemorySeeded, markInMemorySeeded } from "../in-memory-store.js";
import { ensureMemorySchema, getMemoryPool } from "../pg.js";
import { sanitizeRunbookPlaceholders } from "../sanitize-placeholders.js";
import { stats as getMemoryStats, upsertSolution } from "../store.js";
import type { SolutionDoc, SolutionSource } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../../../..");

type PublicSeedEntry = {
  symptom: string;
  rootCause: string;
  fix: string;
  commands?: string;
  tags?: string[];
};

type TrainingContract = {
  diagnosis: string;
  fixes: Array<{
    command: string;
    rootCause: string;
    rationale: string;
  }>;
  validation?: {
    benefitCheck?: string;
  };
};

const SERVICE_NAMES = [
  "nginx",
  "apache2",
  "postgresql",
  "mysql",
  "redis-server",
  "docker",
  "app-api",
  "worker",
  "scheduler",
  "status-beacon",
];

const SYMPTOM_VARIANTS = [
  "not responding after reboot",
  "failed to start with exit code 1",
  "crash looping every few seconds",
  "health check failing intermittently",
  "timing out under load",
  "returning 503 to customers",
  "consuming excessive CPU",
  "unable to bind to its configured port",
];

const ROOT_CAUSE_VARIANTS = [
  "unit disabled and not configured to start on boot",
  "port conflict from a stale process",
  "missing dependency service not running",
  "configuration syntax error introduced in last deploy",
  "file permission mismatch on data directory",
  "certificate expired causing TLS handshake failure",
  "disk full preventing write operations",
  "memory limit exceeded causing OOM kill",
];

const FIX_VARIANTS = [
  "enable and start the affected systemd unit",
  "fix ownership on the service data directory",
  "renew TLS certificate and reload the web server",
  "free disk space and rotate logs",
  "remove stale process holding the port and restart service",
  "correct the invalid configuration and daemon-reload",
  "increase service memory limit in unit drop-in",
  "restore DNS resolver configuration",
];

function expandPublicSeedEntries(base: PublicSeedEntry[]): SolutionDoc[] {
  const docs: SolutionDoc[] = base.map((entry) => ({
    source: "public-seed",
    symptom: entry.symptom,
    rootCause: entry.rootCause,
    fix: entry.fix,
    commands: entry.commands ?? "",
    tags: entry.tags ?? [],
  }));

  for (const service of SERVICE_NAMES) {
    for (let i = 0; i < SYMPTOM_VARIANTS.length; i++) {
      docs.push({
        source: "public-seed",
        symptom: `${service} ${SYMPTOM_VARIANTS[i]}`,
        rootCause: `${ROOT_CAUSE_VARIANTS[i % ROOT_CAUSE_VARIANTS.length]} affecting ${service}`,
        fix: `${FIX_VARIANTS[i % FIX_VARIANTS.length]} for ${service}`,
        commands: `systemctl status ${service} --no-pager\njournalctl -u ${service} -n 50 --no-pager`,
        tags: ["generated", service, "systemd"],
      });
    }
  }

  return docs;
}

function loadPublicSeed(): SolutionDoc[] {
  const path = join(__dirname, "public-incidents.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as PublicSeedEntry[];
  return expandPublicSeedEntries(raw);
}

function chunkRunbook(content: string, sourceId: string): SolutionDoc[] {
  const sections = content
    .split(/\n## /)
    .map((section, index) => (index === 0 ? section : `## ${section}`))
    .filter((section) => section.trim().length > 80);

  return sections.map((section, index) => {
    const sanitized = sanitizeRunbookPlaceholders(section);
    return {
      source: "runbook",
      symptom: sanitized.slice(0, 240),
      rootCause: "See runbook section for common root causes in this symptom class",
      fix: "See runbook section for durable fix guidance",
      commands: sanitized.slice(0, 1200),
      tags: ["runbook", sourceId, `chunk-${index}`],
    };
  });
}

function loadRunbooks(): SolutionDoc[] {
  const runbookDir = join(repoRoot, "docs/knowledge/runbooks");
  const files = [
    "systemd-services.md",
    "networking-web-tls.md",
    "resource-exhaustion.md",
    "data-access-scheduling.md",
  ];

  const docs: SolutionDoc[] = [];
  for (const file of files) {
    const content = readFileSync(join(runbookDir, file), "utf8");
    docs.push(...chunkRunbook(content, file.replace(".md", "")));
  }
  return docs;
}

function loadTrainingContracts(): SolutionDoc[] {
  const path = join(repoRoot, "infra/sandbox/scenarios/training-contracts.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, TrainingContract>;
  const docs: SolutionDoc[] = [];

  for (const [key, contract] of Object.entries(raw)) {
    for (const fix of contract.fixes) {
      docs.push({
        source: "training-contract",
        symptom: contract.diagnosis,
        rootCause: fix.rootCause,
        fix: fix.rationale,
        commands: fix.command,
        validationStatus: contract.validation?.benefitCheck ?? "",
        tags: ["training-contract", key],
      });
    }
  }

  return docs;
}

async function seedDocs(docs: SolutionDoc[], label: SolutionSource): Promise<number> {
  let count = 0;
  for (const doc of docs) {
    const id = await upsertSolution(doc);
    if (id) count += 1;
  }
  console.log(`[seed] upserted ${count} ${label} entries`);
  return count;
}

async function seedAllSources(): Promise<void> {
  await seedDocs(loadPublicSeed(), "public-seed");
  await seedDocs(loadRunbooks(), "runbook");
  await seedDocs(loadTrainingContracts(), "training-contract");
}

export async function runMemorySeed(force = false): Promise<void> {
  if (!memoryConfigured()) {
    if (!force && isInMemorySeeded()) {
      console.log("[seed] in-memory store already seeded; skipping (use --force to re-seed)");
      return;
    }
    if (force) {
      inMemoryTruncate();
      console.log("[seed] truncated in-memory solution store");
    }
    await seedAllSources();
    markInMemorySeeded();
    const finalStats = await getMemoryStats();
    console.log(
      `[seed] complete (in-memory): ${finalStats.total} total entries`,
      finalStats.bySource,
    );
    return;
  }

  const ready = await ensureMemorySchema();
  if (!ready) {
    console.error("[seed] memory schema unavailable");
    return;
  }

  const pool = getMemoryPool();
  if (!pool) return;

  const current = await getMemoryStats();
  if (!force && current.total > 0) {
    console.log(
      `[seed] memory already has ${current.total} entries; skipping (use --force to re-seed)`,
    );
    return;
  }

  if (force && current.total > 0) {
    await pool.query("TRUNCATE solution_memory");
    console.log("[seed] truncated existing solution_memory");
  }

  await seedAllSources();

  const finalStats = await getMemoryStats();
  console.log(`[seed] complete: ${finalStats.total} total entries`, finalStats.bySource);
}
