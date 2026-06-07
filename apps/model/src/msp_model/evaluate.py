from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import typer
from rich.console import Console

from .config import load_config
from .rubric import score_answer

app = typer.Typer(add_completion=False)
console = Console()


def dtype_from_name(name: str | None) -> Any:
    import torch

    if name == "float16":
        return torch.float16
    if name == "bfloat16":
        return torch.bfloat16
    return torch.float32


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def prompt_messages(record: dict[str, Any]) -> tuple[list[dict[str, str]], str | None]:
    messages = list(record["messages"])
    reference = None
    if messages and messages[-1].get("role") == "assistant":
        reference = str(messages[-1].get("content", ""))
        messages = messages[:-1]
    return messages, reference


def build_quantization_config(cfg: dict[str, Any]):
    if not cfg.get("load_in_4bit", True):
        return None

    from transformers import BitsAndBytesConfig

    return BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type=cfg.get("bnb_4bit_quant_type", "nf4"),
        bnb_4bit_use_double_quant=bool(cfg.get("bnb_4bit_use_double_quant", True)),
        bnb_4bit_compute_dtype=dtype_from_name(cfg.get("bnb_4bit_compute_dtype", "bfloat16")),
    )


def tokenizer_from_processing_class(processing_class: Any) -> Any:
    return getattr(processing_class, "tokenizer", processing_class)


def infer_model_loader(base_model: str, cfg: dict[str, Any]) -> str:
    configured = cfg.get("model_loader")
    if configured:
        return str(configured)
    lowered = base_model.lower()
    if "ministral-3" in lowered or "gemma-4" in lowered:
        return "image-text"
    return "causal-lm"


def ensure_padding_token(processing_class: Any) -> None:
    tokenizer = tokenizer_from_processing_class(processing_class)
    if getattr(tokenizer, "pad_token", None) is None:
        tokenizer.pad_token = tokenizer.eos_token


def build_generation_inputs(
    processing_class: Any, messages: list[dict[str, str]], device: Any
) -> Any:
    processor_template = getattr(processing_class, "apply_chat_template", None)
    if processor_template is not None:
        try:
            return processor_template(
                messages,
                tokenize=True,
                return_dict=True,
                return_tensors="pt",
                add_generation_prompt=True,
            ).to(device)
        except TypeError:
            pass

    tokenizer = tokenizer_from_processing_class(processing_class)
    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    return tokenizer(prompt, return_tensors="pt").to(device)


def load_eval_model_and_processing_class(cfg: dict[str, Any]) -> tuple[Any, Any]:
    from transformers import (
        AutoModelForCausalLM,
        AutoModelForImageTextToText,
        AutoProcessor,
        AutoTokenizer,
    )

    base_model = cfg["base_model"]
    loader = infer_model_loader(base_model, cfg)
    model_kwargs = {
        "trust_remote_code": True,
        "device_map": "auto",
        "dtype": dtype_from_name(
            "bfloat16" if cfg.get("bf16") else "float16" if cfg.get("fp16") else None
        ),
        "quantization_config": build_quantization_config(cfg),
    }
    if loader == "image-text":
        processing_class = AutoProcessor.from_pretrained(base_model, trust_remote_code=True)
        model = AutoModelForImageTextToText.from_pretrained(base_model, **model_kwargs)
    elif loader == "causal-lm":
        processing_class = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(base_model, **model_kwargs)
    else:
        raise typer.BadParameter(f"Unsupported model_loader: {loader}")
    ensure_padding_token(processing_class)
    return model, processing_class


def score_rows(rows: list[dict[str, Any]], output_key: str) -> list[dict[str, Any]]:
    scored: list[dict[str, Any]] = []
    for row in rows:
        answer = str(row.get(output_key) or "")
        scored.append({**row, "rubric": score_answer(answer)})
    return scored


def print_score_summary(scored: list[dict[str, Any]]) -> None:
    if not scored:
        console.print("[yellow]No eval rows were scored.[/yellow]")
        return
    max_score = int(scored[0]["rubric"]["max_score"])
    total = sum(int(row["rubric"]["score"]) for row in scored)
    average = total / len(scored)
    console.print(
        f"[green]Average rubric score: {average:.2f}/{max_score} across {len(scored)} row(s).[/green]"
    )


@app.command()
def main(
    config: Path = typer.Option(..., "--config", "-c"),
    max_examples: int = typer.Option(20),
    max_new_tokens: int = typer.Option(512),
    out_file: Path | None = typer.Option(None),
    score_only: bool = typer.Option(False),
) -> None:
    cfg = load_config(config)
    adapter_path = Path(cfg.get("output_dir", "outputs/adapter"))
    eval_file = Path(cfg.get("eval_file", "data/processed/eval.jsonl"))
    out_file = out_file or Path("outputs/eval_predictions.jsonl")
    score_file = Path(cfg.get("eval_score_file", "outputs/eval_scores.jsonl"))

    rows = read_jsonl(eval_file)[:max_examples]

    if score_only:
        scored_references = []
        for record in rows:
            messages, reference = prompt_messages(record)
            scored_references.append(
                {
                    "prompt_messages": messages,
                    "prediction": reference,
                    "reference": reference,
                    "meta": record.get("meta", {}),
                }
            )
        scored = score_rows(scored_references, "prediction")
        write_jsonl(score_file, scored)
        print_score_summary(scored)
        console.print(f"[green]Wrote reference rubric scores to {score_file}[/green]")
        return

    import torch
    from peft import PeftModel

    model, processing_class = load_eval_model_and_processing_class(cfg)
    tokenizer = tokenizer_from_processing_class(processing_class)
    if adapter_path.exists():
        model = PeftModel.from_pretrained(model, adapter_path)
    else:
        console.print(
            f"[yellow]Adapter path not found: {adapter_path}. Evaluating base model only.[/yellow]"
        )
    model.eval()

    predictions: list[dict[str, Any]] = []
    for record in rows:
        messages, reference = prompt_messages(record)
        inputs = build_generation_inputs(processing_class, messages, model.device)
        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,
                pad_token_id=tokenizer.eos_token_id,
            )
        new_tokens = output_ids[0][inputs["input_ids"].shape[-1] :]
        prediction = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
        predictions.append(
            {
                "prompt_messages": messages,
                "prediction": prediction,
                "reference": reference,
                "meta": record.get("meta", {}),
            }
        )
    scored = score_rows(predictions, "prediction")
    write_jsonl(out_file, predictions)
    write_jsonl(score_file, scored)
    print_score_summary(scored)
    console.print(f"[green]Wrote predictions to {out_file}[/green]")
    console.print(f"[green]Wrote rubric scores to {score_file}[/green]")


if __name__ == "__main__":
    app()
