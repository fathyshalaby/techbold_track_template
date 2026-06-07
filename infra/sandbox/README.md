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

With Compose, use the opt-in `sandbox` profile. A one-shot seeder container builds and
launches the fake VMs on the host Docker daemon, then injects each fault:

```bash
docker compose --profile sandbox up sandbox
```

Then point the backend at the sandbox by setting these in `.env` and starting the core stack:

```bash
MOCK_SCENARIOS=true
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

## Synthetic Model Data

The sandbox is also the source of truth for the model sidecar's hackathon dataset.

The fixed VM archetypes are intentionally small and deterministic. To get broader model coverage without committing private tickets, each archetype has a training contract in:

```text
infra/sandbox/scenarios/training-contracts.json
```

That contract records the safe checks, expected evidence, confirmed root cause, minimal fix, rollback, validation, and unsafe-request correction examples for each scenario.

Generate the ignored model dataset from the repo root:

```bash
make -C apps/model dataset-hackathon
```

Or generate only the synthetic source file:

```bash
make -C apps/model ingest-sandbox-synthetic SYNTHETIC_RECORDS=240 SYNTHETIC_SEED=7
```

This is the hackathon extension path for limited static VMs: the VMs define real incident families, and the generator creates reproducible supervised examples for training and held-out eval without storing raw customer data.
