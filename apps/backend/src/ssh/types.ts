export interface SshTarget {
  host: string;
  port: number;
  username: string;
  // Candidate private keys, tried in order until one authenticates. Each VM in
  // the fleet has its own keypair, and at execution time we only know the host
  // (from the ticket), not which key matches - so we offer all of them and let
  // the server accept the right one. A single-element list is the common case.
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
}
