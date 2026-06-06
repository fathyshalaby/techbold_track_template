import { RiskLevel } from './risk-levels.js';

// Tight allowlist patterns for SAFE_READ_ONLY classification.
// Matches must be anchored — a command is only SAFE_READ_ONLY if it clearly
// fits one of these bounded, non-mutating shapes.
const SAFE_READ_ONLY_PATTERNS: RegExp[] = [
  // System info — no-arg or fixed-flag commands
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
  // journalctl — read variants
  /^journalctl\s+(-u\s+\S+|-p\s+\S+)(\s+.*)?$/,
  // curl read-only probes
  /^curl\s+-I\s+\S+$/,
  /^curl\s+-s\s+-o\s+\/dev\/null\s+-w\s+\S+\s+\S+$/,
  // File reads — non-secret paths only; secret-path rejection handled in policy
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
  const trimmed = command.trim();

  for (const pattern of SAFE_READ_ONLY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return RiskLevel.SAFE_READ_ONLY;
    }
  }

  for (const pattern of LOW_RISK_PATTERNS) {
    if (pattern.test(trimmed)) {
      return RiskLevel.LOW_RISK_CHANGE;
    }
  }

  return RiskLevel.MEDIUM_RISK_CHANGE;
}
