import { z } from "zod";

const booleanFromString = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "1", "yes", "on"].includes(v.trim().toLowerCase());
  return false;
}, z.boolean());

const EnvSchema = z
  .object({
    PHOENIX_API_BASE_URL: z.string().default(""),
    PHOENIX_API_TOKEN: z.string().default(""),
    OPENAI_API_KEY: z.string().default(""),
    LLM_PROVIDER: z.string().default("openai"),
    LLM_MODEL: z.string().default("gpt-4o"),
    AI_GATEWAY_API_KEY: z.string().default(""),
    LLM_BASE_URL: z.string().default(""),
    CUSTOM_MODEL_BASE_URL: z.string().default("http://127.0.0.1:8011/v1"),
    CUSTOM_MODEL_SERVED_ID: z.string().default("mlx-community/Qwen2.5-1.5B-Instruct-4bit"),
    AZURE_ENDPOINT: z.string().default(""),
    AZURE_API_KEY: z.string().default(""),
    AZURE_DEPLOYMENT: z.string().default(""),
    SSH_PRIVATE_KEY_PATH: z.string().default(""),
    SSH_PRIVATE_KEY_DIR: z.string().default(""),
    SSH_USERNAME: z.string().default("azureuser"),
    PORT: z.coerce.number().int().positive().default(8000),
    MOCK_MODE: booleanFromString.default(false),
    MOCK_PHOENIX: booleanFromString.default(false),
    MOCK_SSH: booleanFromString.default(false),
    MOCK_LLM: booleanFromString.default(false),
    MOCK_SCENARIOS: booleanFromString.default(false),
    SANDBOX_PROVISIONER_ENABLED: booleanFromString.default(true),
    DATABASE_URL: z.string().default(""),
    GEMINI_API_KEY: z.string().default(""),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().default(""),
    EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
    EMBEDDING_DIM: z.coerce.number().int().positive().default(1536),
    MEMORY_TOP_K: z.coerce.number().int().positive().default(4),
    MEMORY_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.75),
    MEMORY_DISPLAY_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.2),
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
      const provider = effectiveLlmProvider(cfg);
      if (provider === "azure") {
        requireVar(true, "AZURE_ENDPOINT", cfg.AZURE_ENDPOINT);
        requireVar(true, "AZURE_API_KEY", cfg.AZURE_API_KEY);
      } else if (provider === "gateway") {
        requireVar(true, "AI_GATEWAY_API_KEY", cfg.AI_GATEWAY_API_KEY);
      } else if (provider === "openai-compatible") {
        requireVar(true, "LLM_BASE_URL", cfg.LLM_BASE_URL);
        requireVar(
          !isLocalOpenAiCompatibleBaseUrl(cfg.LLM_BASE_URL),
          "OPENAI_API_KEY",
          cfg.OPENAI_API_KEY,
        );
      } else {
        requireVar(true, "OPENAI_API_KEY", cfg.OPENAI_API_KEY);
      }
    }
    if (
      sshReal &&
      cfg.SSH_PRIVATE_KEY_PATH.trim() === "" &&
      cfg.SSH_PRIVATE_KEY_DIR.trim() === ""
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SSH_PRIVATE_KEY_PATH"],
        message: "SSH_PRIVATE_KEY_PATH or SSH_PRIVATE_KEY_DIR is required",
      });
    }
  });

export type EnvConfig = z.infer<typeof EnvSchema>;

export function isLocalOpenAiCompatibleBaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1" ||
      url.hostname === "model" ||
      url.hostname === "host.docker.internal" ||
      url.hostname.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

export function effectiveLlmProvider(
  cfg: Pick<EnvConfig, "LLM_PROVIDER" | "AZURE_ENDPOINT" | "LLM_BASE_URL" | "AI_GATEWAY_API_KEY">,
): "openai" | "azure" | "openai-compatible" | "gateway" {
  const p = (cfg.LLM_PROVIDER ?? "").trim().toLowerCase();
  if (p === "azure" || cfg.AZURE_ENDPOINT.trim() !== "") return "azure";
  if (p === "gateway" || cfg.AI_GATEWAY_API_KEY.trim() !== "") return "gateway";
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
    const key = result.error.issues[0]?.path.join(".") ?? "unknown";
    throw new Error(`Missing or invalid required env var: ${key}`);
  }
  return result.data;
}

let cachedEnv: EnvConfig | undefined;

export function getEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;
  cachedEnv = parseEnv(process.env as Record<string, string | undefined>);
  return cachedEnv;
}

export function resetEnvCacheForTest(): void {
  cachedEnv = undefined;
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

export function effectiveGeminiApiKey(config: EnvConfig = getEnv()): string {
  return config.GEMINI_API_KEY.trim() || config.GOOGLE_GENERATIVE_AI_API_KEY.trim();
}

export function memoryConfigured(config: EnvConfig = getEnv()): boolean {
  return config.DATABASE_URL.trim() !== "";
}

export function isSandboxProvisionerEnabled(config?: EnvConfig): boolean {
  if (config) return config.SANDBOX_PROVISIONER_ENABLED;
  const raw = process.env.SANDBOX_PROVISIONER_ENABLED;
  if (raw === undefined || raw.trim() === "") return true;
  return ["true", "1", "yes", "on"].includes(raw.trim().toLowerCase());
}
