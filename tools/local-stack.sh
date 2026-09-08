#!/usr/bin/env bash
#
# Bring up the full climat.today stack locally: MongoDB + auth/user/rbac/
# carbon-credit services + the API-gateway stand-in, then seed the
# methodologies. Written because the env recipe below is NOT obvious and was
# reverse-engineered painfully once already (see AGENT_BUILD_LOG.md).
#
#   ./carbon-credit/tools/local-stack.sh up      # build (if needed), start everything, seed
#   ./carbon-credit/tools/local-stack.sh down    # stop services started by this script
#   ./carbon-credit/tools/local-stack.sh status  # what's listening
#   ./carbon-credit/tools/local-stack.sh logs <service>
#
# Then start the webapp separately:  npm --prefix carbon-credit-webapp start
# (it reads carbon-credit-webapp/.env.local, which points at the gateway).
#
# THE NON-OBVIOUS BITS — do not "simplify" these without reading the notes:
#
# 1. ENVIRONMENT is per-service, and NOT uniform. carbon-credit, user-service
#    and rbac-service have a clean no-credential Mongo branch gated on the
#    string "test"; auth-service's MongoConnection.ts has NO 'test' branch
#    (same repo pattern, copy-pasted inconsistently), so it needs "dev".
#    Using the wrong one makes Mongo auth fail with a confusing error.
# 2. MONGODB_URI must be explicitly EMPTY. The committed env files set it to a
#    literal "<REPLACE_WITH_MONGODB_URI>" placeholder, and any non-empty value
#    wins over the host/port branch, producing "No AuthProvider for DEFAULT".
# 3. Services must be reached through the gateway stand-in for inter-service
#    calls. Every service's Auth/User/Role.service.ts builds URLs like
#    "/auth/api/v1/...", assuming a gateway strips the leading segment — no
#    such gateway exists in this monorepo (see "Bug B" in AGENT_BUILD_LOG.md).
#    carbon-credit/tools/local-gateway.js is that stand-in. Pointing services directly at
#    each other's ports 404s (and in user-service's case, crashes it).
# 4. Node 20 is required for the services: their eosjs/jsonwebtoken deps break
#    on Node 26 ("invalid base-58", buffer-equal-constant-time prototype).
#    The webapp is fine on the default node.
# 6. TENANT_DEFAULT_SLUG puts every authenticated user into one tenant. That is
#    correct for local and single-operator deployments and WRONG anywhere more
#    than one operator uses the system: with it set, a user with no membership
#    silently lands in the default tenant instead of being refused.
# 5. AUTH_DEV_OTP makes the login OTP a fixed 12121 for local dev only. Without
#    it auth-service generates a real random OTP that you cannot receive (no
#    mail/SMS locally) — see Checkpoint 5. NEVER set this in a deployed env.

set -uo pipefail

# This script orchestrates repos that are siblings of carbon-credit's checkout
# (auth-service, user-service, rbac-service, carbon-credit-webapp). It lives in
# this repo because there is no workspace-level repo to hold it — move it to one
# when there is. Override CLIMAT_ROOT if your layout differs.
ROOT="${CLIMAT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE20="/opt/homebrew/opt/node@20/bin/node"
MONGOD="/opt/homebrew/opt/mongodb-community@7.0/bin/mongod"
DBPATH="$ROOT/.local-mongo-data"

PORT_USER=3600
PORT_AUTH=3601
PORT_RBAC=3602
PORT_GATEWAY=3699
PORT_CARBON=4001
PORT_MONGO=27017

GW="http://localhost:$PORT_GATEWAY"

log() { printf '\033[36m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[33mwarn:\033[0m %s\n' "$*"; }
die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }

for _repo in auth-service user-service rbac-service carbon-credit carbon-credit-webapp; do
  [ -d "$ROOT/$_repo" ] || die "expected sibling checkout '$_repo' under $ROOT — clone all repos side by side, or set CLIMAT_ROOT"
done

port_pid() { lsof -tiTCP:"$1" -sTCP:LISTEN 2>/dev/null | head -1; }

wait_for_port() { # port, label, timeout_s
  local p=$1 label=$2 timeout=${3:-30} waited=0
  until [ -n "$(port_pid "$p")" ]; do
    sleep 1; waited=$((waited+1))
    [ "$waited" -ge "$timeout" ] && { warn "$label did not come up on :$p in ${timeout}s (see: $0 logs $label)"; return 1; }
  done
  log "$label up on :$p"
}

preflight() {
  [ -x "$NODE20" ] || die "Node 20 not found at $NODE20 (brew install node@20)"
  [ -x "$MONGOD" ] || die "mongod not found at $MONGOD (brew tap mongodb/brew && brew install mongodb-community@7.0)"
}

start_mongo() {
  if [ -n "$(port_pid $PORT_MONGO)" ]; then log "mongod already running on :$PORT_MONGO"; return; fi
  mkdir -p "$DBPATH"
  log "starting mongod (no --auth; local dev only)"
  "$MONGOD" --dbpath "$DBPATH" --port $PORT_MONGO --bind_ip 127.0.0.1 \
            --logpath "$DBPATH/mongod.log" --fork >/dev/null \
    || die "mongod failed to start; see $DBPATH/mongod.log"
  wait_for_port $PORT_MONGO mongod
}

build_service() { # dir
  local dir=$1
  if [ ! -f "$ROOT/$dir/dist/src/infrastructure/server.js" ]; then
    log "building $dir (first run)"
    (cd "$ROOT/$dir" && npx tsc -p . >/dev/null 2>&1) || warn "$dir build reported errors; continuing with whatever dist exists"
  fi
}

start_service() { # label, dir, port, env-assignments...
  local label=$1 dir=$2 port=$3; shift 3
  if [ -n "$(port_pid "$port")" ]; then log "$label already running on :$port"; return; fi
  build_service "$dir"
  log "starting $label on :$port"
  ( cd "$ROOT/$dir" && env "$@" nohup "$NODE20" dist/src/infrastructure/server.js \
      > "$ROOT/$dir/local-run.log" 2>&1 < /dev/null & disown )
  wait_for_port "$port" "$label"
}

start_gateway() {
  if [ -n "$(port_pid $PORT_GATEWAY)" ]; then log "gateway already running on :$PORT_GATEWAY"; return; fi
  log "starting API-gateway stand-in on :$PORT_GATEWAY"
  ( cd "$SCRIPT_DIR" && nohup node local-gateway.js > "$SCRIPT_DIR/local-gateway.log" 2>&1 < /dev/null & disown )
  wait_for_port $PORT_GATEWAY gateway
}

seed_tenant() {
  log "seeding the default tenant and backfilling tenantId on pre-tenancy rows"
  ( cd "$ROOT/carbon-credit" && \
    ENVIRONMENT=test MONGODB_URI="" MONGODB_HOST=mongodb://localhost:$PORT_MONGO \
    MONGODB_PORT=$PORT_MONGO DB_NAME=dev TENANT_DEFAULT_SLUG=tenant-zero \
    npx ts-node src/infrastructure/database/seed/tenant.seed.ts 2>&1 | sed 's/^/    /' )
}

seed_methodologies() {
  log "seeding methodologies (VM0047, VMR0017; skips if already present)"
  ( cd "$ROOT/carbon-credit" && \
    ENVIRONMENT=test MONGODB_URI="" MONGODB_HOST=mongodb://localhost:$PORT_MONGO \
    MONGODB_PORT=$PORT_MONGO DB_NAME=dev \
    npx ts-node src/infrastructure/database/seed/methodology.seed.ts 2>&1 | sed 's/^/    /' )
}

cmd_up() {
  preflight
  start_mongo
  start_gateway

  # rbac-service — ENVIRONMENT=test (has the no-credential Mongo branch)
  start_service rbac-service rbac-service $PORT_RBAC \
    ENVIRONMENT=test MONGODB_URI= MONGODB_HOST=mongodb://localhost:$PORT_MONGO \
    MONGODB_PORT=$PORT_MONGO DB_NAME=rbac_local PORT=$PORT_RBAC \
    USER_SERVICE_URL=$GW AUTH_SERVICE_URL=$GW

  # user-service — ENVIRONMENT=test. ACTOR_KEY must be a *valid* WIF key or
  # eosjs throws at import time; this is a throwaway generated for local dev.
  start_service user-service user-service $PORT_USER \
    ENVIRONMENT=test MONGODB_URI= MONGODB_HOST=mongodb://localhost:$PORT_MONGO \
    MONGODB_PORT=$PORT_MONGO DB_NAME=user_local PORT=$PORT_USER \
    ROLE_SERVICE_URL=$GW AUTH_SERVICE_URL=$GW USER_SERVICE_URL=$GW \
    BC_SERVICE_URL=$GW ENCRYPTION_SERVICE_URL=$GW \
    NOTIFICATION_SERVICE_URL=http://localhost:3606 RESET_MAIL_NOTIFY_URL=http://localhost:3606 \
    CONTRACT_NAME=devorg ACTOR=tksgqvyt1cjd \
    ACTOR_KEY=5HxrWG3vJ184Rh1ah33GHvMVuTZ3YchyUambqswzrVS1Yb5c3sG \
    SHINE_BLOCKCHAIN=http://localhost:9999

  # auth-service — ENVIRONMENT=dev (NO 'test' branch in its MongoConnection).
  # USER_SERVICE_URL carries the /user prefix but ROLE_SERVICE_URL does not,
  # because auth-service's own call sites are inconsistent: User.service.ts
  # builds "<url>/api/v1/users/..." with no service segment, while
  # Role.service.ts builds "<url>/rbac/api/v1/..." with one. A single base URL
  # cannot satisfy both, which is a sharper form of Bug B than "everything
  # assumes a gateway" — see AGENT_BUILD_LOG.md.
  start_service auth-service auth-service $PORT_AUTH \
    ENVIRONMENT=dev MONGODB_URI= MONGODB_HOST=mongodb://localhost \
    MONGODB_PORT=$PORT_MONGO DB_NAME=auth_local PORT=$PORT_AUTH \
    USER_SERVICE_URL=$GW/user ROLE_SERVICE_URL=$GW \
    NOTIFICATION_SERVICE_URL=http://localhost:3606 \
    JWT_SECRET=local-dev-secret-not-for-prod \
    AUTH_DEV_OTP=12121

  # carbon-credit — the origination backend. LLM_* are read lazily per call,
  # so the service starts fine without them; generation will fail without a key.
  local llm_key="" llm_base="" llm_model=""
  [ -f "$HOME/.config/gmi/minimax.key" ] && llm_key="$(cat "$HOME/.config/gmi/minimax.key")"
  [ -f "$HOME/.config/gmi/base_url" ] && llm_base="$(cat "$HOME/.config/gmi/base_url")"
  [ -f "$HOME/.config/gmi/model" ] && llm_model="$(cat "$HOME/.config/gmi/model")"
  [ -n "$llm_key" ] || warn "no LLM key at ~/.config/gmi/minimax.key — case generation will fail (everything else works)"

  start_service carbon-credit carbon-credit $PORT_CARBON \
    ENVIRONMENT=test MONGODB_URI= MONGODB_HOST=mongodb://localhost:$PORT_MONGO \
    MONGODB_PORT=$PORT_MONGO DB_NAME=dev PORT=$PORT_CARBON \
    AUTH_SERVICE_URL=$GW USER_SERVICE_URL=$GW ROLE_SERVICE_URL=$GW \
    TENANT_DEFAULT_SLUG=tenant-zero \
    LLM_API_KEY="$llm_key" LLM_BASE_URL="$llm_base" LLM_MODEL="$llm_model"

  seed_tenant
  seed_methodologies
  echo
  cmd_status
  echo
  log "next: npm --prefix carbon-credit-webapp start   (then open http://localhost:3700)"
  log "local login: shine@ISSUER.com / 12345 — captcha value is in mongo (auth_local.captchas), OTP is 12121"
}

cmd_down() {
  for p in $PORT_CARBON $PORT_AUTH $PORT_USER $PORT_RBAC $PORT_GATEWAY; do
    local pid; pid="$(port_pid "$p")"
    if [ -n "$pid" ]; then log "stopping :$p (pid $pid)"; kill "$pid" 2>/dev/null; fi
  done
  warn "mongod left running (shared, holds your data). Stop it with: kill \$(lsof -tiTCP:$PORT_MONGO -sTCP:LISTEN)"
}

cmd_status() {
  printf '%-16s %-7s %s\n' SERVICE PORT STATUS
  for entry in "mongod:$PORT_MONGO" "gateway:$PORT_GATEWAY" "user-service:$PORT_USER" \
               "auth-service:$PORT_AUTH" "rbac-service:$PORT_RBAC" "carbon-credit:$PORT_CARBON"; do
    local name="${entry%%:*}" port="${entry##*:}" pid
    pid="$(port_pid "$port")"
    if [ -n "$pid" ]; then
      printf '%-16s %-7s %s\n' "$name" "$port" "up (pid $pid)"
    else
      printf '%-16s %-7s %s\n' "$name" "$port" "DOWN"
    fi
  done
}

cmd_logs() {
  local svc="${1:-}"
  [ -n "$svc" ] || die "usage: $0 logs <auth-service|user-service|rbac-service|carbon-credit|gateway>"
  if [ "$svc" = "gateway" ]; then tail -f "$SCRIPT_DIR/local-gateway.log"; else tail -f "$ROOT/$svc/local-run.log"; fi
}

case "${1:-up}" in
  up) cmd_up ;;
  down) cmd_down ;;
  status) cmd_status ;;
  logs) shift; cmd_logs "$@" ;;
  *) die "usage: $0 {up|down|status|logs <service>}" ;;
esac

# `logs` tails forever by design; everything else must return promptly.
exit 0
