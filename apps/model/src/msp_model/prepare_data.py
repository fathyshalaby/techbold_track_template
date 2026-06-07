from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

import typer
from rich.console import Console

from .quality import audit_records, fail_on_blocking_issues, write_audit_report

app = typer.Typer(add_completion=False)
console = Console()

VALID_ROLES = {"system", "user", "assistant"}
REQUIRED_META_TEXT_FIELDS = ("source", "license")


def iter_jsonl(path: Path, *, strict_meta: bool) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_no}: invalid JSON: {exc}") from exc
            validate_record(obj, path, line_no, strict_meta=strict_meta)
            rows.append(obj)
    return rows


def validate_record(obj: dict[str, Any], path: Path, line_no: int, *, strict_meta: bool) -> None:
    if not isinstance(obj, dict):
        raise ValueError(f"{path}:{line_no}: record must be an object")
    messages = obj.get("messages")
    if not isinstance(messages, list) or len(messages) < 2:
        raise ValueError(f"{path}:{line_no}: record must contain a non-empty messages array")
    for idx, msg in enumerate(messages):
        if not isinstance(msg, dict):
            raise ValueError(f"{path}:{line_no}: messages[{idx}] must be an object")
        if msg.get("role") not in VALID_ROLES:
            raise ValueError(f"{path}:{line_no}: messages[{idx}].role is invalid")
        if not isinstance(msg.get("content"), str) or not msg["content"].strip():
            raise ValueError(f"{path}:{line_no}: messages[{idx}].content must be non-empty text")
    if messages[-1].get("role") != "assistant":
        raise ValueError(f"{path}:{line_no}: last message should be an assistant answer for SFT")

    meta = obj.get("meta")
    if not isinstance(meta, dict):
        raise ValueError(f"{path}:{line_no}: meta must be an object")
    for field in REQUIRED_META_TEXT_FIELDS:
        if not isinstance(meta.get(field), str) or not meta[field].strip():
            raise ValueError(f"{path}:{line_no}: meta.{field} must be non-empty text")
    if meta.get("approved_for_training") is not True:
        raise ValueError(f"{path}:{line_no}: meta.approved_for_training must be true")
    if strict_meta and meta.get("contains_private_data") is not False:
        raise ValueError(f"{path}:{line_no}: meta.contains_private_data must be false")
    if strict_meta and meta.get("redacted") is not True:
        raise ValueError(f"{path}:{line_no}: meta.redacted must be true")


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")


@app.command()
def main(
    source_dir: Path = typer.Option(Path("data/source")),
    examples_dir: Path = typer.Option(Path("examples")),
    out_dir: Path = typer.Option(Path("data/processed")),
    eval_ratio: float = typer.Option(0.05, min=0.0, max=0.5),
    seed: int = typer.Option(42),
    validate_only: bool = typer.Option(False),
    strict_meta: bool = typer.Option(True),
    audit_report: Path = typer.Option(Path("outputs/data_quality.jsonl")),
    allow_quality_warnings: bool = typer.Option(False),
) -> None:
    """Validate and merge approved chat JSONL files into train/eval JSONL files."""
    source_files = sorted(source_dir.glob("*.jsonl")) if source_dir.exists() else []
    use_examples = not source_files
    files = sorted(examples_dir.glob("*.jsonl")) if use_examples else source_files

    if not files:
        raise typer.BadParameter("No JSONL files found in data/source or examples.")

    records_by_file: dict[Path, list[dict[str, Any]]] = {}
    for path in files:
        records_by_file[path] = iter_jsonl(path, strict_meta=strict_meta)

    records = [record for rows in records_by_file.values() for record in rows]

    if validate_only:
        audits = audit_records(records)
        write_audit_report(audit_report, audits)
        if not allow_quality_warnings:
            fail_on_blocking_issues(audits)
        console.print(f"[green]Validated {len(records)} records from {len(files)} file(s).[/green]")
        console.print(f"[green]Wrote data quality report to {audit_report}.[/green]")
        return

    audits = audit_records(records)
    write_audit_report(audit_report, audits)
    if not allow_quality_warnings:
        fail_on_blocking_issues(audits)

    explicit_split = any(
        isinstance(record.get("meta"), dict) and record["meta"].get("split") in {"train", "eval"}
        for record in records
    )

    if explicit_split:
        train = [
            record
            for record in records
            if not isinstance(record.get("meta"), dict) or record["meta"].get("split") != "eval"
        ]
        eval_rows = [
            record
            for record in records
            if isinstance(record.get("meta"), dict) and record["meta"].get("split") == "eval"
        ]
        if not train or not eval_rows:
            raise typer.BadParameter("Explicit meta.split data must include train and eval rows.")
    elif use_examples:
        train = [
            record
            for path, rows in records_by_file.items()
            for record in rows
            if "eval" not in path.stem.lower()
        ]
        eval_rows = [
            record
            for path, rows in records_by_file.items()
            for record in rows
            if "eval" in path.stem.lower()
        ]
        if not train:
            train = records
        if not eval_rows:
            eval_rows = records[:1]
    else:
        random.Random(seed).shuffle(records)
        split = max(1, int(len(records) * (1.0 - eval_ratio))) if len(records) > 1 else 1
        train = records[:split]
        eval_rows = records[split:] or records[: min(10, len(records))]

    write_jsonl(out_dir / "train.jsonl", train)
    write_jsonl(out_dir / "eval.jsonl", eval_rows)
    console.print(
        f"[green]Wrote {len(train)} train and {len(eval_rows)} eval records to {out_dir}.[/green]"
    )


if __name__ == "__main__":
    app()
