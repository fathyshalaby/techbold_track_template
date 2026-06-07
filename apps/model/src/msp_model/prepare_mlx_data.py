from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            stripped = line.strip()
            if not stripped:
                continue
            try:
                value = json.loads(stripped)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_number}: invalid JSON: {exc}") from exc
            if not isinstance(value, dict):
                raise ValueError(f"{path}:{line_number}: expected JSON object")
            rows.append(value)
    return rows


def _messages_only(row: dict[str, Any], source: str, index: int) -> dict[str, Any]:
    messages = row.get("messages")
    if not isinstance(messages, list) or not messages:
        raise ValueError(f"{source}:{index}: missing non-empty messages list")

    clean_messages: list[dict[str, str]] = []
    for message_index, message in enumerate(messages):
        if not isinstance(message, dict):
            raise ValueError(f"{source}:{index}: message {message_index} is not an object")
        role = message.get("role")
        content = message.get("content")
        if role not in {"system", "user", "assistant"}:
            raise ValueError(f"{source}:{index}: message {message_index} has invalid role")
        if not isinstance(content, str) or not content.strip():
            raise ValueError(f"{source}:{index}: message {message_index} has empty content")
        clean_messages.append({"role": role, "content": content})

    if clean_messages[-1]["role"] != "assistant":
        raise ValueError(f"{source}:{index}: final message must be assistant")
    return {"messages": clean_messages}


def _write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True))
            handle.write("\n")


def build_mlx_data(train_file: Path, eval_file: Path, out_dir: Path) -> tuple[int, int, int]:
    train_rows = [
        _messages_only(row, str(train_file), index)
        for index, row in enumerate(_load_jsonl(train_file), start=1)
    ]
    eval_rows = [
        _messages_only(row, str(eval_file), index)
        for index, row in enumerate(_load_jsonl(eval_file), start=1)
    ]

    if not train_rows:
        raise ValueError(f"{train_file} has no training rows. Run make data first.")

    if eval_rows:
        valid_rows = eval_rows
        test_rows = eval_rows
    elif len(train_rows) >= 2:
        valid_rows = [train_rows[-1]]
        test_rows = [train_rows[-1]]
        train_rows = train_rows[:-1]
    else:
        valid_rows = train_rows
        test_rows = train_rows

    _write_jsonl(out_dir / "train.jsonl", train_rows)
    _write_jsonl(out_dir / "valid.jsonl", valid_rows)
    _write_jsonl(out_dir / "test.jsonl", test_rows)
    return len(train_rows), len(valid_rows), len(test_rows)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert processed MSP chat JSONL into an MLX-LM data directory."
    )
    parser.add_argument("--train-file", default="data/processed/train.jsonl")
    parser.add_argument("--eval-file", default="data/processed/eval.jsonl")
    parser.add_argument("--out-dir", default="outputs/mlx-data")
    args = parser.parse_args()

    train_count, valid_count, test_count = build_mlx_data(
        train_file=Path(args.train_file),
        eval_file=Path(args.eval_file),
        out_dir=Path(args.out_dir),
    )
    print(
        "Wrote MLX data: "
        f"train={train_count} valid={valid_count} test={test_count} out_dir={args.out_dir}"
    )


if __name__ == "__main__":
    main()
