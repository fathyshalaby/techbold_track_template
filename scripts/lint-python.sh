#!/usr/bin/env bash
set -euo pipefail

if ! command -v ruff >/dev/null 2>&1; then
  echo "ruff not found; skipping Python lint. Install with: uv tool install ruff"
  exit 0
fi

ruff check --fix "$@"
ruff format "$@"
