import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { Scenario } from "./types.js";

const execFileAsync = promisify(execFile);

const sandboxModuleDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(sandboxModuleDir, "../../../..");
const sandboxDir = resolve(repoRoot, "infra/sandbox");
const publicKeyPath = resolve(repoRoot, "keys/bench_incident_key.pub");
const baseDockerfile = resolve(sandboxDir, "Dockerfile.base");
const baseImageTag = "sda-sandbox-base:latest";
const labelKey = "techbold.sandbox";
const labelValue = "service-desk-autopilot";

export function scenarioContainerName(scenario: Scenario): string {
  return `sda-${scenario.archetype}-${scenario.ticket.id}`;
}

function imageName(scenario: Scenario): string {
  return `sda-sandbox-${scenario.ticket.id}:latest`;
}

type DockerResult = { status: number; stdout: string; stderr: string };

async function docker(
  args: string[],
  options: { allowFailure?: boolean } = {},
): Promise<DockerResult> {
  try {
    const { stdout, stderr } = await execFileAsync("docker", args, {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    return { status: 0, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (err) {
    const e = err as { code?: number; stdout?: string; stderr?: string; message?: string };
    const result: DockerResult = {
      status: typeof e.code === "number" ? e.code : 1,
      stdout: (e.stdout ?? "").trim(),
      stderr: (e.stderr ?? "").trim(),
    };
    if (options.allowFailure) return result;
    const reason = result.stderr || e.message || `exit ${result.status}`;
    throw new Error(`docker ${args.join(" ")} failed: ${reason}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

// systemd as PID 1 inside Docker needs privileged + a writable cgroup mount
// (true on Docker Desktop / macOS, where a non-privileged /sbin/init exits
// immediately). It is therefore the default; set SANDBOX_DOCKER_PRIVILEGED=false
// only on a host where unprivileged systemd is known to work.
function privilegedEnabled(): boolean {
  return process.env.SANDBOX_DOCKER_PRIVILEGED?.trim().toLowerCase() !== "false";
}

export function readBenchPublicKey(): string {
  if (!existsSync(publicKeyPath)) {
    throw new Error(
      `Missing ${publicKeyPath}. Reuse keys/bench_incident_key.pub; do not generate or commit a new key.`,
    );
  }
  return readFileSync(publicKeyPath, "utf8").trim();
}

async function imageExists(tag: string): Promise<boolean> {
  const result = await docker(["image", "inspect", tag], { allowFailure: true });
  return result.status === 0;
}

let baseImagePromise: Promise<void> | null = null;

// Build the heavy shared base (apt + ssh + user setup) exactly once and cache the
// in-flight promise so parallel provisioning does not trigger duplicate builds.
export function ensureBaseImage(publicKey?: string): Promise<void> {
  if (!baseImagePromise) {
    baseImagePromise = buildBaseImage(publicKey).catch((err) => {
      baseImagePromise = null;
      throw err;
    });
  }
  return baseImagePromise;
}

async function buildBaseImage(publicKey?: string): Promise<void> {
  if (await imageExists(baseImageTag)) return;
  const key = publicKey ?? readBenchPublicKey();
  await docker([
    "build",
    "-f",
    baseDockerfile,
    "-t",
    baseImageTag,
    "--build-arg",
    `BENCH_PUBLIC_KEY=${key}`,
    sandboxDir,
  ]);
}

function buildArgsForScenario(scenario: Scenario, publicKey: string): string[] {
  const args = [
    "--build-arg",
    `BASE_IMAGE=${baseImageTag}`,
    "--build-arg",
    `BENCH_PUBLIC_KEY=${publicKey}`,
  ];
  const add = (key: string, value: string | number) => {
    args.push("--build-arg", `${key}=${value}`);
  };

  switch (scenario.archetype) {
    case "service-health":
      add("SERVICE_NAME", scenario.params.serviceName);
      add("SERVICE_PORT", scenario.params.port);
      add("HEALTH_PATH", scenario.params.healthPath);
      break;
    case "document-upload":
      add("SERVICE_NAME", scenario.params.serviceName);
      add("SERVICE_USER", scenario.params.serviceUser);
      add("SERVICE_UID", scenario.params.serviceUid);
      add("SERVICE_PORT", scenario.params.port);
      add("ROOT_DIR", scenario.params.rootDir);
      add("UPLOAD_DIR", scenario.params.uploadDir);
      add("EXISTING_DIR", scenario.params.existingDir);
      break;
    case "partner-sync":
      add("PARTNER_SERVICE", scenario.params.partnerService);
      add("SYNC_SERVICE", scenario.params.syncService);
      add("PARTNER_HOST", scenario.params.partnerHost);
      add("GOOD_IP", scenario.params.goodIp);
      add("BAD_IP", scenario.params.badIp);
      add("PARTNER_PORT", scenario.params.partnerPort);
      add("STATUS_PATH", scenario.params.statusPath);
      break;
    case "erp-write-path":
      add("DATABASE_NAME", scenario.params.databaseName);
      add("APP_ROLE", scenario.params.appRole);
      add("APP_PASSWORD", scenario.params.appPassword);
      add("TABLE_NAME", scenario.params.tableName);
      add("SEQUENCE_NAME", scenario.params.sequenceName);
      break;
    case "monitoring-data":
      add("CUSTOMER_APP_SERVICE", scenario.params.customerAppService);
      add("CUSTOMER_APP_PORT", scenario.params.customerAppPort);
      add("DASHBOARD_SERVICE", scenario.params.dashboardService);
      add("DASHBOARD_PORT", scenario.params.dashboardPort);
      add("INGEST_SERVICE", scenario.params.ingestService);
      add("INGEST_PORT", scenario.params.ingestPort);
      add("AGENT_SERVICE", scenario.params.agentService);
      add("CONFIG_FILE", scenario.params.configFile);
      add("CORRECT_ENDPOINT", scenario.params.correctEndpoint);
      add("BAD_ENDPOINT", scenario.params.badEndpoint);
      break;
  }

  return args;
}

export async function buildScenarioImage(scenario: Scenario, publicKey: string): Promise<void> {
  await docker([
    "build",
    "-f",
    resolve(sandboxDir, "archetypes", scenario.archetype, "Dockerfile"),
    "-t",
    imageName(scenario),
    ...buildArgsForScenario(scenario, publicKey),
    sandboxDir,
  ]);
}

export async function runScenarioContainer(scenario: Scenario): Promise<void> {
  const privileged = privilegedEnabled();
  const cgroupMount = privileged
    ? "/sys/fs/cgroup:/sys/fs/cgroup:rw"
    : "/sys/fs/cgroup:/sys/fs/cgroup:ro";
  const args = [
    "run",
    "-d",
    "--name",
    scenarioContainerName(scenario),
    "--hostname",
    scenarioContainerName(scenario),
    "--label",
    `${labelKey}=${labelValue}`,
    "--cgroupns=host",
    "--tmpfs",
    "/run",
    "--tmpfs",
    "/run/lock",
    "-v",
    cgroupMount,
    "-p",
    `${scenario.system.ip}:${scenario.system.port}:22`,
  ];
  if (privileged) args.push("--privileged");
  if (scenario.archetype === "partner-sync") {
    args.push("--add-host", `${scenario.params.partnerHost}:${scenario.params.goodIp}`);
  }
  args.push(imageName(scenario));
  await docker(args);
}

async function waitForSystemd(scenario: Scenario): Promise<void> {
  const name = scenarioContainerName(scenario);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const running = await docker(["inspect", "-f", "{{.State.Running}}", name], {
      allowFailure: true,
    });
    if (running.stdout.trim() !== "true") {
      throw new Error(
        `Container ${name} exited during boot. systemd likely needs SANDBOX_DOCKER_PRIVILEGED (default on).`,
      );
    }
    const result = await docker(
      [
        "exec",
        name,
        "bash",
        "-lc",
        "systemctl is-active --quiet ssh && systemctl is-system-running",
      ],
      { allowFailure: true },
    );
    const state = result.stdout.trim();
    if (result.status === 0 || state === "running" || state === "degraded") {
      return;
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for systemd in ${name}`);
}

export async function injectFault(scenario: Scenario): Promise<void> {
  await docker(["exec", scenarioContainerName(scenario), "bash", "-lc", "/opt/hackathon/break.sh"]);
}

export async function provisionScenario(scenario: Scenario, publicKey?: string): Promise<void> {
  const key = publicKey ?? readBenchPublicKey();
  await ensureBaseImage(key);
  await buildScenarioImage(scenario, key);
  await runScenarioContainer(scenario);
  await waitForSystemd(scenario);
  await injectFault(scenario);
}

export async function removeScenarioContainer(scenario: Scenario): Promise<void> {
  await docker(["rm", "-f", scenarioContainerName(scenario)], { allowFailure: true });
}

export async function containerExists(scenario: Scenario): Promise<boolean> {
  const name = scenarioContainerName(scenario);
  const result = await docker([
    "ps",
    "-a",
    "--filter",
    `label=${labelKey}=${labelValue}`,
    "--format",
    "{{.Names}}",
  ]);
  return result.stdout.split("\n").filter(Boolean).includes(name);
}

export async function resetScenarioFault(scenario: Scenario): Promise<void> {
  if (!(await containerExists(scenario))) {
    throw new Error(`Container ${scenarioContainerName(scenario)} not found`);
  }
  await injectFault(scenario);
}
