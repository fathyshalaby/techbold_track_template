import { CUSTOM_MODEL_ID } from "@techbold/contracts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetActiveModelCacheForTest } from "../ai/active-model.js";
import { app } from "../app.js";
import { resetEnvCacheForTest } from "../env.js";
import { makeJsonlAdapter, resetDb, setDb } from "../store/db.js";

describe("settings model API", () => {
  beforeEach(() => {
    process.env.MOCK_MODE = "false";
    process.env.MOCK_PHOENIX = "true";
    process.env.MOCK_SSH = "true";
    process.env.MOCK_LLM = "false";
    process.env.OPENAI_API_KEY = "sk-test";
    delete process.env.AI_GATEWAY_API_KEY;
    resetEnvCacheForTest();
    resetActiveModelCacheForTest();
    resetDb();
    setDb(makeJsonlAdapter());
  });

  afterEach(() => {
    resetDb();
    resetActiveModelCacheForTest();
    resetEnvCacheForTest();
  });

  it("GET /api/settings/model includes the custom trained model in the catalog", async () => {
    const res = await app.request("/api/settings/model");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.models.some((entry: { id: string }) => entry.id === CUSTOM_MODEL_ID)).toBe(true);
  });

  it("GET /api/settings/model reports the live provider honestly (OpenAI configured)", async () => {
    const res = await app.request("/api/settings/model");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.provider).toBe("openai");
    expect(body.liveConfigured).toBe(true);
    // Only the gateway/mock can actually switch the cloud catalog.
    expect(body.canSwitchModels).toBe(false);
  });

  it("GET /api/settings/model marks the gateway as switchable when configured", async () => {
    process.env.LLM_PROVIDER = "gateway";
    process.env.AI_GATEWAY_API_KEY = "gw-test";
    resetEnvCacheForTest();
    const res = await app.request("/api/settings/model");
    const body = await res.json();
    expect(body.provider).toBe("gateway");
    expect(body.liveConfigured).toBe(true);
    expect(body.canSwitchModels).toBe(true);
    process.env.LLM_PROVIDER = "openai";
    delete process.env.AI_GATEWAY_API_KEY;
  });

  it("PUT /api/settings/model accepts the custom model without a gateway configured", async () => {
    const res = await app.request("/api/settings/model", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: CUSTOM_MODEL_ID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.model).toBe(CUSTOM_MODEL_ID);
  });

  it("PUT /api/settings/model accepts a catalog model when a live provider is configured", async () => {
    const res = await app.request("/api/settings/model", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-4o" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.model).toBe("openai/gpt-4o");
  });
});
