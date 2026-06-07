from __future__ import annotations

import json
import shutil
from collections import Counter
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

DIAGNOSTIC_SYSTEM_PROMPT = (
    "Role: problem_analyzer. Output only JSON matching DiagnosticProposal. "
    "Propose one read-only diagnostic command that confirms or denies the top hypothesis."
)

FIX_SYSTEM_PROMPT = (
    "Role: problem_solver. Output only JSON matching FixProposal. Plan one minimal, "
    "reversible remediation command for a confirmed root cause."
)

VALIDATION_SYSTEM_PROMPT = (
    "Role: validator. Output only JSON matching ValidationResult. Verify customer benefit "
    "and persistence from supplied observations."
)

ACTIVITY_SYSTEM_PROMPT = (
    "Role: activity_log_generator. Output only JSON matching ActivityDraftFields. Use only "
    "the supplied audit facts."
)

UNSAFE_CORRECTION_SYSTEM_PROMPT = (
    "You are a careful MSP support engineer. Refuse unsafe broad actions, propose safe "
    "read-only checks first, and explain the warning clearly."
)

SYNTHETIC_GENERATOR_VERSION = "sandbox-contract-v1"
SYNTHETIC_ROLE_COUNTS = {
    "freeform": 8,
    "problem_analyzer": 12,
    "problem_solver": 10,
    "validator": 8,
    "activity_log_generator": 6,
    "unsafe_correction": 4,
}

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


def print_record_summary(records: list[dict[str, Any]], sample_count: int) -> None:
    archetypes: Counter[str] = Counter()
    roles: Counter[str] = Counter()
    splits: Counter[str] = Counter()
    for record in records:
        meta = record.get("meta") if isinstance(record.get("meta"), dict) else {}
        archetypes[str(meta.get("archetype") or "unknown")] += 1
        roles[str(meta.get("role") or "unknown")] += 1
        splits[str(meta.get("split") or "train")] += 1

    console.print("[bold]Synthetic sandbox preview[/bold]")
    console.print(f"Records: {len(records)}")
    console.print(f"Archetypes: {dict(sorted(archetypes.items()))}")
    console.print(f"Roles: {dict(sorted(roles.items()))}")
    console.print(f"Splits: {dict(sorted(splits.items()))}")

    for idx, record in enumerate(records[:sample_count], start=1):
        meta = record["meta"]
        messages = record["messages"]
        user = str(messages[1]["content"]).replace("\n", " ")[:220]
        assistant = str(messages[-1]["content"]).replace("\n", " ")[:220]
        console.print(
            json.dumps(
                {
                    "sample": idx,
                    "source": meta["source"],
                    "archetype": meta.get("archetype"),
                    "role": meta.get("role"),
                    "split": meta.get("split"),
                    "user_preview": user,
                    "assistant_preview": assistant,
                },
                ensure_ascii=False,
                indent=2,
            )
        )


def resolve_existing_path(path: Path, fallbacks: tuple[Path, ...]) -> Path:
    if path.exists():
        return path
    for fallback in fallbacks:
        if fallback.exists():
            return fallback
    candidates = ", ".join(str(candidate) for candidate in (path, *fallbacks))
    raise typer.BadParameter(f"No scenario file found. Checked: {candidates}")


def _json_dumps(value: dict[str, Any]) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True)


def _record(
    system_prompt: str,
    user_content: str,
    assistant_object: dict[str, Any],
    source: str,
    role: str,
    archetype: str,
) -> dict[str, Any]:
    return {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": _json_dumps(assistant_object)},
        ],
        "meta": {
            **approved_meta(source, "MIT project scenario"),
            "domain": "sandbox",
            "archetype": archetype,
            "role": role,
        },
    }


def _scenario_by_archetype(scenarios: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {str(scenario["archetype"]): scenario for scenario in scenarios}


def _base_ticket_context(scenario: dict[str, Any]) -> str:
    ticket = scenario["ticket"]
    return (
        f"Ticket: {ticket['title']}\n\n"
        f"{ticket['description']}\n\n"
        f"System: {scenario['system']['os']}. Archetype: {scenario['archetype']}."
    )


def _contract_file_default() -> Path:
    return Path("../../infra/sandbox/scenarios/training-contracts.json")


def load_training_contracts(contract_file: Path) -> dict[str, Any]:
    contract_file = resolve_existing_path(
        contract_file,
        (
            Path("../../infra/sandbox/scenarios/training-contracts.json"),
            Path("infra/sandbox/scenarios/training-contracts.json"),
        ),
    )
    return json.loads(contract_file.read_text(encoding="utf-8"))


def _synthetic_meta(source: str, archetype: str, role: str, variant: int) -> dict[str, Any]:
    return {
        **approved_meta(source, "MIT project scenario"),
        "domain": "sandbox",
        "archetype": archetype,
        "role": role,
        "synthetic": True,
        "generator_version": SYNTHETIC_GENERATOR_VERSION,
        "variant_seed": variant,
        "split": "eval" if variant % 5 == 0 or variant % 97 == 0 else "train",
    }


def _synthetic_record(
    system_prompt: str,
    user_content: str,
    assistant_content: str | dict[str, Any],
    source: str,
    archetype: str,
    role: str,
    variant: int,
) -> dict[str, Any]:
    content = (
        _json_dumps(assistant_content) if isinstance(assistant_content, dict) else assistant_content
    )
    return {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": content},
        ],
        "meta": _synthetic_meta(source, archetype, role, variant),
    }


def _variant_context(scenario: dict[str, Any], contract: dict[str, Any], variant: int) -> str:
    evidence = contract["evidence"][variant % len(contract["evidence"])]
    check = contract["safeChecks"][variant % len(contract["safeChecks"])]
    return (
        f"{_base_ticket_context(scenario)}\n\n"
        f"Observed clue: {evidence}\n"
        f"Candidate safe check: {check['command']}"
    )


def _freeform_answer(contract: dict[str, Any], check: dict[str, Any], fix: dict[str, Any]) -> str:
    return (
        f"Diagnosis: {contract['diagnosis']}\n\n"
        f"Evidence: {contract['evidence'][0]} {check['expectedSignal']}\n\n"
        f"Safe read-only checks first:\n"
        f"1. {check['command']}\n"
        f"Purpose: {check['purpose']}\n"
        f"Risk: {check['riskNotes']}\n\n"
        f"Remediation: after the evidence confirms the root cause, run `{fix['command']}` "
        f"with operator approval.\n\n"
        f"Verification: run `sudo /opt/hackathon/public-test.sh`, confirm the customer-facing "
        f"symptom is gone, and check persistence.\n\n"
        f"Rollback: {fix['rollbackCommand']}\n\n"
        f"Escalation: escalate if the read-only check does not match the expected signal, "
        f"if validation fails, or if customer data could be affected."
    )


def _diagnostic_object(
    contract: dict[str, Any], check: dict[str, Any], variant: int
) -> dict[str, Any]:
    return {
        "hypotheses": [
            {
                "cause": contract["diagnosis"],
                "evidence": contract["evidence"][variant % len(contract["evidence"])],
                "confidence": round(0.72 + ((variant % 5) * 0.04), 2),
            }
        ],
        "command": check["command"],
        "purpose": check["purpose"],
        "expectedSignal": check["expectedSignal"],
        "riskNotes": check["riskNotes"],
        "isReadOnly": True,
    }


def _fix_object(fix: dict[str, Any]) -> dict[str, Any]:
    return {
        "rootCause": fix["rootCause"],
        "command": fix["command"],
        "rationale": fix["rationale"],
        "rollbackCommand": fix["rollbackCommand"],
        "isReversible": True,
        "persistenceNote": fix["persistenceNote"],
    }


def _validation_object(validation: dict[str, Any]) -> dict[str, Any]:
    return {
        "status": "VERIFIED_FIXED",
        "benefitCheck": validation["benefitCheck"],
        "persistenceCheck": validation["persistenceCheck"],
        "evidence": validation["evidence"],
    }


def _activity_object(
    scenario: dict[str, Any], contract: dict[str, Any], validation: dict[str, Any]
) -> dict[str, Any]:
    return {
        "summary": f"{scenario['ticket']['title']} was resolved through the sandbox runbook.",
        "rootCause": contract["diagnosis"],
        "actionsTaken": (
            "Reviewed the ticket, ran read-only diagnostics, applied one minimal approved fix, "
            "and validated the public test."
        ),
        "commandsSummary": "\n".join(
            [
                f"$ {contract['safeChecks'][0]['command']} (exit 0)",
                f"$ {contract['fixes'][0]['command']} (exit 0)",
                "$ sudo /opt/hackathon/public-test.sh (exit 0)",
            ]
        ),
        "validationResult": validation["benefitCheck"],
    }


def _unsafe_answer(example: dict[str, Any], contract: dict[str, Any]) -> str:
    check = contract["safeChecks"][0]
    return (
        f"Warning: {example['warning']}\n\n"
        f"Do not run the requested broad or destructive action.\n\n"
        f"Safe read-only checks first: run `{check['command']}` to gather evidence.\n\n"
        f"Diagnosis: use the result to confirm or deny this likely cause: {contract['diagnosis']}\n\n"
        f"Remediation: {example['safeAlternative']}\n\n"
        f"Verification: rerun the public validation script and confirm persistence.\n\n"
        f"Rollback and escalation: use the documented rollback for any approved change, and "
        f"escalate if the safe check does not match the expected signal."
    )


def build_synthetic_sandbox_records(
    scenarios: list[dict[str, Any]],
    contracts: dict[str, Any],
    target_records: int,
    seed: int,
) -> list[dict[str, Any]]:
    by_name = _scenario_by_archetype(scenarios)
    canonical: list[dict[str, Any]] = []
    variant = seed

    for archetype in sorted(by_name):
        scenario = by_name[archetype]
        contract = contracts[archetype]
        validation = contract["validation"]
        for idx in range(SYNTHETIC_ROLE_COUNTS["freeform"]):
            check = contract["safeChecks"][idx % len(contract["safeChecks"])]
            fix = contract["fixes"][idx % len(contract["fixes"])]
            canonical.append(
                _synthetic_record(
                    SYSTEM_PROMPT,
                    _variant_context(scenario, contract, variant),
                    _freeform_answer(contract, check, fix),
                    f"sandbox-synthetic/{archetype}/freeform/{idx + 1}",
                    archetype,
                    "freeform",
                    variant,
                )
            )
            variant += 1

        for idx in range(SYNTHETIC_ROLE_COUNTS["problem_analyzer"]):
            check = contract["safeChecks"][idx % len(contract["safeChecks"])]
            canonical.append(
                _synthetic_record(
                    DIAGNOSTIC_SYSTEM_PROMPT,
                    f"{_variant_context(scenario, contract, variant)}\n\nPropose the next diagnostic command.",
                    _diagnostic_object(contract, check, variant),
                    f"sandbox-synthetic/{archetype}/diagnostic/{idx + 1}",
                    archetype,
                    "problem_analyzer",
                    variant,
                )
            )
            variant += 1

        for idx in range(SYNTHETIC_ROLE_COUNTS["problem_solver"]):
            check = contract["safeChecks"][idx % len(contract["safeChecks"])]
            fix = contract["fixes"][idx % len(contract["fixes"])]
            canonical.append(
                _synthetic_record(
                    FIX_SYSTEM_PROMPT,
                    (
                        f"{_base_ticket_context(scenario)}\n\n"
                        f"Confirmed observations:\n- " + "\n- ".join(check["observations"])
                    ),
                    _fix_object(fix),
                    f"sandbox-synthetic/{archetype}/fix/{idx + 1}",
                    archetype,
                    "problem_solver",
                    variant,
                )
            )
            variant += 1

        for idx in range(SYNTHETIC_ROLE_COUNTS["validator"]):
            canonical.append(
                _synthetic_record(
                    VALIDATION_SYSTEM_PROMPT,
                    (
                        f"{_base_ticket_context(scenario)}\n\n"
                        f"Applied fix: {validation['fixApplied']}\n"
                        f"Observations:\n- " + "\n- ".join(validation["observations"])
                    ),
                    _validation_object(validation),
                    f"sandbox-synthetic/{archetype}/validation/{idx + 1}",
                    archetype,
                    "validator",
                    variant,
                )
            )
            variant += 1

        for idx in range(SYNTHETIC_ROLE_COUNTS["activity_log_generator"]):
            canonical.append(
                _synthetic_record(
                    ACTIVITY_SYSTEM_PROMPT,
                    (
                        f"Ticket: {scenario['ticket']['title']}\n"
                        f"Audit facts:\n- " + "\n- ".join(validation["observations"])
                    ),
                    _activity_object(scenario, contract, validation),
                    f"sandbox-synthetic/{archetype}/activity/{idx + 1}",
                    archetype,
                    "activity_log_generator",
                    variant,
                )
            )
            variant += 1

        for idx in range(SYNTHETIC_ROLE_COUNTS["unsafe_correction"]):
            example = contract["unsafeRequests"][idx % len(contract["unsafeRequests"])]
            canonical.append(
                _synthetic_record(
                    UNSAFE_CORRECTION_SYSTEM_PROMPT,
                    f"{_base_ticket_context(scenario)}\n\nOperator request: {example['request']}",
                    _unsafe_answer(example, contract),
                    f"sandbox-synthetic/{archetype}/unsafe-correction/{idx + 1}",
                    archetype,
                    "unsafe_correction",
                    variant,
                )
            )
            variant += 1

    if target_records <= len(canonical):
        return canonical[:target_records]

    records = list(canonical)
    while len(records) < target_records:
        source = canonical[len(records) % len(canonical)]
        copy = json.loads(json.dumps(source))
        copy["meta"]["source"] = f"{source['meta']['source']}/repeat-{len(records) + 1}"
        copy["meta"]["variant_seed"] = len(records) + 1
        copy["meta"]["split"] = "eval" if (len(records) + 1) % 5 == 0 else "train"
        copy["messages"][1]["content"] += f"\n\nSynthetic repeat variant: {len(records) + 1}."
        records.append(copy)
    return records


def build_rich_sandbox_records(scenarios: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_name = _scenario_by_archetype(scenarios)
    records: list[dict[str, Any]] = []

    def add(
        archetype: str,
        role: str,
        system_prompt: str,
        user_suffix: str,
        assistant_object: dict[str, Any],
        label: str,
    ) -> None:
        scenario = by_name[archetype]
        records.append(
            _record(
                system_prompt=system_prompt,
                user_content=f"{_base_ticket_context(scenario)}\n\n{user_suffix}".strip(),
                assistant_object=assistant_object,
                source=f"sandbox-rich/{archetype}/{label}",
                role=role,
                archetype=archetype,
            )
        )

    add(
        "service-health",
        "problem_analyzer",
        DIAGNOSTIC_SYSTEM_PROMPT,
        "No commands have been run yet. Propose the first diagnostic command.",
        {
            "hypotheses": [
                {
                    "cause": "status-beacon is disabled or stopped after host restart",
                    "evidence": "The ticket says the localhost app can answer manually but does not come back on its own after restart.",
                    "confidence": 0.74,
                }
            ],
            "command": "systemctl status status-beacon --no-pager",
            "purpose": "Confirm whether the status-beacon unit is stopped, disabled, or failed.",
            "expectedSignal": "Confirmed if the unit is inactive, disabled, or failed; denied if it is active and enabled.",
            "riskNotes": "Read-only systemd status check; it does not modify services or files.",
            "isReadOnly": True,
        },
        "diagnostic-status",
    )
    add(
        "service-health",
        "problem_solver",
        FIX_SYSTEM_PROMPT,
        "Observations:\n$ systemctl status status-beacon --no-pager\nLoaded: loaded; disabled\nActive: inactive (dead)\n$ curl -fsS http://127.0.0.1:8080/health\ncurl failed: connection refused",
        {
            "rootCause": "status-beacon is disabled and stopped, so it does not bind to the health endpoint after host restart.",
            "command": "sudo systemctl enable --now status-beacon.service",
            "rationale": "Enabling and starting the specific affected service restores the health endpoint and makes the fix persistent across host restarts.",
            "rollbackCommand": "sudo systemctl disable --now status-beacon.service",
            "isReversible": True,
            "persistenceNote": "The enable step persists across host restarts; verify with systemctl is-enabled and the public test.",
        },
        "fix-enable-service",
    )
    add(
        "service-health",
        "validator",
        VALIDATION_SYSTEM_PROMPT,
        "Applied fix: sudo systemctl enable --now status-beacon.service\nObservations:\n$ sudo /opt/hackathon/public-test.sh\npublic test ok\n$ systemctl is-active status-beacon\nactive\n$ systemctl is-enabled status-beacon\nenabled",
        {
            "status": "VERIFIED_FIXED",
            "benefitCheck": "sudo /opt/hackathon/public-test.sh returned public test ok.",
            "persistenceCheck": "systemctl is-enabled status-beacon returned enabled.",
            "evidence": [
                "status-beacon is active",
                "status-beacon is enabled",
                "The public validation script passed",
            ],
        },
        "validation-public-test",
    )

    add(
        "document-upload",
        "problem_analyzer",
        DIAGNOSTIC_SYSTEM_PROMPT,
        "Observations:\n$ curl -fsS http://127.0.0.1:8081/health\nok\n$ curl -fsS -X POST --data-binary probe http://127.0.0.1:8081/upload\nHTTP 500",
        {
            "hypotheses": [
                {
                    "cause": "document-hub cannot write to its upload directory because ownership or permissions are wrong",
                    "evidence": "Health succeeds but upload writes fail, which localizes the issue to the write path rather than service availability.",
                    "confidence": 0.82,
                }
            ],
            "command": "ls -ld /srv/document-hub/uploads /srv/document-hub/existing",
            "purpose": "Inspect ownership and permissions on upload and existing document directories without changing them.",
            "expectedSignal": "Confirmed if uploads is not writable by docsvc while existing data remains present.",
            "riskNotes": "Read-only directory metadata inspection.",
            "isReadOnly": True,
        },
        "diagnostic-permissions",
    )
    add(
        "document-upload",
        "problem_solver",
        FIX_SYSTEM_PROMPT,
        "Observations:\n$ ls -ld /srv/document-hub/uploads /srv/document-hub/existing\ndrwxr-xr-x root root /srv/document-hub/uploads\ndrwxr-xr-x docsvc docsvc /srv/document-hub/existing\n$ id docsvc\nuid=1999(docsvc) gid=1999(docsvc)",
        {
            "rootCause": "The upload directory is owned by root, so the document-hub service user cannot create uploaded files.",
            "command": "sudo chown docsvc:docsvc /srv/document-hub/uploads",
            "rationale": "Changing only the upload directory owner restores write access for the service user without touching existing documents.",
            "rollbackCommand": "sudo chown root:root /srv/document-hub/uploads",
            "isReversible": True,
            "persistenceNote": "Directory ownership persists across service restarts; verify with the public upload test.",
        },
        "fix-upload-owner",
    )

    add(
        "partner-sync",
        "problem_analyzer",
        DIAGNOSTIC_SYSTEM_PROMPT,
        "Observations:\n$ systemctl is-active partner-gateway order-relay\nactive\nactive\n$ curl -fsS http://vendor-api.internal:9000/ping\ncurl failed: connection refused",
        {
            "hypotheses": [
                {
                    "cause": "vendor-api.internal resolves to the wrong local address for the partner service",
                    "evidence": "Both services are active but the hostname endpoint is unreachable.",
                    "confidence": 0.78,
                }
            ],
            "command": "getent hosts vendor-api.internal && ss -ltnp | grep ':9000'",
            "purpose": "Compare hostname resolution with the local listener for the partner service.",
            "expectedSignal": "Confirmed if the hostname resolves away from the address where port 9000 is listening.",
            "riskNotes": "Read-only name-resolution and socket inspection.",
            "isReadOnly": True,
        },
        "diagnostic-hosts",
    )
    add(
        "partner-sync",
        "problem_solver",
        FIX_SYSTEM_PROMPT,
        "Observations:\n$ getent hosts vendor-api.internal\n127.0.0.2 vendor-api.internal\n$ ss -ltnp | grep ':9000'\nLISTEN 0 4096 127.0.0.1:9000",
        {
            "rootCause": "vendor-api.internal points to 127.0.0.2 while partner-gateway listens on 127.0.0.1:9000.",
            "command": "sudo sed -i 's/^127\\.0\\.0\\.2 vendor-api\\.internal$/127.0.0.1 vendor-api.internal/' /etc/hosts",
            "rationale": "Updating only the incorrect hosts entry makes the sync worker reach the local partner service.",
            "rollbackCommand": "sudo sed -i 's/^127\\.0\\.0\\.1 vendor-api\\.internal$/127.0.0.2 vendor-api.internal/' /etc/hosts",
            "isReversible": True,
            "persistenceNote": "The /etc/hosts edit persists until reset; verify with curl and the public validation script.",
        },
        "fix-hosts-entry",
    )

    add(
        "erp-write-path",
        "problem_analyzer",
        DIAGNOSTIC_SYSTEM_PROMPT,
        'Observations:\n$ systemctl is-active postgresql\nactive\n$ sudo -u postgres psql -d deskorders -c "SELECT count(*) FROM orders;"\n count\n  3\nApplication inserts fail with permission denied for sequence orders_id_seq.',
        {
            "hypotheses": [
                {
                    "cause": "order_writer lacks USAGE or SELECT privilege on orders_id_seq",
                    "evidence": "Reads work, PostgreSQL is active, and inserts fail specifically on the sequence.",
                    "confidence": 0.88,
                }
            ],
            "command": 'sudo -u postgres psql -d deskorders -c "\\dp orders_id_seq"',
            "purpose": "Inspect sequence privileges without changing database state.",
            "expectedSignal": "Confirmed if order_writer is missing USAGE or SELECT on orders_id_seq.",
            "riskNotes": "Read-only privilege inspection.",
            "isReadOnly": True,
        },
        "diagnostic-sequence-privilege",
    )
    add(
        "erp-write-path",
        "problem_solver",
        FIX_SYSTEM_PROMPT,
        'Observations:\n$ sudo -u postgres psql -d deskorders -c "\\dp orders_id_seq"\nAccess privileges do not include order_writer=rwU/postgres',
        {
            "rootCause": "The order_writer role can read orders but lacks required sequence privileges for inserts.",
            "command": 'sudo -u postgres psql -d deskorders -c "GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO order_writer;"',
            "rationale": "Granting only sequence usage to the application role restores insert capability without modifying existing order rows.",
            "rollbackCommand": 'sudo -u postgres psql -d deskorders -c "REVOKE USAGE, SELECT ON SEQUENCE orders_id_seq FROM order_writer;"',
            "isReversible": True,
            "persistenceNote": "Database grants persist; verify with the public validation script.",
        },
        "fix-sequence-grant",
    )

    add(
        "monitoring-data",
        "problem_analyzer",
        DIAGNOSTIC_SYSTEM_PROMPT,
        "Observations:\n$ curl -fsS http://127.0.0.1:8088/health\nok\n$ curl -fsS http://127.0.0.1:3000/api/health\nok\n$ curl -fsS http://127.0.0.1:9091/metrics/count\n15\nAfter waiting, the count is still 15.",
        {
            "hypotheses": [
                {
                    "cause": "signal-agent is sending metrics to the wrong ingest endpoint",
                    "evidence": "Application and dashboard health checks pass, but ingest count is stale.",
                    "confidence": 0.8,
                }
            ],
            "command": "systemctl cat signal-agent.service && systemctl status signal-agent --no-pager",
            "purpose": "Inspect the agent unit and overrides for the configured metrics endpoint.",
            "expectedSignal": "Confirmed if the unit or override points METRICS_ENDPOINT at port 9092 instead of 9091.",
            "riskNotes": "Read-only systemd unit and status inspection.",
            "isReadOnly": True,
        },
        "diagnostic-agent-endpoint",
    )
    add(
        "monitoring-data",
        "problem_solver",
        FIX_SYSTEM_PROMPT,
        "Observations:\n$ systemctl cat signal-agent.service\nEnvironment=METRICS_ENDPOINT=http://127.0.0.1:9092/ingest\nExpected endpoint is http://127.0.0.1:9091/ingest.",
        {
            "rootCause": "signal-agent has a systemd override pointing METRICS_ENDPOINT to the wrong port.",
            "command": "sudo sed -i 's#http://127.0.0.1:9092/ingest#http://127.0.0.1:9091/ingest#' /etc/systemd/system/signal-agent.service.d/override.conf && sudo systemctl daemon-reload && sudo systemctl restart signal-agent.service",
            "rationale": "Correcting only the bad endpoint and restarting the affected agent resumes metric delivery to the live ingest service.",
            "rollbackCommand": "sudo sed -i 's#http://127.0.0.1:9091/ingest#http://127.0.0.1:9092/ingest#' /etc/systemd/system/signal-agent.service.d/override.conf && sudo systemctl daemon-reload && sudo systemctl restart signal-agent.service",
            "isReversible": True,
            "persistenceNote": "The override file persists across restarts; verify that the metric count increases after the agent restart.",
        },
        "fix-agent-endpoint",
    )

    add(
        "monitoring-data",
        "activity_log_generator",
        ACTIVITY_SYSTEM_PROMPT,
        "Audit facts:\nTicket: Dashboard shows stale monitoring data\nCommands:\n1. curl health checks for customer app and dashboard passed.\n2. metrics/count remained unchanged before fix.\n3. systemctl cat signal-agent showed METRICS_ENDPOINT on port 9092.\n4. Edited override to port 9091, daemon-reloaded, restarted signal-agent.\n5. public-test.sh passed.",
        {
            "summary": "The dashboard was healthy but monitoring samples were stale because the signal-agent posted to the wrong ingest endpoint.",
            "rootCause": "signal-agent had METRICS_ENDPOINT configured for port 9092 instead of the active ingest service on port 9091.",
            "actionsTaken": "Confirmed health endpoints, verified the metric count was stale, inspected the signal-agent unit, corrected the endpoint override, reloaded systemd, and restarted only signal-agent.",
            "commandsSummary": "$ curl health checks (exit 0)\n$ systemctl cat signal-agent.service (exit 0)\n$ sed endpoint override and restart signal-agent (exit 0)\n$ sudo /opt/hackathon/public-test.sh (exit 0)",
            "validationResult": "The public validation script passed and the metric count increased after remediation.",
        },
        "activity-report",
    )

    return records


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


@app.command("sandbox-rich")
def sandbox_rich(
    scenarios_file: Path = typer.Option(Path("../../infra/sandbox/scenarios/scenarios.json")),
    out_file: Path = typer.Option(Path("data/source/sandbox-rich-generated.jsonl")),
    contract_file: Path = typer.Option(_contract_file_default()),
    records: int = typer.Option(240, min=1),
    seed: int = typer.Option(7),
) -> None:
    """Compatibility alias for contract-backed sandbox synthetic examples."""
    scenarios_file = resolve_existing_path(
        scenarios_file,
        (
            Path("../../infra/sandbox/scenarios/scenarios.json"),
            Path("infra/sandbox/scenarios/scenarios.json"),
        ),
    )
    scenarios = json.loads(scenarios_file.read_text(encoding="utf-8"))
    contracts = load_training_contracts(contract_file)
    generated = build_synthetic_sandbox_records(scenarios, contracts, records, seed)
    write_source_file(out_file, generated)


@app.command("sandbox-synthetic")
def sandbox_synthetic(
    scenarios_file: Path = typer.Option(Path("../../infra/sandbox/scenarios/scenarios.json")),
    contract_file: Path = typer.Option(_contract_file_default()),
    out_file: Path = typer.Option(Path("data/source/sandbox-synthetic-generated.jsonl")),
    records: int = typer.Option(240, min=1),
    seed: int = typer.Option(7),
) -> None:
    """Generate deterministic training/eval examples from sandbox training contracts."""
    scenarios_file = resolve_existing_path(
        scenarios_file,
        (
            Path("../../infra/sandbox/scenarios/scenarios.json"),
            Path("infra/sandbox/scenarios/scenarios.json"),
        ),
    )
    scenarios = json.loads(scenarios_file.read_text(encoding="utf-8"))
    contracts = load_training_contracts(contract_file)
    generated = build_synthetic_sandbox_records(scenarios, contracts, records, seed)
    write_source_file(out_file, generated)


@app.command("preview-synthetic")
def preview_synthetic(
    scenarios_file: Path = typer.Option(Path("../../infra/sandbox/scenarios/scenarios.json")),
    contract_file: Path = typer.Option(_contract_file_default()),
    records: int = typer.Option(240, min=1),
    seed: int = typer.Option(7),
    samples: int = typer.Option(2, min=0, max=10),
) -> None:
    """Preview deterministic sandbox synthetic examples without writing files."""
    scenarios_file = resolve_existing_path(
        scenarios_file,
        (
            Path("../../infra/sandbox/scenarios/scenarios.json"),
            Path("infra/sandbox/scenarios/scenarios.json"),
        ),
    )
    scenarios = json.loads(scenarios_file.read_text(encoding="utf-8"))
    contracts = load_training_contracts(contract_file)
    generated = build_synthetic_sandbox_records(scenarios, contracts, records, seed)
    for idx, record in enumerate(generated, start=1):
        validate_record(record, Path("<synthetic-preview>"), idx, strict_meta=True)
    print_record_summary(generated, samples)


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
