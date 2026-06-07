# TechBold Hackathon Model Sidecar

Part of [Sphinx](../../README.md). Optional training and local-serving sidecar for the MSP troubleshooting adapter.

| Item | Value |
| ---- | ----- |
| Dashboard model id | `techbold/msp-autopilot` |
| Served MLX base | `mlx-community/Qwen2.5-1.5B-Instruct-4bit` |
| OpenAI-compatible URL | `http://127.0.0.1:8011/v1` |

Its job is to produce an offline-capable support model that can help diagnose sandbox incidents, propose safe checks, draft remediation, and emit structured outputs that the backend can consume through the Vercel AI SDK.

The model proposes. The backend owns safety validation, approval, execution, audit logging, and final activity records. Normal app startup does not depend on training or local model serving.

Raw data, private tickets, `.env` files, tokens, adapters, model weights, checkpoints, logs, processed data, and benchmark outputs must stay out of git.

## Hackathon Goal

The sidecar is successful for the TechBold demo when it can produce:

- one useful read-only diagnostic command at a time
- diagnosis grounded in ticket text and observed command output
- clear separation between safe checks and remediation
- minimal reversible fixes with warnings
- verification, rollback, and escalation criteria
- JSON that satisfies the backend agent schemas
- a local OpenAI-compatible endpoint for offline demos

If a model cannot pass the backend schema and safety gates, use it only as an experiment. Do not present it as pipeline-ready.

## One-command demo path

Use the root scripts for a showcaseable flow. They wrap the Makefile targets, print the active settings, and keep generated data/adapters ignored.

From repo root:

```bash
bun run model:doctor
bun run model:synthetic
bun run model:create
```

Then serve and verify in two terminals:

```bash
bun run model:serve
```

```bash
bun run model:verify
```

For a full local smoke setup on Apple Silicon:

```bash
bun run model:showcase
```

Aliases: `model:synthetic` is the same as `model:data`, `model:create` is the same as `model:train`, and `model:all` is the same as `model:showcase`.

`model:serve` blocks because it is the OpenAI-compatible MLX server. Keep it running while `model:verify` checks backend AI SDK transport and local benchmark readiness.

## 5-minute local path

Use this path on Apple Silicon to prove the full loop from dataset to local model server:

```bash
make -C apps/model prepare-mlx
make -C apps/model preview-synthetic
make -C apps/model dataset-hackathon
make -C apps/model schema-guard
make -C apps/model train-mlx-small
make -C apps/model eval-mlx-small
make -C apps/model benchmark
make -C apps/model artifact-guard
```

Serve the adapter and verify that the backend AI SDK can call it:

```bash
make -C apps/model serve-mlx
```

In another terminal:

```bash
make -C apps/model verify-ai-sdk-local
make -C apps/model benchmark-local
```

`verify-ai-sdk-local` must pass before the backend can use the local server. `verify-pipeline-agent` and `benchmark-release` are stricter gates for real pipeline readiness.

## TechBold Demo Recipe

Use this path for the hackathon demo on a MacBook Pro with MLX:

```bash
make -C apps/model dataset-hackathon
make -C apps/model train-mlx-small
make -C apps/model eval-mlx-small
make -C apps/model serve-mlx
```

In another terminal:

```bash
make -C apps/model verify-ai-sdk-local
make -C apps/model benchmark-local
make -C apps/model artifact-guard
```

Backend env for Mac-local serving:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://127.0.0.1:8011/v1
LLM_MODEL=mlx-community/Qwen2.5-1.5B-Instruct-4bit
```

Expected current result:

- `verify-ai-sdk-local` should pass when the MLX server is running.
- `benchmark-local` should remain `pipeline_ready: false` for the 1.5B smoke adapter.
- The expected blocker is the stricter backend `problem_analyzer` contract check.

That is acceptable for proving the loop. It is not enough for a deployable model claim.

For a concise demo script, use `apps/model/MODEL_DEMO.md`.

## What Good Looks Like

A model is only pipeline-ready when all of these are true:

- Dataset audit has zero critical or high-risk records.
- Held-out eval score is at least `6.5/7` average on a meaningful eval set.
- AI SDK structured-output check passes.
- Backend `problem_analyzer` contract check passes.
- The model does not put restart, stop, write, reset, delete, or reconfigure commands under safe checks.
- The adapter can be served offline through a local OpenAI-compatible endpoint.
- `make -C apps/model artifact-guard` passes.

The current 1.5B MLX adapter is a smoke target. It validates the mechanics, not production quality.

## Command Reference

```bash
make -C apps/model help
make -C apps/model prepare
make -C apps/model prepare-mlx
make -C apps/model preview-synthetic
make -C apps/model dataset-hackathon
make -C apps/model schema-guard
make -C apps/model benchmark
make -C apps/model benchmark-local
make -C apps/model benchmark-release
make -C apps/model train-smoke
make -C apps/model train-mlx-small
make -C apps/model train CONFIG=configs/ministral3-14b.yaml
make -C apps/model eval CONFIG=configs/ministral3-14b.yaml
make -C apps/model serve
make -C apps/model serve-mlx
make -C apps/model artifact-guard
```

## Data

The best data is solved MSP incidents that match the product loop:

1. Ticket and customer symptom.
2. Environment and relevant service names.
3. Safe read-only diagnostic command.
4. Redacted command output.
5. Confirmed root cause.
6. Minimal reversible fix.
7. Verification and persistence check.
8. Rollback and escalation criteria.
9. Final activity report grounded in the audit log.

Generate the repo-native hackathon seed set:

```bash
make -C apps/model dataset-hackathon
```

This target creates ignored source and processed data from the sandbox scenarios, including backend-agent contract examples for:

- `DiagnosticProposal`
- `FixProposal`
- `ValidationResult`
- `ActivityDraftFields`

The default hackathon target writes 245 rows: 5 canonical sandbox records plus 240 deterministic synthetic rows from `infra/sandbox/scenarios/training-contracts.json`. The split is explicit in metadata, so the 50 held-out eval rows are stable across runs.

Preview without writing files:

```bash
make -C apps/model preview-synthetic
```

Validate role-specific assistant JSON against the backend Zod schemas:

```bash
make -C apps/model schema-guard
```

The accepted JSONL schema is:

```json
{
  "messages": [
    {"role": "system", "content": "You are a careful MSP support engineer."},
    {"role": "user", "content": "ticket/logs/context"},
    {"role": "assistant", "content": "diagnosis, evidence, safe checks, remediation, verification, rollback, escalation"}
  ],
  "meta": {
    "source": "source_name_or_reference",
    "license": "license_or_internal_approval_reference",
    "approved_for_training": true,
    "contains_private_data": false,
    "redacted": true
  }
}
```

Validation rejects records with missing messages, missing source/license metadata, unapproved data, private data, or unredacted data. Generated source data lands under `apps/model/data/source/` and is ignored by git. Regenerate it from sandbox definitions instead of committing it.

## Best Data Sources

Use public datasets only as augmentation. The strongest adapter will come from data that reflects this repo's actual sandbox and safety workflow.

Source priority:

1. Redacted internal solved MSP tickets.
2. Sandbox traces from real runs through the approval and execution loop.
3. Internal runbooks converted into supervised examples.
4. Approved public datasets used as low-weight augmentation.

Public catalog:

```bash
make -C apps/model ingest-catalog
```

Import a guarded public source:

```bash
cd apps/model
PYTHONPATH=src python -m msp_model.ingest_data hf \
  --dataset-id ibm-research/ITBench-Lite \
  --split train \
  --max-records 1000 \
  --out-file data/source/itbench-lite.jsonl
```

Useful public sources currently tracked in the catalog:

- `ibm-research/ITBench-Lite`: Apache-2.0 IT operations benchmark material.
- `Snaseem2026/devops-incident-response`: MIT incident-response seed data.
- `benjaminmacklin/IT_Support_V2`: MIT broad IT support phrasing.

Do not train on non-commercial, unclear-license, private, or raw ticket data.

## Dataset Size Targets

Hackathon seed:

- 245 audited sandbox-derived records.
- 50 held out for eval through `meta.split`.
- Enough to prove mechanics, not enough for a deployable model.

First useful candidate:

- 500 or more approved supervised examples.
- 50 or more held-out eval cases.
- Coverage for service health, upload/write path, DNS or hosts resolution, database privilege, monitoring ingest, disk pressure, permissions, certificates, bad deploys, and config syntax.
- Negative examples where unsafe commands are refused or moved out of safe checks.

Strong specialization:

- 5,000 to 20,000 curated examples.
- 100 to 300 held-out eval cases separated by incident family.
- Multiple examples per failure mode with different service names, ports, paths, and logs.

See `apps/model/DATA_STRATEGY.md` for collection details.

## Benchmarks

Write a static readiness report:

```bash
make -C apps/model benchmark
```

Write a live report against a running local model server:

```bash
make -C apps/model serve-mlx
make -C apps/model benchmark-local
```

Run release gates and fail if the model is not pipeline-ready:

```bash
make -C apps/model benchmark-release
```

Benchmark output is written to ignored files under `apps/model/outputs/benchmarks/`.

The report includes:

- source, train, eval, and MLX data counts
- source/domain/role mix
- data quality issue counts
- eval rubric summary
- schema guard status
- staged readiness flags
- AI SDK structured-output check
- backend `problem_analyzer` contract check
- pipeline readiness blockers and warnings

The current smoke adapter should honestly pass transport checks but remain `pipeline_ready: false` until it satisfies the backend agent contract and has a meaningful held-out eval set.

## Training Tiers

### Smoke: tiny HF/TRL path

```bash
make -C apps/model train-smoke
make -C apps/model eval CONFIG=configs/smoke.yaml
```

### Mac smoke: MLX 1.5B

```bash
make -C apps/model prepare-mlx
make -C apps/model dataset-hackathon
make -C apps/model train-mlx-small
make -C apps/model eval-mlx-small
```

Default:

- `MLX_MODEL=mlx-community/Qwen2.5-1.5B-Instruct-4bit`
- `MLX_ITERS=5`
- `MLX_ADAPTER_PATH=outputs/mlx-adapter`

### Mac candidate: MLX 7B

Use this after adding real approved data:

```bash
MLX_MODEL=mlx-community/Qwen2.5-7B-Instruct-4bit \
MLX_ADAPTER_PATH=outputs/mlx-qwen2.5-7b-adapter \
MLX_NUM_LAYERS=16 \
MLX_MAX_SEQ_LENGTH=1536 \
MLX_LEARNING_RATE=5e-6 \
MLX_ITERS=100 \
  make -C apps/model train-mlx-small
```

### CUDA candidate: Ministral/Gemma QLoRA

```bash
make -C apps/model prepare
make -C apps/model dataset-hackathon
make -C apps/model train CONFIG=configs/ministral3-14b.yaml
make -C apps/model eval CONFIG=configs/ministral3-14b.yaml
```

Optional fallback:

```bash
make -C apps/model train CONFIG=configs/gemma4-12b.yaml
```

The HF/TRL path uses Transformers, PEFT, TRL, LoRA/QLoRA, conversational JSONL, and assistant-only loss where the tokenizer supports it.

## AI SDK Backend Wiring

The backend uses the Vercel AI SDK OpenAI provider with an optional `baseURL`. Local adapter servers use the existing OpenAI-compatible provider path.

MLX on the Mac host:

```bash
make -C apps/model serve-mlx
```

Backend env:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://127.0.0.1:8011/v1
LLM_MODEL=mlx-community/Qwen2.5-1.5B-Instruct-4bit
```

Docker backend calling Mac host MLX:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://host.docker.internal:8011/v1
LLM_MODEL=mlx-community/Qwen2.5-1.5B-Instruct-4bit
```

vLLM LoRA server:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://model:8001/v1
LLM_MODEL=msp
```

Root Compose optional model profile:

```bash
docker compose --profile model up model
docker compose --profile model up backend frontend model
```

Localhost endpoints do not require a real `OPENAI_API_KEY`. Remote OpenAI-compatible providers still do.

Runtime checks:

```bash
make -C apps/model verify-ai-sdk-local
make -C apps/model verify-pipeline-agent
```

The backend still routes every model proposal through deterministic safety checks and human approval. The model never executes commands. The backend currently uses the Vercel AI SDK OpenAI-compatible path, so this sidecar stays OpenAI-compatible instead of adding another provider workflow.

## Offline Serving

### MLX local server

```bash
make -C apps/model serve-mlx
```

This starts `mlx_lm.server` with `--adapter-path` on port `8011`. It is useful for Mac-local development and AI SDK contract checks. It is not the preferred production container runtime.

### vLLM LoRA server

```bash
ADAPTER_PATH=outputs/adapter \
BASE_MODEL=mistralai/Ministral-3-14B-Instruct-2512 \
LORA_NAME=msp \
make -C apps/model serve
```

Dry-run:

```bash
DRY_RUN=1 make -C apps/model serve
```

Offline container environment:

```bash
HF_HUB_OFFLINE=1
TRANSFORMERS_OFFLINE=1
BASE_MODEL=/models/base
ADAPTER_PATH=/models/adapters/msp
LORA_NAME=msp
PORT=8001
```

Pre-download the base model and adapter into a mounted volume or image layer before setting offline mode.

### Root Compose profile

The root Compose file includes an optional `model` profile. It stays off for normal app startup.

```bash
docker compose --profile model up model
```

Point the backend container at it with:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://model:8001/v1
LLM_MODEL=msp
```

The profile mounts only `apps/model/outputs` into the model container. It does not mount raw source data.

## Artifact Hygiene

Run this before any demo handoff, PR, or upload:

```bash
make -C apps/model artifact-guard
git status --short --ignored apps/model | sed -n '1,80p'
```

Tracked model files should be limited to source code, configs, examples, documentation, manifests, and `.gitkeep` placeholders.

Ignored model files include:

- `apps/model/.env` and local env variants
- `apps/model/data/source/*.jsonl`
- `apps/model/data/processed/`
- `apps/model/data/quarantine/`
- `apps/model/outputs/`
- `apps/model/checkpoints/`
- adapter and weight files such as `.safetensors`, `.bin`, `.gguf`, and `.pt`

## Hugging Face Adapter Publishing

Generate a model card:

```bash
make -C apps/model model-card CONFIG=configs/ministral3-14b.yaml ADAPTER_PATH=outputs/adapter
```

Push a private adapter repo:

```bash
HF_TOKEN=... make -C apps/model push-adapter \
  HF_REPO=your-org/techbold-msp-adapter \
  ADAPTER_PATH=outputs/adapter
```

Verify access:

```bash
HF_TOKEN=... make -C apps/model verify-hf HF_REPO=your-org/techbold-msp-adapter
```

Publish adapter-only first. Do not publish a public adapter until source licenses, redaction, approval, and attribution have been reviewed.

## Docker

Use Node 22 for local backend test runs. The backend Docker image already uses Node 22, and `better-sqlite3` is a native dependency that can fail when local Node versions drift.

Smoke train:

```bash
docker compose -f apps/model/compose.yaml run --rm train make train-smoke
```

Full train:

```bash
docker compose -f apps/model/compose.yaml run --rm train make train CONFIG=configs/ministral3-14b.yaml
```

Serve:

```bash
docker compose -f apps/model/compose.yaml up serve
```

## References

- Vercel AI SDK OpenAI provider: https://vercel.com/docs/ai/openai
- AI SDK structured objects: https://vercel-ai.mintlify.app/reference/ai-sdk-core/generate-object
- vLLM OpenAI-compatible server: https://docs.vllm.ai/en/v0.8.3/serving/openai_compatible_server.html
