import { z } from "zod";

// Tolerant boolean coercion: accept the common truthy strings, not just the
// literal 'true' (so MOCK_MODE=1/yes/on don't silently become false).
const booleanFromString = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "1", "yes", "on"].includes(v.trim().toLowerCase());
  return false;
}, z.boolean());

// Canonical names match the track contract (README / phoenix-openapi.yaml /
// docs): PHOENIX_API_BASE_URL, SSH_PRIVATE_KEY_PATH, SSH_USERNAME.
// Credentials default to '' and are required CONDITIONALLY (see superRefine) so
// the stack boots fully offline under MOCK_MODE without real keys (PLAT-04).
const EnvSchema = z
  .object({
    PHOENIX_API_BASE_URL: z.string().default(""),
    PHOENIX_API_TOKEN: z.string().default(""),
    OPENAI_API_KEY: z.string().default(""),
    // 'openai' (default) | 'azure' (Azure AI Foundry / OpenAI on Azure) |
    // 'openai-compatible' (OpenRouter, a local server, any OpenAI-shaped API).
    LLM_PROVIDER: z.string().default("openai"),
    LLM_MODEL: z.string().default("gpt-4o"),
    // OpenAI-compatible base URL (OpenRouter / local). When set, selects the
    // 'openai-compatible' provider unless an Azure endpoint is also configured.
    LLM_BASE_URL: z.string().default(""),
    // Azure AI Foundry: the project/resource endpoint, its key, and the model
    // deployment name. Setting AZURE_ENDPOINT selects the 'azure' provider.
    AZURE_ENDPOINT: z.string().default(""),
    AZURE_API_KEY: z.string().default(""),
    AZURE_DEPLOYMENT: z.string().default(""),
    // No placeholder default - required in real SSH mode (see superRefine) so a
    // missing key fails loudly at startup instead of silently targeting a wrong
    // key at execution time.
    SSH_PRIVATE_KEY_PATH: z.string().default(""),
    // Directory of fallback SSH keys for multi-key auth (the contest ships 5
    // case keys). Defaults to the primary key's directory when unset.
    SSH_KEY_DIR: z.string().default("/keys"),
    SSH_USERNAME: z.string().default("azureuser"),
    PORT: z.coerce.number().int().positive().default(8000),
    MOCK_MODE: booleanFromString.default(false),
    MOCK_PHOENIX: booleanFromString.default(false),
    MOCK_SSH: booleanFromString.default(false),
    MOCK_LLM: booleanFromString.default(false),
    // When the Phoenix mock is active, serve the realistic sandbox incident
    // catalog (5 scenarios) instead of the generic 4-ticket fixtures - used for
    // the MOCK_MODE demo. No effect on real Phoenix.
    MOCK_SCENARIOS: booleanFromString.default(false),
  })
  .superRefine((cfg, ctx) => {
    const requireVar = (needed: boolean, key: string, value: string) => {
      if (needed && value.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${key} is required` });
      }
    };
    const phoenixReal = !cfg.MOCK_MODE && !cfg.MOCK_PHOENIX;
    const llmReal = !cfg.MOCK_MODE && !cfg.MOCK_LLM;
    const sshReal = !cfg.MOCK_MODE && !cfg.MOCK_SSH;
    requireVar(phoenixReal, "PHOENIX_API_BASE_URL", cfg.PHOENIX_API_BASE_URL);
    requireVar(phoenixReal, "PHOENIX_API_TOKEN", cfg.PHOENIX_API_TOKEN);
    if (llmReal) {
      // Require only the credentials the SELECTED provider actually needs, so a
      // misconfig fails loudly at startup pointing at the right variable.
      const provider = effectiveLlmProvider(cfg);
      if (provider === "azure") {
        requireVar(true, "AZURE_ENDPOINT", cfg.AZURE_ENDPOINT);
        requireVar(true, "AZURE_API_KEY", cfg.AZURE_API_KEY);
      } else if (provider === "openai-compatible") {
        requireVar(true, "LLM_BASE_URL", cfg.LLM_BASE_URL);
        requireVar(true, "OPENAI_API_KEY", cfg.OPENAI_API_KEY);
      } else {
        requireVar(true, "OPENAI_API_KEY", cfg.OPENAI_API_KEY);
      }
    }
    requireVar(sshReal, "SSH_PRIVATE_KEY_PATH", cfg.SSH_PRIVATE_KEY_PATH);
  });

export type EnvConfig = z.infer<typeof EnvSchema>;

// Single source of truth for which LLM provider is active. Explicit LLM_PROVIDER
// wins; otherwise the presence of an Azure endpoint or a compatible base URL
// selects the provider. Hoisted so superRefine (above) can use it during parse.
export function effectiveLlmProvider(
  cfg: Pick<EnvConfig, "LLM_PROVIDER" | "AZURE_ENDPOINT" | "LLM_BASE_URL">,
): "openai" | "azure" | "openai-compatible" {
  const p = (cfg.LLM_PROVIDER ?? "").trim().toLowerCase();
  if (p === "azure" || cfg.AZURE_ENDPOINT.trim() !== "") return "azure";
  if (
    p === "openai-compatible" ||
    p === "openrouter" ||
    p === "local" ||
    cfg.LLM_BASE_URL.trim() !== ""
  ) {
    return "openai-compatible";
  }
  return "openai";
}

export function parseEnv(raw: Record<string, string | undefined>): EnvConfig {
  const result = EnvSchema.safeParse(raw);
  if (!result.success) {
    // Message contains the variable NAME only - never the value - so secrets
    // can't leak into logs/error output.
    const key = result.error.issues[0]?.path.join(".") ?? "unknown";
    throw new Error(`Missing or invalid required env var: ${key}`);
  }
  return result.data;
}

let cachedEnv: EnvConfig | undefined;

// Lazily parse process.env on first access so importing this module has no
// side effects - pure helpers (parseEnv/resolveClientMode/isMockMode) and the
// test suite can run without a fully populated environment. Fails fast with a
// readable message the first time the real config is actually needed.
export function getEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;
  // Throw (don't process.exit) so a misconfig surfaces as a catchable error - a
  // request handler degrades to a 500, tests can assert it, and the top-level
  // bootstrap (index.ts) is the single place that turns it into an exit.
  cachedEnv = parseEnv(process.env as Record<string, string | undefined>);
  return cachedEnv;
}

export function resolveClientMode(
  service: "phoenix" | "ssh" | "llm",
  config: EnvConfig = getEnv(),
): "mock" | "real" {
  if (config.MOCK_MODE) return "mock";
  if (service === "phoenix" && config.MOCK_PHOENIX) return "mock";
  if (service === "ssh" && config.MOCK_SSH) return "mock";
  if (service === "llm" && config.MOCK_LLM) return "mock";
  return "real";
}

export function isMockMode(config: EnvConfig = getEnv()): boolean {
  return config.MOCK_MODE || config.MOCK_PHOENIX || config.MOCK_SSH || config.MOCK_LLM;
}
