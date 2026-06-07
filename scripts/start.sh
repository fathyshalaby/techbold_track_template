#!/usr/bin/env bash
set -euo pipefail

# Single entrypoint for the whole Sphinx stack.
#
#   bun run start                 build + start db, backend, frontend (detached)
#   bun run start -- --sandbox    also build + seed the 5 fake-VM incidents
#   bun run start -- --model      also serve the MLX adapter on the Mac host (:8011)
#   bun run start -- --logs       follow compose logs after the stack is healthy
#   bun run start -- --no-build   skip image rebuild (fast restart)
#   bun run stop                  tear the whole stack down
#
# The script is idempotent: it ensures .env and the sandbox SSH keypair exist,
# brings the core services up, waits for real health (not just container start),
# then prints the access URLs and the live/mock mode the backend resolved.

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")/.." rev-parse --show-toplevel)"
cd "$ROOT"

WITH_SANDBOX=0
WITH_MODEL=0
FOLLOW_LOGS=0
DO_BUILD=1
MODEL_LOG="$ROOT/.model-server.log"
MODEL_PID_FILE="$ROOT/.model-server.pid"

C_RESET=$'\033[0m'
C_BOLD=$'\033[1m'
C_GREEN=$'\033[32m'
C_YELLOW=$'\033[33m'
C_RED=$'\033[31m'
C_CYAN=$'\033[36m'

log()  { printf '%s==>%s %s\n' "$C_CYAN" "$C_RESET" "$*"; }
ok()   { printf '%s[ok]%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf '%s[warn]%s %s\n' "$C_YELLOW" "$C_RESET" "$*"; }
die()  { printf '%s[error]%s %s\n' "$C_RED" "$C_RESET" "$*" >&2; exit 1; }

usage() {
  sed -n '4,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sandbox) WITH_SANDBOX=1 ;;
    --model) WITH_MODEL=1 ;;
    --logs) FOLLOW_LOGS=1 ;;
    --no-build) DO_BUILD=0 ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1 (try --help)" ;;
  esac
  shift
done

# ---- Preflight ----------------------------------------------------------------
command -v docker >/dev/null 2>&1 || die "docker is not installed or not on PATH."
docker compose version >/dev/null 2>&1 || die "The Docker Compose plugin is required (docker compose)."
if ! docker info >/dev/null 2>&1; then
  die "Docker daemon is not running. Start Docker Desktop and retry."
fi
ok "Docker daemon reachable."

# ---- Free host ports squatted by stale dev servers ----------------------------
# Docker publishes 8000/3000/5432 on the host, so a leftover `bun run dev:*`
# server blocks the container from binding. Those dev servers run under a
# `tsx --watch` / `next dev` supervisor that instantly respawns a killed child,
# so we walk up the process tree and kill the supervising ancestors too. Only
# THIS repo's own dev servers are touched; Docker-managed ports are left alone,
# and any other process aborts with a clear message (not a cryptic bind error).
DEV_SIGNATURE='tsx .*src/index\.ts|tsx --watch|next-server|next .*dev|bun run dev|dev:backend|dev:frontend'

kill_stale_tree() {
  local pid="$1" cur="$1" cmd chain=()
  while [[ -n "$cur" && "$cur" != "1" && "$cur" != "0" ]]; do
    cmd="$(ps -p "$cur" -o command= 2>/dev/null || true)"
    if printf '%s' "$cmd" | grep -Eq "$DEV_SIGNATURE"; then
      chain+=("$cur")
    fi
    cur="$(ps -p "$cur" -o ppid= 2>/dev/null | tr -d ' ')"
  done
  # Kill supervisors first (highest in the tree) so they cannot respawn the child.
  local i
  for (( i=${#chain[@]}-1; i>=0; i-- )); do kill -9 "${chain[i]}" 2>/dev/null || true; done
  kill -9 "$pid" 2>/dev/null || true
}

free_port_if_stale() {
  local port="$1" label="$2" pids pid cmd
  pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -z "$pids" ]] && return 0
  for pid in $pids; do
    cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
    if printf '%s' "$cmd" | grep -Eqi 'com\.docker|docker\.app|vpnkit|docker-proxy'; then
      continue # Docker-managed publish; compose recreates it cleanly.
    fi
    if printf '%s' "$cmd" | grep -Eq "$DEV_SIGNATURE"; then
      warn "Port $port ($label) held by a stale dev server (pid $pid). Stopping its supervisor tree."
      kill_stale_tree "$pid"
    else
      die "Port $port ($label) is in use by pid $pid: ${cmd:-unknown}. Stop it and retry."
    fi
  done
  # Wait for the socket to actually release before compose tries to bind it.
  local waited=0
  while lsof -ti tcp:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
    cmd="$(ps -p "$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null | head -1)" -o command= 2>/dev/null || true)"
    printf '%s' "$cmd" | grep -Eqi 'com\.docker|docker\.app|vpnkit|docker-proxy' && break
    (( waited >= 10 )) && die "Port $port ($label) is still in use after stopping stale servers."
    sleep 1; (( waited++ ))
  done
}
free_port_if_stale 8000 backend
free_port_if_stale 3000 frontend
free_port_if_stale 5432 postgres
ok "Host ports 8000/3000/5432 are clear."

# ---- Ensure .env --------------------------------------------------------------
if [[ ! -f .env ]]; then
  cp .env.example .env
  warn ".env was missing; created it from .env.example (mock mode, no credentials)."
else
  ok ".env present."
fi

# ---- Ensure sandbox SSH keypair ----------------------------------------------
# The fake-VM incidents (and the dashboard provisioner) inject this public key.
if [[ ! -f keys/bench_incident_key || ! -f keys/bench_incident_key.pub ]]; then
  log "Generating sandbox SSH keypair (keys/bench_incident_key)."
  ssh-keygen -t ed25519 -N "" -C "techbold-sandbox" -f keys/bench_incident_key >/dev/null
  ok "Sandbox keypair created."
else
  ok "Sandbox SSH keypair present."
fi

# ---- Bring up the core stack --------------------------------------------------
COMPOSE_ARGS=(up -d)
[[ "$DO_BUILD" -eq 1 ]] && COMPOSE_ARGS+=(--build)
log "Starting core services (db, backend, frontend)..."
docker compose "${COMPOSE_ARGS[@]}" db backend frontend

# ---- Wait for real health -----------------------------------------------------
wait_for() {
  local name="$1" url="$2" tries="${3:-60}" i=1
  printf '%s==>%s waiting for %s ' "$C_CYAN" "$C_RESET" "$name"
  while (( i <= tries )); do
    if curl -fsS -o /dev/null --max-time 2 "$url" 2>/dev/null; then
      printf ' %s[ok]%s\n' "$C_GREEN" "$C_RESET"
      return 0
    fi
    printf '.'
    sleep 2
    ((i++))
  done
  printf ' %s[timeout]%s\n' "$C_RED" "$C_RESET"
  return 1
}

BACKEND_OK=0
FRONTEND_OK=0
wait_for "backend  http://localhost:8000/health" "http://localhost:8000/health" && BACKEND_OK=1 || true
wait_for "frontend http://localhost:3000"        "http://localhost:3000"        && FRONTEND_OK=1 || true

if [[ "$BACKEND_OK" -ne 1 ]]; then
  warn "Backend did not become healthy. Recent logs:"
  docker compose logs --tail=40 backend || true
fi

# ---- Optional: sandbox fake-VM incidents -------------------------------------
if [[ "$WITH_SANDBOX" -eq 1 ]]; then
  log "Building + seeding sandbox incidents (host Docker daemon)..."
  if docker compose --profile sandbox up --build sandbox; then
    ok "Sandbox incidents seeded (SSH on 127.0.0.1:2201-2205)."
    warn "For the app to use them, set MOCK_SCENARIOS=true (and SSH vars) in .env, then: bun run start -- --no-build"
  else
    warn "Sandbox seeding failed; the core stack is still up."
  fi
fi

# ---- Optional: MLX model server on the Mac host ------------------------------
if [[ "$WITH_MODEL" -eq 1 ]]; then
  if [[ "$(uname -s)" == "Darwin" && "$(uname -m)" == "arm64" ]]; then
    if [[ -f "$MODEL_PID_FILE" ]] && kill -0 "$(cat "$MODEL_PID_FILE")" 2>/dev/null; then
      ok "MLX model server already running (pid $(cat "$MODEL_PID_FILE"))."
    else
      log "Starting MLX adapter server on http://127.0.0.1:8011 (host)..."
      nohup bash "$ROOT/scripts/model-demo.sh" serve >"$MODEL_LOG" 2>&1 &
      echo $! >"$MODEL_PID_FILE"
      if wait_for "model    http://127.0.0.1:8011/v1/models" "http://127.0.0.1:8011/v1/models" 30; then
        ok "MLX model server up. Set LLM_PROVIDER=local + LLM_BASE_URL=http://host.docker.internal:8011/v1 in .env to route to it."
      else
        warn "MLX server not responding yet. Tail: tail -f $MODEL_LOG (it may still be loading or MLX deps may be missing: bun run model:train)."
      fi
    fi
  else
    warn "--model needs Apple Silicon (MLX). Skipping local model server on this host."
  fi
fi

# ---- Summary ------------------------------------------------------------------
MODE="unknown"
if [[ "$BACKEND_OK" -eq 1 ]]; then
  # Grab the first "mode" field (top-level mock/real), not the nested store.mode.
  MODE="$(curl -fsS --max-time 2 http://localhost:8000/health 2>/dev/null | grep -o '"mode":"[a-z]*"' | head -1 | sed 's/.*:"//;s/"//')"
  [[ -z "$MODE" ]] && MODE="unknown"
fi

printf '\n%s================ Sphinx is up ================%s\n' "$C_BOLD" "$C_RESET"
printf '  Dashboard   %shttp://localhost:3000%s\n' "$C_GREEN" "$C_RESET"
printf '  Backend API %shttp://localhost:8000%s\n' "$C_GREEN" "$C_RESET"
printf '  Health      http://localhost:8000/health  (mode: %s)\n' "$MODE"
printf '  Postgres    localhost:5432  (autopilot/autopilot)\n'
[[ "$WITH_SANDBOX" -eq 1 ]] && printf '  Sandbox VMs SSH 127.0.0.1:2201-2205\n'
[[ "$WITH_MODEL" -eq 1 ]]   && printf '  MLX model   http://127.0.0.1:8011/v1\n'
printf '%s=============================================%s\n' "$C_BOLD" "$C_RESET"
printf '  Logs   docker compose logs -f backend frontend\n'
printf '  Stop   bun run stop\n\n'

if [[ "$FOLLOW_LOGS" -eq 1 ]]; then
  log "Following logs (Ctrl-C to detach; services keep running)..."
  exec docker compose logs -f backend frontend
fi

[[ "$BACKEND_OK" -eq 1 && "$FRONTEND_OK" -eq 1 ]] || exit 1
