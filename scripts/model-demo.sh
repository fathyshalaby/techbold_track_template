#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")/.." rev-parse --show-toplevel)"
MODEL_DIR="$ROOT/apps/model"

MLX_MODEL="${MLX_MODEL:-mlx-community/Qwen2.5-1.5B-Instruct-4bit}"
MLX_ADAPTER_PATH="${MLX_ADAPTER_PATH:-outputs/mlx-adapter}"
MLX_PORT="${MLX_PORT:-8011}"
MLX_ITERS="${MLX_ITERS:-5}"
SYNTHETIC_RECORDS="${SYNTHETIC_RECORDS:-240}"
SYNTHETIC_SEED="${SYNTHETIC_SEED:-7}"
SKIP_PREPARE="${SKIP_PREPARE:-0}"

usage() {
  cat <<'EOF'
Usage: bun run model:<command>

Commands:
  model:doctor       Check local tools and print the active model settings.
  model:data         Generate synthetic sandbox data and validate schemas.
  model:train        Install MLX deps if needed, train the smoke adapter, and eval it.
  model:serve        Start the local MLX OpenAI-compatible server. This blocks.
  model:verify       Verify backend AI SDK transport and write benchmark-local.
  model:prompt       Run one sample prompt through the trained adapter.
  model:showcase     Run doctor, data, train, and print the two-terminal demo path.
  model:vllm         Dry-run the optional Compose/vLLM serving command.
  model:clean        Remove generated model data and outputs.

Useful overrides:
  MLX_MODEL=mlx-community/Qwen2.5-7B-Instruct-4bit
  MLX_ADAPTER_PATH=outputs/mlx-qwen2.5-7b-adapter
  MLX_ITERS=100
  SYNTHETIC_RECORDS=240
  SKIP_PREPARE=1
EOF
}

section() {
  printf '\n== %s ==\n' "$1"
}

run() {
  printf '+ %s\n' "$*"
  "$@"
}

use_node_22_if_available() {
  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1091
    source "$HOME/.nvm/nvm.sh"
    nvm use 22 >/dev/null
  fi
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    return 1
  fi
}

is_apple_silicon() {
  [[ "$(uname -s)" == "Darwin" && "$(uname -m)" == "arm64" ]]
}

make_model() {
  (cd "$MODEL_DIR" && env \
    MLX_MODEL="$MLX_MODEL" \
    MLX_ADAPTER_PATH="$MLX_ADAPTER_PATH" \
    MLX_PORT="$MLX_PORT" \
    MLX_ITERS="$MLX_ITERS" \
    SYNTHETIC_RECORDS="$SYNTHETIC_RECORDS" \
    SYNTHETIC_SEED="$SYNTHETIC_SEED" \
    make --no-print-directory -s "$@")
}

print_settings() {
  cat <<EOF
Repo: $ROOT
Model: $MLX_MODEL
Adapter: apps/model/$MLX_ADAPTER_PATH
Server: http://127.0.0.1:$MLX_PORT/v1
Synthetic records: $SYNTHETIC_RECORDS
Synthetic seed: $SYNTHETIC_SEED
MLX iters: $MLX_ITERS
EOF
}

doctor() {
  use_node_22_if_available || true
  section "Model Demo Doctor"
  print_settings
  printf 'Node: '
  node --version
  printf 'Bun: '
  bun --version
  printf 'Python: '
  python --version
  if is_apple_silicon; then
    printf 'MLX host: Apple Silicon detected\n'
  else
    printf 'MLX host: not Apple Silicon, MLX training may be unavailable\n'
  fi
  if command -v mlx_lm.lora >/dev/null 2>&1; then
    printf 'MLX-LM: installed\n'
  else
    printf 'MLX-LM: not on PATH yet. model:train can install it on Apple Silicon.\n'
  fi
}

data() {
  use_node_22_if_available || true
  section "Generate Synthetic Sandbox Data"
  run make_model preview-synthetic
  run make_model dataset-hackathon
  run make_model benchmark
  run make_model artifact-guard
  section "Dataset Files"
  printf 'Source: apps/model/data/source/sandbox-generated.jsonl\n'
  printf 'Synthetic: apps/model/data/source/sandbox-synthetic-generated.jsonl\n'
  printf 'Train: apps/model/data/processed/train.jsonl\n'
  printf 'Eval: apps/model/data/processed/eval.jsonl\n'
  printf 'MLX data: apps/model/outputs/mlx-data\n'
}

train() {
  use_node_22_if_available || true
  section "Train MLX Adapter"
  if ! is_apple_silicon; then
    printf 'This training path requires Apple Silicon MLX. Use model:vllm on CUDA hosts.\n' >&2
    exit 1
  fi
  if [[ "$SKIP_PREPARE" != "1" ]]; then
    run make_model prepare-mlx
  fi
  run make_model dataset-hackathon
  run make_model train-mlx-small
  run make_model eval-mlx-small
  run make_model benchmark
  run make_model artifact-guard
  section "Adapter Ready"
  printf 'Adapter path: apps/model/%s\n' "$MLX_ADAPTER_PATH"
}

serve() {
  use_node_22_if_available || true
  section "Serve MLX Adapter"
  print_settings
  printf 'This process blocks. Keep it running, then use another terminal for: bun run model:verify\n'
  run make_model serve-mlx
}

verify() {
  use_node_22_if_available || true
  section "Verify Backend AI SDK Against Local Model"
  run make_model verify-ai-sdk-local
  run make_model benchmark-local
  run make_model artifact-guard
}

prompt() {
  use_node_22_if_available || true
  section "Generate Sample Troubleshooting Response"
  run make_model generate-mlx-small
}

showcase() {
  doctor
  data
  train
  section "Showcase Runbook"
  cat <<EOF
Terminal 1:
  bun run model:serve

Terminal 2:
  bun run model:verify

Backend env for a host-run backend:
  LLM_PROVIDER=local
  LLM_BASE_URL=http://127.0.0.1:$MLX_PORT/v1
  LLM_MODEL=$MLX_MODEL

Backend env for Docker backend calling the Mac host:
  LLM_PROVIDER=local
  LLM_BASE_URL=http://host.docker.internal:$MLX_PORT/v1
  LLM_MODEL=$MLX_MODEL
EOF
}

vllm() {
  use_node_22_if_available || true
  section "Dry-run Optional vLLM Serving"
  (cd "$MODEL_DIR" && DRY_RUN=1 make serve)
}

clean() {
  section "Clean Generated Model Artifacts"
  run make_model clean
  run make_model artifact-guard
}

main() {
  require_command git
  require_command make
  require_command python
  require_command bun

  case "${1:-help}" in
    help|-h|--help) usage ;;
    doctor) doctor ;;
    data) data ;;
    train) train ;;
    serve) serve ;;
    verify) verify ;;
    prompt) prompt ;;
    showcase) showcase ;;
    vllm) vllm ;;
    clean) clean ;;
    *)
      usage >&2
      exit 2
      ;;
  esac
}

main "$@"
