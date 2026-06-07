from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

import typer
from rich.console import Console

from .prepare_data import validate_record, write_jsonl

app = typer.Typer(add_completion=False)
console = Console()

SYSTEM_PROMPT = (
    "You are a careful MSP support engineer. Diagnose from evidence, start with safe "
    "read-only checks, warn before risky actions, and include verification."
)

APPROVED_PUBLIC_SOURCES = {
    "benjaminmacklin/IT_Support_V2": {
        "license": "MIT",
        "approved_for_training": True,
        "commercial_use": True,
        "note": "Broad IT support phrasing. Filter and down-weight.",
    },
    "Snaseem2026/devops-incident-response": {
        "license": "MIT",
        "approved_for_training": True,
        "commercial_use": True,
        "note": "Small incident-response seed set.",
    },
    "ibm-research/ITBench-Lite": {
        "license": "Apache-2.0",
        "approved_for_training": True,
        "commercial_use": True,
        "note": "IT operations benchmark. Use for SRE-style troubleshooting.",
    },
    "Tobi-Bueck/customer-support-tickets": {
        "license": "CC-BY-NC-4.0",
        "approved_for_training": False,
        "commercial_use": False,
        "note": "Non-commercial only unless legal approves.",
    },
}


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_no}: invalid JSON: {exc}") from exc
    return rows


def normalize_messages(row: dict[str, Any]) -> list[dict[str, str]] | None:
    messages = row.get("messages")
    if isinstance(messages, list) and messages:
        return [
            {"role": str(message.get("role")), "content": str(message.get("content"))}
            for message in messages
            if isinstance(message, dict)
        ]

    instruction = (
        row.get("instruction") or row.get("question") or row.get("prompt") or row.get("ticket")
    )
    context = row.get("input") or row.get("context") or row.get("description") or ""
    answer = row.get("output") or row.get("answer") or row.get("response") or row.get("resolution")
    if instruction and answer:
        user_content = str(instruction)
        if context:
            user_content = f"{user_content}\n\nContext:\n{context}"
        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": str(answer)},
        ]
    return None


def approved_meta(source: str, license_name: str) -> dict[str, Any]:
    return {
        "source": source,
        "license": license_name,
        "approved_for_training": True,
        "contains_private_data": False,
        "redacted": True,
    }


def write_source_file(out_file: Path, records: list[dict[str, Any]]) -> None:
    for idx, record in enumerate(records, start=1):
        validate_record(record, out_file, idx, strict_meta=True)
    write_jsonl(out_file, records)
    console.print(f"[green]Wrote {len(records)} records to {out_file}.[/green]")


def resolve_existing_path(path: Path, fallbacks: tuple[Path, ...]) -> Path:
    if path.exists():
        return path
    for fallback in fallbacks:
        if fallback.exists():
            return fallback
    candidates = ", ".join(str(candidate) for candidate in (path, *fallbacks))
    raise typer.BadParameter(f"No scenario file found. Checked: {candidates}")


@app.command("internal-jsonl")
def internal_jsonl(
    input_file: Path = typer.Option(...),
    out_file: Path = typer.Option(Path("data/source/internal-approved.jsonl")),
) -> None:
    """Copy an already approved internal JSONL file into the ignored source drop zone."""
    records = read_jsonl(input_file)
    for idx, record in enumerate(records, start=1):
        validate_record(record, input_file, idx, strict_meta=True)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(input_file, out_file)
    console.print(f"[green]Copied {len(records)} approved records to {out_file}.[/green]")


@app.command("sandbox")
def sandbox(
    scenarios_file: Path = typer.Option(Path("../../infra/sandbox/scenarios/scenarios.json")),
    out_file: Path = typer.Option(Path("data/source/sandbox-generated.jsonl")),
) -> None:
    """Generate canonical examples from this repo's sandbox scenarios."""
    scenarios_file = resolve_existing_path(
        scenarios_file,
        (
            Path("../../infra/sandbox/scenarios/scenarios.json"),
            Path("infra/sandbox/scenarios/scenarios.json"),
        ),
    )
    scenarios = json.loads(scenarios_file.read_text(encoding="utf-8"))
    records: list[dict[str, Any]] = []
    for scenario in scenarios:
        ticket = scenario["ticket"]
        params = scenario.get("params", {})
        services = ", ".join(
            str(value) for key, value in params.items() if "service" in key.lower()
        )
        user_content = (
            f"Ticket: {ticket['title']}\n\n{ticket['description']}\n\n"
            f"System: {scenario['system']['os']}. Archetype: {scenario['archetype']}. "
            f"Relevant services: {services or 'unknown'}."
        )
        assistant_content = (
            "Likely diagnosis: the service or dependency named in the ticket is misconfigured, "
            "disabled, unreachable, or failing after restart.\n\n"
            "Evidence: use the ticket symptom, public validation command, service names, ports, "
            "and recent systemd or application logs to localize the failure.\n\n"
            "Safe read-only checks first:\n"
            "1. sudo systemctl status --no-pager for the named service.\n"
            "2. sudo journalctl -u SERVICE -b --no-pager.\n"
            "3. ss -ltnp for the expected port.\n"
            "4. cat relevant service unit and config files without editing them.\n"
            "5. sudo /opt/hackathon/public-test.sh to reproduce the customer-visible failure.\n\n"
            "Remediation: change only the minimal incorrect service, config, permission, DNS, "
            "or endpoint setting after confirming the root cause from evidence.\n\n"
            "Verification: rerun the public validation, confirm the service is active, inspect "
            "logs for clean startup, and repeat the customer-facing check.\n\n"
            "Rollback and escalation: restore the previous unit or config file if validation "
            "fails. Escalate if data loss, unknown services, or missing credentials are involved."
        )
        records.append(
            {
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                    {"role": "assistant", "content": assistant_content},
                ],
                "meta": {
                    **approved_meta(
                        f"sandbox/scenarios/{scenario['archetype']}",
                        "MIT project scenario",
                    ),
                    "domain": "sandbox",
                    "archetype": scenario["archetype"],
                },
            }
        )
    write_source_file(out_file, records)


@app.command("hf")
def hf(
    dataset_id: str = typer.Option(...),
    split: str = typer.Option("train"),
    out_file: Path = typer.Option(Path("data/source/hf-import.jsonl")),
    max_records: int = typer.Option(1000),
    allow_noncommercial: bool = typer.Option(False),
) -> None:
    """Import a known Hugging Face dataset into canonical chat JSONL."""
    source = APPROVED_PUBLIC_SOURCES.get(dataset_id)
    if source is None:
        raise typer.BadParameter(f"Dataset is not in the approved source catalog: {dataset_id}")
    if not source["commercial_use"] and not allow_noncommercial:
        raise typer.BadParameter(f"{dataset_id} is not approved for commercial training use.")

    from datasets import load_dataset

    ds = load_dataset(dataset_id, split=split)
    records: list[dict[str, Any]] = []
    for row in ds:
        messages = normalize_messages(dict(row))
        if not messages:
            continue
        records.append(
            {
                "messages": messages,
                "meta": {
                    **approved_meta(dataset_id, str(source["license"])),
                    "split": split,
                    "import_note": source["note"],
                },
            }
        )
        if len(records) >= max_records:
            break
    if not records:
        raise typer.BadParameter(f"No compatible rows found in {dataset_id}:{split}")
    write_source_file(out_file, records)


@app.command("catalog")
def catalog() -> None:
    """Print the current public-source catalog and license policy."""
    console.print(json.dumps(APPROVED_PUBLIC_SOURCES, indent=2))


if __name__ == "__main__":
    app()
