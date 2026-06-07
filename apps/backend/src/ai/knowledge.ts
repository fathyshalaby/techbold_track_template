// Machine-encoded diagnostic method and runbooks for agent prompts.

export const DIAGNOSTIC_METHOD = `
TROUBLESHOOTING METHOD - follow it; reason from it; do not guess:
Loop: TRIAGE -> ISOLATE (USE) -> ROOT CAUSE (5 Whys) -> DURABLE FIX -> VALIDATE -> DOCUMENT.
- Recent changes first: a system that just broke usually broke because something CHANGED
  (deploy, config edit, package update, cert rotation, disk filling). Check journal timestamps
  and recent errors before exotic theories.
- Hypothesize -> test cheaply (read-only) -> bisect: each probe should halve the search space;
  a clean check is informative (it rules out a branch).
- Never ASSUME a tool, path, port, service, or unit exists - verify it on the box first
  (which <tool>; test -e <path>; systemctl cat <unit>). Stock Ubuntu only; install nothing.
- 60-second triage sweep (use what is present, skip absent tools): uptime; dmesg -T | tail
  (OOM / I/O error / remount-ro / segfault - high value); df -h; df -i (inodes); systemctl --failed;
  ss -ltnp (what is actually listening); journalctl -p err -b --no-pager | tail.
- USE per resource (CPU / memory / disk / network): check Utilization, Saturation, Errors -
  the first Error found is often the cause; saturation usually hurts before utilization hits 100%.
- Root cause != symptom: "restarted the service" is mitigation, not a cause. Keep going until ONE
  hypothesis is confirmed by a specific evidence line and the cause is technical (WHY it failed).
- PARTIAL failure = bisect by OPERATION, not by service up/down: when one action works and a related
  one fails (reads succeed but writes/INSERTs fail; health 200 but a feature errors; service active but
  the customer test fails; a process runs but emits stale/no data), the service is NOT down - the fault
  is a specific permission, privilege, config value, or dependency on the FAILING path. Reproduce the
  exact failing customer action, read its specific error, and fix that path - do not restart blindly.
- DURABLE fix: a runtime-only change (start without enable, /run drop-in, in-memory) does NOT survive
  reboot. Durable = on-disk config under /etc + enable the unit + daemon-reload. Minimal & reversible:
  a targeted one-line / one-path change - never blanket or recursive changes on system roots.
- VALIDATE the EXACT customer operation the ticket describes (the failing endpoint returns the expected
  code, the write/INSERT now succeeds, the dependency is reachable, the data is fresh/increasing) AND
  persistence: the unit is is-enabled and the fix survives a restart/reboot, AND existing customer data
  was preserved (never destroyed to "fix" a permission). A process showing "active" alone is NOT proof.
- If a RUNBOOK block is provided in the input, use its diagnose commands, root-cause list, durable-fix
  vs anti-pattern, and "avoid" guidance for this symptom class - but still verify on the live box.
`.trim();

interface Runbook {
  id: string;
  keywords: string[];
  digest: string;
}

// Compact, generic digests (Diagnose -> Root causes -> Durable fix vs anti-pattern ->
// Validate -> Avoid) - one per symptom class. Faithful to knowledge/runbooks/*.
const RUNBOOKS: readonly Runbook[] = [
  {
    id: "systemd-services",
    keywords: [
      "service",
      "unit",
      "systemctl",
      "start",
      "won't start",
      "wont start",
      "crash",
      "crash-loop",
      "failed",
      "masked",
      "daemon",
      "exit code",
      "restart",
      "timer",
      "enable",
      "enabled",
      "disabled",
      ".service",
      "boot",
      "override",
      "drop-in",
      "environment",
      "stale",
    ],
    digest: `RUNBOOK systemd & service lifecycle (won't start, crash-loop, masked, deps, DISABLED, bad drop-in):
Diagnose: systemctl --failed; systemctl status UNIT --no-pager -l; systemctl is-enabled/is-active UNIT;
journalctl -xeu UNIT -n 100 --no-pager; systemctl cat UNIT (effective MERGED unit incl. drop-ins - read it carefully);
systemctl show UNIT -p Result,ExecMainStatus,ExecMainCode,NRestarts,Environment. Field tells: LoadState=masked->blocked;
is-enabled=disabled->won't start on boot (the fault may simply be a stopped+disabled unit); Result=exit-code->app exited
non-zero; Result=start-limit-hit->rate-limited (cause is UPSTREAM); Result=oom-kill->OOM; activating(auto-restart)->crash-loop.
Root causes: unit stopped AND disabled (won't come back after reboot); bad ExecStart path / binary not executable;
non-zero app exit (config error, missing dep/file/port); unit masked; failed dependency; OOM-killed;
*** BAD DROP-IN OVERRIDE *** - the vendor unit is fine but an override injects a wrong value: 'systemctl cat UNIT' shows
a [Service] line (Environment=/ExecStart=/User=) that came from /etc/systemd/system/UNIT.d/*.conf or /run/.../UNIT.d/*.conf;
the service runs but mis-behaves (points at the wrong endpoint/path) -> the override IS the cause.
Durable fix: for a disabled unit, systemctl enable --now UNIT. For a bad override, correct or REMOVE the offending drop-in
file then systemctl daemon-reload + restart. Otherwise fix the on-disk unit/config under /etc (or add a correct
/etc/systemd/system/UNIT.d/override.conf) + daemon-reload + enable --now; unmask if masked. NOT durable: 'start' alone,
/run drop-ins, set-environment.
Validate: systemctl is-active AND is-enabled UNIT; the service's functional test passes; restart UNIT and re-test.
Avoid: editing vendor units in /lib (use an /etc drop-in); masking to "fix"; restarting unrelated units.`,
  },
  {
    id: "networking-web-tls",
    keywords: [
      "port",
      "bind",
      "listen",
      "firewall",
      "ufw",
      "iptables",
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
      "certificate",
      "https",
      "http",
      "web",
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
    digest: `RUNBOOK networking / web / TLS / name-resolution (ports, bind, firewall, DNS, /etc/hosts, 502/504, certs):
Diagnose: ss -ltnp (is it listening, on which address:port, which pid); curl -sS -o /dev/null -w '%{http_code}'
http://localhost:PORT/ (test locally, bypass the proxy); ufw status / iptables -S (firewall);
*** NAME RESOLUTION *** getent hosts NAME (shows the EFFECTIVE answer incl. /etc/hosts, which wins over DNS via nsswitch);
cat /etc/hosts (a wrong or stale 'IP  hostname' line silently routes a dependency to the wrong/black-hole IP);
resolvectl status / dig NAME (DNS proper); then curl/nc the dependency by name AND by expected IP to localise the break.
journalctl -u <proxy/client svc>; nginx -t / apachectl configtest; openssl x509 -enddate -noout -in <cert> (expiry).
Root causes: bound to 127.0.0.1 only (not 0.0.0.0); firewall blocking the port; *** wrong /etc/hosts entry pointing a
dependency hostname at a bad IP ***; DNS failure; wrong/expired cert; upstream/dependency down -> 502; slow -> 504.
Durable fix: for a bad /etc/hosts line, correct it to the right IP (or remove the stale override so DNS resolves);
correct the listen/bind directive + reload (nginx -t then nginx -s reload); ufw allow <port> (targeted - NEVER disable
the firewall); renew/replace cert + reload; bring up/repair the dependency.
Validate: resolve the name to the correct IP (getent hosts NAME) AND curl the dependency endpoint succeeds from the
client service; the customer feature works end-to-end; restart and re-test.
Avoid: ufw disable / iptables -F (hard-fail); chmod 777 on web roots; blanket-rewriting /etc/hosts; swapping certs without a reload.`,
  },
  {
    id: "resource-exhaustion",
    keywords: [
      "disk",
      "inode",
      "no space",
      "space",
      "full",
      "read-only",
      "readonly",
      "read only",
      "log",
      "oom",
      "memory",
      "out of memory",
      "swap",
      "cpu",
      "load",
      "fd",
      "file descriptor",
      "too many open",
      "137",
      "killed",
    ],
    digest: `RUNBOOK resource exhaustion (disk, inodes, read-only fs, log growth, OOM, swap, CPU, FDs):
Diagnose: df -h AND df -i (inodes - either at 100% breaks writes); du -xsh /var/* | sort -h (find the consumer);
dmesg -T | grep -iE 'oom|killed process|read-only|I/O error'; free -m (available + swap); journalctl --disk-usage;
ulimit -n or cat /proc/<pid>/limits (FDs); uptime + top -b -n1 (load/CPU).
Root causes: disk or inode full (often runaway logs) -> writes fail / service won't start / fs remounted read-only;
OOM killer terminated the process (exit 137); FD limit hit ('too many open files'); CPU saturation/runaway.
Durable fix (disk): rotate/compress via logrotate -f, gzip, or move a large file off-volume; cap the journal with
SystemMaxUse in journald.conf; delete a SPECIFIC large non-audit file. (OOM): fix the leak or set a sane
MemoryMax/restart policy in a unit drop-in. (FDs): raise LimitNOFILE in a drop-in. Then enable + restart.
Validate: df -h / df -i back under threshold; the service writes succeed; functional test passes; survives restart.
Avoid: rm -rf on /var/log or system dirs (hard-fail; wipes the audit trail); truncating audit logs; chmod -R 777.`,
  },
  {
    id: "data-access-scheduling",
    keywords: [
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
      "scheduled",
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
    digest: `RUNBOOK data / access / scheduling (DB privileges, file perms, sudo, cron-timers, app config, AppArmor/SELinux):
Diagnose: (db up?) systemctl status postgresql|mysql; sudo -u postgres psql -c '\\l' or mysqladmin ping; tail the db log;
ss -ltnp | grep -E '5432|3306'. (auth) pg_hba.conf. (*** DB PRIVILEGES - reads work but writes fail ***) connect AS the
app role and reproduce the failing statement to read the exact error; in psql: \\dp <table> and \\z <table> show table
grants, \\ds shows sequences. An INSERT into a SERIAL/identity column needs USAGE,SELECT on the OWNING SEQUENCE, not just
INSERT on the table - so SELECT can succeed while INSERT fails with 'permission denied for sequence'. Check the role's
grants on BOTH the table and its sequence(s). (perms) ls -ld <path>; namei -l <path>; id <svc-user> - compare ownership/mode
to the service user; for an upload/data dir the service user must be able to WRITE. (sudo) sudo -n true. (cron) systemctl
list-timers; journalctl -u <timer>; crontab -l. (MAC) aa-status/getenforce; journalctl | grep -iE 'apparmor|denied|avc'.
Root causes: db not listening / wrong auth; *** role missing privilege on the write path (sequence USAGE for INSERT, or
table INSERT/UPDATE) ***; file/dir owned by the wrong user or wrong mode -> 'permission denied' on write; MAC denial;
cron/timer not enabled or wrong schedule; app config pointing at the wrong host/port/socket.
Durable fix: GRANT the minimal missing privilege to the role (e.g. GRANT USAGE, SELECT ON SEQUENCE <seq> TO <role>; and/or
GRANT INSERT ON <table> TO <role>;) - consider ALTER DEFAULT PRIVILEGES for future objects; targeted chown <svc-user>:<grp>
<specific path> + least-privilege chmod (NEVER recursive 777, and preserve existing files); fix pg_hba/my.cnf + reload;
systemctl enable --now UNIT.timer; correct the on-disk app config; add a specific MAC rule.
Validate: connect AS the app role and the failing statement (INSERT/UPDATE) now succeeds; the service user can write the dir
AND existing data is intact; the scheduled job runs; functional test passes; survives restart.
Avoid: GRANT ALL / superuser as a shortcut; chmod -R 777 or blanket chown; deleting/recreating data or dropping the DB to
"fix" a permission (hard-fail - destroys customer data); disabling AppArmor/SELinux.`,
  },
];

export const RUNBOOK_IDS = RUNBOOKS.map((r) => r.id);

// Cheap keyword router: return the most relevant runbook digest(s) for a symptom
// (ticket text + observations), capped to `max`. Returns '' when nothing matches
// (the method alone then applies). Mirrors knowledge/README's "retrieve the
// relevant slice, don't dump all four" wiring guidance.
export function selectRunbooks(symptomText: string, max = 2): string {
  const t = symptomText.toLowerCase();
  const scored = RUNBOOKS.map((r) => ({
    r,
    score: r.keywords.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
  return scored.map((x) => x.r.digest).join("\n\n");
}
