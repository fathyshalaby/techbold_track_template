import type { ClientChannel } from "ssh2";
import { REDACTION_CAP_BYTES } from "../safety/redaction.js";
import { openSshConnection } from "./client.js";
import { acquireConnection, dropConnection } from "./pool.js";
import type {
  CommandResult,
  ConnectionTestResult,
  PreflightResult,
  SshExecutor,
  SshTarget,
} from "./types.js";

export const COMMAND_TIMEOUT_MS = 30_000;
const OUTPUT_CAP_BYTES = REDACTION_CAP_BYTES;

export function wrapCommand(command: string): string {
  const escaped = command.replace(/'/g, "'\\''");
  return `bash -lc '${escaped}'`;
}

function capToUtf8(chunks: Buffer[], capBytes: number): string {
  const joined = Buffer.concat(chunks);
  const sliced = joined.length > capBytes ? joined.subarray(0, capBytes) : joined;
  return sliced.toString("utf8");
}

const SIGNAL_NUMBERS: Record<string, number> = {
  HUP: 1,
  INT: 2,
  QUIT: 3,
  ILL: 4,
  TRAP: 5,
  ABRT: 6,
  BUS: 7,
  FPE: 8,
  KILL: 9,
  USR1: 10,
  SEGV: 11,
  USR2: 12,
  PIPE: 13,
  ALRM: 14,
  TERM: 15,
};

function signalToExitCode(signalName: string): number {
  const bare = signalName.replace(/^SIG/i, "").toUpperCase();
  return 128 + (SIGNAL_NUMBERS[bare] ?? 0);
}

export async function executeApprovedCommand(
  _approvalId: string,
  command: string,
  target: SshTarget,
): Promise<CommandResult> {
  const startedAt = Date.now();
  const client = await acquireConnection(target);

  return new Promise<CommandResult>((resolve) => {
    let settled = false;
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let stdoutLen = 0;
    let stderrLen = 0;
    let exitCode = -1;
    let timedOut = false;

    const finalize = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        exitCode,
        stdout: capToUtf8(stdoutChunks, OUTPUT_CAP_BYTES),
        stderr: capToUtf8(stderrChunks, OUTPUT_CAP_BYTES),
        durationMs: Math.max(0, Date.now() - startedAt),
        timedOut,
      });
    };

    let activeChannel: ClientChannel | undefined;

    const timer = setTimeout(() => {
      timedOut = true;
      exitCode = 124;
      try {
        activeChannel?.signal("KILL");
      } catch {
        /* server may not support signals - fall through to dropConnection() */
      }
      dropConnection(target);
      finalize();
    }, COMMAND_TIMEOUT_MS);

    client.exec(wrapCommand(command), { env: { LANG: "C" } }, (err, channel: ClientChannel) => {
      if (err || !channel) {
        exitCode = -1;
        stderrChunks.push(
          Buffer.from(err ? `exec failed: ${err.message}` : "exec failed: no channel"),
        );
        stderrLen = stderrChunks[0].length;
        finalize();
        return;
      }

      activeChannel = channel;

      channel.on("data", (chunk: Buffer) => {
        if (stdoutLen >= OUTPUT_CAP_BYTES) return;
        stdoutChunks.push(chunk);
        stdoutLen += chunk.length;
      });
      channel.stderr.on("data", (chunk: Buffer) => {
        if (stderrLen >= OUTPUT_CAP_BYTES) return;
        stderrChunks.push(chunk);
        stderrLen += chunk.length;
      });
      channel.on("exit", (code: number | null, signalName?: string) => {
        if (typeof code === "number") exitCode = code;
        else if (signalName) exitCode = signalToExitCode(signalName); // killed by signal (OOM/segfault/…)
      });
      channel.on("close", () => finalize());

      channel.end();
    });
  });
}

export async function runPreflight(target: SshTarget): Promise<PreflightResult> {
  const sudo = await executeApprovedCommand("preflight:sudo", "sudo -n true", target);
  const pathProbe = await executeApprovedCommand("preflight:path", 'echo "$PATH"', target);
  return {
    sudoAvailable: sudo.exitCode === 0 && !sudo.timedOut,
    lang: "C",
    path: pathProbe.stdout.trim(),
  };
}

export async function testSshConnection(target: SshTarget): Promise<ConnectionTestResult> {
  const startedAt = Date.now();
  try {
    const client = await openSshConnection(target);
    client.end();
    return { reachable: true, latencyMs: Date.now() - startedAt };
  } catch {
    return { reachable: false, latencyMs: Date.now() - startedAt };
  }
}

export class RealSshExecutor implements SshExecutor {
  executeApprovedCommand(
    approvalId: string,
    command: string,
    target: SshTarget,
  ): Promise<CommandResult> {
    return executeApprovedCommand(approvalId, command, target);
  }

  runPreflight(target: SshTarget): Promise<PreflightResult> {
    return runPreflight(target);
  }

  testConnection(target: SshTarget): Promise<ConnectionTestResult> {
    return testSshConnection(target);
  }
}

export function createRealSshExecutor(): SshExecutor {
  return new RealSshExecutor();
}
