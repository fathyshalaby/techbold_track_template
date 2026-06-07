# Codex instructions for `apps/model/`

Python sidecar for MSP troubleshooting LoRA/QLoRA adapter training.

- Keep changes inside `apps/model/` unless parent-repo integration is requested.
- Do not commit datasets, `.env`, tokens, weights, adapters, logs, or generated outputs.
- Preserve JSONL chat schema with `messages` and optional `meta`.
- Expose stable Make targets: `prepare`, `data`, `train-smoke`, `eval`.
