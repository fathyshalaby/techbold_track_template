PY ?= python
CONFIG ?= configs/ministral3-14b.yaml
BASE_MODEL ?= mistralai/Ministral-3-14B-Instruct-2512
ADAPTER_PATH ?= outputs/adapter
HF_REPO ?=
MLX_MODEL ?= mlx-community/Qwen2.5-1.5B-Instruct-4bit
MLX_DATA_DIR ?= outputs/mlx-data
MLX_ADAPTER_PATH ?= outputs/mlx-adapter
MLX_ITERS ?= 20
MLX_NUM_LAYERS ?= 8
MLX_MAX_SEQ_LENGTH ?= 1024
MLX_LEARNING_RATE ?= 1e-5
PROMPT ?= Ticket: A Windows workstation cannot resolve internal DNS names but can ping 8.8.8.8. Provide diagnosis, evidence, safe checks, remediation, verification, rollback, and escalation.

.PHONY: prepare prepare-mlx data validate audit-data ingest-sandbox ingest-catalog mlx-data train-smoke train train-mlx-small eval eval-mlx-small generate-mlx-small fuse-mlx-small model-card push-adapter verify-hf serve clean

help:
	@printf '%s\n' "MSP model sidecar targets:"
	@printf '%s\n' "  make prepare                         Install Python training dependencies"
	@printf '%s\n' "  make prepare-mlx                     Install optional Apple Silicon MLX dependencies"
	@printf '%s\n' "  make validate                        Validate source/examples JSONL without writing outputs"
	@printf '%s\n' "  make data                            Build data/processed/train.jsonl and eval.jsonl"
	@printf '%s\n' "  make audit-data                      Run strict data quality gates"
	@printf '%s\n' "  make ingest-sandbox                  Generate ignored source data from repo sandbox scenarios"
	@printf '%s\n' "  make ingest-catalog                  Print approved public dataset catalog"
	@printf '%s\n' "  make mlx-data                        Build MLX-LM train/valid/test JSONL from processed data"
	@printf '%s\n' "  make train-smoke                     Run the tiny local LoRA smoke training config"
	@printf '%s\n' "  make train-mlx-small                 Fine-tune a small 4-bit MLX model on Apple Silicon"
	@printf '%s\n' "  make eval-mlx-small                  Run MLX-LM adapter test batches"
	@printf '%s\n' "  make generate-mlx-small PROMPT='...' Generate from the MLX adapter"
	@printf '%s\n' "  make fuse-mlx-small                  Fuse MLX adapter into outputs/mlx-fused"
	@printf '%s\n' "  make train CONFIG=configs/ministral3-14b.yaml"
	@printf '%s\n' "                                      Train an adapter from processed data"
	@printf '%s\n' "  make eval CONFIG=configs/ministral3-14b.yaml"
	@printf '%s\n' "                                      Generate and score held-out eval predictions"
	@printf '%s\n' "  make model-card                      Generate outputs/MODEL_CARD.md for HF"
	@printf '%s\n' "  make push-adapter HF_REPO=org/name   Upload adapter folder to HF"
	@printf '%s\n' "  make verify-hf HF_REPO=org/name      Verify the HF repo is reachable"
	@printf '%s\n' "  make serve                           Start optional vLLM OpenAI-compatible serving"
	@printf '%s\n' "  make clean                           Remove generated processed data and outputs"
	@printf '%s\n' ""
	@printf '%s\n' "Overrides: PY=python3 CONFIG=... BASE_MODEL=... ADAPTER_PATH=... HF_REPO=... PORT=..."
	@printf '%s\n' "MLX overrides: MLX_MODEL=... MLX_ITERS=... MLX_ADAPTER_PATH=... PROMPT='...'"

prepare:
	$(PY) -m pip install --upgrade pip
	$(PY) -m pip install -e ".[train]"

prepare-mlx:
	$(PY) -m pip install --upgrade pip
	$(PY) -m pip install -e ".[mlx]"

data:
	PYTHONPATH=src $(PY) -m msp_model.prepare_data --source-dir data/source --examples-dir examples --out-dir data/processed

validate:
	PYTHONPATH=src $(PY) -m msp_model.prepare_data --source-dir data/source --examples-dir examples --out-dir data/processed --validate-only

audit-data:
	PYTHONPATH=src $(PY) -m msp_model.prepare_data --source-dir data/source --examples-dir examples --out-dir data/processed --validate-only --audit-report outputs/data_quality.jsonl

ingest-sandbox:
	PYTHONPATH=src $(PY) -m msp_model.ingest_data sandbox

ingest-catalog:
	PYTHONPATH=src $(PY) -m msp_model.ingest_data catalog

mlx-data:
	PYTHONPATH=src $(PY) -m msp_model.prepare_mlx_data --train-file data/processed/train.jsonl --eval-file data/processed/eval.jsonl --out-dir $(MLX_DATA_DIR)

train-smoke:
	PYTHONPATH=src $(PY) -m msp_model.train --config configs/smoke.yaml

train-mlx-small: mlx-data
	mlx_lm.lora --model $(MLX_MODEL) --train --data $(MLX_DATA_DIR) --fine-tune-type lora --mask-prompt --num-layers $(MLX_NUM_LAYERS) --batch-size 1 --iters $(MLX_ITERS) --val-batches 1 --learning-rate $(MLX_LEARNING_RATE) --steps-per-report 1 --steps-per-eval 10 --adapter-path $(MLX_ADAPTER_PATH) --max-seq-length $(MLX_MAX_SEQ_LENGTH) --grad-checkpoint

train:
	PYTHONPATH=src $(PY) -m msp_model.train --config $(CONFIG)

eval:
	PYTHONPATH=src $(PY) -m msp_model.evaluate --config $(CONFIG)

eval-mlx-small:
	mlx_lm.lora --model $(MLX_MODEL) --data $(MLX_DATA_DIR) --adapter-path $(MLX_ADAPTER_PATH) --batch-size 1 --test --test-batches 1

generate-mlx-small:
	mlx_lm.generate --model $(MLX_MODEL) --adapter-path $(MLX_ADAPTER_PATH) --system-prompt "You are a careful MSP support engineer. Use evidence, run safe read-only checks before changes, include remediation, verification, rollback, and escalation." --prompt "$(PROMPT)" --max-tokens 256

fuse-mlx-small:
	mlx_lm.fuse --model $(MLX_MODEL) --adapter-path $(MLX_ADAPTER_PATH) --save-path outputs/mlx-fused

model-card:
	PYTHONPATH=src $(PY) -m msp_model.publish model-card --config $(CONFIG) --adapter-dir $(ADAPTER_PATH)

push-adapter:
	test -n "$(HF_REPO)"
	PYTHONPATH=src $(PY) -m msp_model.publish push-adapter --repo-id $(HF_REPO) --adapter-dir $(ADAPTER_PATH)

verify-hf:
	test -n "$(HF_REPO)"
	PYTHONPATH=src $(PY) -m msp_model.publish verify-hf --repo-id $(HF_REPO)

serve:
	bash scripts/serve.sh

clean:
	rm -rf data/processed/* outputs/* .cache __pycache__ src/msp_model/__pycache__
	touch data/processed/.gitkeep outputs/.gitkeep
