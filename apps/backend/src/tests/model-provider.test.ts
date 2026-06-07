import { CUSTOM_MODEL_ID } from "@techbold/contracts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetActiveModelCacheForTest, setActiveModelId } from "../ai/active-model.js";
import { getModel, resolveCustomModelConfig, resolveModelConfig } from "../ai/model.js";
import {
  effectiveLlmProvider,
  isLocalOpenAiCompatibleBaseUrl,
  parseEnv,
  resetEnvCacheForTest,
} from "../env.js";
import { makeJsonlAdapter, resetDb, setDb } from "../store/db.js";

// Multi-provider model wiring (absorbed Azure AI Foundry support). Pure config
// resolution - no network, no key material exercised.

// Drop phoenix/ssh requirements so we can isolate the LLM provider config.
const NO_PHX_SSH = { MOCK_PHOENIX: "true", MOCK_SSH: "true" } as const;

describe("effectiveLlmProvider", () => {
  it("defaults to openai", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "openai",
        AZURE_ENDPOINT: "",
        LLM_BASE_URL: "",
        AI_GATEWAY_API_KEY: "",
      }),
    ).toBe("openai");
  });
  it("selects azure when an endpoint is present (even without explicit provider)", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "openai",
        AZURE_ENDPOINT: "https://x.azure.com",
        LLM_BASE_URL: "",
        AI_GATEWAY_API_KEY: "",
      }),
    ).toBe("azure");
  });
  it("selects openai-compatible when a base URL is present", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "openrouter",
        AZURE_ENDPOINT: "",
        LLM_BASE_URL: "https://or/api/v1",
        AI_GATEWAY_API_KEY: "",
      }),
    ).toBe("openai-compatible");
  });
  it("azure wins over a base URL when both are set", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "",
        AZURE_ENDPOINT: "https://x.azure.com",
        LLM_BASE_URL: "https://or",
        AI_GATEWAY_API_KEY: "",
      }),
    ).toBe("azure");
  });
  it("selects gateway when AI_GATEWAY_API_KEY is set", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "openai",
        AZURE_ENDPOINT: "",
        LLM_BASE_URL: "",
        AI_GATEWAY_API_KEY: "gw-key",
      }),
    ).toBe("gateway");
  });
});

describe("resolveModelConfig", () => {
  it("openai (default): no baseURL, model from LLM_MODEL", () => {
    const cfg = resolveModelConfig(
      parseEnv({ ...NO_PHX_SSH, OPENAI_API_KEY: "k", LLM_MODEL: "gpt-4o" }),
    );
    expect(cfg).toEqual({ provider: "openai", modelId: "gpt-4o" });
  });

  it("openai: strips the gateway openai/ prefix from catalog slugs", () => {
    const env = parseEnv({ ...NO_PHX_SSH, OPENAI_API_KEY: "k", LLM_MODEL: "gpt-4o" });
    expect(resolveModelConfig(env, "openai/gpt-4o")).toEqual({
      provider: "openai",
      modelId: "gpt-4o",
    });
  });

  it("azure: appends /openai/v1 and uses AZURE_DEPLOYMENT as the model id", () => {
    const cfg = resolveModelConfig(
      parseEnv({
        ...NO_PHX_SSH,
        AZURE_ENDPOINT: "https://proj.services.ai.azure.com",
        AZURE_API_KEY: "k",
        AZURE_DEPLOYMENT: "gpt-4o-mini",
      }),
    );
    expect(cfg.provider).toBe("azure");
    expect(cfg.baseURL).toBe("https://proj.services.ai.azure.com/openai/v1");
    expect(cfg.modelId).toBe("gpt-4o-mini");
  });

  it("azure: does not double-append /openai/v1 and strips trailing slashes", () => {
    const cfg = resolveModelConfig(
      parseEnv({
        ...NO_PHX_SSH,
        AZURE_ENDPOINT: "https://proj.services.ai.azure.com/openai/v1/",
        AZURE_API_KEY: "k",
        AZURE_DEPLOYMENT: "d",
      }),
    );
    expect(cfg.baseURL).toBe("https://proj.services.ai.azure.com/openai/v1");
  });

  it("openai-compatible: uses LLM_BASE_URL (trailing slash stripped) + LLM_MODEL", () => {
    const cfg = resolveModelConfig(
      parseEnv({
        ...NO_PHX_SSH,
        LLM_PROVIDER: "openrouter",
        LLM_BASE_URL: "https://openrouter.ai/api/v1/",
        OPENAI_API_KEY: "k",
        LLM_MODEL: "anthropic/claude",
      }),
    );
    expect(cfg).toEqual({
      provider: "openai-compatible",
      baseURL: "https://openrouter.ai/api/v1",
      modelId: "anthropic/claude",
    });
  });

  it("openai-compatible: supports local adapter servers without a real API key", () => {
    const cfg = resolveModelConfig(
      parseEnv({
        ...NO_PHX_SSH,
        LLM_PROVIDER: "local",
        LLM_BASE_URL: "http://127.0.0.1:8011/v1/",
        LLM_MODEL: "mlx-community/Qwen2.5-1.5B-Instruct-4bit",
      }),
    );
    expect(cfg).toEqual({
      provider: "openai-compatible",
      baseURL: "http://127.0.0.1:8011/v1",
      modelId: "mlx-community/Qwen2.5-1.5B-Instruct-4bit",
    });
  });

  it("gateway: uses AI Gateway base URL and active model slug", () => {
    const cfg = resolveModelConfig(
      parseEnv({
        ...NO_PHX_SSH,
        LLM_PROVIDER: "gateway",
        AI_GATEWAY_API_KEY: "gw-key",
        LLM_MODEL: "anthropic/claude-sonnet-4",
      }),
    );
    expect(cfg).toEqual({
      provider: "gateway",
      baseURL: "https://ai-gateway.vercel.sh/v1",
      modelId: "anthropic/claude-sonnet-4",
    });
  });
});

describe("resolveCustomModelConfig", () => {
  it("routes to the trained adapter server with the served model id", () => {
    const env = parseEnv({
      ...NO_PHX_SSH,
      MOCK_MODE: "true",
      CUSTOM_MODEL_BASE_URL: "http://127.0.0.1:8011/v1",
      CUSTOM_MODEL_SERVED_ID: "mlx-community/Qwen2.5-1.5B-Instruct-4bit",
    });
    expect(resolveCustomModelConfig(env)).toEqual({
      provider: "openai-compatible",
      baseURL: "http://127.0.0.1:8011/v1",
      modelId: "mlx-community/Qwen2.5-1.5B-Instruct-4bit",
    });
  });
});

describe("getModel custom routing", () => {
  beforeEach(() => {
    process.env.MOCK_MODE = "false";
    process.env.MOCK_PHOENIX = "true";
    process.env.MOCK_SSH = "true";
    process.env.MOCK_LLM = "false";
    process.env.CUSTOM_MODEL_BASE_URL = "http://127.0.0.1:8011/v1";
    process.env.CUSTOM_MODEL_SERVED_ID = "mlx-community/Qwen2.5-1.5B-Instruct-4bit";
    process.env.OPENAI_API_KEY = "sk-test";
    resetEnvCacheForTest();
    resetActiveModelCacheForTest();
    resetDb();
    setDb(makeJsonlAdapter());
    setActiveModelId(CUSTOM_MODEL_ID);
  });

  afterEach(() => {
    resetDb();
    resetActiveModelCacheForTest();
    resetEnvCacheForTest();
  });

  it("uses the trained adapter model id regardless of LLM_PROVIDER", () => {
    const model = getModel();
    expect(model.modelId).toBe("mlx-community/Qwen2.5-1.5B-Instruct-4bit");
  });
});

describe("isLocalOpenAiCompatibleBaseUrl", () => {
  it("treats compose service hosts as local", () => {
    expect(isLocalOpenAiCompatibleBaseUrl("http://model:8001/v1")).toBe(true);
    expect(isLocalOpenAiCompatibleBaseUrl("http://host.docker.internal:8001/v1")).toBe(true);
  });
});

describe("env requires the selected provider credentials", () => {
  it("azure provider requires AZURE_ENDPOINT + AZURE_API_KEY", () => {
    expect(() => parseEnv({ ...NO_PHX_SSH, LLM_PROVIDER: "azure" })).toThrow(/AZURE_/);
  });
  it("openai-compatible requires LLM_BASE_URL", () => {
    expect(() =>
      parseEnv({ ...NO_PHX_SSH, LLM_PROVIDER: "openai-compatible", OPENAI_API_KEY: "k" }),
    ).toThrow(/LLM_BASE_URL/);
  });
  it("openai-compatible requires OPENAI_API_KEY for remote endpoints", () => {
    expect(() =>
      parseEnv({
        ...NO_PHX_SSH,
        LLM_PROVIDER: "openai-compatible",
        LLM_BASE_URL: "https://openrouter.ai/api/v1",
      }),
    ).toThrow(/OPENAI_API_KEY/);
  });
  it("still requires OPENAI_API_KEY for the default openai provider", () => {
    expect(() => parseEnv({ ...NO_PHX_SSH })).toThrow(/OPENAI_API_KEY/);
  });
  it("gateway provider requires AI_GATEWAY_API_KEY", () => {
    expect(() => parseEnv({ ...NO_PHX_SSH, LLM_PROVIDER: "gateway" })).toThrow(
      /AI_GATEWAY_API_KEY/,
    );
  });
});
