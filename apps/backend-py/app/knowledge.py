"""Encoded diagnostic method + per-symptom runbooks (parity with the node backend's
apps/backend/src/ai/knowledge.ts). General fault-family knowledge — NO incident-specific
hardcoding (grading uses fresh VMs). The agent reasons FROM a proven procedure."""

from __future__ import annotations

DIAGNOSTIC_METHOD = """
TROUBLESHOOTING METHOD - follow it; reason from it; do not guess:
Loop: TRIAGE -> ISOLATE (USE) -> ROOT CAUSE (5 Whys) -> DURABLE FIX -> VALIDATE -> DOCUMENT.
- Recent changes first: a system that just broke usually broke because something CHANGED.
- Hypothesize -> test cheaply (read-only) -> bisect: each probe should halve the search space.
- Never ASSUME a tool, path, port, service, or unit exists - verify it on the box first.
- 60s triage: uptime; dmesg -T | tail; df -h; df -i (inodes); systemctl --failed; ss -ltnp;
  journalctl -p err -b --no-pager | tail.
- USE per resource (CPU/mem/disk/net): Utilization, Saturation, Errors - first Error found is often the cause.
- Root cause != symptom: keep going until ONE hypothesis is confirmed by a specific evidence line.
- PARTIAL failure = bisect by OPERATION, not service up/down: when reads succeed but writes/INSERTs fail,
  health is OK but a feature errors, or a process runs but emits stale/no data, the fault is a specific
  permission, privilege, config value, or dependency on the FAILING path. Reproduce the exact failing
  customer action, read its specific error, fix that path - do not restart blindly.
- DURABLE fix: a runtime-only change does NOT survive reboot. Durable = on-disk config under /etc +
  enable the unit + daemon-reload. Targeted one-line/one-path change - never blanket/recursive on system roots.
- VALIDATE the EXACT customer operation (failing endpoint returns expected code, the write/INSERT now
  succeeds, dependency reachable, data fresh) AND persistence (is-enabled, survives restart) AND that
  existing customer data was preserved (never destroyed to "fix" a permission).
""".strip()

_RUNBOOKS = [
    {
        "id": "systemd-services",
        "keywords": [
            "service",
            "unit",
            "systemctl",
            "start",
            "won't start",
            "crash",
            "failed",
            "masked",
            "daemon",
            "restart",
            "timer",
            "enable",
            "enabled",
            "disabled",
            "boot",
            "override",
            "drop-in",
            "environment",
            "stale",
        ],
        "digest": (
            "RUNBOOK systemd lifecycle (won't start, crash-loop, masked, DISABLED, bad drop-in): "
            "Diagnose systemctl --failed; status UNIT -l; is-enabled/is-active; journalctl -xeu UNIT; "
            "systemctl cat UNIT (MERGED config incl. drop-ins - read carefully). A stopped+DISABLED unit "
            "won't return after reboot -> enable --now. A BAD DROP-IN OVERRIDE (wrong Environment=/ExecStart= "
            "in /etc/systemd/system/UNIT.d/*.conf) makes a running service misbehave -> correct/REMOVE that "
            "file + daemon-reload + restart. Validate is-active AND is-enabled + functional test + restart."
        ),
    },
    {
        "id": "networking-web-tls",
        "keywords": [
            "port",
            "bind",
            "listen",
            "firewall",
            "ufw",
            "dns",
            "resolve",
            "refused",
            "nginx",
            "apache",
            "502",
            "504",
            "tls",
            "ssl",
            "cert",
            "https",
            "http",
            "proxy",
            "curl",
            "connection",
            "timeout",
            "unreachable",
            "hosts",
            "/etc/hosts",
            "resolution",
            "upstream",
            "partner",
            "dependency",
            "reach",
        ],
        "digest": (
            "RUNBOOK networking / web / TLS / name-resolution: ss -ltnp (listening addr:port); curl local "
            "to bypass proxy; ufw status. NAME RESOLUTION: getent hosts NAME shows the EFFECTIVE answer incl. "
            "/etc/hosts (which wins over DNS); a wrong 'IP hostname' line in /etc/hosts black-holes a "
            "dependency -> correct/remove it. Also: bound to 127.0.0.1 only; firewall blocking; expired cert; "
            "upstream down (502) / slow (504). Fix on-disk config + reload (nginx -t then -s reload); "
            "ufw allow PORT (never disable). Validate: name resolves to the right IP AND endpoint succeeds."
        ),
    },
    {
        "id": "resource-exhaustion",
        "keywords": [
            "disk",
            "inode",
            "no space",
            "space",
            "full",
            "read-only",
            "readonly",
            "log",
            "oom",
            "memory",
            "swap",
            "cpu",
            "load",
            "fd",
            "file descriptor",
            "too many open",
            "137",
            "killed",
        ],
        "digest": (
            "RUNBOOK resource exhaustion: df -h AND df -i (inodes); du -xsh /var/* | sort -h; "
            "dmesg -T | grep -iE 'oom|killed|read-only|I/O error'; free -m. Disk/inode full -> writes fail / "
            "fs remounts read-only; OOM kill (exit 137); FD limit. Fix: rotate/compress logs (logrotate -f, "
            "gzip), cap journal (SystemMaxUse), delete a SPECIFIC large non-audit file; raise LimitNOFILE in a "
            "drop-in. Validate under threshold + writes succeed. Avoid rm -rf /var/log, truncating audit logs."
        ),
    },
    {
        "id": "data-access-scheduling",
        "keywords": [
            "postgres",
            "postgresql",
            "mysql",
            "mariadb",
            "database",
            "db",
            "sql",
            "permission",
            "denied",
            "chown",
            "chmod",
            "owner",
            "sudo",
            "cron",
            "crontab",
            "schedule",
            "apparmor",
            "selinux",
            "config",
            "access",
            "5432",
            "3306",
            "socket",
            "grant",
            "revoke",
            "privilege",
            "sequence",
            "insert",
            "write",
            "role",
            "upload",
            "writable",
        ],
        "digest": (
            "RUNBOOK data / access / scheduling (DB privileges, file perms, sudo, cron, MAC): "
            "DB PRIVILEGES - reads work but writes fail: connect AS the app role, reproduce the failing "
            "statement; \\dp/\\z show table grants, \\ds sequences. An INSERT into a SERIAL/identity column "
            "needs USAGE,SELECT on the OWNING SEQUENCE (not just INSERT on the table) - so SELECT can succeed "
            "while INSERT fails 'permission denied for sequence'. Fix: GRANT USAGE, SELECT ON SEQUENCE seq TO "
            "role; (+ GRANT INSERT ON table). FILE PERMS: ls -ld; namei -l; chown SVCUSER:grp SPECIFIC-path + "
            "least-privilege chmod (never recursive 777; preserve existing files). Validate AS the role/user; "
            "survives restart. Avoid GRANT ALL/superuser shortcuts and dropping data to 'fix' a permission."
        ),
    },
]

RUNBOOK_IDS = [r["id"] for r in _RUNBOOKS]


def select_runbooks(symptom_text: str, max_n: int = 2) -> str:
    """Return the most relevant runbook digest(s) for a symptom, capped to max_n; '' if none match."""
    t = (symptom_text or "").lower()
    scored = [(sum(1 for k in r["keywords"] if k in t), r) for r in _RUNBOOKS]
    picked = [r for score, r in sorted(scored, key=lambda x: -x[0]) if score > 0][
        :max_n
    ]
    return "\n\n".join(r["digest"] for r in picked)
