import { describe, expect, it } from "vitest";
import { resolveModelConfig } from "../ai/model.js";
import { effectiveLlmProvider, parseEnv } from "../env.js";

// Multi-provider model wiring (absorbed Azure AI Foundry support). Pure config
// resolution - no network, no key material exercised.

// Drop phoenix/ssh requirements so we can isolate the LLM provider config.
const NO_PHX_SSH = { MOCK_PHOENIX: "true", MOCK_SSH: "true" } as const;

describe("effectiveLlmProvider", () => {
  it("defaults to openai", () => {
    expect(
      effectiveLlmProvider({ LLM_PROVIDER: "openai", AZURE_ENDPOINT: "", LLM_BASE_URL: "" }),
    ).toBe("openai");
  });
  it("selects azure when an endpoint is present (even without explicit provider)", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "openai",
        AZURE_ENDPOINT: "https://x.azure.com",
        LLM_BASE_URL: "",
      }),
    ).toBe("azure");
  });
  it("selects openai-compatible when a base URL is present", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "openrouter",
        AZURE_ENDPOINT: "",
        LLM_BASE_URL: "https://or/api/v1",
      }),
    ).toBe("openai-compatible");
  });
  it("azure wins over a base URL when both are set", () => {
    expect(
      effectiveLlmProvider({
        LLM_PROVIDER: "",
        AZURE_ENDPOINT: "https://x.azure.com",
        LLM_BASE_URL: "https://or",
      }),
    ).toBe("azure");
  });
});

describe("resolveModelConfig", () => {
  it("openai (default): no baseURL, model from LLM_MODEL", () => {
    const cfg = resolveModelConfig(
      parseEnv({ ...NO_PHX_SSH, OPENAI_API_KEY: "k", LLM_MODEL: "gpt-4o" }),
    );
    expect(cfg).toEqual({ provider: "openai", modelId: "gpt-4o" });
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
  it("still requires OPENAI_API_KEY for the default openai provider", () => {
    expect(() => parseEnv({ ...NO_PHX_SSH })).toThrow(/OPENAI_API_KEY/);
  });
});
