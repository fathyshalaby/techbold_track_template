import { classifyCommand } from "./classifier.js";
import { RiskLevel } from "./risk-levels.js";

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
  {
    ruleName: "rm-rf-system-paths",
    pattern:
      /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|--recursive)\s+(-[a-zA-Z]+\s+)*([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot|\/var\/lib)/i,
    reason: "Recursive force-delete on system or data paths is forbidden",
  },
  {
    ruleName: "rm-rf-system-paths",
    pattern:
      /\brm\b.*\s(-[a-zA-Z]*r[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*)\s+.*(-[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*r[a-zA-Z]*)\s+([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: "Recursive force-delete on system or data paths is forbidden",
  },
  {
    ruleName: "rm-rf-system-paths",
    pattern:
      /\brm\b.*--(recursive|force).*--(recursive|force)\s+(-[a-zA-Z]+\s+)*([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: "Recursive force-delete (long flags) on system or data paths is forbidden",
  },
  {
    ruleName: "rm-rf-system-paths",
    pattern:
      /\brm\b.*--recursive\s+(-[a-zA-Z]+\s+)*([\/~\.]|\.\.|\.|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: "Recursive delete (long flags) on system or data paths is forbidden",
  },

  {
    ruleName: "recursive-find-delete",
    pattern: /\bfind\b.*(\/etc|\/var|\/home|\/srv|\/usr|\/boot|\/).*-delete/i,
    reason: "Recursive find -delete over system directories is forbidden",
  },
  {
    ruleName: "recursive-find-delete",
    pattern: /\bfind\b[^;&|]*-exec(?:dir)?\s+(rm|shred|chmod|chown|mv|dd)\b/i,
    reason: "find -exec with a destructive command is forbidden",
  },
  {
    ruleName: "recursive-find-delete",
    pattern: /\bxargs\b[^;&|]*\b(rm|shred|chmod|chown)\b/i,
    reason: "xargs into a destructive command is forbidden",
  },

  {
    ruleName: "disk-wipe",
    pattern: /\b(mkfs\.\w+|mke2fs|wipefs|shred)\b/i,
    reason: "Disk formatting or wiping commands are forbidden",
  },
  {
    ruleName: "disk-wipe",
    pattern: /\bdd\b.*\bof=\/dev\//i,
    reason: "Writing to block device via dd is forbidden",
  },

  {
    ruleName: "block-device-write",
    pattern: />\s*\/dev\/(sd[a-z]|hd[a-z])/i,
    reason: "Direct writes to block devices are forbidden",
  },

  {
    ruleName: "shutdown-reboot",
    pattern: /\b(shutdown|reboot|halt|poweroff)\b/i,
    reason: "Shutdown and reboot commands require explicit approval as the final fix step",
  },
  {
    ruleName: "shutdown-reboot",
    pattern: /\binit\s+(0|6)\b/,
    reason: "init 0/6 triggers shutdown or reboot",
  },

  {
    ruleName: "fork-bomb",
    pattern: /:\(\)\s*\{/,
    reason: "Fork bomb pattern detected",
  },

  {
    ruleName: "broad-chmod-chown",
    // World-writable (the `7` "other" triad) is never a correct fix. Match 777 with
    // any octal prefix (0777, 1777 sticky, 2777/4777/6777 setuid/setgid) so
    // `chmod 0777` cannot slip the `\b777\b` boundary.
    pattern: /\bchmod\b[^;&|]*\b[0-7]{0,2}777\b/i,
    reason: "chmod 777 (world-writable) is forbidden - use a least-privilege mode",
  },
  {
    ruleName: "broad-chmod-chown",
    // Symbolic world-writable forms (chmod a+rwx, o+w, ugo+rwx, +rwx).
    pattern: /\bchmod\b[^;&|]*\b(?:a|o|ugo)?\+(?:rwx|w)\b/i,
    reason: "chmod granting world-write (symbolic +w/+rwx) is forbidden",
  },
  {
    ruleName: "broad-chmod-chown",
    pattern:
      /\bch(?:own|mod)\s+(?:-[a-zA-Z]+\s+|[0-7]{3,4}\s+|[^\s\/]+\s+)*\/(?:etc|usr|var|home|srv|opt|boot|bin|sbin|lib|lib64|root|dev|proc|sys|mnt|media)?\/?(?:\s|$)/i,
    reason: "chmod/chown on the filesystem root or a bare system directory is forbidden",
  },
  {
    ruleName: "broad-chmod-chown",
    pattern:
      /\bch(?:own|mod)\b[^;&|]*-[a-zA-Z]*R[a-zA-Z]*[^;&|]*\s\/(?:etc|boot|bin|sbin|lib|lib64|root|dev|proc|sys)(?:\/|\s|$)/i,
    reason: "Recursive chmod/chown under a critical system directory is forbidden",
  },
  {
    ruleName: "broad-chmod-chown",
    pattern: /\bch(?:own|mod)\b[^;&|]*-[a-zA-Z]*R[a-zA-Z]*[^;&|]*\s\/usr\/(?!local(?:\/|\s|$))/i,
    reason: "Recursive chmod/chown under /usr (except /usr/local) is forbidden",
  },

  {
    ruleName: "disable-security",
    pattern: /\bufw\b[^;&|]*\bdisable\b/i,
    reason: "Disabling the firewall is forbidden",
  },
  {
    ruleName: "disable-security",
    pattern: /\bservice\s+(ufw|firewalld|auditd|apparmor|fail2ban)\s+stop\b/i,
    reason: "Stopping a security service via `service` is forbidden",
  },
  {
    ruleName: "disable-security",
    // Flush the firewall ruleset (any table): iptables -F / --flush / -t nat -F, ip6tables.
    pattern: /\bip6?tables\b[^;&|]*\s(?:-F|--flush)\b/i,
    reason: "Flushing firewall rules is forbidden",
  },
  {
    ruleName: "disable-security",
    // Default-ACCEPT policy effectively disables filtering.
    pattern: /\bip6?tables\b[^;&|]*-P\s+\w+\s+ACCEPT\b/i,
    reason: "Setting a firewall chain policy to ACCEPT (disabling filtering) is forbidden",
  },
  {
    ruleName: "disable-security",
    // nftables: `nft flush ruleset` / `nft flush table …`.
    pattern: /\bnft\b[^;&|]*\bflush\b/i,
    reason: "Flushing the nftables ruleset is forbidden",
  },
  {
    ruleName: "disable-security",
    pattern: /\bsetenforce\s+0\b/i,
    reason: "Disabling SELinux enforcement is forbidden",
  },
  {
    ruleName: "disable-security",
    // Flag-tolerant: `systemctl disable --now ufw`, `systemctl stop -f firewalld`, etc.
    pattern:
      /\bsystemctl\b[^;&|]*\b(?:stop|disable|mask)\b[^;&|]*\b(auditd|firewalld|ufw|nftables|iptables|apparmor|fail2ban|aide)\b/i,
    reason: "Stopping or masking security services is forbidden",
  },

  {
    ruleName: "privilege-escalation",
    pattern:
      /\bsudo\b(?:\s+(?:-[A-Za-z]+|-u\s+\S+|--[A-Za-z-]+(?:=\S+)?|[A-Za-z_]+=\S+))*\s+(?:su|bash|sh|zsh|fish|ksh|csh|tcsh|dash)\b/i,
    reason: "Gaining an interactive root shell via sudo is forbidden",
  },
  {
    ruleName: "privilege-escalation",
    pattern: /\bsudo\b[^;&|]*\s(?:-i|-s|--login|--shell)\b/i,
    reason: "sudo interactive/login shell is forbidden",
  },
  {
    ruleName: "privilege-escalation",
    pattern: /\bsu\b(\s+-)?(\s+(root|-l|--login))*\s*$/,
    reason: "Switching to root user is forbidden",
  },

  {
    ruleName: "reverse-shell",
    pattern: /\/dev\/(tcp|udp)\//i,
    reason: "Bash /dev/tcp|udp reverse shell is forbidden",
  },
  {
    ruleName: "reverse-shell",
    pattern: /\bbash\s+.*>&\s*\/dev\//i,
    reason: "Bash I/O redirect to /dev/ is a reverse shell indicator",
  },
  {
    ruleName: "inline-interpreter",
    pattern:
      /\b(python3?|perl|ruby|lua)\s+-[ce]\b|\bnode\s+(?:-e|-p|--eval|--print)\b|\bphp\s+-r\b/i,
    reason: "Inline interpreter one-liners can execute arbitrary code and are forbidden",
  },
  {
    ruleName: "inline-interpreter",
    pattern: /\b[gm]?awk\b[^;&|]*\bsystem\s*\(/i,
    reason: "awk system() executes arbitrary commands and is forbidden",
  },

  {
    ruleName: "setuid-setgid",
    pattern: /\bchmod\b.*[+][sS]/i,
    reason: "Setting setuid or setgid bit is forbidden",
  },
  {
    ruleName: "setuid-setgid",
    pattern: /\bchmod\b\s+[2467][0-9]{3}/i,
    reason: "chmod with setuid/setgid numeric mode (2xxx, 4xxx, 6xxx, 7xxx) is forbidden",
  },

  {
    ruleName: "secret-exposure",
    pattern: /\bcat\s+\/etc\/shadow\b/i,
    reason: "Reading /etc/shadow exposes hashed passwords",
  },
  {
    ruleName: "secret-exposure",
    pattern: /\bcat\s+~\/\.ssh\/id_/i,
    reason: "Reading SSH private keys is forbidden",
  },
  {
    ruleName: "secret-exposure",
    pattern: /\bcat\s+.*\/proc\/self\/environ\b/i,
    reason: "Reading process environment exposes all secrets including tokens",
  },
  {
    ruleName: "secret-exposure",
    pattern: /\bcat\s+(~\/\.env|\.\/\.env|\/etc\/environment)\b/i,
    reason: "Reading .env or system environment files exposes secrets",
  },
  {
    ruleName: "secret-exposure",
    pattern: /\bcat\s+\/etc\/passwd\b/i,
    reason: "Reading /etc/passwd is forbidden",
  },
  {
    ruleName: "secret-exposure",
    pattern: /\b(printenv|env)\b/i,
    reason: "printenv/env may expose secrets; use specific non-secret reads instead",
  },

  {
    ruleName: "secret-file-access",
    pattern: /\/etc\/(shadow|gshadow)\b/i,
    reason: "Accessing the shadow password file (any command) is forbidden",
  },
  {
    ruleName: "secret-file-access",
    pattern: /\/etc\/ssh\/ssh_host_[a-z0-9]+_key\b/i,
    reason: "Accessing SSH host private keys is forbidden",
  },
  {
    ruleName: "secret-file-access",
    pattern: /(?:^|[\s\/=])id_(rsa|dsa|ecdsa|ed25519)\b|\.ssh\/[^\s]*id_/i,
    reason: "Accessing SSH private keys is forbidden",
  },
  {
    ruleName: "secret-file-access",
    pattern: /\/proc\/(self|\d+)\/environ\b/i,
    reason: "Reading process environment (any command) exposes secrets",
  },
  {
    ruleName: "secret-file-access",
    pattern: /(?:^|[\s\/=])\.env(?:\.[\w-]+)?(?=$|[\s|;&])|\/etc\/environment\b/i,
    reason: "Reading .env or system environment files (any command) exposes secrets",
  },
  {
    ruleName: "secret-file-access",
    pattern:
      /\.aws\/credentials\b|\.pgpass\b|\.netrc\b|\.kube\/config\b|\.docker\/config\.json\b|\.git-credentials\b|\.npmrc\b|\.netlify\b|\.azure\/|gcloud\/[^\s]*credentials/i,
    reason: "Accessing a cloud/service credential file (any command) is forbidden",
  },
  {
    ruleName: "secret-file-access",
    pattern: /\/root\/\.[A-Za-z]/i,
    reason: "Accessing root's home dotfiles is forbidden",
  },

  {
    ruleName: "hide-tracks",
    pattern: /\bhistory\s+-c\b/i,
    reason: "Clearing shell history to hide actions is forbidden",
  },
  {
    ruleName: "hide-tracks",
    pattern: /\btruncate\b.*\/var\/log\//i,
    reason: "Truncating log files is forbidden",
  },
  {
    ruleName: "hide-tracks",
    pattern: /\bjournalctl\s+--vacuum/i,
    reason: "Vacuuming journal logs to hide evidence is forbidden",
  },
  {
    ruleName: "hide-tracks",
    pattern: /\brm\b.*(\/var\/log\/|~\/\.bash_history)/i,
    reason: "Deleting log files or shell history is forbidden",
  },
  {
    ruleName: "hide-tracks",
    pattern: />\s*\/var\/log\//i,
    reason: "Truncating a log file via redirect is forbidden",
  },
  {
    ruleName: "hide-tracks",
    pattern: /echo\s+.*>\s*~\/\.bash_history/i,
    reason: "Overwriting shell history is forbidden",
  },

  {
    ruleName: "exfiltration",
    pattern: /\b(curl|wget)\b.*\|\s*(ba)?sh\b/i,
    reason: "Piping remote content into a shell is forbidden",
  },
  {
    ruleName: "exfiltration",
    pattern: /\b(nc|netcat|ncat)\b/i,
    reason: "Netcat is forbidden - use curl for probes",
  },
  {
    ruleName: "exfiltration",
    pattern: /\bsocat\b/i,
    reason: "socat (reverse/bind shells, tunnels) is forbidden - use curl for probes",
  },

  {
    ruleName: "db-destruction",
    pattern: /\bDROP\s+(DATABASE|TABLE)\b/i,
    reason: "Dropping databases or tables is forbidden",
  },
  {
    ruleName: "db-destruction",
    pattern: /\bTRUNCATE\b/i,
    reason: "TRUNCATE on database tables is forbidden",
  },
  {
    ruleName: "db-destruction",
    pattern: /\bdropdb\b/i,
    reason: "dropdb destroys the entire database",
  },
  {
    ruleName: "db-destruction",
    pattern: /\brm\b.*\/var\/lib\/(postgresql|mysql)\b/i,
    reason: "Deleting database data directories is forbidden",
  },

  {
    ruleName: "mass-kill",
    pattern: /\bkill\s+-9\s+-1\b/,
    reason: "kill -9 -1 kills all processes and is forbidden",
  },
  {
    ruleName: "mass-kill",
    pattern: /\bkill\s+(-\d+\s+)?1\b/,
    reason: "Killing PID 1 (init) is forbidden",
  },

  // ── Interactive editors / TUIs (non-interactive SSH) ─────────────────────
  {
    ruleName: "interactive-tui",
    pattern: /\bsystemctl\s+edit\b(?!.*--stdin)/i,
    reason:
      "systemctl edit opens an interactive editor; write a drop-in under /etc/systemd/system/ with tee instead",
  },
  {
    ruleName: "interactive-tui",
    pattern: /\bcrontab\s+-e\b/i,
    reason: "crontab -e is interactive; use a file under /etc/cron.d/ instead",
  },
  {
    ruleName: "interactive-tui",
    pattern: /\bvisudo\b/i,
    reason: "visudo is interactive",
  },
  {
    ruleName: "interactive-tui",
    pattern: /\b(vi|vim|nano|emacs)\b/i,
    reason: "Interactive editors cannot run over non-interactive SSH",
  },
  {
    ruleName: "interactive-tui",
    pattern: /\b(less|more|man)\b/i,
    reason: "Interactive pagers cannot run over non-interactive SSH",
  },
  {
    ruleName: "interactive-tui",
    pattern: /\btop\b(?!\s+-b\b)/i,
    reason: "Interactive top cannot run over non-interactive SSH; use top -b -n1",
  },
];

function splitSegments(cmd: string): string[] {
  return cmd
    .split(/\|\||&&|;|\||&/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function normalizeCommand(cmd: string): string {
  let result = cmd
    .trim()
    .replace(/[\r\n]+/g, " ; ")
    .replace(/\s+/g, " ")
    .replace(/['"]/g, "");

  result = result.replace(/\$\(echo\s+([^)]+)\)/g, "$1");
  if (/\$\([^)]*\S[^)]*\)|`[^`]*`/.test(result)) {
    return `__UNRESOLVABLE__ ${result}`;
  }
  if (/\$\{[^}]+\}|\$[A-Za-z_][A-Za-z0-9_]*/.test(result)) {
    return `__UNRESOLVABLE__ ${result}`;
  }

  return result;
}

export function normalizeCommandForCompare(command: string): string {
  return normalizeCommand(command);
}

export function validateCommandAgainstPolicy(command: string): PolicyResult {
  const normalized = normalizeCommand(command);

  if (normalized.startsWith("__UNRESOLVABLE__")) {
    return {
      allowed: false,
      riskLevel: RiskLevel.HIGH_RISK_BLOCKED,
      matchedRule: "unresolvable-wrapper",
      reason: "Command contains unresolvable subshell or variable - blocked conservatively",
    };
  }

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

  const riskLevel = classifyCommand(command);
  return { allowed: true, riskLevel };
}
