"""Static knowledge pack — the diagnostic playbook (system prompt) + per-ticket runbook routing.

Read-only, human-authored Linux troubleshooting knowledge from docs/knowledge/. This gives the agent
a method + runbooks so it generalises to UNSEEN incidents instead of guessing (scoring B). This is the
static layer; the self-evolving store the agent writes to lives in memory.py.

Loader path order mirrors safety.py's shared-dir resolution: KNOWLEDGE_DIR env -> /knowledge (Docker
mount) -> <repo>/docs/knowledge (local dev). Missing files degrade to empty strings, never raise.
"""
from __future__ import annotations

from pathlib import Path

from .config import settings


def _knowledge_dir() -> Path:
    if settings.knowledge_dir:
        p = Path(settings.knowledge_dir)
        if (p / "diagnostic_playbook.md").exists():
            return p
    container = Path("/knowledge")
    if (container / "diagnostic_playbook.md").exists():
        return container
    # local dev fallback: app/ -> backend-py/ -> repo root -> docs/knowledge
    return Path(__file__).resolve().parents[2] / "docs" / "knowledge"


_DIR = _knowledge_dir()


def _read(rel: str) -> str:
    try:
        return (_DIR / rel).read_text(encoding="utf-8")
    except OSError:
        return ""


# Cheap symptom routing: keyword -> runbook. The README's wiring guide says inject the ONE or two
# relevant runbooks per ticket, not all four every turn. Keywords are kept specific to avoid noise.
_RUNBOOKS: list[tuple[str, tuple[str, ...]]] = [
    (
        "runbooks/systemd-services.md",
        (
            "won't start", "wont start", "won t start", "fails to start", "failed to start",
            "crash", "crashloop", "crash-loop", "restart", "service", "unit", "systemd",
            "masked", "daemon", "exited", "does not come back", "not come back",
        ),
    ),
    (
        "runbooks/networking-web-tls.md",
        (
            "502", "503", "504", "nginx", "apache", "httpd", "port", "listen", "bind",
            "connection refused", "unreachable", "timeout", "timed out", "dns", "resolve",
            "tls", "ssl", "certificate", " cert", "https", "proxy", "upstream", "gateway",
            "endpoint", "status page", "reachable",
        ),
    ),
    (
        "runbooks/resource-exhaustion.md",
        (
            "disk", "no space", " full", "inode", "read-only", "read only", "memory", "oom",
            "out of memory", "killed", "swap", "high load", "load average", "fd limit",
            "too many open files", "/var/log", "log grow",
        ),
    ),
    (
        "runbooks/data-access-scheduling.md",
        (
            "postgres", "postgresql", "psql", "mysql", "mariadb", "database", "permission denied",
            "cron", "crontab", "timer", "schedule", "apparmor", "selinux", "upload", "role",
            "ownership", "creating a new order", "server error", "fails",
        ),
    ),
]


def route_runbook(ticket: dict) -> str:
    """Pick the single most relevant runbook for this ticket, wrapped as prompt context.

    Returns '' if nothing matches — the playbook embedded in the system prompt still covers the
    general method, so an unmatched ticket is not left without guidance.
    """
    text = f"{ticket.get('title', '')} {ticket.get('description', '')}".lower()
    best_rel, best_score = "", 0
    for rel, kws in _RUNBOOKS:
        score = sum(1 for kw in kws if kw in text)
        if score > best_score:
            best_rel, best_score = rel, score
    if not best_rel:
        return ""
    body = _read(best_rel)
    if not body:
        return ""
    name = best_rel.rsplit("/", 1)[-1]
    return (
        f"# Runbook selected for this incident: {name}\n"
        "Apply its diagnose -> root-cause -> durable-fix -> validate steps where they fit the "
        "evidence. It is guidance, not a script; this customer's system may differ.\n\n" + body
    )


def playbook_block() -> str:
    """The master diagnostic playbook, embedded into the system prompt (method for ANY incident)."""
    body = _read("diagnostic_playbook.md")
    if not body:
        return ""
    return (
        "## Diagnostic method (your standard operating procedure)\n"
        "Follow this loop for every incident: triage -> isolate -> root cause -> durable fix -> "
        "validate -> document. Diagnose before you fix; a runtime-only change is not a fix; prove "
        "persistence before you conclude.\n\n" + body
    )
