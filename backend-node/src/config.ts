// Typed env config (mirror of backend-py/app/config.py). Secrets come from .env (git-ignored)
// or the container env. Never logged.

for (const p of ["../.env", ".env", "../../.env"]) {
  try {
    (process as unknown as { loadEnvFile?: (path: string) => void }).loadEnvFile?.(p);
  } catch {
    /* file not present — rely on real env vars */
  }
}

const e = process.env;
function parseSandboxCaseCount(value: string | undefined): number {
  const count = Number(value || 0);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}
const sandboxCaseCount = parseSandboxCaseCount(e.SANDBOX_CASE_COUNT);
const realPhoenixBaseUrl = (e.PHOENIX_API_BASE_URL || "").replace(/\/$/, "");
const sandboxPhoenixBaseUrl = (e.SANDBOX_PHOENIX_API_BASE_URL || "http://sandbox-phoenix:9000").replace(/\/$/, "");

export const config = {
  phoenixBaseUrl: realPhoenixBaseUrl,
  realPhoenixBaseUrl,
  phoenixToken: e.PHOENIX_API_TOKEN || "sandbox-local-token",
  sandboxCaseCount,
  sandboxPhoenixBaseUrl,

  sshKeyPath: e.SSH_PRIVATE_KEY_PATH || "/keys/case1_key.pem",
  sshKeyDir: e.SSH_KEY_DIR || "/keys",
  sshUsername: e.SSH_USERNAME || "azureuser",
  sshConnectTimeout: Number(e.SSH_CONNECT_TIMEOUT || 10),
  sshCommandTimeout: Number(e.SSH_COMMAND_TIMEOUT || 30),

  // auto-execute read-only diagnostics; require approval ONLY for writes (set "false" for strict mode)
  autoRunReadonly: e.AUTO_RUN_READONLY !== "false",

  llmProvider: (e.LLM_PROVIDER || "azure").toLowerCase(),
  azureEndpoint: e.AZURE_OPENAI_ENDPOINT || "",
  azureApiKey: e.AZURE_OPENAI_API_KEY || "",
  azureApiVersion: e.AZURE_OPENAI_API_VERSION || "2025-01-01-preview",
  azureDeployment: e.AZURE_OPENAI_DEPLOYMENT || "gpt-5.4",
  azureAllowedDeployments: (e.AZURE_OPENAI_ALLOWED_DEPLOYMENTS || "").split(",").map((m) => m.trim()).filter(Boolean),
  openrouterApiKey: e.OPENROUTER_API_KEY || "",
  openrouterBaseUrl: e.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  openrouterModel: e.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-6",
  openrouterAllowedModels: (e.OPENROUTER_ALLOWED_MODELS || "").split(",").map((m) => m.trim()).filter(Boolean),
  localBaseUrl: e.LOCAL_BASE_URL || "http://host.docker.internal:1234/v1",
  localApiKey: e.LOCAL_API_KEY || "lm-studio",
  localModel: e.LOCAL_MODEL || "",

  sharedDir: e.SHARED_DIR || "/shared",
  port: Number(e.PORT || 8001),
};
