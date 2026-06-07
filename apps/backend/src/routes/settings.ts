import {
  MODEL_CATALOG,
  type ModelSettingsResponse,
  isCustomModelId,
  llmProviderLabel,
} from "@techbold/contracts";
import { Hono } from "hono";
import { z } from "zod";
import { defaultModelFromEnv, getActiveModelId, setActiveModelId } from "../ai/active-model.js";
import {
  canSwitchModels,
  isLiveLlmConfigured,
  runtimeModelId,
  runtimeProvider,
} from "../ai/model.js";
import { type EnvConfig, getEnv, resolveClientMode } from "../env.js";

export const settingsRouter = new Hono();

const SetModelBodySchema = z.object({
  model: z.string().min(1),
});

function buildSettings(env: EnvConfig, model: string): ModelSettingsResponse {
  const provider = runtimeProvider(env);
  return {
    model,
    models: MODEL_CATALOG,
    provider,
    providerLabel: llmProviderLabel(provider),
    liveConfigured: isLiveLlmConfigured(env),
    canSwitchModels: canSwitchModels(env),
    runtimeModel: runtimeModelId(env),
    defaultModel: defaultModelFromEnv(),
  };
}

settingsRouter.get("/model", (c) => {
  return c.json(buildSettings(getEnv(), getActiveModelId()));
});

settingsRouter.put("/model", async (c) => {
  const rawBody = await c.req.json().catch(() => null);
  const parsed = SetModelBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return c.json({ error: "invalid request body" }, 400);
  }

  const env = getEnv();
  const mockLlm = resolveClientMode("llm") === "mock";
  const customModel = isCustomModelId(parsed.data.model);
  // The trained local adapter always routes. Otherwise a live LLM must be configured
  // for the selection to mean anything.
  if (!mockLlm && !customModel && !isLiveLlmConfigured(env)) {
    return c.json(
      {
        error: "No live LLM configured",
        detail:
          "Configure a provider on the backend (AI Gateway, Azure, or OpenAI) or use the Mac MLX trained model.",
      },
      503,
    );
  }

  try {
    const model = setActiveModelId(parsed.data.model);
    return c.json(buildSettings(env, model));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 400);
  }
});
