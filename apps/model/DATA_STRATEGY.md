# MSP adapter data strategy

The best data for this project is not a generic helpdesk dataset. It is solved incidents that match the sandbox pipeline: ticket context, read-only diagnostic command, observed output, confirmed root cause, minimal reversible fix, verification, rollback, and activity report.

## Hackathon dataset build

Generate the repo-native seed set:

```bash
make -C apps/model dataset-hackathon
```

This creates ignored source and processed files from:

- `infra/sandbox/scenarios/scenarios.json`
- `infra/sandbox/scenarios/training-contracts.json`
- role-specific backend-agent contract examples for `DiagnosticProposal`, `FixProposal`, `ValidationResult`, and `ActivityDraftFields`

The target also runs strict metadata and quality gates, then prepares MLX train, valid, and test JSONL.

Default synthetic output is 240 deterministic records. `dataset-hackathon` also includes 5 canonical sandbox records, for 245 total rows with 50 held out for eval. That is the hackathon bridge from a small fixed sandbox to a broader training/eval set: the five VM archetypes define the real failure modes, while the generator varies phrasing, observations, role outputs, validation facts, and unsafe-request corrections without inventing private customer data.

Use:

```bash
make -C apps/model ingest-sandbox-synthetic SYNTHETIC_RECORDS=240 SYNTHETIC_SEED=7
```

The generated JSONL is ignored under `apps/model/data/source/`. Commit the sandbox contract, not generated examples.

Schema guard is part of the dataset acceptance path:

```bash
make -C apps/model schema-guard
```

It validates role-specific assistant JSON against the backend Zod schemas before training, so schema drift fails before a model is tuned.

## Source priority

1. Redacted internal solved MSP tickets.
2. Sandbox traces from real runs through the approval and execution loop.
3. Internal runbooks converted into supervised ticket examples.
4. Approved public datasets used only as low-weight augmentation.

Public data should not be the main source. It usually lacks the exact safety loop, command approval model, and verification discipline this app needs.

## What to collect from real runs

For each incident, capture:

- Ticket title and symptom.
- Environment and relevant service names.
- Every command proposed.
- Safety classification and approval decision.
- Redacted command output.
- Confirmed root cause.
- Minimal fix command.
- Rollback command.
- Public validation result.
- Final activity text.

Do not train on raw private tickets or transcripts. Redact and convert them into approved supervised examples first.

## Acceptance bar

A serious first candidate should have:

- 500 or more approved supervised examples.
- 50 or more held-out eval cases.
- Coverage for service health, upload/write path, DNS or hosts resolution, database privilege, monitoring ingest, disk, permissions, certificates, bad deploys, and config syntax.
- Negative examples where unsafe commands are rejected or moved out of safe checks.
- Passing `make -C apps/model verify-pipeline-agent` against the served adapter.

## Offline container path

For a Linux container that runs offline, prefer vLLM with a LoRA adapter:

```bash
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
BASE_MODEL=/models/base \
ADAPTER_PATH=/models/adapters/msp \
LORA_NAME=msp \
make -C apps/model serve
```

Point the backend at the local model server:

```bash
LLM_PROVIDER=local
LLM_BASE_URL=http://model:8001/v1
LLM_MODEL=msp
```

For Mac-local development, use MLX on the host and point containers to `host.docker.internal:8011`.
