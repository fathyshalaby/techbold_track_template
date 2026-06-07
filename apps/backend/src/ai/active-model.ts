import {
  ACTIVE_MODEL_SETTING_ID,
  DEFAULT_GATEWAY_MODEL,
  isCatalogModelId,
} from "@techbold/contracts";
import { getEnv } from "../env.js";
import { getDb } from "../store/db.js";

const LEGACY_MODEL_MAP: Record<string, string> = {
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gpt-5.5": "openai/gpt-5.5",
};

let cachedModelId: string | undefined;

function normalizeModelId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_GATEWAY_MODEL;
  if (isCatalogModelId(trimmed)) return trimmed;
  return LEGACY_MODEL_MAP[trimmed] ?? trimmed;
}

export function defaultModelFromEnv(): string {
  const env = getEnv();
  if (env.AI_GATEWAY_API_KEY.trim() !== "" || env.LLM_PROVIDER.trim().toLowerCase() === "gateway") {
    return normalizeModelId(env.LLM_MODEL);
  }
  return env.LLM_MODEL.trim() || DEFAULT_GATEWAY_MODEL;
}

function readPersistedModelId(): string | undefined {
  const row = getDb().get<{ value: string }>("SELECT value FROM settings WHERE id = ?", [
    ACTIVE_MODEL_SETTING_ID,
  ]);
  if (!row?.value?.trim()) return undefined;
  return normalizeModelId(row.value);
}

function persistModelId(modelId: string): void {
  const db = getDb();
  const existing = db.get<{ value: string }>("SELECT value FROM settings WHERE id = ?", [
    ACTIVE_MODEL_SETTING_ID,
  ]);
  if (existing) {
    db.run("UPDATE settings SET value = ? WHERE id = ?", [modelId, ACTIVE_MODEL_SETTING_ID]);
  } else {
    db.run("INSERT INTO settings (id, value) VALUES (?, ?)", [ACTIVE_MODEL_SETTING_ID, modelId]);
  }
}

export function getActiveModelId(): string {
  if (cachedModelId) return cachedModelId;
  cachedModelId = readPersistedModelId() ?? defaultModelFromEnv();
  return cachedModelId;
}

export function setActiveModelId(modelId: string): string {
  const normalized = normalizeModelId(modelId);
  if (!isCatalogModelId(normalized)) {
    throw new Error(`Unknown model id: ${modelId}`);
  }
  persistModelId(normalized);
  cachedModelId = normalized;
  return normalized;
}

export function resetActiveModelCacheForTest(): void {
  cachedModelId = undefined;
}
