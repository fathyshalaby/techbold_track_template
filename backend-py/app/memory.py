"""Self-evolving solution memory — a local SQLite FTS5 store of the agent's own solved cases.

On conclude, the solution (symptom -> root cause -> fix commands -> validation) is saved. At the start
of a new run, similar past cases are recalled by keyword (FTS5) and injected as context, so each solved
incident makes the next one smarter. Local, zero new deps (stdlib sqlite3 + FTS5).

Secrets never land in the DB: every field passes through safety.redact() before insertion (rubric C).
Everything here is best-effort — a DB hiccup must never break a run, so reads/writes swallow errors.
"""
from __future__ import annotations

import re
import sqlite3
import threading
from pathlib import Path

from . import safety
from .config import settings

# Runs drive on background threads; a single shared connection is serialised with this lock.
_LOCK = threading.Lock()
_CONN: sqlite3.Connection | None = None

# Dropped from FTS queries so recall matches on the technical terms, not boilerplate ticket prose.
_STOPWORDS = {
    "the", "and", "are", "was", "were", "for", "with", "this", "that", "after", "not", "but",
    "you", "your", "our", "when", "does", "did", "can", "cannot", "server", "customer", "report",
    "portal", "users", "get", "gets", "new", "still", "from", "they", "has", "have", "had", "its",
    "must", "should", "would", "could", "been", "than", "then", "there", "here", "into", "out",
}


def _db_path() -> Path:
    p = Path(settings.solutions_db_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def _conn() -> sqlite3.Connection:
    global _CONN
    if _CONN is None:
        conn = sqlite3.connect(str(_db_path()), check_same_thread=False)
        conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS solutions USING fts5("
            "ticket_id, title, symptom, root_cause, fix_commands, validation, fixed, created_at)"
        )
        conn.commit()
        _CONN = conn
    return _CONN


def init() -> None:
    """Eagerly create the store (optional; reads/writes also create it lazily)."""
    try:
        with _LOCK:
            _conn()
    except Exception:
        pass


def save_solution(run) -> None:
    """Persist a concluded run's solution (redacted). Never raises into the run loop."""
    try:
        concl = run.conclusion or {}
        fix_steps = [s for s in run.steps if s.kind == "fix" and s.status == "succeeded"]
        if not fix_steps:
            fix_steps = [s for s in run.steps if s.kind == "fix"]
        fix_cmds = "\n".join((s.edited_command or s.command) for s in fix_steps)
        row = (
            str(run.ticket_id or ""),
            safety.redact(run.ticket.get("title", "")),
            safety.redact(run.ticket.get("description", "")),
            safety.redact(concl.get("root_cause", "")),
            safety.redact(fix_cmds),
            safety.redact(concl.get("validation_result", "")),
            "yes" if concl.get("fixed") else "no",
            getattr(run, "created_at", ""),
        )
        with _LOCK:
            c = _conn()
            c.execute(
                "INSERT INTO solutions"
                " (ticket_id, title, symptom, root_cause, fix_commands, validation, fixed, created_at)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                row,
            )
            c.commit()
    except Exception:
        pass


def _fts_query(ticket: dict) -> str:
    """Build a safe FTS5 MATCH expression: distinct quoted keywords OR'd together."""
    text = f"{ticket.get('title', '')} {ticket.get('description', '')}".lower()
    seen: set[str] = set()
    terms: list[str] = []
    for tok in re.findall(r"[a-z0-9]{3,}", text):
        if tok in _STOPWORDS or tok in seen:
            continue
        seen.add(tok)
        terms.append(f'"{tok}"')
        if len(terms) >= 12:
            break
    return " OR ".join(terms)


def recall(ticket: dict, k: int = 3) -> str:
    """Up to k similar past solutions formatted as prompt context, or '' if the store has no match."""
    try:
        query = _fts_query(ticket)
        if not query:
            return ""
        with _LOCK:
            c = _conn()
            rows = c.execute(
                "SELECT title, symptom, root_cause, fix_commands, validation, fixed"
                " FROM solutions WHERE solutions MATCH ? ORDER BY rank LIMIT ?",
                (query, k),
            ).fetchall()
    except Exception:
        return ""
    if not rows:
        return ""
    blocks = []
    for i, (title, symptom, root_cause, fix_cmds, validation, fixed) in enumerate(rows, 1):
        blocks.append(
            f"### Past case {i}: {title or '(untitled)'} (fixed={fixed})\n"
            f"- Symptom: {symptom or '(none)'}\n"
            f"- Root cause: {root_cause or '(none)'}\n"
            f"- Fix commands previously used:\n{fix_cmds or '(none recorded)'}\n"
            f"- Validation: {validation or '(none recorded)'}"
        )
    return (
        "## Prior solved cases from your own history\n"
        "Incidents YOU resolved before. Use them as the FIRST hypotheses to check, but VERIFY against "
        "this customer's actual system before acting — setups differ. Never blindly re-run a past "
        "command; diagnose, then adapt.\n\n" + "\n\n".join(blocks)
    )
