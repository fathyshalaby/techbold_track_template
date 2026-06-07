export type ModelProvider =
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "xAI"
  | "Meta"
  | "DeepSeek"
  | "Mistral"
  | "Qwen"
  | "Custom";

export const CUSTOM_MODEL_ID = "techbold/msp-autopilot";

export interface ModelCatalogEntry {
  id: string;
  label: string;
  provider: ModelProvider;
  recommended?: boolean;
}

// Order within each provider is newest/strongest first. The gateway tab groups
// by provider; "recommended" surfaces a sensible default per provider.
export const MODEL_CATALOG: ModelCatalogEntry[] = [
  {
    id: CUSTOM_MODEL_ID,
    label: "MSP Autopilot (Mac MLX)",
    provider: "Custom",
    recommended: true,
  },

  { id: "openai/gpt-5.5", label: "GPT-5.5", provider: "OpenAI", recommended: true },
  { id: "openai/gpt-5.1", label: "GPT-5.1", provider: "OpenAI" },
  { id: "openai/gpt-5", label: "GPT-5", provider: "OpenAI" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini", provider: "OpenAI" },
  { id: "openai/o3", label: "o3", provider: "OpenAI" },
  { id: "openai/o4-mini", label: "o4 Mini", provider: "OpenAI" },
  { id: "openai/gpt-4.1", label: "GPT-4.1", provider: "OpenAI" },
  { id: "openai/gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },

  {
    id: "anthropic/claude-opus-4.5",
    label: "Claude Opus 4.5",
    provider: "Anthropic",
    recommended: true,
  },
  { id: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5", provider: "Anthropic" },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5", provider: "Anthropic" },
  { id: "anthropic/claude-opus-4.1", label: "Claude Opus 4.1", provider: "Anthropic" },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "anthropic/claude-3.7-sonnet", label: "Claude 3.7 Sonnet", provider: "Anthropic" },
  { id: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku", provider: "Anthropic" },

  {
    id: "google/gemini-3-pro",
    label: "Gemini 3 Pro",
    provider: "Google",
    recommended: true,
  },
  { id: "google/gemini-3-flash", label: "Gemini 3 Flash", provider: "Google" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google" },

  { id: "xai/grok-4", label: "Grok 4", provider: "xAI", recommended: true },
  { id: "xai/grok-4-fast", label: "Grok 4 Fast", provider: "xAI" },
  { id: "xai/grok-3", label: "Grok 3", provider: "xAI" },

  {
    id: "deepseek/deepseek-v3.2-exp",
    label: "DeepSeek V3.2",
    provider: "DeepSeek",
    recommended: true,
  },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1", provider: "DeepSeek" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat", provider: "DeepSeek" },

  {
    id: "meta-llama/llama-4-maverick",
    label: "Llama 4 Maverick",
    provider: "Meta",
    recommended: true,
  },
  { id: "meta-llama/llama-4-scout", label: "Llama 4 Scout", provider: "Meta" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B", provider: "Meta" },

  {
    id: "mistral/mistral-large-latest",
    label: "Mistral Large",
    provider: "Mistral",
    recommended: true,
  },
  { id: "mistral/magistral-medium-latest", label: "Magistral Medium", provider: "Mistral" },
  { id: "mistral/codestral-latest", label: "Codestral", provider: "Mistral" },

  { id: "qwen/qwen3-max", label: "Qwen3 Max", provider: "Qwen", recommended: true },
  { id: "qwen/qwen3-coder", label: "Qwen3 Coder", provider: "Qwen" },
  { id: "qwen/qwen-max", label: "Qwen Max", provider: "Qwen" },
];

export const DEFAULT_GATEWAY_MODEL = "openai/gpt-4o";

export const ACTIVE_MODEL_SETTING_ID = "active_model";

// The runtime LLM provider the backend is actually wired to. "mock" means
// MOCK_LLM is on; the rest mirror env.effectiveLlmProvider.
export type LlmRuntimeProvider = "mock" | "gateway" | "azure" | "openai" | "openai-compatible";

export interface ModelSettingsResponse {
  // Persisted active model id (catalog id, or the trained local adapter).
  model: string;
  models: ModelCatalogEntry[];
  // What the backend is wired to right now, so the UI can be honest instead of
  // assuming the Vercel AI Gateway is the only live path.
  provider: LlmRuntimeProvider;
  providerLabel: string;
  // True when live agent calls are possible (mock, or the active provider has
  // its credentials). When false the UI shows a real "not configured" warning.
  liveConfigured: boolean;
  // Catalog model switching only routes through the gateway (or mock). On a
  // fixed provider (Azure/OpenAI) the backend always calls one configured model.
  canSwitchModels: boolean;
  // The model actually invoked for non-custom routing (e.g. the Azure
  // deployment), so a fixed provider can display the truth.
  runtimeModel: string;
  // Non-custom default model id, used as the "backend default" choice when the
  // trained local adapter is currently active.
  defaultModel: string;
}

export function llmProviderLabel(provider: LlmRuntimeProvider): string {
  switch (provider) {
    case "mock":
      return "Mock";
    case "gateway":
      return "Vercel AI Gateway";
    case "azure":
      return "Azure AI Foundry";
    case "openai":
      return "OpenAI";
    case "openai-compatible":
      return "OpenAI-compatible";
  }
}

export function isCatalogModelId(id: string): boolean {
  return MODEL_CATALOG.some((entry) => entry.id === id);
}

export function isCustomModelId(id: string): boolean {
  return id === CUSTOM_MODEL_ID;
}

export function modelLabel(id: string): string {
  return MODEL_CATALOG.find((entry) => entry.id === id)?.label ?? id;
}
