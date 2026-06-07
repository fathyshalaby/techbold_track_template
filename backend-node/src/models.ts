import { config } from "./config";

interface ModelOption {
  id: string;
  provider: string;
  label: string;
  model: string;
  configured: boolean;
  active: boolean;
}

function isConfigured(value?: string): boolean {
  if (!value) return false;
  const lowered = value.trim().toLowerCase();
  return Boolean(lowered) && !lowered.includes("replace-with") && !lowered.includes("<your-");
}

function currentActive(): { provider: string; model: string; id: string } {
  let provider = config.llmProvider;
  let model = config.azureDeployment;
  if (provider === "openrouter") model = config.openrouterModel;
  else if (provider === "local") model = config.localModel;
  else provider = "azure";
  return { provider, model, id: `${provider}:${model}` };
}

function option(provider: string, model: string, label: string, configured: boolean): ModelOption {
  const active = currentActive();
  return {
    id: `${provider}:${model}`,
    provider,
    label,
    model,
    configured,
    active: active.provider === provider && active.model === model,
  };
}

export function listModels(): { active: { provider: string; model: string; id: string }; models: ModelOption[] } {
  const models: ModelOption[] = [];
  if (isConfigured(config.azureEndpoint) && isConfigured(config.azureApiKey) && isConfigured(config.azureDeployment)) {
    const allowed = config.azureAllowedDeployments.length ? config.azureAllowedDeployments : [config.azureDeployment].filter(Boolean);
    for (const model of allowed) models.push(option("azure", model, `Azure · ${model}`, true));
  }
  if (isConfigured(config.openrouterApiKey)) {
    const allowed = config.openrouterAllowedModels.length ? config.openrouterAllowedModels : [config.openrouterModel].filter(Boolean);
    for (const model of allowed) models.push(option("openrouter", model, `OpenRouter · ${model}`, true));
  }
  if (isConfigured(config.localModel)) {
    models.push(option("local", config.localModel, `Local · ${config.localModel}`, true));
  }

  let active = currentActive();
  for (const model of models) model.active = model.provider === active.provider && model.model === active.model;
  if (models.length && !models.some((model) => model.active)) {
    const first = models[0]!;
    first.active = true;
    active = { provider: first.provider, model: first.model, id: first.id };
  }
  return { active, models };
}

export function selectModel(provider: string, model: string): { active: { provider: string; model: string; id: string }; models: ModelOption[] } {
  provider = provider.toLowerCase();
  const selected = listModels().models.find((item) => item.configured && item.provider === provider && item.model === model);
  if (!selected) throw new Error("model is not configured");

  config.llmProvider = provider;
  if (provider === "azure") config.azureDeployment = model;
  else if (provider === "openrouter") config.openrouterModel = model;
  else if (provider === "local") config.localModel = model;

  return listModels();
}
