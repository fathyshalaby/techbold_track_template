import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import { type EnvConfig, effectiveLlmProvider, getEnv, resolveClientMode } from "../env.js";

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
  provider: "openai" | "azure" | "openai-compatible";
  modelId: string;
  baseURL?: string;
}

// Pure, testable resolution of the provider wiring from env. Azure AI Foundry
// project/resource endpoints expose an OpenAI-compatible v1 surface at
// `{endpoint}/openai/v1`, so all three providers are served by createOpenAI with
// a baseURL. No extra provider package needed, which keeps the v4 dep tree intact.
export function resolveModelConfig(env: EnvConfig): ResolvedModelConfig {
  const provider = effectiveLlmProvider(env);
  if (provider === "azure") {
    const endpoint = env.AZURE_ENDPOINT.replace(/\/+$/, "");
    const baseURL = endpoint.endsWith("/openai/v1") ? endpoint : `${endpoint}/openai/v1`;
    return { provider, baseURL, modelId: env.AZURE_DEPLOYMENT || env.LLM_MODEL };
  }
  if (provider === "openai-compatible") {
    return { provider, baseURL: env.LLM_BASE_URL.replace(/\/+$/, ""), modelId: env.LLM_MODEL };
  }
  return { provider, modelId: env.LLM_MODEL };
}

export function getModel(): LanguageModelV1 {
  if (resolveClientMode("llm") === "mock") {
    return MOCK_MODEL;
  }
  const env = getEnv();
  const cfg = resolveModelConfig(env);
  if (cfg.provider === "azure") {
    // Azure Foundry authenticates with an `api-key` header. createOpenAI also
    // sends Authorization: Bearer, which is harmless and keeps both surfaces happy.
    const azure = createOpenAI({
      baseURL: cfg.baseURL,
      apiKey: env.AZURE_API_KEY,
      headers: { "api-key": env.AZURE_API_KEY },
    });
    return azure(cfg.modelId);
  }
  const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
  });
  return openai(cfg.modelId);
}

export function isBuiltInMockModel(model: LanguageModelV1): boolean {
  return model.provider === MOCK_MODEL.provider && model.modelId === MOCK_MODEL.modelId;
}
