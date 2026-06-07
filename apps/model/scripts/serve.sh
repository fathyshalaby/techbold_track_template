#!/usr/bin/env bash
set -euo pipefail

BASE_MODEL="${BASE_MODEL:-mistralai/Ministral-3-14B-Instruct-2512}"
ADAPTER_PATH="${ADAPTER_PATH:-outputs/adapter}"
LORA_NAME="${LORA_NAME:-msp}"
PORT="${PORT:-8001}"
MAX_MODEL_LEN="${MAX_MODEL_LEN:-8192}"
MAX_LORA_RANK="${MAX_LORA_RANK:-64}"
DRY_RUN="${DRY_RUN:-0}"

if [[ "$DRY_RUN" != "1" ]] && ! command -v vllm >/dev/null 2>&1; then
  echo "vLLM is not installed. Run: python -m pip install -e '.[serve]'" >&2
  exit 1
fi

EXTRA_ARGS=(--host 0.0.0.0 --port "$PORT" --max-model-len "$MAX_MODEL_LEN")

# Ministral 3 model card recommends Mistral-specific vLLM loading flags.
if [[ "$BASE_MODEL" == mistralai/Ministral-3-* ]]; then
  EXTRA_ARGS+=(--tokenizer_mode mistral --config_format mistral --load_format mistral)
fi

if [[ -d "$ADAPTER_PATH" ]]; then
  CMD=(vllm serve "$BASE_MODEL" \
    "${EXTRA_ARGS[@]}" \
    --enable-lora \
    --max-lora-rank "$MAX_LORA_RANK" \
    --lora-modules "$LORA_NAME=$ADAPTER_PATH")
else
  echo "Adapter path not found: $ADAPTER_PATH. Serving base model only." >&2
  CMD=(vllm serve "$BASE_MODEL" "${EXTRA_ARGS[@]}")
fi

if [[ "$DRY_RUN" == "1" ]]; then
  printf 'DRY_RUN command:'
  printf ' %q' "${CMD[@]}"
  printf '\n'
  exit 0
fi

exec "${CMD[@]}"
