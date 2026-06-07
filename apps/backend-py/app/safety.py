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
    candidates = [
        Path(settings.shared_dir),
        Path(__file__).resolve().parent
        / "shared",  # bundled: apps/backend-py/app/shared
        Path(__file__).resolve().parents[3]
        / "shared",  # monorepo root /shared (if present)
    ]
    for c in candidates:
        if (c / "safety-rules.json").exists():
            return c
    return Path(__file__).resolve().parent / "shared"


_RULES = json.loads((_shared_dir() / "safety-rules.json").read_text())
_DENY = [
    (r["id"], r.get("reason", ""), re.compile(r["pattern"], re.IGNORECASE))
    for r in _RULES["deny"]
]
_ALLOW = [
    (r["id"], re.compile(r["pattern"], re.IGNORECASE)) for r in _RULES["readonly_allow"]
]


_OBFUSCATION = re.compile(
    r"\$\(|\$\{|`"
)  # subshell / unresolved var expansion / backtick


def _segments(cmd: str) -> list[str]:
    # split on ; && || | so a dangerous link in a chain can't hide behind a safe prefix
    return [s.strip() for s in re.split(r";|&&|\|\||\|", cmd) if s.strip()]


def classify(command: str) -> dict:
    cmd = (command or "").strip()
    # Blocklist: check the full command AND each chained segment (node parity).
    for candidate in [cmd, *_segments(cmd)]:
        for rid, reason, rx in _DENY:
            if rx.search(candidate):
                return {
                    "classification": "blocked",
                    "risk": "blocked",
                    "matched_rule": rid,
                    "reason": reason,
                }
    # Anti-obfuscation fail-safe: a command whose true target is hidden behind a subshell /
    # variable / backtick must NOT be auto-cleared as read-only — force human review.
    if _OBFUSCATION.search(cmd):
        return {
            "classification": "needs_review",
            "risk": "needs_review",
            "matched_rule": "obfuscated",
            "reason": None,
        }
    for rid, rx in _ALLOW:
        if rx.search(cmd):
            return {
                "classification": "low_risk",
                "risk": "low",
                "matched_rule": rid,
                "reason": None,
            }
    return {
        "classification": "needs_review",
        "risk": "needs_review",
        "matched_rule": None,
        "reason": None,
    }


def is_blocked(command: str) -> bool:
    return classify(command)["classification"] == "blocked"


# ---- secret redaction ----------------------------------------------------------------
# Parity with the node backend's hardened redaction set (apps/backend/src/safety/
# redaction.ts): 18 patterns + a 16 KB cap. Each entry is (regex, replacement).
_REDACTION_CAP_BYTES = 16384
_REDACTION_PATTERNS: list[tuple[re.Pattern, str]] = [
    # private key block (to END or end-of-string for truncated keys)
    (
        re.compile(
            r"-----BEGIN[\s\S]*?PRIVATE KEY-----[\s\S]*?(?:-----END[^-]*PRIVATE KEY-----|$)"
        ),
        "«redacted»",
    ),
    (re.compile(r"(?i)(authorization\s*:\s*).+"), r"\1«redacted»"),
    (re.compile(r"(?i)Bearer\s+[A-Za-z0-9\-_.~+/]+=*"), "Bearer «redacted»"),
    # JWT (header.payload.sig, both starting eyJ)
    (
        re.compile(r"\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"),
        "«redacted»",
    ),
    (
        re.compile(r"(?i)(postgres(?:ql)?|mysql|mongodb|redis)://[^@\s]+@[^\s]*"),
        r"\1://«redacted»",
    ),
    (re.compile(r"AKIA[A-Z0-9]{16}"), "«redacted»"),
    (re.compile(r"sig=[A-Za-z0-9%+/=]{20,}"), "sig=«redacted»"),
    (re.compile(r"(?i)(passw(?:or)?d\s*[=:]\s*)\S+"), r"\1«redacted»"),
    (re.compile(r"(?i)(token\s*[=:]\s*)\S+"), r"\1«redacted»"),
    (re.compile(r"(?i)(secret\s*[=:]\s*)\S+"), r"\1«redacted»"),
    (re.compile(r"(?i)(api[_-]?key\s*[=:]\s*)\S+"), r"\1«redacted»"),
    # JSON-encoded "key":"value" where key contains a secret-indicator word
    (
        re.compile(
            r'(?i)("[A-Za-z0-9_-]*(?:token|secret|passwd|password|api[_-]?key|key|authorization|auth|credential)[A-Za-z0-9_-]*"\s*:\s*)"[^"]*"'
        ),
        r'\1"«redacted»"',
    ),
    # env-style SECRET=... (negative lookahead avoids double-redacting)
    (
        re.compile(
            r"\b([A-Za-z_]*(?:SECRET|TOKEN|KEY|PASS|PASSWORD|CREDENTIAL|secret|token|key|pass|password|credential)[A-Za-z_0-9]*\s*=\s*)(?!«redacted»)\S+"
        ),
        r"\1«redacted»",
    ),
    # custom secret headers (X-Phoenix-Token: ...)
    (
        re.compile(
            r"(?i)([Xx]-[A-Za-z0-9-]*(?:token|key|secret|auth)[A-Za-z0-9-]*\s*:\s*)\S+"
        ),
        r"\1«redacted»",
    ),
    # /etc/shadow-style unix crypt hashes
    (re.compile(r"\$(?:1|2[abxy]?|5|6|7|y|gy)\$[^\s:'\"]{3,}"), "«redacted»"),
    # high-confidence vendor token prefixes (GitHub, Slack, OpenAI, Stripe, GitLab, Google)
    (
        re.compile(
            r"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9]{20,}|sk_live_[A-Za-z0-9]{16,}|rk_live_[A-Za-z0-9]{16,}|glpat-[A-Za-z0-9_-]{16,}|AIza[A-Za-z0-9_-]{16,}|ya29\.[A-Za-z0-9_-]{20,})"
        ),
        "«redacted»",
    ),
    (re.compile(r"(?i)(aws_secret_access_key\s*[=:]\s*)\S+"), r"\1«redacted»"),
]


def redact(text: str | None) -> str:
    """Scrub secret values + 18 secret-shaped patterns (node-parity). Caps at 16 KB."""
    if not text:
        return text or ""
    s = str(text)
    if len(s) > _REDACTION_CAP_BYTES:
        s = s[:_REDACTION_CAP_BYTES]
    # exact known-secret values first
    for value in (
        settings.phoenix_api_token,
        settings.azure_openai_api_key,
        settings.openrouter_api_key,
    ):
        if value and len(value) >= 6:
            s = s.replace(value, "«redacted»")
    for rx, repl in _REDACTION_PATTERNS:
        s = rx.sub(repl, s)
    return s
