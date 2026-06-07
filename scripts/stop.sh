#!/usr/bin/env bash
set -euo pipefail

# Tear down the whole Sphinx stack started by scripts/start.sh.
#
#   bun run stop              stop and remove containers (keep volumes/data)
#   bun run stop -- --purge   also remove named volumes (Postgres + audit data)
#
# Also stops the host MLX model server (if start.sh launched one) and the
# sandbox fake-VM containers.

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")/.." rev-parse --show-toplevel)"
cd "$ROOT"

PURGE=0
MODEL_PID_FILE="$ROOT/.model-server.pid"

C_RESET=$'\033[0m'; C_GREEN=$'\033[32m'; C_CYAN=$'\033[36m'
log()  { printf '%s==>%s %s\n' "$C_CYAN" "$C_RESET" "$*"; }
ok()   { printf '%s[ok]%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --purge) PURGE=1 ;;
    -h|--help) sed -n '4,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) printf 'Unknown option: %s\n' "$1" >&2; exit 1 ;;
  esac
  shift
done

# Stop the host MLX model server if we started one.
if [[ -f "$MODEL_PID_FILE" ]]; then
  PID="$(cat "$MODEL_PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    log "Stopping MLX model server (pid $PID)..."
    kill "$PID" 2>/dev/null || true
  fi
  rm -f "$MODEL_PID_FILE"
fi

# Bring down all profiles so the sandbox seeder/containers are cleaned up too.
DOWN_ARGS=(--profile sandbox down --remove-orphans)
[[ "$PURGE" -eq 1 ]] && DOWN_ARGS+=(--volumes)
log "Stopping Docker stack..."
docker compose "${DOWN_ARGS[@]}"

# The fake VMs are launched on the host daemon by the seeder, not by compose.
if command -v bun >/dev/null 2>&1 && [[ -d infra/sandbox ]]; then
  log "Stopping sandbox fake-VM containers (if any)..."
  (cd infra/sandbox && bun run down >/dev/null 2>&1) || true
fi

ok "Stack stopped.$([[ "$PURGE" -eq 1 ]] && printf ' Volumes purged.' || true)"
