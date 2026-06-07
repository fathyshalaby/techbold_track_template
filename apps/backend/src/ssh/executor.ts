// SSH executor - runs ONE approved command on the target VM and returns a
// structured result. Backend-only: NEVER registered as a model tool (§A1).
// The executor returns RAW output; the CALLER applies redactSecrets() before
// anything reaches the audit log, UI, or model (data-flow §3).
import type { ClientChannel } from "ssh2";
import { REDACTION_CAP_BYTES } from "../safety/redaction.js";
import { openSshConnection } from "./client.js";
import type {
  CommandResult,
  ConnectionTestResult,
  PreflightResult,
  SshExecutor,
  SshTarget,
} from "./types.js";

export const COMMAND_TIMEOUT_MS = 30_000;
// Reuse the redaction cap as the per-stream output cap (16 KB) - a single
// constant for "the most bytes we ever keep from one command stream".
const OUTPUT_CAP_BYTES = REDACTION_CAP_BYTES;

// Wrap for deterministic, non-interactive execution: `bash -lc` gives a login
// shell (stable PATH); LANG=C forces parseable C-locale output. Single-quote the
// command and escape embedded single quotes ('->'\'').
export function wrapCommand(command: string): string {
  const escaped = command.replace(/'/g, "'\\''");
  return `bash -lc '${escaped}'`;
}

function capToUtf8(chunks: Buffer[], capBytes: number): string {
  const joined = Buffer.concat(chunks);
  const sliced = joined.length > capBytes ? joined.subarray(0, capBytes) : joined;
  return sliced.toString("utf8");
}

// POSIX signal name -> number (ssh2 reports the name WITHOUT the SIG prefix on
// the exit-signal channel message, RFC 4254 §6.10).
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

// When the remote process is killed by a signal, ssh2's 'exit' gives a null code
// plus a signal name. Encode it the way bash itself does - exit = 128 + signum -
// so an OOM kill surfaces as 137 (SIGKILL) and a segfault as 139 (SIGSEGV)
// instead of a meaningless -1. Unknown signals still flag "killed" via 128.
function signalToExitCode(signalName: string): number {
  const bare = signalName.replace(/^SIG/i, "").toUpperCase();
  return 128 + (SIGNAL_NUMBERS[bare] ?? 0);
}

// Execute a single approved command. Resolves with a CommandResult for normal
// completion AND for timeout/exec-channel failure (so the run loop can observe
// and continue). Rejects only when the connection itself cannot be established.
export async function executeApprovedCommand(
  _approvalId: string,
  command: string,
  target: SshTarget,
): Promise<CommandResult> {
  const startedAt = Date.now();
  const client = await openSshConnection(target);

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
      try {
        client.end();
      } catch {
        /* already closed */
      }
      resolve({
        exitCode,
        stdout: capToUtf8(stdoutChunks, OUTPUT_CAP_BYTES),
        stderr: capToUtf8(stderrChunks, OUTPUT_CAP_BYTES),
        durationMs: Math.max(0, Date.now() - startedAt),
        timedOut,
      });
    };

    let activeChannel: ClientChannel | undefined;

    // Kill the channel and resolve with timedOut=true on overrun - never hang.
    const timer = setTimeout(() => {
      timedOut = true;
      // 124 mirrors coreutils `timeout`, so it never collides with the -1 used
      // for an exec-channel failure or with a real process exit code.
      exitCode = 124;
      // Best-effort: ask the remote to kill the runaway process before we drop
      // the transport, so it can't keep running on the VM after we move on.
      try {
        activeChannel?.signal("KILL");
      } catch {
        /* server may not support signals - fall through to client.end() */
      }
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

      // Close our (write) half immediately: we never send stdin. Without this, a
      // command that reads stdin (e.g. `grep pattern` with no file, `cat`, `sort`,
      // `wc`) blocks forever waiting for input and only resolves at the 30s kill -
      // a "forgot the filename" slip would burn 30s of a graded run. EOF makes it
      // exit at once. The read half (stdout/stderr) stays open.
      channel.end();
    });
  });
}

// Per-run preflight: confirm passwordless sudo, force LANG=C, capture PATH.
// `sudo -n true` never prompts; a non-zero result means sudo is unavailable -
// NON-FATAL (record the capability so the agent can ask), never a hang (G7).
export async function runPreflight(target: SshTarget): Promise<PreflightResult> {
  const sudo = await executeApprovedCommand("preflight:sudo", "sudo -n true", target);
  const pathProbe = await executeApprovedCommand("preflight:path", 'echo "$PATH"', target);
  return {
    sudoAvailable: sudo.exitCode === 0 && !sudo.timedOut,
    lang: "C",
    path: pathProbe.stdout.trim(),
  };
}

// Connectivity preflight: open + immediately close a connection, measure latency.
// Never throws — returns reachable:false with a redacted message instead, so a UI
// preflight can't crash the run.
export async function testConnection(target: SshTarget): Promise<ConnectionTestResult> {
  const start = Date.now();
  try {
    const client = await openSshConnection(target);
    client.end();
    return { reachable: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      reachable: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "connection failed",
    };
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
    return testConnection(target);
  }
}

export function createRealSshExecutor(): SshExecutor {
  return new RealSshExecutor();
}
