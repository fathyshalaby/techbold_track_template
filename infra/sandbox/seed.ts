import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS, parseSandboxCaseCount, scenariosForHost } from "./scenarios/registry.ts";
import type { Scenario } from "./scenarios/types.ts";

const sandboxDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(sandboxDir, "..");
const publicKeyPath = resolve(repoRoot, "keys/bench_incident_key.pub");
const baseDockerfile = resolve(sandboxDir, "Dockerfile.base");
const baseImageTag = "sda-sandbox-base:latest";
const labelKey = "techbold.sandbox";
const labelValue = "service-desk-autopilot";

type Action = "up" | "down" | "reset";

function run(
  command: string,
  args: string[],
  options: { allowFailure?: boolean; quiet?: boolean } = {},
) {
  if (!options.quiet) {
    console.log(`$ ${command} ${args.join(" ")}`);
  }
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.quiet ? "pipe" : "inherit",
  });
  if (result.status !== 0 && !options.allowFailure) {
    const stderr = options.quiet ? result.stderr : "";
    const reason =
      result.error?.message ||
      `exit ${result.status ?? "unknown"}${result.signal ? ` signal ${result.signal}` : ""}`;
    throw new Error(
      `${command} ${args.join(" ")} failed with ${reason}${stderr ? `\n${stderr}` : ""}`,
    );
  }
  return result;
}

function dockerOutput(args: string[]): string {
  const result = run("docker", args, { quiet: true });
  return result.stdout.trim();
}

function scenarioName(scenario: Scenario): string {
  return `sda-${scenario.archetype}-${scenario.ticket.id}`;
}

function imageName(scenario: Scenario): string {
  return `sda-sandbox-${scenario.ticket.id}:latest`;
}

function ensureBaseImage(publicKey: string) {
  const inspect = run("docker", ["image", "inspect", baseImageTag], {
    allowFailure: true,
    quiet: true,
  });
  if (inspect.status === 0) return;
  run("docker", [
    "build",
    "-f",
    baseDockerfile,
    "-t",
    baseImageTag,
    "--build-arg",
    `BENCH_PUBLIC_KEY=${publicKey}`,
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

function buildScenario(scenario: Scenario, publicKey: string) {
  run("docker", [
    "build",
    "-f",
    resolve(sandboxDir, "archetypes", scenario.archetype, "Dockerfile"),
    "-t",
    imageName(scenario),
    ...buildArgsForScenario(scenario, publicKey),
    sandboxDir,
  ]);
}

function runScenarioContainer(scenario: Scenario) {
  const privileged = process.env.SANDBOX_DOCKER_PRIVILEGED === "true";
  const cgroupMount = privileged
    ? "/sys/fs/cgroup:/sys/fs/cgroup:rw"
    : "/sys/fs/cgroup:/sys/fs/cgroup:ro";
  const args = [
    "run",
    "-d",
    "--name",
    scenarioName(scenario),
    "--hostname",
    scenarioName(scenario),
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
  run("docker", args);
}

function waitForSystemd(scenario: Scenario) {
  const name = scenarioName(scenario);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = run(
      "docker",
      [
        "exec",
        name,
        "bash",
        "-lc",
        "systemctl is-active --quiet ssh && systemctl is-system-running",
      ],
      {
        allowFailure: true,
        quiet: true,
      },
    );
    const state = result.stdout.trim();
    if (result.status === 0 || state === "running" || state === "degraded") {
      return;
    }
    run("sleep", ["1"], { quiet: true, allowFailure: true });
  }
  throw new Error(`Timed out waiting for systemd in ${name}`);
}

function injectFault(scenario: Scenario) {
  run("docker", ["exec", scenarioName(scenario), "bash", "-lc", "/opt/hackathon/break.sh"]);
}

function printSummary(scenarios: Scenario[]) {
  console.log("\nCompose env for Docker sandbox cases:\n");
  console.log(`SANDBOX_CASE_COUNT=${scenarios.length}`);
  console.log("SANDBOX_DOCKER_PRIVILEGED=true");
  console.log("SANDBOX_PHOENIX_API_BASE_URL=http://sandbox-phoenix:9000");
  console.log("PHOENIX_MOCK_DATASET=sandbox");
  console.log(
    "SANDBOX_SSH_HOST=host.docker.internal   # backend containers -> host-mapped fake VMs",
  );
  console.log("SSH_PRIVATE_KEY_PATH=/keys/bench_incident_key");
  console.log("SSH_USERNAME=azureuser");
  console.log("\nTickets:\n");
  console.log("ticket_id  ssh_target          archetype");
  for (const scenario of scenarios) {
    console.log(
      `${scenario.ticket.id}      ${scenario.system.ip}:${scenario.system.port}     ${scenario.archetype}`,
    );
  }
}

function removeAllScenarioContainers(): boolean {
  const names = dockerOutput([
    "ps",
    "-a",
    "--filter",
    `label=${labelKey}=${labelValue}`,
    "--format",
    "{{.Names}}",
  ]);
  if (!names) return false;
  for (const name of names.split("\n").filter(Boolean)) {
    run("docker", ["rm", "-f", name]);
  }
  return true;
}

function configuredScenarios(): Scenario[] {
  return scenariosForHost(process.env.SANDBOX_SSH_HOST, parseSandboxCaseCount());
}

function up() {
  if (!existsSync(publicKeyPath)) {
    throw new Error(
      `Missing ${publicKeyPath}. Reuse keys/bench_incident_key.pub; do not generate or commit a new key.`,
    );
  }
  const publicKey = readFileSync(publicKeyPath, "utf8").trim();
  const scenarios = configuredScenarios();
  removeAllScenarioContainers();
  ensureBaseImage(publicKey);
  for (const scenario of scenarios) {
    buildScenario(scenario, publicKey);
    runScenarioContainer(scenario);
    waitForSystemd(scenario);
    injectFault(scenario);
  }
  printSummary(scenarios);
}

function down() {
  if (!removeAllScenarioContainers()) {
    console.log("No sandbox containers found.");
  }
}

function reset() {
  const scenarios = configuredScenarios();
  for (const scenario of scenarios) {
    run("docker", ["restart", scenarioName(scenario)]);
  }
  printSummary(scenarios);
}

const action = process.argv[2] as Action | undefined;
if (!action || !["up", "down", "reset"].includes(action)) {
  console.error("Usage: bun run seed.ts <up|down|reset>");
  process.exit(2);
}

if (action === "up") up();
if (action === "down") down();
if (action === "reset") reset();

void SCENARIOS;
