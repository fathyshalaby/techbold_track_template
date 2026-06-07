// Encoded operational knowledge for the diagnostic agents — distilled from
// `knowledge/` (diagnostic_playbook.md + runbooks/ + safety/command-policy.md),
// itself built from Brendan Gregg's USE method, the Google SRE book, and
// systemd/nginx/postgres/Ubuntu docs. `knowledge/` stays the human-readable
// source of truth; this module is the machine-encoded slice the agents run on.
//
// GENERALISATION (hard rule): this is METHOD + per-symptom RUNBOOKS, never
// incident answers. No ticket IDs, hostnames, ports, or symptom strings are
// hardcoded — grading uses fresh VMs and penalises hardcoding. The agent reasons
// FROM a proven procedure; it does not pattern-match a memorised fix.

export const DIAGNOSTIC_METHOD = `
TROUBLESHOOTING METHOD — follow it; reason from it; do not guess:
Loop: TRIAGE -> ISOLATE (USE) -> ROOT CAUSE (5 Whys) -> DURABLE FIX -> VALIDATE -> DOCUMENT.
- Recent changes first: a system that just broke usually broke because something CHANGED
  (deploy, config edit, package update, cert rotation, disk filling). Check journal timestamps
  and recent errors before exotic theories.
- Hypothesize -> test cheaply (read-only) -> bisect: each probe should halve the search space;
  a clean check is informative (it rules out a branch).
- Never ASSUME a tool, path, port, service, or unit exists — verify it on the box first
  (which <tool>; test -e <path>; systemctl cat <unit>). Stock Ubuntu only; install nothing.
- 60-second triage sweep (use what is present, skip absent tools): uptime; dmesg -T | tail
  (OOM / I/O error / remount-ro / segfault — high value); df -h; df -i (inodes); systemctl --failed;
  ss -ltnp (what is actually listening); journalctl -p err -b --no-pager | tail.
- USE per resource (CPU / memory / disk / network): check Utilization, Saturation, Errors —
  the first Error found is often the cause; saturation usually hurts before utilization hits 100%.
- Root cause != symptom: "restarted the service" is mitigation, not a cause. Keep going until ONE
  hypothesis is confirmed by a specific evidence line and the cause is technical (WHY it failed).
- DURABLE fix: a runtime-only change (start without enable, /run drop-in, in-memory) does NOT survive
  reboot. Durable = on-disk config under /etc + enable the unit + daemon-reload. Minimal & reversible:
  a targeted one-line / one-path change — never blanket or recursive changes on system roots.
- VALIDATE with a customer-benefit functional test (an endpoint returns the expected code, a DB accepts
  a connection, a job completes) AND a persistence check (restart the unit, re-run the test). A process
  showing "active" alone is NOT proof of customer benefit.
- If a RUNBOOK block is provided in the input, use its diagnose commands, root-cause list, durable-fix
  vs anti-pattern, and "avoid" guidance for this symptom class — but still verify on the live box.
`.trim();

interface Runbook {
  id: string;
  keywords: string[];
  digest: string;
}

// Compact, generic digests (Diagnose -> Root causes -> Durable fix vs anti-pattern ->
// Validate -> Avoid) — one per symptom class. Faithful to knowledge/runbooks/*.
const RUNBOOKS: readonly Runbook[] = [
  {
    id: 'systemd-services',
    keywords: [
      'service', 'unit', 'systemctl', 'start', "won't start", 'wont start', 'crash', 'crash-loop',
      'failed', 'masked', 'daemon', 'exit code', 'restart', 'timer', 'enable', '.service', 'boot',
    ],
    digest: `RUNBOOK systemd & service lifecycle (won't start, crash-loop, masked, deps, timers):
Diagnose: systemctl --failed; systemctl status UNIT --no-pager -l; systemctl is-enabled/is-active UNIT;
journalctl -xeu UNIT -n 100 --no-pager; systemctl cat UNIT (effective merged unit incl. drop-ins);
systemctl show UNIT -p Result,ExecMainStatus,ExecMainCode,NRestarts. Field tells: LoadState=masked->blocked;
Result=exit-code->app exited non-zero; Result=start-limit-hit->rate-limited (cause is UPSTREAM, the limiter is
just the brake); Result=oom-kill->OOM; ActiveState=activating(auto-restart)->crash-looping.
Root causes: bad ExecStart path / binary not executable; non-zero app exit (config error, missing dep/file/port);
unit masked; failed dependency; OOM-killed.
Durable fix: correct on-disk unit/config under /etc (or a drop-in /etc/systemd/system/UNIT.d/override.conf) +
systemctl daemon-reload + systemctl enable --now UNIT; systemctl unmask if masked. NOT durable: 'start' alone,
/run drop-ins, set-environment.
Validate: systemctl is-active && is-enabled UNIT; the service's functional test passes; restart UNIT and re-test.
Avoid: editing vendor units in /lib (use an /etc drop-in); masking to "fix"; restarting unrelated units.`,
  },
  {
    id: 'networking-web-tls',
    keywords: [
      'port', 'bind', 'listen', 'firewall', 'ufw', 'iptables', 'dns', 'resolve', 'refused', 'nginx',
      'apache', '502', '504', 'tls', 'ssl', 'cert', 'certificate', 'https', 'http', 'web', 'proxy',
      'curl', 'connection', 'timeout', 'unreachable',
    ],
    digest: `RUNBOOK networking / web / TLS (ports, bind, firewall, DNS, 502/504, certs):
Diagnose: ss -ltnp (is it listening, on which address:port, which pid); curl -sS -o /dev/null -w '%{http_code}'
http://localhost:PORT/ (test locally, bypass the proxy); ufw status / iptables -S (firewall); resolvectl status
or getent hosts NAME (DNS); journalctl -u <proxy>; nginx -t / apachectl configtest (config syntax);
openssl x509 -enddate -noout -in <cert> (expiry); openssl s_client -connect HOST:443 (chain).
Root causes: bound to 127.0.0.1 only (not 0.0.0.0); firewall blocking the port; wrong/expired cert or missing
intermediate; upstream down -> 502; upstream slow/timeout -> 504; DNS failure; config syntax error.
Durable fix: correct the listen/bind directive in the on-disk config + reload (nginx -t then nginx -s reload);
ufw allow <port> (targeted — NEVER disable the firewall); renew/replace cert + reload; fix the upstream.
Validate: curl the real endpoint returns the expected status from the intended interface; restart and re-test.
Avoid: ufw disable / iptables -F (hard-fail); chmod 777 on web roots; swapping certs without a reload.`,
  },
  {
    id: 'resource-exhaustion',
    keywords: [
      'disk', 'inode', 'no space', 'space', 'full', 'read-only', 'readonly', 'read only', 'log',
      'oom', 'memory', 'out of memory', 'swap', 'cpu', 'load', 'fd', 'file descriptor',
      'too many open', '137', 'killed',
    ],
    digest: `RUNBOOK resource exhaustion (disk, inodes, read-only fs, log growth, OOM, swap, CPU, FDs):
Diagnose: df -h AND df -i (inodes — either at 100% breaks writes); du -xsh /var/* | sort -h (find the consumer);
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
    id: 'data-access-scheduling',
    keywords: [
      'postgres', 'postgresql', 'mysql', 'mariadb', 'database', 'db', 'sql', 'permission', 'denied',
      'chown', 'chmod', 'owner', 'sudo', 'cron', 'crontab', 'schedule', 'scheduled', 'apparmor',
      'selinux', 'config', 'access', '5432', '3306', 'socket',
    ],
    digest: `RUNBOOK data / access / scheduling (DBs, file perms, sudo, cron-timers, app config, AppArmor/SELinux):
Diagnose: (db) systemctl status postgresql|mysql; sudo -u postgres psql -c '\\l' or mysqladmin ping; tail the db log;
ss -ltnp | grep -E '5432|3306'. (perms) ls -ld <path>; namei -l <path>; id <svc-user> — compare ownership to the
service user. (sudo) sudo -n true. (cron) systemctl list-timers; journalctl -u <timer>; crontab -l. (MAC) aa-status
or getenforce; journalctl | grep -iE 'apparmor|denied|avc'. (config) the app's own config file + its error log.
Root causes: db not listening / wrong auth (pg_hba.conf); file/dir owned by the wrong user -> 'permission denied';
AppArmor/SELinux denial; cron/timer not enabled or wrong schedule/path; app config pointing at the wrong host/port/socket.
Durable fix: targeted chown <svc-user>:<grp> <specific path> / chmod with a least-privilege mode (never recursive 777
on system roots); fix pg_hba/my.cnf + reload; systemctl enable --now UNIT.timer; correct the on-disk app config; add a
specific MAC rule (do not blanket-disable AppArmor/SELinux).
Validate: the access succeeds AS the service user; the scheduled job runs on time; functional test passes; survives restart.
Avoid: chmod -R 777 or blanket chown on /; dropping/altering customer DBs or data (hard-fail); disabling AppArmor/SELinux.`,
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
  return scored.map((x) => x.r.digest).join('\n\n');
}
