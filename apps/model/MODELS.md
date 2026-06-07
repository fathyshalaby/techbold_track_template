# Model choice

Default: `mistralai/Ministral-3-14B-Instruct-2512`.

Why:

- European provider.
- Apache-2.0 model card.
- Strong multilingual support including German and English.
- Supports system prompts, JSON/function-calling style behavior, and long context.
- Explicitly intended for local/private deployments and fine-tuning.

Optional:

- Gemma 4 12B: optional Apache-2.0 Google fallback at `google/gemma-4-12B-it`. It is a multimodal image-text-to-text checkpoint, so the sidecar uses an image-text loader for this config while training on text-only `messages` data.
- Code-specialized models: use only if the adapter should focus on code/CI failures rather than MSP endpoint/server troubleshooting.

Loader notes:

- `configs/smoke.yaml` uses `model_loader: causal-lm` for a tiny local smoke run.
- `configs/ministral3-14b.yaml` and `configs/gemma4-12b.yaml` use `model_loader: image-text` because current Hugging Face cards for these checkpoints recommend `AutoProcessor` with image-text model classes.
- vLLM serving uses `--enable-lora` and serves the adapter if `ADAPTER_PATH` exists. The sidecar defaults to port `8001` so it does not collide with the main backend on `8000`.
