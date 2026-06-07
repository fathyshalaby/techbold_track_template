from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import yaml

ENV_EXPR_RE = re.compile(r"^\$\{([A-Z0-9_]+)(?::-([^}]*))?}$")


def _resolve_env(value: Any) -> Any:
    if isinstance(value, str):
        match = ENV_EXPR_RE.match(value)
        if match:
            name, default = match.groups()
            return os.environ.get(name, default or "")
    if isinstance(value, list):
        return [_resolve_env(item) for item in value]
    if isinstance(value, dict):
        return {key: _resolve_env(item) for key, item in value.items()}
    return value


def load_config(path: str | Path) -> dict[str, Any]:
    with Path(path).open("r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f) or {}
    return {k: _resolve_env(v) for k, v in cfg.items()}
