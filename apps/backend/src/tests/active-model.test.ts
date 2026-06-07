import { CUSTOM_MODEL_ID } from "@techbold/contracts";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getActiveModelId,
  resetActiveModelCacheForTest,
  setActiveModelId,
} from "../ai/active-model.js";
import { resetEnvCacheForTest } from "../env.js";
import { makeJsonlAdapter, resetDb, setDb } from "../store/db.js";

describe("active model settings", () => {
  beforeEach(() => {
    process.env.MOCK_MODE = "true";
    resetEnvCacheForTest();
    resetDb();
    resetActiveModelCacheForTest();
    setDb(makeJsonlAdapter());
  });

  it("persists catalog model selection", () => {
    expect(getActiveModelId()).toBeTruthy();
    const next = setActiveModelId("anthropic/claude-sonnet-4");
    expect(next).toBe("anthropic/claude-sonnet-4");
    resetActiveModelCacheForTest();
    expect(getActiveModelId()).toBe("anthropic/claude-sonnet-4");
  });

  it("persists the custom trained model id", () => {
    const next = setActiveModelId(CUSTOM_MODEL_ID);
    expect(next).toBe(CUSTOM_MODEL_ID);
    resetActiveModelCacheForTest();
    expect(getActiveModelId()).toBe(CUSTOM_MODEL_ID);
  });

  it("rejects unknown model ids", () => {
    expect(() => setActiveModelId("not-a-real/model")).toThrow(/Unknown model id/);
  });
});
