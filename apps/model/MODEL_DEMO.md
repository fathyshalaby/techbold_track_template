# TechBold Model Demo

This is the fastest honest demo path for the optional MSP troubleshooting model sidecar.

The story: the sandbox has a small fixed set of VM incidents, but each incident has a deterministic training contract. The model sidecar expands those contracts into approved synthetic training and eval rows without committing private tickets or generated datasets.

## 1. Prove The Data

```bash
make -C apps/model preview-synthetic
make -C apps/model dataset-hackathon
make -C apps/model schema-guard
make -C apps/model benchmark
make -C apps/model artifact-guard
```

Expected result:

- 245 source records
- 195 train records
- 50 eval records
- schema guard passes
- artifact guard passes
- benchmark is not pipeline-ready until live model checks run

## 2. Train A Mac Smoke Adapter

```bash
make -C apps/model prepare-mlx
make -C apps/model train-mlx-small
make -C apps/model eval-mlx-small
```

This verifies the local MLX training loop. It does not prove production model quality.

## 3. Serve MLX Locally

```bash
make -C apps/model serve-mlx
```

Backend env for a host-run backend:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://127.0.0.1:8011/v1
LLM_MODEL=mlx-community/Qwen2.5-1.5B-Instruct-4bit
```

Backend env for a Docker backend calling the Mac host:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://host.docker.internal:8011/v1
LLM_MODEL=mlx-community/Qwen2.5-1.5B-Instruct-4bit
```

In another terminal:

```bash
make -C apps/model verify-ai-sdk-local
make -C apps/model benchmark-local
```

## 4. Optional Docker vLLM Serving

For a CUDA host with a base model and adapter available:

```bash
docker compose --profile model up model
```

Backend env:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://model:8001/v1
LLM_MODEL=msp
```

Dry-run the vLLM command without starting a server:

```bash
cd apps/model
DRY_RUN=1 make serve
```

## Talk Track

- `infra/sandbox` defines deterministic incident families.
- `apps/model` turns those contracts into safe supervised examples.
- `apps/backend` still owns schema enforcement, safety checks, approvals, command execution, and audit.
- The model proposes; the pipeline decides.

## Limitations

- Synthetic data is a bootstrap, not a replacement for redacted solved tickets.
- The 1.5B MLX adapter is a smoke model.
- A model is not pipeline-ready until schema guard, benchmark gates, AI SDK transport, and backend agent contract checks all pass.
- Run full backend tests under Node 22 so `better-sqlite3` native bindings match the repo runtime.
