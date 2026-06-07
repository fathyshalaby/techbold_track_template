// LLM model factory — azure (primary) | openrouter | local. Returns an AI SDK LanguageModel.
import { createAzure } from "@ai-sdk/azure";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { config } from "./config";

function azureResourceName(): string {
  try {
    return new URL(config.azureEndpoint).hostname.split(".")[0] || "";
  } catch {
    return "";
  }
}

export function getModel(): LanguageModel {
  if (config.llmProvider === "openrouter") {
    const provider = createOpenAICompatible({
      name: "openrouter",
      baseURL: config.openrouterBaseUrl,
      apiKey: config.openrouterApiKey,
    });
    return provider(config.openrouterModel);
  }
  if (config.llmProvider === "local") {
    const provider = createOpenAICompatible({
      name: "local",
      baseURL: config.localBaseUrl,
      apiKey: config.localApiKey,
    });
    return provider(config.localModel);
  }
  // azure (default)
  const endpoint = config.azureEndpoint.replace(/\/+$/, "");
  if (endpoint.includes("services.ai.azure.com") || endpoint.includes("/api/projects/")) {
    // Azure AI Foundry project endpoint — OpenAI-compatible v1 surface
    // ({endpoint}/openai/v1/chat/completions), NOT classic deployment URLs + api-version.
    const baseURL = azureFoundryBase(endpoint);
    const provider = createOpenAICompatible({
      name: "azure-foundry",
      baseURL,
      apiKey: config.azureApiKey,
      headers: { "api-key": config.azureApiKey },
    });
    return provider(config.azureDeployment);
  }
  // Classic Azure OpenAI resource (*.openai.azure.com)
  const azure = createAzure({
    resourceName: azureResourceName(),
    apiKey: config.azureApiKey,
    apiVersion: config.azureApiVersion,
    useDeploymentBasedUrls: true,
  });
  return azure(config.azureDeployment);
}

function azureFoundryBase(value: string): string {
  let endpoint = value.replace(/\/+$/, "");
  for (const suffix of ["/responses", "/chat/completions"]) {
    if (endpoint.endsWith(suffix)) endpoint = endpoint.slice(0, -suffix.length);
  }
  return endpoint.endsWith("/openai/v1") ? endpoint : `${endpoint}/openai/v1`;
}
