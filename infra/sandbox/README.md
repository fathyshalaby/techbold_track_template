# Sandbox Incident Harness

Local Docker-backed "fake VMs" for developing the troubleshooting loop without burning the real practice VMs.

## Commands

```bash
bun run sandbox:up
bun run sandbox:down
bun run sandbox:reset
bun run sandbox:test
```

`sandbox:up` builds one container per scenario, maps SSH to `127.0.0.1:2201-2205`, waits for systemd, then injects the fault. `sandbox:reset` only restarts containers; it is the persistence check after a clean fix.

With Compose, set this in `.env` and run `docker compose up --build`:

```bash
SANDBOX_CASE_COUNT=1
SANDBOX_DOCKER_PRIVILEGED=true
```

The app then uses the local Phoenix-compatible sandbox ERP and shows tickets starting at `7101`.
Real Builder Base ERP tickets stay under the normal `PHOENIX_API_BASE_URL` path when
`SANDBOX_CASE_COUNT=0`.

If Docker Desktop needs extra privileges for systemd:

```bash
SANDBOX_DOCKER_PRIVILEGED=true bun run sandbox:up
```

## Manual Backend Env

For a manually-run backend outside Compose:

```bash
SANDBOX_CASE_COUNT=1
SANDBOX_PHOENIX_API_BASE_URL=http://localhost:9000
PHOENIX_MOCK_DATASET=sandbox
SANDBOX_SSH_HOST=127.0.0.1
SSH_PRIVATE_KEY_PATH=./keys/bench_incident_key
SSH_USERNAME=azureuser
```

The mock Phoenix will return sandbox tickets and customer-system targets, while SSH connects to the containers.

## Manual Verification

For each printed port:

```bash
ssh -i keys/bench_incident_key -o IdentitiesOnly=yes azureuser@127.0.0.1 -p 2201
sudo /opt/hackathon/public-test.sh
```

The public test should fail before the fix, pass after the clean archetype-level fix, and still pass after `bun run sandbox:reset`.
