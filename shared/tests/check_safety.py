#!/usr/bin/env python3
"""Validate shared/safety-rules.json with Python's `re` engine.

Compiles every pattern (catches regex-portability bugs) and checks that each command in
safety-cases.json classifies as expected. The Node twin (check_safety.mjs) must agree.
Run: python3 shared/tests/check_safety.py
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
RULES = json.loads((HERE.parent / "safety-rules.json").read_text())
CASES = json.loads((HERE / "safety-cases.json").read_text())

DENY = [(r["id"], re.compile(r["pattern"], re.IGNORECASE)) for r in RULES["deny"]]
ALLOW = [(r["id"], re.compile(r["pattern"], re.IGNORECASE)) for r in RULES["readonly_allow"]]


def classify(cmd: str):
    for rid, rx in DENY:
        if rx.search(cmd):
            return "blocked", rid
    for rid, rx in ALLOW:
        if rx.search(cmd):
            return "low_risk", rid
    return "needs_review", None


def main() -> int:
    fail = 0
    for c in CASES:
        got, rid = classify(c["command"])
        ok = got == c["expect"]
        fail += not ok
        tag = f"  [{rid}]" if rid else ""
        print(f'{"PASS" if ok else "FAIL"}  {got:13} (exp {c["expect"]:13}) {c["command"]}{tag}')
    print(f"\n{len(CASES) - fail}/{len(CASES)} passed (python re)")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
