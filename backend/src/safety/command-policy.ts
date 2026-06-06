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
    pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|--recursive)\s+(-[a-zA-Z]+\s+)*([\/~]|\/etc|\/var|\/home|\/srv|\/usr|\/boot|\/var\/lib)/i,
    reason: 'Recursive force-delete on system or data paths is forbidden',
  },
  // Catch rm with flags in any order: rm -fr, rm -rf
  {
    ruleName: 'rm-rf-system-paths',
    pattern: /\brm\b.*\s(-[a-zA-Z]*r[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*)\s+.*(-[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*r[a-zA-Z]*)\s+([\/~]|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: 'Recursive force-delete on system or data paths is forbidden',
  },

  // ── Recursive find -delete over system paths ─────────────────────────────
  {
    ruleName: 'recursive-find-delete',
    pattern: /\bfind\b.*(\/etc|\/var|\/home|\/srv|\/usr|\/boot|\/).*-delete/i,
    reason: 'Recursive find -delete over system directories is forbidden',
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

  // ── Broad chmod / chown ───────────────────────────────────────────────────
  {
    ruleName: 'broad-chmod-chown',
    // chmod -R 777 / or chmod 777 -R /etc etc.
    pattern: /\bchmod\b.*\b777\b.*\s(-R\s+|(-[a-zA-Z]*R[a-zA-Z]*)\s+)?(\/|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: 'Broad recursive 777 chmod on system paths is forbidden',
  },
  {
    ruleName: 'broad-chmod-chown',
    pattern: /\bchmod\b.*-[a-zA-Z]*R[a-zA-Z]*\b.*\b777\b/i,
    reason: 'Broad recursive 777 chmod is forbidden',
  },
  {
    ruleName: 'broad-chmod-chown',
    // chmod 777 -R /path or chmod -R 777 /path (any system path)
    pattern: /\bchmod\b\s+(\d+\s+-[a-zA-Z]*R[a-zA-Z]*|-[a-zA-Z]*R[a-zA-Z]*\s+\d+)\s+(\/|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: 'Recursive chmod on system paths is forbidden',
  },
  {
    ruleName: 'broad-chmod-chown',
    // Allow an optional owner:group argument between the flag and the path
    pattern: /\bchown\s+-[a-zA-Z]*R[a-zA-Z]*\s+(\S+\s+)?(\/|\/etc|\/var|\/home|\/srv|\/usr|\/boot)/i,
    reason: 'Broad recursive chown on system root or directories is forbidden',
  },

  // ── Disable security controls ─────────────────────────────────────────────
  {
    ruleName: 'disable-security',
    pattern: /\bufw\s+disable\b/i,
    reason: 'Disabling the firewall is forbidden',
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
    // printenv/env piped externally
    pattern: /\b(printenv|env)\b.*\|/i,
    reason: 'Piping environment variables to external commands risks secret exposure',
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
    // nc/netcat with -e (reverse shell)
    pattern: /\b(nc|netcat)\b.*-e\b/i,
    reason: 'Netcat reverse shell is forbidden',
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
  // Split on ||, &&, and ; — order matters: check two-char ops first
  return cmd
    .split(/\|\||&&|;/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Collapse whitespace, strip wrapping quotes around tokens, handle $() wrappers.
// Returns the normalized string or a string prefixed with '__UNRESOLVABLE__ '
// if the command contains subshells that cannot be safely resolved.
function normalizeCommand(cmd: string): string {
  // 1. Trim
  let result = cmd.trim();

  // 2. Collapse runs of whitespace to single space
  result = result.replace(/\s+/g, ' ');

  // 3. Strip wrapping single/double quotes around individual tokens
  //    e.g. 'rm' → rm, "chmod" → chmod
  result = result.replace(/(?<!\S)'([^\s']+)'(?!\S)/g, '$1');
  result = result.replace(/(?<!\S)"([^\s"]+)"(?!\S)/g, '$1');

  // 4. Handle $() and backtick subshell wrappers
  //    Simple literal: $(echo foo) → foo
  const simpleSubshell = /\$\(echo\s+([^)]+)\)/g;
  result = result.replace(simpleSubshell, '$1');

  // 5. If any remaining $( with content or backticks remain → unresolvable
  if (/\$\([^)]*\S[^)]*\)|`[^`]*`/.test(result)) {
    return `__UNRESOLVABLE__ ${result}`;
  }

  // 6. Variables like ${HOME} that remain unresolved → block conservatively
  if (/\$\{[^}]+\}|\$[A-Z_][A-Z0-9_]*/.test(result)) {
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

  // Split into segments and check each against the blocklist
  const segments = splitSegments(normalized);

  for (const segment of segments) {
    for (const rule of BLOCKLIST) {
      if (rule.pattern.test(segment)) {
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
