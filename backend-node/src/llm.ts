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
  // azure (default): deployment-based URL + api-version, matching standard Azure OpenAI deployments.
  const azure = createAzure({
    resourceName: azureResourceName(),
    apiKey: config.azureApiKey,
    apiVersion: config.azureApiVersion,
    useDeploymentBasedUrls: true,
  });
  return azure(config.azureDeployment);
}
