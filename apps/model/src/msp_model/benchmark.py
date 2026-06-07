from __future__ import annotations

import argparse
import json
import os
import subprocess
import time
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if stripped:
                rows.append(json.loads(stripped))
    return rows


def count_jsonl(path: Path) -> int:
    return len(read_jsonl(path))


def source_mix(rows: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    sources: Counter[str] = Counter()
    domains: Counter[str] = Counter()
    roles: Counter[str] = Counter()
    for row in rows:
        meta = row.get("meta") if isinstance(row.get("meta"), dict) else {}
        sources[str(meta.get("source") or "unknown")] += 1
        domains[str(meta.get("domain") or "unknown")] += 1
        roles[str(meta.get("role") or "general")] += 1
    return {
        "sources": dict(sorted(sources.items())),
        "domains": dict(sorted(domains.items())),
        "roles": dict(sorted(roles.items())),
    }


def summarize_quality(rows: list[dict[str, Any]]) -> dict[str, Any]:
    by_severity: Counter[str] = Counter()
    by_code: Counter[str] = Counter()
    blocking = 0
    for row in rows:
        issues = row.get("issues") if isinstance(row.get("issues"), list) else []
        has_blocking = False
        for issue in issues:
            if not isinstance(issue, dict):
                continue
            severity = str(issue.get("severity") or "unknown")
            code = str(issue.get("code") or "unknown")
            by_severity[severity] += 1
            by_code[code] += 1
            if severity in {"critical", "high"}:
                has_blocking = True
        if has_blocking:
            blocking += 1
    return {
        "audited_records": len(rows),
        "blocking_records": blocking,
        "issues_by_severity": dict(sorted(by_severity.items())),
        "issues_by_code": dict(sorted(by_code.items())),
    }


def summarize_eval_scores(rows: list[dict[str, Any]]) -> dict[str, Any]:
    scores: list[int] = []
    max_scores: list[int] = []
    failed_checks: Counter[str] = Counter()
    for row in rows:
        rubric = row.get("rubric") if isinstance(row.get("rubric"), dict) else {}
        if "score" in rubric and "max_score" in rubric:
            scores.append(int(rubric["score"]))
            max_scores.append(int(rubric["max_score"]))
        checks = rubric.get("checks") if isinstance(rubric.get("checks"), list) else []
        for check in checks:
            if isinstance(check, dict) and check.get("passed") is False:
                failed_checks[str(check.get("name") or "unknown")] += 1
    if not scores:
        return {"scored_rows": 0, "average_score": None, "max_score": None, "failed_checks": {}}
    return {
        "scored_rows": len(scores),
        "average_score": round(sum(scores) / len(scores), 3),
        "max_score": max(max_scores),
        "failed_checks": dict(sorted(failed_checks.items())),
    }


def summarize_schema_guard(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {
            "present": False,
            "passed": False,
            "checked": 0,
            "skipped": 0,
            "failures": [],
        }
    report = json.loads(path.read_text(encoding="utf-8"))
    return {
        "present": True,
        "passed": bool(report.get("passed")),
        "checked": int(report.get("checked") or 0),
        "skipped": int(report.get("skipped") or 0),
        "counts": report.get("counts") if isinstance(report.get("counts"), dict) else {},
        "failures": report.get("failures") if isinstance(report.get("failures"), list) else [],
    }


def run_check(
    name: str, command: list[str], env: dict[str, str], timeout_seconds: int
) -> dict[str, Any]:
    started = time.perf_counter()
    try:
        result = subprocess.run(
            command,
            cwd=Path.cwd(),
            env={**os.environ, **env},
            text=True,
            capture_output=True,
            timeout=timeout_seconds,
            check=False,
        )
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        return {
            "name": name,
            "passed": result.returncode == 0,
            "return_code": result.returncode,
            "duration_ms": duration_ms,
            "stdout_tail": result.stdout.strip()[-2000:],
            "stderr_tail": result.stderr.strip()[-2000:],
        }
    except subprocess.TimeoutExpired as exc:
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        return {
            "name": name,
            "passed": False,
            "return_code": None,
            "duration_ms": duration_ms,
            "stdout_tail": (exc.stdout or "")[-2000:] if isinstance(exc.stdout, str) else "",
            "stderr_tail": f"Timed out after {timeout_seconds}s",
        }


def readiness(report: dict[str, Any]) -> dict[str, Any]:
    blockers: list[str] = []
    warnings: list[str] = []
    data = report["data"]
    quality = report["quality"]
    eval_scores = report["eval_scores"]
    schema_guard = report["schema_guard"]
    live_checks = report["live_checks"]

    hackathon_data_ready = data["source_records"] >= 245 and data["eval_records"] >= 50
    production_data_ready = data["source_records"] >= 500 and data["eval_records"] >= 50
    quality_ready = quality["blocking_records"] == 0
    scored_eval_ready = bool(eval_scores["scored_rows"]) and eval_scores["average_score"] >= 6.5
    schema_ready = bool(schema_guard["present"] and schema_guard["passed"])

    checks_by_name = {check["name"]: check for check in live_checks}
    transport_ready = bool(checks_by_name.get("ai-sdk-structured-output", {}).get("passed"))
    agent_contract_ready = bool(checks_by_name.get("problem-analyzer-contract", {}).get("passed"))

    if data["source_records"] < 500:
        warnings.append("source_records below production target of 500 approved examples")
    if data["eval_records"] < 50:
        warnings.append("eval_records below production target of 50 held-out examples")
    if not quality_ready:
        blockers.append("data quality has critical or high-risk records")
    if not schema_ready:
        blockers.append("schema guard missing or failed")
    if not eval_scores["scored_rows"]:
        blockers.append("no eval rubric scores found")
    elif eval_scores["average_score"] < 6.5:
        blockers.append("rubric average below 6.5/7")

    if not transport_ready and "ai-sdk-structured-output" not in checks_by_name:
        blockers.append("AI SDK structured-output check not run")
    elif not transport_ready:
        blockers.append("AI SDK structured-output check failed")
    if not agent_contract_ready and "problem-analyzer-contract" not in checks_by_name:
        blockers.append("backend problem_analyzer contract check not run")
    elif not agent_contract_ready:
        blockers.append("backend problem_analyzer contract check failed")

    return {
        "hackathon_data_ready": hackathon_data_ready,
        "production_data_ready": production_data_ready,
        "quality_ready": quality_ready,
        "scored_eval_ready": scored_eval_ready,
        "schema_ready": schema_ready,
        "transport_ready": transport_ready,
        "agent_contract_ready": agent_contract_ready,
        "pipeline_ready": not blockers,
        "blockers": blockers,
        "warnings": warnings,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Write MSP adapter benchmark and readiness report."
    )
    parser.add_argument("--source-dir", default="data/source")
    parser.add_argument("--train-file", default="data/processed/train.jsonl")
    parser.add_argument("--eval-file", default="data/processed/eval.jsonl")
    parser.add_argument("--mlx-data-dir", default="outputs/mlx-data")
    parser.add_argument("--quality-report", default="outputs/data_quality.jsonl")
    parser.add_argument("--eval-score-file", default="outputs/eval_scores.jsonl")
    parser.add_argument("--schema-guard-file", default="outputs/schema_guard.json")
    parser.add_argument("--out-file", default="outputs/benchmarks/latest.json")
    parser.add_argument("--model-name", default=os.environ.get("MLX_MODEL", "unknown"))
    parser.add_argument("--run-ai-sdk", action="store_true")
    parser.add_argument("--run-pipeline-agent", action="store_true")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--timeout-seconds", type=int, default=45)
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    source_rows = [row for path in sorted(source_dir.glob("*.jsonl")) for row in read_jsonl(path)]
    quality_rows = read_jsonl(Path(args.quality_report))
    eval_score_rows = read_jsonl(Path(args.eval_score_file))

    live_checks: list[dict[str, Any]] = []
    if args.run_ai_sdk or args.run_pipeline_agent:
        live_checks.append(
            run_check(
                "ai-sdk-structured-output",
                ["bash", "scripts/verify_ai_sdk_local.sh"],
                {},
                args.timeout_seconds,
            )
        )
    if args.run_pipeline_agent:
        live_checks.append(
            run_check(
                "problem-analyzer-contract",
                ["bash", "scripts/verify_ai_sdk_local.sh"],
                {"STRICT_AGENT_CONTRACT": "1"},
                args.timeout_seconds,
            )
        )

    report: dict[str, Any] = {
        "generated_at": datetime.now(UTC).isoformat(),
        "model_name": args.model_name,
        "data": {
            "source_records": len(source_rows),
            "train_records": count_jsonl(Path(args.train_file)),
            "eval_records": count_jsonl(Path(args.eval_file)),
            "mlx_train_records": count_jsonl(Path(args.mlx_data_dir) / "train.jsonl"),
            "mlx_valid_records": count_jsonl(Path(args.mlx_data_dir) / "valid.jsonl"),
            "mlx_test_records": count_jsonl(Path(args.mlx_data_dir) / "test.jsonl"),
            "mix": source_mix(source_rows),
        },
        "quality": summarize_quality(quality_rows),
        "eval_scores": summarize_eval_scores(eval_score_rows),
        "schema_guard": summarize_schema_guard(Path(args.schema_guard_file)),
        "live_checks": live_checks,
    }
    report["readiness"] = readiness(report)

    out_file = Path(args.out_file)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(
        json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8"
    )
    print(f"Wrote benchmark report to {out_file}")
    print(json.dumps(report["readiness"], ensure_ascii=False, indent=2, sort_keys=True))

    if args.strict and not report["readiness"]["pipeline_ready"]:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
