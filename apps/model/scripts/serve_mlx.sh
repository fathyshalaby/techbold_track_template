#!/usr/bin/env bash
set -euo pipefail

MLX_MODEL="${MLX_MODEL:-mlx-community/Qwen2.5-1.5B-Instruct-4bit}"
MLX_ADAPTER_PATH="${MLX_ADAPTER_PATH:-outputs/mlx-adapter}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8011}"
MAX_TOKENS="${MAX_TOKENS:-512}"
TEMP="${TEMP:-0.0}"
DRY_RUN="${DRY_RUN:-0}"

if [[ "$DRY_RUN" != "1" ]] && ! command -v mlx_lm.server >/dev/null 2>&1; then
  echo "mlx_lm.server is not installed. Run: python -m pip install -e '.[mlx]'" >&2
  exit 1
fi

CMD=(mlx_lm.server
  --model "$MLX_MODEL"
  --host "$HOST"
  --port "$PORT"
  --max-tokens "$MAX_TOKENS"
  --temp "$TEMP")

if [[ -d "$MLX_ADAPTER_PATH" ]]; then
  CMD+=(--adapter-path "$MLX_ADAPTER_PATH")
else
  echo "MLX adapter path not found: $MLX_ADAPTER_PATH. Serving base model only." >&2
fi

if [[ "$DRY_RUN" == "1" ]]; then
  printf 'DRY_RUN command:'
  printf ' %q' "${CMD[@]}"
  printf '\n'
  exit 0
fi

exec "${CMD[@]}"
