#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

tracked_forbidden="$(
  git -C "$ROOT" ls-files apps/model | grep -E \
    '^(apps/model/(\.env($|\.)|outputs/|checkpoints/|data/(source/.*\.jsonl|processed/|quarantine/)|.*__pycache__/|.*\.pyc$|.*\.safetensors$|.*\.bin$|.*\.log$|.*\.sqlite$|.*\.db$))' \
    | grep -v '^apps/model/\.env\.example$' \
    || true
)"

if [[ -n "$tracked_forbidden" ]]; then
  printf '%s\n' "Forbidden generated/private model artifacts are tracked:" >&2
  printf '%s\n' "$tracked_forbidden" >&2
  exit 1
fi

must_ignore=(
  "apps/model/.env"
  "apps/model/data/source/private.jsonl"
  "apps/model/data/source/sandbox-generated.jsonl"
  "apps/model/data/source/sandbox-synthetic-generated.jsonl"
  "apps/model/data/processed/train.jsonl"
  "apps/model/data/quarantine/private.jsonl"
  "apps/model/outputs/adapter/model.safetensors"
  "apps/model/outputs/benchmarks/latest.json"
  "apps/model/outputs/schema_guard.json"
  "apps/model/checkpoints/run-001"
)

missing_ignore=()
for path in "${must_ignore[@]}"; do
  if ! git -C "$ROOT" check-ignore -q "$path"; then
    missing_ignore+=("$path")
  fi
done

if (( ${#missing_ignore[@]} > 0 )); then
  printf '%s\n' "Expected model artifact path is not ignored:" >&2
  printf '  %s\n' "${missing_ignore[@]}" >&2
  exit 1
fi

printf '%s\n' "Model artifact guard passed."
