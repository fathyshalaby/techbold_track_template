// Mock SSH executor - no ssh2 dependency. Used for offline demo and CI.
import type {
  CommandResult,
  ConnectionTestResult,
  PreflightResult,
  SshExecutor,
  SshTarget,
} from "./types.js";

export const MOCK_SSH_FIXTURES: Record<string, CommandResult> = {
  "uname -a": {
    stdout:
      "Linux vm-01 5.15.0-1034-azure #41-Ubuntu SMP Fri Feb 10 19:59:48 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux",
    stderr: "",
    exitCode: 0,
    durationMs: 42,
    timedOut: false,
  },
  "systemctl status status-api --no-pager": {
    stdout:
      "● status-api.service - Status API\n   Loaded: loaded (/etc/systemd/system/status-api.service; enabled)\n   Active: failed (Result: exit-code)\n  Process: 1234 ExecStart=/usr/bin/node /srv/status-api/index.js (code=exited, status=1/FAILURE)\n",
    stderr: "",
    exitCode: 3,
    durationMs: 55,
    timedOut: false,
  },
  "journalctl -u status-api -n 100 --no-pager": {
    stdout:
      "Jun 06 08:00:01 vm-01 node[1234]: Error: EADDRINUSE: address already in use :::8080\nJun 06 08:00:01 vm-01 systemd[1]: status-api.service: Main process exited, code=exited, status=1/FAILURE\n",
    stderr: "",
    exitCode: 0,
    durationMs: 61,
    timedOut: false,
  },
  "ss -tulpn": {
    stdout:
      'Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port\ntcp   LISTEN 0      511    0.0.0.0:8080       0.0.0.0:*       users:(("node",pid=999,fd=6))\n',
    stderr: "",
    exitCode: 0,
    durationMs: 38,
    timedOut: false,
  },
  "sudo kill -9 999": {
    stdout: "",
    stderr: "",
    exitCode: 0,
    durationMs: 44,
    timedOut: false,
  },
  "sudo systemctl restart status-api": {
    stdout: "",
    stderr: "",
    exitCode: 0,
    durationMs: 120,
    timedOut: false,
  },
  "sudo systemctl enable status-api": {
    stdout:
      "Created symlink /etc/systemd/system/multi-user.target.wants/status-api.service -> /etc/systemd/system/status-api.service.",
    stderr: "",
    exitCode: 0,
    durationMs: 55,
    timedOut: false,
  },
  "systemctl is-active status-api": {
    stdout: "active",
    stderr: "",
    exitCode: 0,
    durationMs: 33,
    timedOut: false,
  },
  'curl -s -o /dev/null -w "%{http_code}" localhost:8080': {
    stdout: "200",
    stderr: "",
    exitCode: 0,
    durationMs: 88,
    timedOut: false,
  },
  "df -h": {
    stdout:
      "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        30G   8.1G   20G  29% /\n",
    stderr: "",
    exitCode: 0,
    durationMs: 28,
    timedOut: false,
  },
  "free -m": {
    stdout:
      "              total        used        free      shared  buff/cache   available\nMem:           7986        1234        5421          42        1330        6509\nSwap:          2047           0        2047\n",
    stderr: "",
    exitCode: 0,
    durationMs: 25,
    timedOut: false,
  },
};

export const DEFAULT_FALLBACK_RESULT: CommandResult = {
  stdout: "command completed (no output)",
  stderr: "",
  exitCode: 0,
  durationMs: 10,
  timedOut: false,
};

export class MockSshExecutor implements SshExecutor {
  private readonly preflightCache = new Map<string, PreflightResult>();

  async executeApprovedCommand(
    _approvalId: string,
    command: string,
    _target: SshTarget,
  ): Promise<CommandResult> {
    return Promise.resolve(MOCK_SSH_FIXTURES[command] ?? DEFAULT_FALLBACK_RESULT);
  }

  async runPreflight(_target: SshTarget): Promise<PreflightResult> {
    const cacheKey = `${_target.host}:${_target.port}:${_target.username}`;
    const cached = this.preflightCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const result: PreflightResult = {
      sudoAvailable: true,
      lang: "C",
      path: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    };
    this.preflightCache.set(cacheKey, result);
    return result;
  }

  async testConnection(_target: SshTarget): Promise<ConnectionTestResult> {
    return Promise.resolve({ reachable: true, latencyMs: 1 });
  }
}

export function createMockSshExecutor(): SshExecutor {
  return new MockSshExecutor();
}
