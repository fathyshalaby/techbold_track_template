"""Safety layer — classify a command BEFORE it runs, and redact secrets from any text.
(rubric C: no dangerous blanket commands; no secrets in logs/activity.)

Loads the SHARED rules (shared/safety-rules.json) so backend-py and backend-node behave
identically. classify() returns one of: blocked (never runs), low_risk (read-only diagnostics),
needs_review (default). ALL non-blocked commands still require explicit human approval.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from .config import settings


def _shared_dir() -> Path:
    primary = Path(settings.shared_dir)
    if (primary / "safety-rules.json").exists():
        return primary
    # local dev fallback: repo_root/shared  (app/ -> backend-py/ -> repo root)
    return Path(__file__).resolve().parents[2] / "shared"


_RULES = json.loads((_shared_dir() / "safety-rules.json").read_text())
_DENY = [(r["id"], r.get("reason", ""), re.compile(r["pattern"], re.IGNORECASE)) for r in _RULES["deny"]]
_ALLOW = [(r["id"], re.compile(r["pattern"], re.IGNORECASE)) for r in _RULES["readonly_allow"]]


def classify(command: str) -> dict:
    cmd = (command or "").strip()
    for rid, reason, rx in _DENY:
        if rx.search(cmd):
            return {"classification": "blocked", "risk": "blocked", "matched_rule": rid, "reason": reason}
    for rid, rx in _ALLOW:
        if rx.search(cmd):
            return {"classification": "low_risk", "risk": "low", "matched_rule": rid, "reason": None}
    return {"classification": "needs_review", "risk": "needs_review", "matched_rule": None, "reason": None}


def is_blocked(command: str) -> bool:
    return classify(command)["classification"] == "blocked"


# ---- secret redaction ----------------------------------------------------------------
_SECRET_PATTERNS = [
    re.compile(r"-----BEGIN [^-]*PRIVATE KEY-----.*?-----END [^-]*PRIVATE KEY-----", re.S),
    re.compile(r"(?i)\b(password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key)\b\s*[:=]\s*\S+"),
    re.compile(r"(?i)\bAuthorization:\s*Bearer\s+\S+"),
]


def redact(text: str | None) -> str:
    """Scrub known secret values + common secret-looking patterns from any text."""
    if not text:
        return text or ""
    s = str(text)
    for value in (settings.phoenix_api_token, settings.azure_openai_api_key, settings.openrouter_api_key):
        if value and len(value) >= 6:
            s = s.replace(value, "***REDACTED***")
    for rx in _SECRET_PATTERNS:
        s = rx.sub("***REDACTED***", s)
    return s
