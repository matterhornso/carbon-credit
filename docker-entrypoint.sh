#!/bin/sh
# Seeds run in-container because the database is only reachable on Railway's
# private network, and both are idempotent — the tenant seed skips an existing
# tenant and backfills nothing on a second run, and the methodology seed skips
# codes already present. A seed failure must not stop the service from
# starting: the service is still useful, and the failure is visible in logs.
set -u

echo "[entrypoint] seeding default tenant"
node dist/src/infrastructure/database/seed/tenant.seed.js || echo "[entrypoint] tenant seed failed, continuing"

echo "[entrypoint] seeding methodologies"
node dist/src/infrastructure/database/seed/methodology.seed.js || echo "[entrypoint] methodology seed failed, continuing"

echo "[entrypoint] seeding worked example"
node dist/src/infrastructure/database/seed/worked_example.seed.js || echo "[entrypoint] worked example seed failed, continuing"

echo "[entrypoint] starting carbon-credit"
exec node dist/src/infrastructure/server.js
