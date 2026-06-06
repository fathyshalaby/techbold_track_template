// SSH executor — runs ONE approved command on the target VM and returns a
// structured result. Backend-only: NEVER registered as a model tool (§A1).
// The executor returns RAW output; the CALLER applies redactSecrets() before
// anything reaches the audit log, UI, or model (data-flow §3).
import type { ClientChannel } from 'ssh2';
import { openSshConnection } from './client.js';
import { REDACTION_CAP_BYTES } from '../safety/redaction.js';
import type { CommandResult, PreflightResult, SshExecutor, SshTarget } from './types.js';

export const COMMAND_TIMEOUT_MS = 30_000;
// Reuse the redaction cap as the per-stream output cap (16 KB) — a single
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
  return sliced.toString('utf8');
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

    // Kill the channel and resolve with timedOut=true on overrun — never hang.
    const timer = setTimeout(() => {
      timedOut = true;
      exitCode = -1;
      finalize();
    }, COMMAND_TIMEOUT_MS);

    client.exec(wrapCommand(command), { env: { LANG: 'C' } }, (err, channel: ClientChannel) => {
      if (err || !channel) {
        exitCode = -1;
        stderrChunks.push(Buffer.from(err ? `exec failed: ${err.message}` : 'exec failed: no channel'));
        stderrLen = stderrChunks[0].length;
        finalize();
        return;
      }

      channel.on('data', (chunk: Buffer) => {
        if (stdoutLen >= OUTPUT_CAP_BYTES) return;
        stdoutChunks.push(chunk);
        stdoutLen += chunk.length;
      });
      channel.stderr.on('data', (chunk: Buffer) => {
        if (stderrLen >= OUTPUT_CAP_BYTES) return;
        stderrChunks.push(chunk);
        stderrLen += chunk.length;
      });
      channel.on('exit', (code: number | null) => {
        if (typeof code === 'number') exitCode = code;
      });
      channel.on('close', () => finalize());
    });
  });
}

// Per-run preflight: confirm passwordless sudo, force LANG=C, capture PATH.
// `sudo -n true` never prompts; a non-zero result means sudo is unavailable —
// NON-FATAL (record the capability so the agent can ask), never a hang (G7).
export async function runPreflight(target: SshTarget): Promise<PreflightResult> {
  const sudo = await executeApprovedCommand('preflight:sudo', 'sudo -n true', target);
  const pathProbe = await executeApprovedCommand('preflight:path', 'echo "$PATH"', target);
  return {
    sudoAvailable: sudo.exitCode === 0 && !sudo.timedOut,
    lang: 'C',
    path: pathProbe.stdout.trim(),
  };
}

export class RealSshExecutor implements SshExecutor {
  executeApprovedCommand(approvalId: string, command: string, target: SshTarget): Promise<CommandResult> {
    return executeApprovedCommand(approvalId, command, target);
  }

  runPreflight(target: SshTarget): Promise<PreflightResult> {
    return runPreflight(target);
  }
}

export function createRealSshExecutor(): SshExecutor {
  return new RealSshExecutor();
}
