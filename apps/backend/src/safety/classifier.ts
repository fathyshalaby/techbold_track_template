import { RiskLevel } from "./risk-levels.js";

// Tight allowlist patterns for SAFE_READ_ONLY classification.
// Matches must be anchored - a command is only SAFE_READ_ONLY if it clearly
// fits one of these bounded, non-mutating shapes.
const SAFE_READ_ONLY_PATTERNS: RegExp[] = [
  // System info - no-arg or fixed-flag commands
  /^(uname(\s+-[a-zA-Z]+)*|uptime|whoami|id|hostnamectl)(\s|$)/,
  // Disk / memory
  /^df(\s+-[a-zA-Z]+)*$/,
  /^free(\s+-[a-zA-Z]+)*$/,
  /^lsblk(\s+.*)?$/,
  /^du\s+-sh\s+\S+$/,
  // Process / network
  /^ps(\s+.*)?$/,
  /^ss(\s+.*)?$/,
  /^ip\s+(a|addr)(\s|$)/,
  /^ping\s+-c\s+\d+\s+\S+$/,
  // systemctl read-only
  /^systemctl\s+(status|is-active|is-enabled)\s+\S+(\s+.*)?$/,
  // journalctl - read variants
  /^journalctl\s+(-u\s+\S+|-p\s+\S+)(\s+.*)?$/,
  // curl read-only probes
  /^curl\s+-I\s+\S+$/,
  /^curl\s+-s\s+-o\s+\/dev\/null\s+-w\s+\S+\s+\S+$/,
  // Config validation / version checks - inspect-only, never mutate state.
  // (nginx -t, apache configtest, sshd -t, etc. are standard read-only probes.)
  /^nginx\s+-t$/,
  /^(apachectl|apache2ctl)\s+(configtest|-t)$/,
  /^sshd\s+-t$/,
  /^named-checkconf(\s+\S+)?$/,
  /^postconf\s+-n$/,
  /^(php|node)\s+-v$/,
  /^python3?\s+--version$/,
  /^psql\s+--version$/,
  /^systemctl\s+--version$/,
  // File reads - non-secret paths only; secret-path rejection handled in policy
  /^cat\s+(?!.*\/etc\/shadow)(?!.*\/.ssh\/)(?!.*\.env)\S+$/,
  /^tail\s+-n\s+\d+\s+\S+$/,
  /^grep\s+\S+\s+\S+$/,
  /^ls(\s+-[a-zA-Z]+)*\s+\S+$/,
  /^stat\s+\S+$/,
  /^getfacl\s+\S+$/,
];

const LOW_RISK_PATTERNS: RegExp[] = [
  /^systemctl\s+(restart|start|enable)\s+\S+$/,
  // Non-recursive chown on a specific path
  /^chown\s+(?!-R\s)\S+\s+\S+$/,
  // Non-recursive chmod with a specific numeric mode on a specific path
  /^chmod\s+\d{3,4}\s+(?!.*\s+-R\s)(?!\/)(?!\~)\S+$/,
  /^mkdir(\s+-p)?\s+\S+$/,
  /^touch\s+\S+$/,
  /^cp\s+\S+\s+\S+$/,
  /^mv\s+\S+\s+\S+$/,
  /^sed\s+-i\s+.+\s+\S+$/,
];

export function classifyCommand(command: string): RiskLevel {
  // Defense-in-depth: classifyCommand is exported and may be called WITHOUT
  // first passing validateCommandAgainstPolicy (e.g. to render a risk badge in
  // the UI or to drive an auto-approve tier). It must therefore fail safe on its
  // own - never award SAFE_READ_ONLY / LOW_RISK_CHANGE to a command whose true
  // shape is hidden by quoting or shell expansion. The policy gate already does
  // this; mirroring it here closes the standalone-caller hole.
  const trimmed = command.trim();

  // 1. Any unresolved shell expansion ($VAR, ${VAR}, $(...), `...`) means we
  //    cannot know what the command actually targets - refuse to lower the risk.
  if (/\$\{?[A-Za-z_(]|`/.test(trimmed)) {
    return RiskLevel.MEDIUM_RISK_CHANGE;
  }

  // 2. Strip quote characters so embedded-quote obfuscation (cat /etc/sh''adow,
  //    'ls' /etc) cannot dodge the anchored allowlist patterns below.
  const normalized = trimmed.replace(/['"]/g, "").replace(/\s+/g, " ");

  for (const pattern of SAFE_READ_ONLY_PATTERNS) {
    if (pattern.test(normalized)) {
      return RiskLevel.SAFE_READ_ONLY;
    }
  }

  for (const pattern of LOW_RISK_PATTERNS) {
    if (pattern.test(normalized)) {
      return RiskLevel.LOW_RISK_CHANGE;
    }
  }

  return RiskLevel.MEDIUM_RISK_CHANGE;
}
