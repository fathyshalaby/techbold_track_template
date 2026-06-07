from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .rubric import DESTRUCTIVE_PATTERNS, score_answer

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PRIVATE_IPV4_RE = re.compile(
    r"\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b"
)
SECRET_RE = re.compile(
    r"(?i)\b(?:api[_-]?key|token|secret|password|passwd|authorization|bearer)\b\s*[:=]\s*[^\s]+"
)
SECTION_TERMS = (
    "diagnosis",
    "evidence",
    "safe",
    "remediation",
    "verification",
    "rollback",
    "escalat",
)


@dataclass(frozen=True)
class QualityIssue:
    severity: str
    code: str
    detail: str


@dataclass(frozen=True)
class RecordAudit:
    index: int
    source: str
    sha256: str
    issues: list[QualityIssue]
    rubric_score: int
    rubric_max_score: int


def stable_record_hash(record: dict[str, Any]) -> str:
    payload = json.dumps(record, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def iter_record_text(record: dict[str, Any]) -> str:
    messages = record.get("messages") or []
    parts = []
    for message in messages:
        if isinstance(message, dict):
            parts.append(str(message.get("content") or ""))
    return "\n".join(parts)


def assistant_text(record: dict[str, Any]) -> str:
    messages = record.get("messages") or []
    if messages and isinstance(messages[-1], dict) and messages[-1].get("role") == "assistant":
        return str(messages[-1].get("content") or "")
    return ""


def has_destructive_command_without_warning(answer: str) -> bool:
    warning_terms = ("do not", "destructive", "warning", "approval", "backup", "snapshot")
    has_destructive = any(
        re.search(pattern, answer, flags=re.IGNORECASE) for pattern in DESTRUCTIVE_PATTERNS
    )
    has_warning = any(term in answer.lower() for term in warning_terms)
    return has_destructive and not has_warning


def audit_record(record: dict[str, Any], index: int) -> RecordAudit:
    issues: list[QualityIssue] = []
    text = iter_record_text(record)
    answer = assistant_text(record)
    meta = record.get("meta") if isinstance(record.get("meta"), dict) else {}
    rubric = score_answer(answer)

    if EMAIL_RE.search(text):
        issues.append(QualityIssue("high", "pii_email", "Record contains an email-like value."))
    if PRIVATE_IPV4_RE.search(text):
        issues.append(
            QualityIssue("medium", "private_ipv4", "Record contains private IPv4 addresses.")
        )
    if SECRET_RE.search(text):
        issues.append(
            QualityIssue("critical", "secret_like_value", "Record contains secret-like text.")
        )
    if int(rubric["score"]) < int(rubric["max_score"]):
        issues.append(
            QualityIssue(
                "medium", "rubric_incomplete", "Assistant answer misses target MSP sections."
            )
        )
    if has_destructive_command_without_warning(answer):
        issues.append(
            QualityIssue(
                "critical",
                "unsafe_destructive_command",
                "Assistant answer contains a destructive command without a warning.",
            )
        )
    if not all(term in answer.lower() for term in SECTION_TERMS[:5]):
        issues.append(
            QualityIssue(
                "low",
                "weak_answer_shape",
                "Assistant answer does not clearly include diagnosis, evidence, safe checks, remediation, and verification.",
            )
        )

    return RecordAudit(
        index=index,
        source=str(meta.get("source") or "unknown"),
        sha256=stable_record_hash(record),
        issues=issues,
        rubric_score=int(rubric["score"]),
        rubric_max_score=int(rubric["max_score"]),
    )


def audit_records(records: list[dict[str, Any]]) -> list[RecordAudit]:
    seen_hashes: dict[str, int] = {}
    audits: list[RecordAudit] = []
    for index, record in enumerate(records, start=1):
        audit = audit_record(record, index)
        issues = list(audit.issues)
        if audit.sha256 in seen_hashes:
            issues.append(
                QualityIssue(
                    "high",
                    "duplicate_record",
                    f"Duplicate of record {seen_hashes[audit.sha256]}.",
                )
            )
        else:
            seen_hashes[audit.sha256] = index
        audits.append(
            RecordAudit(
                index=audit.index,
                source=audit.source,
                sha256=audit.sha256,
                issues=issues,
                rubric_score=audit.rubric_score,
                rubric_max_score=audit.rubric_max_score,
            )
        )
    return audits


def write_audit_report(path: Path, audits: list[RecordAudit]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for audit in audits:
            f.write(
                json.dumps(
                    {
                        "index": audit.index,
                        "source": audit.source,
                        "sha256": audit.sha256,
                        "rubric_score": audit.rubric_score,
                        "rubric_max_score": audit.rubric_max_score,
                        "issues": [issue.__dict__ for issue in audit.issues],
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )


def fail_on_blocking_issues(audits: list[RecordAudit]) -> None:
    blocking = [
        audit
        for audit in audits
        if any(issue.severity in {"critical", "high"} for issue in audit.issues)
    ]
    if blocking:
        details = ", ".join(f"record {audit.index}" for audit in blocking[:10])
        raise ValueError(f"Blocking data quality issue(s) found in {details}.")
