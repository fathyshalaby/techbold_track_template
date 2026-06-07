# MSP model sidecar implementation report

## Files changed

- `apps/model/Makefile`
- `apps/model/.dockerignore`
- `apps/model/.env.example`
- `apps/model/.gitignore`
- `apps/model/compose.yaml`
- `apps/model/configs/smoke.yaml`
- `apps/model/configs/ministral3-14b.yaml`
- `apps/model/configs/gemma4-12b.yaml`
- `apps/model/configs/mlx-qwen2.5-1.5b.yaml`
- `apps/model/data/README.md`
- `apps/model/data/quarantine/.gitkeep`
- `apps/model/examples/train.jsonl`
- `apps/model/examples/eval.jsonl`
- `apps/model/MODELS.md`
- `apps/model/pyproject.toml`
- `apps/model/README.md`
- `apps/model/scripts/codex_task.md`
- `apps/model/scripts/serve.sh`
- `apps/model/src/msp_model/config.py`
- `apps/model/src/msp_model/prepare_data.py`
- `apps/model/src/msp_model/train.py`
- `apps/model/src/msp_model/evaluate.py`
- `apps/model/src/msp_model/rubric.py`
- `apps/model/src/msp_model/quality.py`
- `apps/model/src/msp_model/ingest_data.py`
- `apps/model/src/msp_model/publish.py`
- `apps/model/src/msp_model/prepare_mlx_data.py`
- `apps/model/data/SOURCES.md`
- `apps/model/data/source_manifest.example.yaml`

No root app, root workflow, or `.planning` files were changed.

## Commands run

- `make -C apps/model help`
- `make -C apps/model prepare`
- `PYTHONPATH=apps/model/src python -m compileall -q apps/model/src/msp_model`
- `make -C apps/model validate`
- `make -C apps/model data`
- `PYTHONPATH=apps/model/src python -m msp_model.train --config apps/model/configs/smoke.yaml --check-config`
- `PYTHONPATH=apps/model/src python -m msp_model.train --config apps/model/configs/ministral3-14b.yaml --check-config`
- `cd apps/model && PYTHONPATH=src python -m msp_model.evaluate --config configs/ministral3-14b.yaml --score-only`
- `cd apps/model && DRY_RUN=1 make serve`
- `docker compose -f apps/model/compose.yaml config`
- `git check-ignore -v apps/model/.env apps/model/data/source/private.jsonl apps/model/data/processed/train.jsonl apps/model/outputs/adapter/model.safetensors apps/model/checkpoints/x apps/model/data/quarantine/private.jsonl`
- `make -C apps/model train-smoke`
- `make -C apps/model eval CONFIG=configs/smoke.yaml`
- `make -C apps/model audit-data`
- `make -C apps/model ingest-catalog`
- `make -C apps/model ingest-sandbox`
- `python -m pip install -e ".[mlx]"`
- `make -C apps/model mlx-data`
- `MLX_ITERS=1 make -C apps/model train-mlx-small`
- `make -C apps/model eval-mlx-small`
- `PROMPT='Ticket: nginx will not start after a deploy. journalctl shows address already in use on port 443. Give diagnosis, evidence, safe checks, remediation, verification, rollback, and escalation.' make -C apps/model generate-mlx-small`
- `make -C apps/model model-card CONFIG=configs/smoke.yaml ADAPTER_PATH=outputs/smoke-adapter`
- `PYTHONPATH=src python -m msp_model.publish push-adapter --repo-id example/private-msp-adapter --adapter-dir outputs/smoke-adapter --dry-run`

## Results

- `make -C apps/model help` printed the sidecar target list.
- `make -C apps/model prepare` installed `techbold-msp-adapter` in editable mode with the `train` extra.
- Python modules compiled successfully.
- `make -C apps/model validate` validated 4 safe example records from 2 JSONL files.
- `make -C apps/model data` wrote 2 train and 2 eval records to `apps/model/data/processed`.
- Smoke config and Ministral config self-checks passed.
- Ministral score-only eval scored the held-out references at `7.00/7` average across 2 rows.
- Serve dry-run produced a vLLM command for `mistralai/Ministral-3-14B-Instruct-2512` on port `8001`.
- Docker Compose config rendered successfully.
- Git ignore checks confirmed `.env`, raw source data, processed data, quarantine data, checkpoints, and model outputs are ignored.
- Smoke training completed and saved `outputs/smoke-adapter`.
- Smoke eval generated predictions and wrote rubric scores. The tiny smoke adapter scored `3.50/7` average across 2 rows, which is enough for path verification but not quality validation.
- Data quality gates, sandbox ingestion, source catalog, model card generation, and HF adapter push dry-run are available through Make or Python module commands.
- Optional MLX dependencies installed in editable mode on Apple Silicon.
- `make -C apps/model mlx-data` wrote 4 train, 1 valid, and 1 test chat records under ignored `outputs/mlx-data`.
- `MLX_ITERS=1 make -C apps/model train-mlx-small` downloaded `mlx-community/Qwen2.5-1.5B-Instruct-4bit`, trained one LoRA iteration, and saved ignored `outputs/mlx-adapter/adapters.safetensors`.
- MLX smoke training reported `Val loss 3.050`, `Train loss 3.094`, about `113.901` tokens/sec, and `1.752 GB` peak memory.
- `make -C apps/model eval-mlx-small` originally exposed the MLX default eval batch size issue on a one-row test set. The target now passes `--batch-size 1`.
- `make -C apps/model generate-mlx-small` generated from the saved MLX adapter and reported about `154.509` generated tokens/sec with `1.107 GB` peak memory.

## Exact smoke command

```bash
make -C apps/model train-smoke
```

## Exact Apple Silicon MLX smoke command

```bash
MLX_ITERS=20 make -C apps/model train-mlx-small
```

For fastest path verification:

```bash
MLX_ITERS=1 make -C apps/model train-mlx-small
```

## Exact full training command

```bash
make -C apps/model train CONFIG=configs/ministral3-14b.yaml
```

Run `make -C apps/model data` first and provide Hugging Face access if the base model requires it.

## Exact eval command

```bash
make -C apps/model eval CONFIG=configs/ministral3-14b.yaml
```

## Exact data ingestion commands

```bash
make -C apps/model ingest-sandbox
make -C apps/model data
make -C apps/model audit-data
```

```bash
cd apps/model
PYTHONPATH=src python -m msp_model.ingest_data hf \
  --dataset-id ibm-research/ITBench-Lite \
  --split train \
  --max-records 1000 \
  --out-file data/source/itbench-lite.jsonl
```

## Exact serve command

```bash
ADAPTER_PATH=outputs/adapter \
BASE_MODEL=mistralai/Ministral-3-14B-Instruct-2512 \
make -C apps/model serve
```

Default serving port is `8001` to avoid the main backend on `8000`.

## Exact Hugging Face commands

```bash
make -C apps/model model-card CONFIG=configs/ministral3-14b.yaml ADAPTER_PATH=outputs/adapter
HF_TOKEN=... make -C apps/model push-adapter HF_REPO=your-org/techbold-msp-adapter ADAPTER_PATH=outputs/adapter
HF_TOKEN=... make -C apps/model verify-hf HF_REPO=your-org/techbold-msp-adapter
```

## Remaining assumptions

- Full Ministral training is intended for a Linux CUDA host with enough GPU memory for QLoRA.
- Apple Silicon local tuning is intended for small MLX models such as `mlx-community/Qwen2.5-1.5B-Instruct-4bit`, not the 14B Ministral config.
- Full training/eval may require an HF token and accepted model terms.
- `assistant_only_loss` is used only when the tokenizer exposes assistant masks. Otherwise the trainer logs a fallback to full formatted conversation loss.
- The sidecar rejects unsafe data instead of copying private or unredacted records into this repository.

## Known limitations

- Full `make train CONFIG=configs/ministral3-14b.yaml` was not run locally because it requires large-model GPU resources and HF access.
- Full `make eval CONFIG=configs/ministral3-14b.yaml` was not run locally because no full adapter exists.
- vLLM is not installed locally; serving was validated through dry-run command construction and Docker Compose config.
- The rubric is deterministic and checks answer structure and safety signals. It is not a substitute for human review or task-based incident validation.
- The current MLX tune used only sandbox-sized data. It verifies the mechanics but cannot produce a production-quality MSP adapter.
