#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

tracked_forbidden="$(
  git -C "$ROOT" ls-files | grep -E \
    '(^|/)\.env($|\.)|^keys/|^apps/backend/data/|^apps/dashboard/(\.next|out|dist)/|^apps/model/(\.env($|\.)|outputs/|checkpoints/|data/(source/.*\.jsonl|processed/|quarantine/)|.*__pycache__/|.*\.(pyc|safetensors|bin|gguf|pt|pth|ckpt|onnx|sqlite|db|log)$)|(^|/)(checkpoints|adapters|weights|logs)/|.*\.(safetensors|bin|gguf|pt|pth|ckpt|onnx|sqlite|db|log)$' \
    | grep -v -E '^(\.env\.example|apps/model/\.env\.example|keys/\.gitkeep|apps/model/outputs/\.gitkeep|apps/model/data/(source|processed|quarantine)/\.gitkeep)$' \
    || true
)"

if [[ -n "$tracked_forbidden" ]]; then
  printf '%s\n' "Forbidden generated/private artifacts are tracked:" >&2
  printf '%s\n' "$tracked_forbidden" >&2
  exit 1
fi

must_ignore=(
  ".env"
  ".env.local"
  "keys/customer.pem"
  "apps/backend/data/autopilot.db"
  "apps/backend/data/autopilot.db-wal"
  "apps/dashboard/.next/BUILD_ID"
  "apps/dashboard/out/index.html"
  "apps/model/.env"
  "apps/model/data/source/private.jsonl"
  "apps/model/data/source/sandbox-generated.jsonl"
  "apps/model/data/processed/train.jsonl"
  "apps/model/data/quarantine/private.jsonl"
  "apps/model/outputs/adapter/model.safetensors"
  "apps/model/outputs/benchmarks/latest.json"
  "apps/model/outputs/schema_guard.json"
  "apps/model/checkpoints/run-001"
  "logs/demo.log"
)

missing_ignore=()
for path in "${must_ignore[@]}"; do
  if ! git -C "$ROOT" check-ignore -q "$path"; then
    missing_ignore+=("$path")
  fi
done

if (( ${#missing_ignore[@]} > 0 )); then
  printf '%s\n' "Expected artifact path is not ignored:" >&2
  printf '  %s\n' "${missing_ignore[@]}" >&2
  exit 1
fi

printf '%s\n' "Root artifact guard passed."
