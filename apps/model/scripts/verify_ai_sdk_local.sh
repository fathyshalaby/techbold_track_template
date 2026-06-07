#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="${BACKEND_DIR:-../backend}"
LLM_BASE_URL="${LLM_BASE_URL:-http://127.0.0.1:${MLX_PORT:-8011}/v1}"
LLM_MODEL="${LLM_MODEL:-${MLX_MODEL:-mlx-community/Qwen2.5-1.5B-Instruct-4bit}}"
STRICT_AGENT_CONTRACT="${STRICT_AGENT_CONTRACT:-0}"

cd "$BACKEND_DIR"

env -u OPENAI_API_KEY \
  LLM_PROVIDER=local \
  LLM_BASE_URL="$LLM_BASE_URL" \
  LLM_MODEL="$LLM_MODEL" \
  MOCK_PHOENIX=true \
  MOCK_SSH=true \
  bunx tsx -e '
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "./src/ai/model.ts";

async function main() {
  const result = await generateObject({
    model: getModel(),
    schema: z.object({ ok: z.boolean(), command: z.string() }),
    system: "Return JSON only.",
    prompt: "Return ok true and command ss -ltnp | grep :443",
    maxTokens: 128,
  });
  console.log(JSON.stringify({ check: "ai-sdk-structured-output", result: result.object }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
'

if [[ "$STRICT_AGENT_CONTRACT" != "1" ]]; then
  exit 0
fi

env -u OPENAI_API_KEY \
  LLM_PROVIDER=local \
  LLM_BASE_URL="$LLM_BASE_URL" \
  LLM_MODEL="$LLM_MODEL" \
  MOCK_PHOENIX=true \
  MOCK_SSH=true \
  bunx tsx -e '
import { runProblemAnalyzer } from "./src/ai/agents/problem-analyzer.ts";

async function main() {
  const result = await runProblemAnalyzer({
    ticketDescription:
      "nginx will not start after deploy; journalctl says bind() to 0.0.0.0:443 failed address already in use",
    observations: [],
  });
  console.log(JSON.stringify({ check: "problem-analyzer-contract", result }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
'
