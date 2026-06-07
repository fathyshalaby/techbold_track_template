# Model sidecar: MSP troubleshooting adapter

This sidecar trains and optionally serves a LoRA/QLoRA adapter for MSP and helpdesk troubleshooting. It is independent from the main app: normal app startup does not install, train, load, or serve this model.

The sidecar uses stable Make targets so the existing GSD-core workflow can call it without adding a second workflow system.

## Commands

```bash
make -C apps/model help
make -C apps/model prepare
make -C apps/model validate
make -C apps/model audit-data
make -C apps/model ingest-catalog
make -C apps/model ingest-sandbox
make -C apps/model data
make -C apps/model train-smoke
make -C apps/model train-mlx-small
make -C apps/model train CONFIG=configs/ministral3-14b.yaml
make -C apps/model eval CONFIG=configs/ministral3-14b.yaml
make -C apps/model model-card
make -C apps/model push-adapter HF_REPO=your-org/techbold-msp-adapter
make -C apps/model serve
```

For local development from this folder:

```bash
cd apps/model
python -m venv .venv
source .venv/bin/activate
make prepare
make data
make train-smoke
```

## Apple Silicon MLX tuning

For a MacBook with Apple Silicon, use the optional MLX lane for local small-model tuning. This path does not replace the full Hugging Face/TRL training path; it is for fast local adapter experiments.

Install the optional dependencies:

```bash
make -C apps/model prepare-mlx
```

Build or refresh approved training data:

```bash
make -C apps/model ingest-sandbox
make -C apps/model data
make -C apps/model audit-data
make -C apps/model mlx-data
```

Run a small LoRA tune:

```bash
MLX_ITERS=20 make -C apps/model train-mlx-small
```

The default MLX model is `mlx-community/Qwen2.5-1.5B-Instruct-4bit`. On a 24 GB M4 Pro, start there. A 3B 4-bit MLX model may be possible with a short sequence length and low batch size, but the default should stay small until the dataset and rubric are mature. The 14B Ministral config is a Linux CUDA training target, not the right first local Mac tune.

Evaluate and generate from the MLX adapter:

```bash
make -C apps/model eval-mlx-small
PROMPT='Ticket: nginx fails with address already in use on port 443. What should I check?' \
  make -C apps/model generate-mlx-small
```

Fuse the MLX adapter into an ignored local model directory:

```bash
make -C apps/model fuse-mlx-small
```

MLX artifacts are written under `apps/model/outputs/` and must not be committed.

## Data

Place approved JSONL files in `apps/model/data/source/*.jsonl`. Raw data, private tickets, processed data, checkpoints, adapters, logs, and outputs are ignored by git and must stay out of commits.

Each JSONL line must use this schema:

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

Validation rejects records when:

- `messages` is missing, empty, malformed, or does not end with an assistant answer.
- `meta.source` or `meta.license` is missing.
- `meta.approved_for_training` is not exactly `true`.
- `meta.contains_private_data` is not exactly `false`.
- `meta.redacted` is not exactly `true`.

If `data/source` has no JSONL files, `make data` uses the safe examples in `apps/model/examples` so the smoke path remains verifiable.

Run the quality gates before training:

```bash
make -C apps/model audit-data
```

This writes an ignored `outputs/data_quality.jsonl` report and blocks critical or high-risk records such as secrets, duplicate records, or destructive commands without warning.

## Data sources

The strongest adapter will come from approved internal MSP examples, not a generic public dataset. Best sources:

- Redacted internal tickets with final technician resolution notes.
- This repo's sandbox scenario and audit traces.
- Internal runbooks converted into ticket/context/answer examples.
- Public datasets used only as secondary augmentation after license review.

Generate seed examples from the repo sandbox:

```bash
make -C apps/model ingest-sandbox
make -C apps/model data
```

Print the guarded public-source catalog:

```bash
make -C apps/model ingest-catalog
```

Import a known compatible Hugging Face dataset into the ignored source drop zone:

```bash
cd apps/model
PYTHONPATH=src python -m msp_model.ingest_data hf \
  --dataset-id ibm-research/ITBench-Lite \
  --split train \
  --max-records 1000 \
  --out-file data/source/itbench-lite.jsonl
```

Use `apps/model/data/source_manifest.example.yaml` to track source approval, license, redaction, and weighting before training.

## Training

Smoke training verifies code paths with a tiny model:

```bash
make -C apps/model train-smoke
```

Full adapter training uses the processed dataset and the default Ministral 3 config:

```bash
cd apps/model
cp .env.example .env
# Add HF_TOKEN if the model or account requires it.
make data
make train CONFIG=configs/ministral3-14b.yaml
```

The default real config uses:

- Base model: `mistralai/Ministral-3-14B-Instruct-2512`
- Loader: `image-text`
- Training stack: Hugging Face Transformers, PEFT, TRL
- Adapter mode: QLoRA with LoRA target modules
- Dataset format: conversational JSONL with `messages`
- Loss: assistant-only where the tokenizer exposes assistant masks, with a logged fallback otherwise

Optional fallback:

```bash
make -C apps/model train CONFIG=configs/gemma4-12b.yaml
```

The Gemma config uses `google/gemma-4-12B-it`.

## Evaluation

Generate predictions and score them:

```bash
make -C apps/model eval CONFIG=configs/ministral3-14b.yaml
```

Fast score-only validation uses references without loading a model:

```bash
cd apps/model
python -m msp_model.evaluate --config configs/smoke.yaml --score-only
```

The rubric checks:

- diagnosis quality
- evidence use
- safe read-only checks first
- remediation
- verification
- rollback or escalation
- no destructive command without warning

Prediction and score outputs are written under `apps/model/outputs/` and ignored by git.

## Hugging Face deployment

Generate a model card for the adapter:

```bash
make -C apps/model model-card CONFIG=configs/ministral3-14b.yaml ADAPTER_PATH=outputs/adapter
```

Push the adapter to a private Hugging Face model repo:

```bash
HF_TOKEN=... make -C apps/model push-adapter \
  HF_REPO=your-org/techbold-msp-adapter \
  CONFIG=configs/ministral3-14b.yaml \
  ADAPTER_PATH=outputs/adapter
```

Verify the repo is reachable:

```bash
HF_TOKEN=... make -C apps/model verify-hf HF_REPO=your-org/techbold-msp-adapter
```

Publish adapter-only first. Do not publish a public adapter until all dataset sources, licenses, redaction, and attribution have been reviewed.

## Serving

Serving is optional local serving only. It prefers vLLM with LoRA adapter support when installed:

```bash
cd apps/model
ADAPTER_PATH=outputs/adapter \
BASE_MODEL=mistralai/Ministral-3-14B-Instruct-2512 \
make serve
```

The default port is `8001` to avoid colliding with the main backend on `8000`. Override it with `PORT=8000` if needed.

If vLLM is unavailable or incompatible with the selected checkpoint, use the training/eval commands for adapter validation and serve the base model or adapter with a compatible Hugging Face or provider runtime instead.

Dry-run the serving command without vLLM:

```bash
DRY_RUN=1 make -C apps/model serve
```

## Docker

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
