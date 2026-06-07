from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import torch
import typer
from datasets import Dataset
from peft import LoraConfig, prepare_model_for_kbit_training
from rich.console import Console
from transformers import (
    AutoModelForCausalLM,
    AutoModelForImageTextToText,
    AutoProcessor,
    AutoTokenizer,
    BitsAndBytesConfig,
)
from trl import SFTConfig, SFTTrainer

from .config import load_config

app = typer.Typer(add_completion=False)
console = Console()

REQUIRED_CONFIG_KEYS = ("base_model", "train_file", "output_dir")
ASSISTANT_MASK_SAMPLE = [
    {"role": "system", "content": "You are a careful MSP support engineer."},
    {"role": "user", "content": "A service failed after reboot. What should I check?"},
    {"role": "assistant", "content": "Start with read-only service status and logs."},
]


def dtype_from_name(name: str | None) -> torch.dtype:
    if name == "float16":
        return torch.float16
    if name == "bfloat16":
        return torch.bfloat16
    return torch.float32


def build_bnb_config(cfg: dict[str, Any]) -> BitsAndBytesConfig | None:
    if not cfg.get("load_in_4bit", True):
        return None
    return BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type=cfg.get("bnb_4bit_quant_type", "nf4"),
        bnb_4bit_use_double_quant=bool(cfg.get("bnb_4bit_use_double_quant", True)),
        bnb_4bit_compute_dtype=dtype_from_name(cfg.get("bnb_4bit_compute_dtype", "bfloat16")),
    )


def validate_config(cfg: dict[str, Any], *, require_files: bool) -> None:
    missing = [key for key in REQUIRED_CONFIG_KEYS if not cfg.get(key)]
    if missing:
        raise typer.BadParameter(f"Config missing required key(s): {', '.join(missing)}")
    if require_files and not Path(str(cfg["train_file"])).exists():
        raise typer.BadParameter(f"Training file not found: {cfg['train_file']}")
    eval_file = cfg.get("eval_file")
    if require_files and eval_file and not Path(str(eval_file)).exists():
        raise typer.BadParameter(f"Eval file not found: {eval_file}")
    if cfg.get("load_in_4bit", True) and cfg.get("optim", "").endswith("_8bit"):
        console.print("[cyan]QLoRA enabled:[/cyan] 4-bit loading with PEFT LoRA adapter training.")


def read_training_records(path: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with Path(path).open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            if not isinstance(row.get("messages"), list):
                raise ValueError(f"{path}:{line_no}: missing messages")
            records.append({"messages": row["messages"]})
    return records


def load_json_dataset(train_file: str, eval_file: str | None):
    if not Path(train_file).exists():
        raise FileNotFoundError(f"Training file not found: {train_file}")
    train_ds = Dataset.from_list(read_training_records(train_file))
    if eval_file and Path(eval_file).exists():
        return train_ds, Dataset.from_list(read_training_records(eval_file))
    return train_ds, None


def tokenizer_from_processing_class(processing_class: Any) -> Any:
    return getattr(processing_class, "tokenizer", processing_class)


def ensure_padding_token(processing_class: Any) -> None:
    tokenizer = tokenizer_from_processing_class(processing_class)
    if getattr(tokenizer, "pad_token", None) is None:
        tokenizer.pad_token = tokenizer.eos_token


def infer_model_loader(base_model: str, cfg: dict[str, Any]) -> str:
    configured = cfg.get("model_loader")
    if configured:
        return str(configured)
    lowered = base_model.lower()
    if "ministral-3" in lowered or "gemma-4" in lowered:
        return "image-text"
    return "causal-lm"


def load_model_and_processing_class(cfg: dict[str, Any]) -> tuple[Any, Any]:
    base_model = cfg["base_model"]
    loader = infer_model_loader(base_model, cfg)
    quantization_config = build_bnb_config(cfg)
    model_kwargs = {
        "trust_remote_code": True,
        "device_map": "auto",
        "dtype": dtype_from_name(
            "bfloat16" if cfg.get("bf16") else "float16" if cfg.get("fp16") else None
        ),
        "quantization_config": quantization_config,
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
    if quantization_config is not None:
        model = prepare_model_for_kbit_training(
            model,
            use_gradient_checkpointing=bool(cfg.get("gradient_checkpointing", True)),
        )
    return model, processing_class


def supports_assistant_masks(processing_class: Any) -> bool:
    tokenizer = tokenizer_from_processing_class(processing_class)
    apply_chat_template = getattr(tokenizer, "apply_chat_template", None)
    if apply_chat_template is None:
        return False
    try:
        rendered = apply_chat_template(
            ASSISTANT_MASK_SAMPLE,
            tokenize=True,
            return_dict=True,
            return_assistant_tokens_mask=True,
        )
    except Exception:
        return False
    mask = rendered.get("assistant_masks") or rendered.get("assistant_tokens_mask")
    return isinstance(mask, list) and any(bool(item) for item in mask)


def build_sft_config(
    cfg: dict[str, Any], output_dir: str, assistant_loss: bool, eval_ds: Any
) -> SFTConfig:
    fields = SFTConfig.__dataclass_fields__
    kwargs: dict[str, Any] = {
        "output_dir": output_dir,
        "max_length": int(cfg.get("max_seq_length", 8192)),
        "packing": bool(cfg.get("packing", True)),
        "num_train_epochs": float(cfg.get("num_train_epochs", 1)),
        "max_steps": int(cfg["max_steps"]) if cfg.get("max_steps") is not None else -1,
        "per_device_train_batch_size": int(cfg.get("per_device_train_batch_size", 1)),
        "per_device_eval_batch_size": int(cfg.get("per_device_eval_batch_size", 1)),
        "gradient_accumulation_steps": int(cfg.get("gradient_accumulation_steps", 16)),
        "learning_rate": float(cfg.get("learning_rate", 1e-4)),
        "lr_scheduler_type": cfg.get("lr_scheduler_type", "cosine"),
        "weight_decay": float(cfg.get("weight_decay", 0.0)),
        "logging_steps": int(cfg.get("logging_steps", 5)),
        "save_steps": int(cfg.get("save_steps", 100)),
        "eval_steps": int(cfg.get("eval_steps", 100)),
        "save_total_limit": int(cfg.get("save_total_limit", 2)),
        "gradient_checkpointing": bool(cfg.get("gradient_checkpointing", True)),
        "optim": cfg.get("optim", "paged_adamw_8bit"),
        "bf16": bool(cfg.get("bf16", True)),
        "fp16": bool(cfg.get("fp16", False)),
        "seed": int(cfg.get("seed", 42)),
        "save_strategy": "steps",
        "report_to": "none",
    }
    if "assistant_only_loss" in fields:
        kwargs["assistant_only_loss"] = assistant_loss
    if "warmup_steps" in cfg:
        kwargs["warmup_steps"] = int(cfg["warmup_steps"])
    elif "warmup_ratio" in cfg:
        kwargs["warmup_ratio"] = float(cfg["warmup_ratio"])
    if "dataloader_pin_memory" in cfg and "dataloader_pin_memory" in fields:
        kwargs["dataloader_pin_memory"] = bool(cfg["dataloader_pin_memory"])
    strategy_key = "eval_strategy" if "eval_strategy" in fields else "evaluation_strategy"
    if strategy_key in fields:
        kwargs[strategy_key] = "steps" if eval_ds is not None else "no"
    return SFTConfig(**kwargs)


def build_trainer(cfg: dict[str, Any]) -> SFTTrainer:
    validate_config(cfg, require_files=True)
    base_model = cfg["base_model"]
    console.print(f"[cyan]Loading base model:[/cyan] {base_model}")

    model, processing_class = load_model_and_processing_class(cfg)

    train_ds, eval_ds = load_json_dataset(cfg["train_file"], cfg.get("eval_file"))

    lora_config = LoraConfig(
        r=int(cfg.get("lora_r", 64)),
        lora_alpha=int(cfg.get("lora_alpha", 128)),
        lora_dropout=float(cfg.get("lora_dropout", 0.05)),
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=cfg.get("target_modules", "all-linear"),
    )

    output_dir = cfg.get("output_dir", "outputs/adapter")
    requested_assistant_loss = bool(cfg.get("assistant_only_loss", True))
    assistant_loss = requested_assistant_loss and supports_assistant_masks(processing_class)
    if requested_assistant_loss and not assistant_loss:
        console.print(
            "[yellow]assistant_only_loss requested, but the tokenizer did not expose assistant masks. "
            "Training will use the full formatted conversation loss.[/yellow]"
        )
    training_args = build_sft_config(cfg, output_dir, assistant_loss, eval_ds)

    kwargs = dict(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        peft_config=lora_config,
    )
    try:
        return SFTTrainer(**kwargs, processing_class=processing_class)
    except TypeError:
        return SFTTrainer(**kwargs, tokenizer=tokenizer_from_processing_class(processing_class))


@app.command()
def main(
    config: Path = typer.Option(..., "--config", "-c"),
    check_config: bool = typer.Option(False),
) -> None:
    cfg = load_config(config)
    if check_config:
        validate_config(cfg, require_files=False)
        console.print(f"[green]Config is valid:[/green] {config}")
        console.print(f"[cyan]Base model:[/cyan] {cfg['base_model']}")
        console.print(f"[cyan]Model loader:[/cyan] {infer_model_loader(cfg['base_model'], cfg)}")
        console.print(f"[cyan]Output dir:[/cyan] {cfg.get('output_dir', 'outputs/adapter')}")
        return
    trainer = build_trainer(cfg)
    trainer.train()
    trainer.save_model(cfg.get("output_dir", "outputs/adapter"))
    console.print(f"[green]Saved adapter to {cfg.get('output_dir', 'outputs/adapter')}[/green]")


if __name__ == "__main__":
    app()
