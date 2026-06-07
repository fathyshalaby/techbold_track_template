import { createOpenAI } from "@ai-sdk/openai";
import { CUSTOM_MODEL_ID, type LlmRuntimeProvider } from "@techbold/contracts";
import type { LanguageModelV1 } from "ai";
import {
  type EnvConfig,
  effectiveLlmProvider,
  getEnv,
  isLocalOpenAiCompatibleBaseUrl,
  resolveClientMode,
} from "../env.js";
import { getActiveModelId } from "./active-model.js";

const GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

const MOCK_MODEL: LanguageModelV1 = {
  specificationVersion: "v1",
  provider: "mock",
  modelId: "mock",
  defaultObjectGenerationMode: "json",
  supportsStructuredOutputs: true,
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 0, completionTokens: 0 },
    text: "{}",
  }),
  doStream: async () => {
    throw new Error("Mock model does not support streaming");
  },
};

export interface ResolvedModelConfig {
  provider: "openai" | "azure" | "openai-compatible" | "gateway";
  modelId: string;
  baseURL?: string;
}

export function resolveModelConfig(env: EnvConfig, modelId?: string): ResolvedModelConfig {
  const resolvedModelId = modelId ?? env.LLM_MODEL;
  const provider = effectiveLlmProvider(env);
  if (provider === "azure") {
    const endpoint = env.AZURE_ENDPOINT.replace(/\/+$/, "");
    const baseURL = endpoint.endsWith("/openai/v1") ? endpoint : `${endpoint}/openai/v1`;
    return { provider, baseURL, modelId: env.AZURE_DEPLOYMENT || resolvedModelId };
  }
  if (provider === "gateway") {
    return { provider, baseURL: GATEWAY_BASE_URL, modelId: resolvedModelId };
  }
  if (provider === "openai-compatible") {
    return { provider, baseURL: env.LLM_BASE_URL.replace(/\/+$/, ""), modelId: resolvedModelId };
  }
  const openAiModelId = resolvedModelId.startsWith("openai/")
    ? resolvedModelId.slice("openai/".length)
    : resolvedModelId;
  return { provider, modelId: openAiModelId };
}

export function resolveCustomModelConfig(env: EnvConfig): ResolvedModelConfig {
  return {
    provider: "openai-compatible",
    baseURL: env.CUSTOM_MODEL_BASE_URL.replace(/\/+$/, ""),
    modelId: env.CUSTOM_MODEL_SERVED_ID,
  };
}

export function getModel(): LanguageModelV1 {
  if (resolveClientMode("llm") === "mock") {
    return MOCK_MODEL;
  }
  const env = getEnv();
  const activeModelId = getActiveModelId();
  if (activeModelId === CUSTOM_MODEL_ID) {
    const cfg = resolveCustomModelConfig(env);
    const local = createOpenAI({
      baseURL: cfg.baseURL,
      apiKey: "local",
    });
    return local(cfg.modelId);
  }
  const cfg = resolveModelConfig(env, activeModelId);
  if (cfg.provider === "azure") {
    const azure = createOpenAI({
      baseURL: cfg.baseURL,
      apiKey: env.AZURE_API_KEY,
      headers: { "api-key": env.AZURE_API_KEY },
    });
    return azure(cfg.modelId);
  }
  if (cfg.provider === "gateway") {
    const gateway = createOpenAI({
      baseURL: cfg.baseURL,
      apiKey: env.AI_GATEWAY_API_KEY,
    });
    return gateway(cfg.modelId);
  }
  const openai = createOpenAI({
    apiKey:
      cfg.provider === "openai-compatible" ? env.OPENAI_API_KEY || "local" : env.OPENAI_API_KEY,
    ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
  });
  return openai(cfg.modelId);
}

export function isBuiltInMockModel(model: LanguageModelV1): boolean {
  return model.provider === MOCK_MODEL.provider && model.modelId === MOCK_MODEL.modelId;
}

export function isGatewayConfigured(env: EnvConfig = getEnv()): boolean {
  return env.AI_GATEWAY_API_KEY.trim() !== "";
}

// The provider the backend will actually call right now. "mock" short-circuits
// the real providers (MOCK_LLM), otherwise this mirrors effectiveLlmProvider.
export function runtimeProvider(env: EnvConfig = getEnv()): LlmRuntimeProvider {
  if (resolveClientMode("llm", env) === "mock") return "mock";
  return effectiveLlmProvider(env);
}

// Whether live agent calls are possible: mock counts, otherwise the active
// provider must have the credentials it needs. Mirrors env.superRefine so the
// UI's "configured" state matches what the backend will accept at startup.
export function isLiveLlmConfigured(env: EnvConfig = getEnv()): boolean {
  const provider = runtimeProvider(env);
  switch (provider) {
    case "mock":
      return true;
    case "azure":
      return env.AZURE_ENDPOINT.trim() !== "" && env.AZURE_API_KEY.trim() !== "";
    case "gateway":
      return env.AI_GATEWAY_API_KEY.trim() !== "";
    case "openai-compatible":
      return (
        env.LLM_BASE_URL.trim() !== "" &&
        (isLocalOpenAiCompatibleBaseUrl(env.LLM_BASE_URL) || env.OPENAI_API_KEY.trim() !== "")
      );
    default:
      return env.OPENAI_API_KEY.trim() !== "";
  }
}

// Catalog (gateway-slug) model switching only actually routes through the
// Vercel AI Gateway or the mock. A fixed provider always calls one model.
export function canSwitchModels(env: EnvConfig = getEnv()): boolean {
  const provider = runtimeProvider(env);
  return provider === "gateway" || provider === "mock";
}

// The model id the backend will invoke for non-custom routing - the truth a
// fixed provider should display (e.g. the Azure deployment) rather than the
// gateway slug stored as the active model.
export function runtimeModelId(env: EnvConfig = getEnv()): string {
  return resolveModelConfig(env).modelId;
}
