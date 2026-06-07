from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import typer
from rich.console import Console

from .config import load_config

app = typer.Typer(add_completion=False)
console = Console()


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def collect_sources(processed_file: Path) -> list[str]:
    sources = set()
    for row in read_jsonl(processed_file):
        meta = row.get("meta")
        if isinstance(meta, dict) and meta.get("source"):
            sources.add(str(meta["source"]))
    return sorted(sources)


def render_model_card(
    *,
    config_path: Path,
    adapter_dir: Path,
    eval_scores: Path,
    train_file: Path,
    out_file: Path,
    visibility: str,
) -> None:
    cfg = load_config(config_path)
    scores = read_jsonl(eval_scores)
    average = "not run"
    if scores:
        total = sum(int(row.get("rubric", {}).get("score", 0)) for row in scores)
        max_score = int(scores[0].get("rubric", {}).get("max_score", 0))
        average = f"{total / len(scores):.2f}/{max_score} across {len(scores)} examples"

    sources = collect_sources(train_file)
    source_lines = "\n".join(f"- `{source}`" for source in sources) or "- Not recorded"
    adapter_status = "present" if adapter_dir.exists() else "not found"

    content = f"""---
base_model: {cfg["base_model"]}
library_name: peft
pipeline_tag: text-generation
license: other
tags:
  - qlora
  - lora
  - msp
  - helpdesk
  - troubleshooting
  - peft
---

# Techbold MSP troubleshooting adapter

This repository contains a LoRA/QLoRA adapter for MSP and helpdesk troubleshooting. It is trained to answer tickets with diagnosis, evidence, safe read-only checks, remediation, verification, rollback, and escalation.

## Base model

`{cfg["base_model"]}`

## Adapter status

Adapter directory at card generation time: `{adapter_status}` (`{adapter_dir}`)

## Intended use

- MSP and helpdesk ticket triage.
- Linux service, web app, endpoint, monitoring, and integration troubleshooting.
- Drafting safe remediation plans for technician review.

Do not use this adapter as an autonomous executor. It should propose actions for a deterministic safety layer and human approval flow.

## Training data

Training sources recorded in the processed train file:

{source_lines}

Only approved, licensed, redacted, non-private records should be included in training.

## Evaluation

Rubric score at card generation time: {average}

The deterministic rubric checks diagnosis quality, evidence use, read-only checks first, remediation, verification, rollback or escalation, and destructive-command warnings.

## Limitations

- Quality depends on curated MSP examples. Public data alone is not enough for strong specialization.
- The adapter can still hallucinate commands, paths, service names, or root causes.
- Live use requires the product safety classifier, approval workflow, and audit trail.
- Visibility target: `{visibility}`. Prefer private until data licenses and redaction are reviewed.
"""
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(content, encoding="utf-8")
    console.print(f"[green]Wrote model card to {out_file}.[/green]")


@app.command("model-card")
def model_card(
    config: Path = typer.Option(Path("configs/ministral3-14b.yaml")),
    adapter_dir: Path = typer.Option(Path("outputs/adapter")),
    eval_scores: Path = typer.Option(Path("outputs/eval_scores.jsonl")),
    train_file: Path = typer.Option(Path("data/processed/train.jsonl")),
    out_file: Path = typer.Option(Path("outputs/MODEL_CARD.md")),
    private: bool = typer.Option(True),
) -> None:
    """Generate a Hugging Face model card for adapter publication."""
    render_model_card(
        config_path=config,
        adapter_dir=adapter_dir,
        eval_scores=eval_scores,
        train_file=train_file,
        out_file=out_file,
        visibility="private" if private else "public",
    )


@app.command("push-adapter")
def push_adapter(
    repo_id: str = typer.Option(...),
    adapter_dir: Path = typer.Option(Path("outputs/adapter")),
    model_card_file: Path = typer.Option(Path("outputs/MODEL_CARD.md")),
    private: bool = typer.Option(True),
    dry_run: bool = typer.Option(False),
) -> None:
    """Upload an adapter folder to a Hugging Face model repository."""
    if not adapter_dir.exists():
        raise typer.BadParameter(f"Adapter directory not found: {adapter_dir}")
    if dry_run:
        console.print(
            f"[cyan]DRY_RUN[/cyan] would create/update repo {repo_id} "
            f"private={private} from {adapter_dir}."
        )
        return

    from huggingface_hub import HfApi

    api = HfApi()
    api.create_repo(repo_id=repo_id, repo_type="model", private=private, exist_ok=True)
    if model_card_file.exists():
        api.upload_file(
            path_or_fileobj=str(model_card_file),
            path_in_repo="README.md",
            repo_id=repo_id,
            repo_type="model",
        )
    api.upload_folder(
        folder_path=str(adapter_dir),
        repo_id=repo_id,
        repo_type="model",
        ignore_patterns=["*.log", "checkpoint-*", "optimizer.pt", "scheduler.pt"],
    )
    console.print(f"[green]Uploaded adapter to https://huggingface.co/{repo_id}[/green]")


@app.command("verify-hf")
def verify_hf(repo_id: str = typer.Option(...)) -> None:
    """Verify a Hugging Face model repo is reachable with current credentials."""
    from huggingface_hub import HfApi

    info = HfApi().model_info(repo_id)
    console.print(f"[green]Found model repo:[/green] {info.modelId}")
    console.print(f"[cyan]Private:[/cyan] {getattr(info, 'private', 'unknown')}")


if __name__ == "__main__":
    app()
