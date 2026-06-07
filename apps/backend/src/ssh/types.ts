export interface SshTarget {
  host: string;
  port: number;
  username: string;
  privateKeyPaths: string[];
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export interface PreflightResult {
  sudoAvailable: boolean;
  lang: string;
  path: string;
}

export interface ConnectionTestResult {
  reachable: boolean;
  latencyMs: number;
}

export class SshConnectionError extends Error {
  override name = "SSHConnectionError";

  constructor(
    message: string,
    public override cause?: unknown,
  ) {
    super(message);
    // Restore prototype chain broken by extending built-in Error in ES5 targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface SshExecutor {
  executeApprovedCommand(
    approvalId: string,
    command: string,
    target: SshTarget,
  ): Promise<CommandResult>;
  runPreflight(target: SshTarget): Promise<PreflightResult>;
  testConnection(target: SshTarget): Promise<ConnectionTestResult>;
}
