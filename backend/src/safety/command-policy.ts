import { RiskLevel } from './risk-levels.js';
import { classifyCommand } from './classifier.js';

export type BlocklistRule = {
  pattern: RegExp;
  ruleName: string;
  reason: string;
};

export type PolicyResult = {
  allowed: boolean;
  riskLevel: RiskLevel;
  matchedRule?: string;
  reason?: string;
};

export const BLOCKLIST: ReadonlyArray<BlocklistRule> = [
  // ── rm -rf on system/data paths ──────────────────────────────────────────
  {
    ruleName: 'rm-rf-system-paths',
    pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|--recursive)\s+(-[a-zA-Z]+\s+)*([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot|\/var\/lib)/i,
    reason: 'Recursive force-delete on system or data paths is forbidden',
  },
  // Catch rm with flags in any order: rm -fr, rm -rf
  {
    ruleName: 'rm-rf-system-paths',
    pattern: /\brm\b.*\s(-[a-zA-Z]*r[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*)\s+.*(-[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*r[a-zA-Z]*)\s+([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: 'Recursive force-delete on system or data paths is forbidden',
  },
  // Long-form flags: --recursive --force (both orders) on system/data paths
  {
    ruleName: 'rm-rf-system-paths',
    pattern: /\brm\b.*--(recursive|force).*--(recursive|force)\s+(-[a-zA-Z]+\s+)*([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: 'Recursive force-delete (long flags) on system or data paths is forbidden',
  },
  // --recursive alone is sufficient to delete non-empty dirs
  {
    ruleName: 'rm-rf-system-paths',
    pattern: /\brm\b.*--recursive\s+(-[a-zA-Z]+\s+)*([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: 'Recursive delete (long flags) on system or data paths is forbidden',
  },

  // ── Recursive find -delete over system paths ─────────────────────────────
  {
    ruleName: 'recursive-find-delete',
    pattern: /\bfind\b.*(\/etc|\/var|\/home|\/srv|\/usr|\/boot|\/).*-delete/i,
    reason: 'Recursive find -delete over system directories is forbidden',
  },
  {
    ruleName: 'recursive-find-delete',
    // `find … -exec rm/shred/chmod/chown … {}` and `find … -execdir …` route
    // around the -delete rule by spawning a destructive command per match.
    pattern: /\bfind\b[^;&|]*-exec(?:dir)?\s+(rm|shred|chmod|chown|mv|dd)\b/i,
    reason: 'find -exec with a destructive command is forbidden',
  },
  {
    ruleName: 'recursive-find-delete',
    // `… | xargs rm/shred/chmod/chown` — the same destructive intent via a pipe.
    pattern: /\bxargs\b[^;&|]*\b(rm|shred|chmod|chown)\b/i,
    reason: 'xargs into a destructive command is forbidden',
  },

  // ── Disk wipe ─────────────────────────────────────────────────────────────
  {
    ruleName: 'disk-wipe',
    pattern: /\b(mkfs\.\w+|mke2fs|wipefs|shred)\b/i,
    reason: 'Disk formatting or wiping commands are forbidden',
  },
  {
    ruleName: 'disk-wipe',
    pattern: /\bdd\b.*\bof=\/dev\//i,
    reason: 'Writing to block device via dd is forbidden',
  },

  // ── Direct block device writes ────────────────────────────────────────────
  {
    ruleName: 'block-device-write',
    pattern: />\s*\/dev\/(sd[a-z]|hd[a-z])/i,
    reason: 'Direct writes to block devices are forbidden',
  },

  // ── Shutdown / reboot ─────────────────────────────────────────────────────
  {
    ruleName: 'shutdown-reboot',
    pattern: /\b(shutdown|reboot|halt|poweroff)\b/i,
    reason: 'Shutdown and reboot commands require explicit approval as the final fix step',
  },
  {
    ruleName: 'shutdown-reboot',
    pattern: /\binit\s+(0|6)\b/,
    reason: 'init 0/6 triggers shutdown or reboot',
  },

  // ── Fork bomb ─────────────────────────────────────────────────────────────
  {
    ruleName: 'fork-bomb',
    pattern: /:\(\)\s*\{/,
    reason: 'Fork bomb pattern detected',
  },

  // ── Broad / dangerous chmod / chown ───────────────────────────────────────
  // Design note (ops lens): the ONLY chmod/chown hard-fail is world-writable
  // (777). Recursive chown / non-777 recursive chmod on an APPLICATION path
  // (/var/www/html, /srv/app, /home/<u>/app, /opt/app, /usr/local/app) is a
  // routine, legitimate permission repair — blocking it would cripple
  // troubleshooting. Those pass through to human approval (MEDIUM); only the
  // filesystem root, bare top-level dirs, and critical system trees are blocked.
  {
    ruleName: 'broad-chmod-chown',
    // 777 (world-writable) is never a correct fix — recursive or not.
    pattern: /\bchmod\b[^;&|]*\b777\b/i,
    reason: 'chmod 777 (world-writable) is forbidden — use a least-privilege mode',
  },
  {
    ruleName: 'broad-chmod-chown',
    // chmod/chown on the filesystem root `/` or a BARE top-level directory
    // (no deeper app subpath). Consumes leading flags / numeric mode / owner
    // tokens, then requires the target to be root or a bare system dir.
    pattern: /\bch(?:own|mod)\s+(?:-[a-zA-Z]+\s+|[0-7]{3,4}\s+|[^\s\/]+\s+)*\/(?:etc|usr|var|home|srv|opt|boot|bin|sbin|lib|lib64|root|dev|proc|sys|mnt|media)?\/?(?:\s|$)/i,
    reason: 'chmod/chown on the filesystem root or a bare system directory is forbidden',
  },
  {
    ruleName: 'broad-chmod-chown',
    // Recursive chmod/chown anywhere under a never-touch system tree. The `\s`
    // before the slash anchors the match to a TOP-LEVEL component, so that an
    // app path that merely contains a system name mid-path (e.g. /var/lib/myapp
    // contains "/lib/") is NOT caught.
    pattern: /\bch(?:own|mod)\b[^;&|]*-[a-zA-Z]*R[a-zA-Z]*[^;&|]*\s\/(?:etc|boot|bin|sbin|lib|lib64|root|dev|proc|sys)(?:\/|\s|$)/i,
    reason: 'Recursive chmod/chown under a critical system directory is forbidden',
  },
  {
    ruleName: 'broad-chmod-chown',
    // Recursive chmod/chown under /usr — except the /usr/local app prefix.
    pattern: /\bch(?:own|mod)\b[^;&|]*-[a-zA-Z]*R[a-zA-Z]*[^;&|]*\s\/usr\/(?!local(?:\/|\s|$))/i,
    reason: 'Recursive chmod/chown under /usr (except /usr/local) is forbidden',
  },

  // ── Disable security controls ─────────────────────────────────────────────
  {
    ruleName: 'disable-security',
    pattern: /\bufw\b[^;&|]*\bdisable\b/i,
    reason: 'Disabling the firewall is forbidden',
  },
  {
    ruleName: 'disable-security',
    pattern: /\bservice\s+(ufw|firewalld|auditd|apparmor|fail2ban)\s+stop\b/i,
    reason: 'Stopping a security service via `service` is forbidden',
  },
  {
    ruleName: 'disable-security',
    pattern: /\biptables\s+-F\b/i,
    reason: 'Flushing iptables rules is forbidden',
  },
  {
    ruleName: 'disable-security',
    pattern: /\bsetenforce\s+0\b/i,
    reason: 'Disabling SELinux enforcement is forbidden',
  },
  {
    ruleName: 'disable-security',
    pattern: /\bsystemctl\s+(stop|disable|mask)\s+(auditd|firewalld|ufw|apparmor|fail2ban|aide)\b/i,
    reason: 'Stopping or masking security services is forbidden',
  },

  // ── Privilege escalation ──────────────────────────────────────────────────
  {
    ruleName: 'privilege-escalation',
    // sudo escalating to an interactive shell, tolerating intervening options
    // (sudo -u root bash, sudo -H bash, sudo --preserve-env php). The option chain
    // only consumes flag-like / VAR=val tokens, so a real command in between
    // (e.g. `sudo apt install bash-completion`) breaks the chain before the shell
    // word and is NOT a false positive.
    pattern: /\bsudo\b(?:\s+(?:-[A-Za-z]+|-u\s+\S+|--[A-Za-z-]+(?:=\S+)?|[A-Za-z_]+=\S+))*\s+(?:su|bash|sh|zsh|fish|ksh|csh|tcsh|dash)\b/i,
    reason: 'Gaining an interactive root shell via sudo is forbidden',
  },
  {
    ruleName: 'privilege-escalation',
    // sudo's own interactive/login shell flags, regardless of intervening tokens.
    pattern: /\bsudo\b[^;&|]*\s(?:-i|-s|--login|--shell)\b/i,
    reason: 'sudo interactive/login shell is forbidden',
  },
  {
    ruleName: 'privilege-escalation',
    pattern: /\bsu\b(\s+-)?(\s+(root|-l|--login))*\s*$/,
    reason: 'Switching to root user is forbidden',
  },

  // ── Reverse shells ────────────────────────────────────────────────────────
  {
    ruleName: 'reverse-shell',
    pattern: /\/dev\/(tcp|udp)\//i,
    reason: 'Bash /dev/tcp|udp reverse shell is forbidden',
  },
  {
    ruleName: 'reverse-shell',
    pattern: /\bbash\s+.*>&\s*\/dev\//i,
    reason: 'Bash I/O redirect to /dev/ is a reverse shell indicator',
  },
  {
    ruleName: 'inline-interpreter',
    // python -c, perl/ruby/lua -e, node -e/-p/--eval, php -r — arbitrary code.
    // (GTFOBins: these are the canonical interpreter shell-escape vectors.)
    pattern: /\b(python3?|perl|ruby|lua)\s+-[ce]\b|\bnode\s+(?:-e|-p|--eval|--print)\b|\bphp\s+-r\b/i,
    reason: 'Inline interpreter one-liners can execute arbitrary code and are forbidden',
  },
  {
    ruleName: 'inline-interpreter',
    // awk/gawk/mawk system()/cmd-pipe — a classic GTFOBins exec escape that hides
    // an arbitrary command inside a "harmless" text-processing tool.
    pattern: /\b[gm]?awk\b[^;&|]*\bsystem\s*\(/i,
    reason: 'awk system() executes arbitrary commands and is forbidden',
  },

  // ── Setuid / setgid bit ───────────────────────────────────────────────────
  {
    ruleName: 'setuid-setgid',
    pattern: /\bchmod\b.*[+][sS]/i,
    reason: 'Setting setuid or setgid bit is forbidden',
  },
  {
    ruleName: 'setuid-setgid',
    pattern: /\bchmod\b\s+[2467][0-9]{3}/i,
    reason: 'chmod with setuid/setgid numeric mode (2xxx, 4xxx, 6xxx, 7xxx) is forbidden',
  },

  // ── Secret exposure ───────────────────────────────────────────────────────
  {
    ruleName: 'secret-exposure',
    pattern: /\bcat\s+\/etc\/shadow\b/i,
    reason: 'Reading /etc/shadow exposes hashed passwords',
  },
  {
    ruleName: 'secret-exposure',
    pattern: /\bcat\s+~\/\.ssh\/id_/i,
    reason: 'Reading SSH private keys is forbidden',
  },
  {
    ruleName: 'secret-exposure',
    pattern: /\bcat\s+.*\/proc\/self\/environ\b/i,
    reason: 'Reading process environment exposes all secrets including tokens',
  },
  {
    ruleName: 'secret-exposure',
    pattern: /\bcat\s+(~\/\.env|\.\/\.env|\/etc\/environment)\b/i,
    reason: 'Reading .env or system environment files exposes secrets',
  },
  {
    ruleName: 'secret-exposure',
    pattern: /\bcat\s+\/etc\/passwd\b/i,
    reason: 'Reading /etc/passwd is forbidden',
  },
  {
    ruleName: 'secret-exposure',
    // Block printenv and bare env outright — they can dump all env vars including secrets
    pattern: /\b(printenv|env)\b/i,
    reason: 'printenv/env may expose secrets; use specific non-secret reads instead',
  },

  // ── Secret-FILE access (ANY command/verb, not just `cat`) ──────────────────
  // The rules above keyed on `cat`; these block reading a secret PATH with any
  // reader (head/tac/less/grep/awk/xxd/strings/cp/scp/dd/redirect/…) or flag.
  {
    ruleName: 'secret-file-access',
    pattern: /\/etc\/(shadow|gshadow)\b/i,
    reason: 'Accessing the shadow password file (any command) is forbidden',
  },
  {
    ruleName: 'secret-file-access',
    pattern: /\/etc\/ssh\/ssh_host_[a-z0-9]+_key\b/i,
    reason: 'Accessing SSH host private keys is forbidden',
  },
  {
    ruleName: 'secret-file-access',
    pattern: /(?:^|[\s\/=])id_(rsa|dsa|ecdsa|ed25519)\b|\.ssh\/[^\s]*id_/i,
    reason: 'Accessing SSH private keys is forbidden',
  },
  {
    ruleName: 'secret-file-access',
    pattern: /\/proc\/(self|\d+)\/environ\b/i,
    reason: 'Reading process environment (any command) exposes secrets',
  },
  {
    ruleName: 'secret-file-access',
    pattern: /(?:^|[\s\/=])\.env(?:\.[\w-]+)?(?=$|[\s|;&])|\/etc\/environment\b/i,
    reason: 'Reading .env or system environment files (any command) exposes secrets',
  },
  {
    ruleName: 'secret-file-access',
    // Cloud / service credential files (any reader/verb). These are NOT under
    // /etc or ~/.ssh, so the rules above miss them — yet they leak long-lived
    // secrets whose shapes redaction can't fully catch. Block at the path.
    pattern: /\.aws\/credentials\b|\.pgpass\b|\.netrc\b|\.kube\/config\b|\.docker\/config\.json\b|\.git-credentials\b|\.npmrc\b|\.netlify\b|\.azure\/|gcloud\/[^\s]*credentials/i,
    reason: 'Accessing a cloud/service credential file (any command) is forbidden',
  },
  {
    ruleName: 'secret-file-access',
    // Reading dotfiles under root's home (tokens, histories, keys live here).
    pattern: /\/root\/\.[A-Za-z]/i,
    reason: "Accessing root's home dotfiles is forbidden",
  },

  // ── Hide tracks ───────────────────────────────────────────────────────────
  {
    ruleName: 'hide-tracks',
    pattern: /\bhistory\s+-c\b/i,
    reason: 'Clearing shell history to hide actions is forbidden',
  },
  {
    ruleName: 'hide-tracks',
    pattern: /\btruncate\b.*\/var\/log\//i,
    reason: 'Truncating log files is forbidden',
  },
  {
    ruleName: 'hide-tracks',
    pattern: /\bjournalctl\s+--vacuum/i,
    reason: 'Vacuuming journal logs to hide evidence is forbidden',
  },
  {
    ruleName: 'hide-tracks',
    pattern: /\brm\b.*(\/var\/log\/|~\/\.bash_history)/i,
    reason: 'Deleting log files or shell history is forbidden',
  },
  {
    ruleName: 'hide-tracks',
    // `> /var/log/x` or `: > /var/log/x` truncates a log via redirect
    pattern: />\s*\/var\/log\//i,
    reason: 'Truncating a log file via redirect is forbidden',
  },
  {
    ruleName: 'hide-tracks',
    pattern: /echo\s+.*>\s*~\/\.bash_history/i,
    reason: 'Overwriting shell history is forbidden',
  },

  // ── Exfiltration / remote code execution ──────────────────────────────────
  {
    ruleName: 'exfiltration',
    pattern: /\b(curl|wget)\b.*\|\s*(ba)?sh\b/i,
    reason: 'Piping remote content into a shell is forbidden',
  },
  {
    ruleName: 'exfiltration',
    // Block all nc/netcat/ncat usage — redirect, pipe, listener, and -e forms
    pattern: /\b(nc|netcat|ncat)\b/i,
    reason: 'Netcat is forbidden — use curl for probes',
  },
  {
    ruleName: 'exfiltration',
    // socat: reverse/bind shells, tunnels, and file transfer (GTFOBins). No
    // diagnostic use here — use curl/ss for probes.
    pattern: /\bsocat\b/i,
    reason: 'socat (reverse/bind shells, tunnels) is forbidden — use curl for probes',
  },

  // ── DB destruction ────────────────────────────────────────────────────────
  {
    ruleName: 'db-destruction',
    pattern: /\bDROP\s+(DATABASE|TABLE)\b/i,
    reason: 'Dropping databases or tables is forbidden',
  },
  {
    ruleName: 'db-destruction',
    pattern: /\bTRUNCATE\b/i,
    reason: 'TRUNCATE on database tables is forbidden',
  },
  {
    ruleName: 'db-destruction',
    pattern: /\bdropdb\b/i,
    reason: 'dropdb destroys the entire database',
  },
  {
    ruleName: 'db-destruction',
    pattern: /\brm\b.*\/var\/lib\/(postgresql|mysql)\b/i,
    reason: 'Deleting database data directories is forbidden',
  },

  // ── Mass kill ─────────────────────────────────────────────────────────────
  {
    ruleName: 'mass-kill',
    pattern: /\bkill\s+-9\s+-1\b/,
    reason: 'kill -9 -1 kills all processes and is forbidden',
  },
  {
    ruleName: 'mass-kill',
    pattern: /\bkill\s+(-\d+\s+)?1\b/,
    reason: 'Killing PID 1 (init) is forbidden',
  },
];

// Split a normalized command string on unescaped ;, &&, || separators.
// This is deliberately simple — no full shell parse, just enough to catch
// chained dangerous segments like `echo hi; rm -rf /etc`.
function splitSegments(cmd: string): string[] {
  // Split on ||, &&, ;, |, and a single & (background) — order matters: the
  // two-char ops (||, &&) are listed first so they win over | and &. A single &
  // backgrounds a command, so `safe & rm -rf /etc` is two commands; without it
  // the dangerous half could hide from a per-segment check.
  return cmd
    .split(/\|\||&&|;|\||&/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Collapse whitespace, strip wrapping quotes around tokens, handle $() wrappers.
// Returns the normalized string or a string prefixed with '__UNRESOLVABLE__ '
// if the command contains subshells that cannot be safely resolved.
function normalizeCommand(cmd: string): string {
  // 1. Trim
  let result = cmd.trim();

  // 2a. Treat newlines as command separators. A multi-line command string runs
  //     as multiple commands on the VM, so a trailing newline must not let an
  //     end-anchored rule (e.g. `su -$`) be evaded by `su -\nrm -rf /etc`.
  //     Convert to ';' BEFORE collapsing whitespace so splitSegments() sees them.
  result = result.replace(/[\r\n]+/g, ' ; ');

  // 2b. Collapse runs of whitespace to single space
  result = result.replace(/\s+/g, ' ');

  // 3. Strip ALL quote characters so embedded-quote obfuscation cannot hide a
  //    keyword or path from the blocklist (e.g. cat /etc/sh''adow, r"m" -rf /etc).
  //    Normalisation is detection-only — the original command is what executes.
  result = result.replace(/['"]/g, '');

  // 4. Handle $() and backtick subshell wrappers
  //    Simple literal: $(echo foo) → foo
  const simpleSubshell = /\$\(echo\s+([^)]+)\)/g;
  result = result.replace(simpleSubshell, '$1');

  // 5. If any remaining $( with content or backticks remain → unresolvable
  if (/\$\([^)]*\S[^)]*\)|`[^`]*`/.test(result)) {
    return `__UNRESOLVABLE__ ${result}`;
  }

  // 6. Variables like ${HOME} or $dir that remain unresolved → block conservatively
  if (/\$\{[^}]+\}|\$[A-Za-z_][A-Za-z0-9_]*/.test(result)) {
    return `__UNRESOLVABLE__ ${result}`;
  }

  return result;
}

export function validateCommandAgainstPolicy(command: string): PolicyResult {
  const normalized = normalizeCommand(command);

  // Unresolvable subshell / variable → block conservatively
  if (normalized.startsWith('__UNRESOLVABLE__')) {
    return {
      allowed: false,
      riskLevel: RiskLevel.HIGH_RISK_BLOCKED,
      matchedRule: 'unresolvable-wrapper',
      reason: 'Command contains unresolvable subshell or variable — blocked conservatively',
    };
  }

  // Check the full command AND each split segment against the blocklist.
  // Full-command check catches pipe-to-shell exfiltration (curl … | sh), where
  // the danger is the pipe itself; per-segment check catches a dangerous link in
  // a chain (echo hi; rm -rf /etc) that would otherwise hide behind a safe prefix.
  const candidates = [normalized, ...splitSegments(normalized)];

  for (const candidate of candidates) {
    for (const rule of BLOCKLIST) {
      if (rule.pattern.test(candidate)) {
        return {
          allowed: false,
          riskLevel: RiskLevel.HIGH_RISK_BLOCKED,
          matchedRule: rule.ruleName,
          reason: rule.reason,
        };
      }
    }
  }

  // No blocklist match — classify the command
  const riskLevel = classifyCommand(command);
  return { allowed: true, riskLevel };
}
