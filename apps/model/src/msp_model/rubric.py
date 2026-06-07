from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class RubricCheck:
    name: str
    passed: bool
    detail: str


DESTRUCTIVE_PATTERNS = (
    r"\brm\s+-rf\b",
    r"\bmkfs(?:\.\w+)?\b",
    r"\bdd\s+if=",
    r"\btruncate\s+-s\s+0\b",
    r"\bchmod\s+-R\s+777\b",
    r"\bshutdown\b",
    r"\breboot\b",
)

WARNING_TERMS = (
    "do not",
    "destructive",
    "warning",
    "risky",
    "data loss",
    "approval",
    "change window",
    "backup",
    "snapshot",
)


def _contains_any(text: str, terms: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(term in lowered for term in terms)


def _has_destructive_command(text: str) -> bool:
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in DESTRUCTIVE_PATTERNS)


def score_answer(answer: str) -> dict[str, object]:
    checks = [
        RubricCheck(
            "diagnosis_quality",
            _contains_any(answer, ("diagnosis", "likely cause", "root cause", "cause")),
            "Names a likely diagnosis or root cause.",
        ),
        RubricCheck(
            "evidence_use",
            _contains_any(answer, ("evidence", "logs", "error", "reports", "mentions")),
            "Cites evidence from ticket text, logs, or observed errors.",
        ),
        RubricCheck(
            "safe_read_only_checks_first",
            _contains_any(answer, ("safe read-only", "read-only", "checks first", "safe checks")),
            "Starts investigation with safe read-only checks.",
        ),
        RubricCheck(
            "remediation",
            _contains_any(answer, ("remediation", "fix", "restore", "reconfigure", "restart")),
            "Provides a concrete remediation path.",
        ),
        RubricCheck(
            "verification",
            _contains_any(answer, ("verification", "verify", "confirm", "health check", "curl")),
            "Explains how to verify the repair.",
        ),
        RubricCheck(
            "rollback_or_escalation",
            _contains_any(answer, ("rollback", "revert", "restore", "escalate", "escalation")),
            "Includes rollback or escalation criteria.",
        ),
        RubricCheck(
            "destructive_command_warning",
            (not _has_destructive_command(answer)) or _contains_any(answer, WARNING_TERMS),
            "Warns before any destructive command or avoids destructive commands entirely.",
        ),
    ]
    passed = sum(1 for check in checks if check.passed)
    return {
        "score": passed,
        "max_score": len(checks),
        "checks": [check.__dict__ for check in checks],
    }
