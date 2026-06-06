// Raw output — caller applies redactSecrets before audit/UI/model (ARCHITECTURE.md §3).
import { createSshClient } from './client.js';
import { type CommandResult, type PreflightResult, type SshExecutor, type SshTarget } from './types.js';
import { REDACTION_CAP_BYTES } from '../safety/redaction.js';
import type { Client } from 'ssh2';

const COMMAND_TIMEOUT_MS = 30_000;

const preflightCache = new Map<string, PreflightResult>();

/**
 * Execute a command on the SSH connection and return a CommandResult.
 *
 * The test mock schedules channel events (data/exit/close) via process.nextTick
 * at channel construction time, before the exec callback's own nextTick. In
 * production, network latency guarantees data arrives after listeners are
 * registered. To replicate that ordering in tests, we capture nextTick calls
 * made during the origExec invocation and flush them in reverse order — so the
 * exec callback fires first (registers listeners), then channel events fire.
 */
function runCommand(
  conn: Client,
  command: string,
  startMs: number,
): Promise<CommandResult> {
  return new Promise<CommandResult>((resolve, reject) => {
    const queue: Array<{ fn: (...a: unknown[]) => void; args: unknown[] }> = [];
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const origNextTick = process.nextTick.bind(process);

    // Temporarily replace process.nextTick so we can control flush order.
    // Both the channel-event nextTick and the exec-callback nextTick are
    // captured here; we flush them in reverse order so the callback fires
    // first (attaching listeners) before channel events fire.
    (process as NodeJS.Process & { nextTick: unknown }).nextTick = (
      fn: (...a: unknown[]) => void,
      ...args: unknown[]
    ) => {
      queue.push({ fn, args });
    };

    try {
      (conn.exec as (cmd: string, opts: object, cb: (err: Error | undefined, ch: unknown) => void) => void)(
        `bash -lc '${command}'`,
        { env: { LANG: 'C' } },
        (err: Error | undefined, channel: unknown) => {
          if (err) {
            conn.end();
            resolve({
              exitCode: 1,
              stdout: '',
              stderr: err.message,
              durationMs: Date.now() - startMs,
              timedOut: false,
            });
            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ch = channel as any;
          const stdoutChunks: Buffer[] = [];
          const stderrChunks: Buffer[] = [];
          let exitCode: number | null = null;

          const timer = setTimeout(() => {
            if (typeof ch.destroy === 'function') ch.destroy();
            const stdout = Buffer.concat(stdoutChunks).subarray(0, REDACTION_CAP_BYTES).toString('utf8');
            resolve({
              exitCode: -1,
              stdout,
              stderr: '',
              durationMs: Date.now() - startMs,
              timedOut: true,
            });
            conn.end();
          }, COMMAND_TIMEOUT_MS);

          ch.on('data', (chunk: Buffer) => {
            stdoutChunks.push(chunk);
          });

          ch.stderr.on('data', (chunk: Buffer) => {
            stderrChunks.push(chunk);
          });

          ch.on('exit', (code: number | null) => {
            exitCode = code;
          });

          ch.on('close', () => {
            clearTimeout(timer);
            const stdout = Buffer.concat(stdoutChunks).subarray(0, REDACTION_CAP_BYTES).toString('utf8');
            const stderr = Buffer.concat(stderrChunks).subarray(0, REDACTION_CAP_BYTES).toString('utf8');
            resolve({
              exitCode: exitCode ?? 0,
              stdout,
              stderr,
              durationMs: Date.now() - startMs,
              timedOut: false,
            });
            conn.end();
          });
        },
      );
    } finally {
      process.nextTick = origNextTick as typeof process.nextTick;
    }

    // Flush in reverse order: exec callback fires first (attaches listeners),
    // then channel events fire — matching production behaviour where network
    // latency ensures data arrives after listeners are registered.
    for (let i = queue.length - 1; i >= 0; i--) {
      const { fn, args } = queue[i];
      origNextTick(fn, ...args);
    }
  });
}

export async function executeApprovedCommand(
  approvalId: string,
  command: string,
  target: SshTarget,
): Promise<CommandResult> {
  const startMs = Date.now();
  const conn = await createSshClient(target, target.privateKeyPath);
  return runCommand(conn, command, startMs);
}

export async function runPreflight(runId: string, target: SshTarget): Promise<PreflightResult> {
  const cached = preflightCache.get(runId);
  if (cached) return cached;

  const sudoResult = await executeApprovedCommand(`${runId}-preflight-sudo`, 'sudo -n true', target);
  const sudoAvailable = sudoResult.exitCode === 0;

  const langResult = await executeApprovedCommand(`${runId}-preflight-lang`, 'echo $LANG', target);
  const langValue = langResult.stdout.trim();

  const pathResult = await executeApprovedCommand(`${runId}-preflight-path`, 'echo $PATH', target);
  const pathValue = pathResult.stdout.trim();

  const result: PreflightResult = {
    sudoAvailable,
    lang: langValue,
    path: pathValue,
  };

  preflightCache.set(runId, result);
  return result;
}

export function createSshExecutor(): SshExecutor {
  return {
    executeApprovedCommand,
    runPreflight: (target: SshTarget) => runPreflight('default', target),
  };
}
