import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModelV1 } from 'ai';
import { getEnv, resolveClientMode } from '../env.js';

const MOCK_MODEL: LanguageModelV1 = {
  specificationVersion: 'v1',
  provider: 'mock',
  modelId: 'mock',
  defaultObjectGenerationMode: 'json',
  supportsStructuredOutputs: true,
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop',
    usage: { promptTokens: 0, completionTokens: 0 },
    text: '{}',
  }),
  doStream: async () => {
    throw new Error('Mock model does not support streaming');
  },
};

export function getModel(): LanguageModelV1 {
  if (resolveClientMode('llm') === 'mock') {
    return MOCK_MODEL;
  }
  const env = getEnv();
  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  return openai(env.LLM_MODEL);
}
