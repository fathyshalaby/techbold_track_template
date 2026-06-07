PY ?= python
CONFIG ?= configs/ministral3-14b.yaml
BASE_MODEL ?= mistralai/Ministral-3-14B-Instruct-2512
ADAPTER_PATH ?= outputs/adapter
HF_REPO ?=
MLX_MODEL ?= mlx-community/Qwen2.5-1.5B-Instruct-4bit
MLX_DATA_DIR ?= outputs/mlx-data
MLX_ADAPTER_PATH ?= outputs/mlx-adapter
MLX_ITERS ?= 5
MLX_NUM_LAYERS ?= 8
MLX_MAX_SEQ_LENGTH ?= 1024
MLX_LEARNING_RATE ?= 1e-5
MLX_PORT ?= 8011
SYNTHETIC_RECORDS ?= 240
SYNTHETIC_SEED ?= 7
PROMPT ?= Ticket: A Windows workstation cannot resolve internal DNS names but can ping 8.8.8.8. Provide diagnosis, evidence, safe checks, remediation, verification, rollback, and escalation.

.PHONY: prepare prepare-mlx data validate audit-data artifact-guard schema-guard clean-sandbox-generated preview-synthetic ingest-sandbox ingest-sandbox-rich ingest-sandbox-synthetic dataset-hackathon ingest-catalog mlx-data benchmark benchmark-local benchmark-release train-smoke train train-mlx-small eval eval-mlx-small generate-mlx-small fuse-mlx-small model-card push-adapter verify-hf verify-ai-sdk-local verify-pipeline-agent serve serve-mlx clean

help:
	@printf '%s\n' "MSP model sidecar targets:"
	@printf '%s\n' "  make prepare                         Install Python training dependencies"
	@printf '%s\n' "  make prepare-mlx                     Install optional Apple Silicon MLX dependencies"
	@printf '%s\n' "  make validate                        Validate source/examples JSONL without writing outputs"
	@printf '%s\n' "  make data                            Build data/processed/train.jsonl and eval.jsonl"
	@printf '%s\n' "  make audit-data                      Run strict data quality gates"
	@printf '%s\n' "  make artifact-guard                  Ensure generated data/adapters are ignored"
	@printf '%s\n' "  make schema-guard                    Validate generated role JSON against backend schemas"
	@printf '%s\n' "  make clean-sandbox-generated         Remove ignored sandbox-generated source files"
	@printf '%s\n' "  make preview-synthetic               Preview deterministic sandbox examples without writing"
	@printf '%s\n' "  make ingest-sandbox                  Generate ignored source data from repo sandbox scenarios"
	@printf '%s\n' "  make ingest-sandbox-rich             Generate backend-agent contract examples from sandbox scenarios"
	@printf '%s\n' "  make ingest-sandbox-synthetic        Generate deterministic sandbox contract examples"
	@printf '%s\n' "  make dataset-hackathon               Build audited sandbox training data for local tuning"
	@printf '%s\n' "  make ingest-catalog                  Print approved public dataset catalog"
	@printf '%s\n' "  make mlx-data                        Build MLX-LM train/valid/test JSONL from processed data"
	@printf '%s\n' "  make benchmark                       Write static dataset/eval readiness report"
	@printf '%s\n' "  make benchmark-local                 Include live local AI SDK checks"
	@printf '%s\n' "  make benchmark-release               Fail if benchmark gates are not pipeline-ready"
	@printf '%s\n' "  make train-smoke                     Run the tiny local LoRA smoke training config"
	@printf '%s\n' "  make train-mlx-small                 Fine-tune a small 4-bit MLX model on Apple Silicon"
	@printf '%s\n' "  make eval-mlx-small                  Run MLX-LM adapter test batches"
	@printf '%s\n' "  make generate-mlx-small PROMPT='...' Generate from the MLX adapter"
	@printf '%s\n' "  make fuse-mlx-small                  Fuse MLX adapter into outputs/mlx-fused"
	@printf '%s\n' "  make serve-mlx                       Start local MLX OpenAI-compatible adapter server"
	@printf '%s\n' "  make verify-ai-sdk-local             Verify backend AI SDK structured output against local server"
	@printf '%s\n' "  make verify-pipeline-agent           Strict backend problem-analyzer contract check"
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
	@printf '%s\n' "MLX overrides: MLX_MODEL=... MLX_ITERS=... MLX_ADAPTER_PATH=... MLX_PORT=... PROMPT='...'"
	@printf '%s\n' "Synthetic overrides: SYNTHETIC_RECORDS=240 SYNTHETIC_SEED=7"

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

artifact-guard:
	bash scripts/check_artifacts.sh

schema-guard:
	bun scripts/schema_guard.ts --source-dir data/source --out-file outputs/schema_guard.json

clean-sandbox-generated:
	rm -f data/source/sandbox-generated.jsonl data/source/sandbox-rich-generated.jsonl data/source/sandbox-synthetic-generated.jsonl

preview-synthetic:
	PYTHONPATH=src $(PY) -m msp_model.ingest_data preview-synthetic --records $(SYNTHETIC_RECORDS) --seed $(SYNTHETIC_SEED)

ingest-sandbox:
	PYTHONPATH=src $(PY) -m msp_model.ingest_data sandbox

ingest-sandbox-rich:
	PYTHONPATH=src $(PY) -m msp_model.ingest_data sandbox-rich --records $(SYNTHETIC_RECORDS) --seed $(SYNTHETIC_SEED)

ingest-sandbox-synthetic:
	PYTHONPATH=src $(PY) -m msp_model.ingest_data sandbox-synthetic --records $(SYNTHETIC_RECORDS) --seed $(SYNTHETIC_SEED)

dataset-hackathon: clean-sandbox-generated ingest-sandbox ingest-sandbox-synthetic data audit-data schema-guard mlx-data artifact-guard

ingest-catalog:
	PYTHONPATH=src $(PY) -m msp_model.ingest_data catalog

mlx-data:
	PYTHONPATH=src $(PY) -m msp_model.prepare_mlx_data --train-file data/processed/train.jsonl --eval-file data/processed/eval.jsonl --out-dir $(MLX_DATA_DIR)

benchmark:
	PYTHONPATH=src $(PY) -m msp_model.benchmark --model-name "$(MLX_MODEL)"

benchmark-local:
	PYTHONPATH=src MLX_PORT=$(MLX_PORT) MLX_MODEL=$(MLX_MODEL) $(PY) -m msp_model.benchmark --model-name "$(MLX_MODEL)" --run-ai-sdk --run-pipeline-agent

benchmark-release:
	PYTHONPATH=src MLX_PORT=$(MLX_PORT) MLX_MODEL=$(MLX_MODEL) $(PY) -m msp_model.benchmark --model-name "$(MLX_MODEL)" --run-ai-sdk --run-pipeline-agent --strict

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
	mlx_lm.generate --model $(MLX_MODEL) --adapter-path $(MLX_ADAPTER_PATH) --system-prompt "You are a careful MSP support engineer. Use evidence. Safe checks must be read-only only. Do not put restart, stop, delete, write, reset, or reconfigure commands under safe checks. Put changes only under remediation with warning, verification, rollback, and escalation." --prompt "$(PROMPT)" --max-tokens 256 --temp 0.2 --top-p 0.9 --seed 7

fuse-mlx-small:
	mlx_lm.fuse --model $(MLX_MODEL) --adapter-path $(MLX_ADAPTER_PATH) --save-path outputs/mlx-fused

serve-mlx:
	PORT=$(MLX_PORT) MLX_MODEL=$(MLX_MODEL) MLX_ADAPTER_PATH=$(MLX_ADAPTER_PATH) bash scripts/serve_mlx.sh

verify-ai-sdk-local:
	MLX_PORT=$(MLX_PORT) MLX_MODEL=$(MLX_MODEL) bash scripts/verify_ai_sdk_local.sh

verify-pipeline-agent:
	MLX_PORT=$(MLX_PORT) MLX_MODEL=$(MLX_MODEL) STRICT_AGENT_CONTRACT=1 bash scripts/verify_ai_sdk_local.sh

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
