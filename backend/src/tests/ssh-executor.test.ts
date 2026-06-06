import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { REDACTION_CAP_BYTES } from '../safety/redaction.js';
import { executeApprovedCommand, runPreflight } from '../ssh/executor.js';
import { SshConnectionError, type SshTarget } from '../ssh/types.js';

// Cross-platform recursive scan for a substring in non-comment lines of a dir.
// Replaces a bash-only `execSync('grep … 2>/dev/null || true')` that threw under
// the Windows cmd.exe shell. Returns matching "file:line" entries (empty = none).
function grepDir(dir: string, needle: string): string[] {
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return []; // dir absent → nothing to match (same as grep on a missing path)
  }
  const hits: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      hits.push(...grepDir(full, needle));
    } else if (entry.isFile()) {
      readFileSync(full, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (line.trim().startsWith('//')) return; // skip comment-only lines
          if (line.includes(needle)) hits.push(`${full}:${i + 1}`);
        });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// ssh2 mock
// The factory must be self-contained — vi.mock is hoisted before all imports,
// so referencing any module-level variable (including EventEmitter) inside the
// factory would cause a TDZ error. We use require() inside the factory instead.
// ---------------------------------------------------------------------------

type ChannelOpts = {
  stdout: Buffer | null;
  stderr: Buffer | null;
  exitCode: number | null;
  // When true, the channel never emits 'exit' or 'close' — simulates timeout.
  hang?: boolean;
};

// Holds the channel factory for the current test; each test overrides it.
// Declared at module scope but only accessed from inside exec(), which runs
// after module initialization — safe from the hoist TDZ.
let channelFactory: () => ReturnType<typeof makeSshChannel>;

function makeSshChannel(opts: ChannelOpts) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EventEmitter } = require('node:events') as typeof import('node:events');
  const channel = new EventEmitter() as InstanceType<typeof EventEmitter> & {
    stderr: InstanceType<typeof EventEmitter>;
  };
  channel.stderr = new EventEmitter();

  process.nextTick(() => {
    if (opts.stdout !== null) channel.emit('data', opts.stdout);
    if (opts.stderr !== null) channel.stderr.emit('data', opts.stderr);
    if (!opts.hang) {
      channel.emit('exit', opts.exitCode ?? 0);
      channel.emit('close');
    }
  });

  return channel;
}

vi.mock('ssh2', () => {
  // require() is safe inside the factory — it resolves at call time, not hoist time.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EventEmitter } = require('node:events') as typeof import('node:events');

  class MockClient extends EventEmitter {
    connect(_config: unknown): void {
      process.nextTick(() => this.emit('ready'));
    }

    exec(
      _cmd: string,
      _opts: unknown,
      cb: (err: Error | undefined, ch: ReturnType<typeof makeSshChannel>) => void,
    ): void {
      // channelFactory is a module-level let; it is fully initialized by the time
      // exec() is actually called (after all imports have settled).
      const channel = channelFactory();
      // Deliver the channel SYNCHRONOUSLY so the caller attaches its data/exit/
      // close listeners before the channel's queued (nextTick) emits fire. This
      // mirrors real ssh2 — the exec callback runs first, then stream events
      // arrive. (The previous nextTick wrapper raced the channel's own emit tick
      // and dropped every event, so the executor never saw 'close'.)
      cb(undefined, channel);
    }

    end(): void {}
  }

  return { Client: MockClient };
});

// ---------------------------------------------------------------------------
// Shared SSH target — no real credentials needed; the mock intercepts ssh2.
// ---------------------------------------------------------------------------

const TARGET: SshTarget = {
  host: '127.0.0.1',
  port: 22,
  username: 'testuser',
  privateKeyPath: '/dev/null',
};

// ---------------------------------------------------------------------------
// Test groups
// ---------------------------------------------------------------------------

describe('ssh-executor', () => {

  describe('result shape', () => {
    beforeEach(() => {
      channelFactory = () =>
        makeSshChannel({ stdout: Buffer.from('Linux 5.15'), stderr: null, exitCode: 0 });
    });

    it('resolves with exitCode 0 for a successful command', async () => {
      const result = await executeApprovedCommand('appr-001', 'uname -a', TARGET);
      expect(result.exitCode).toBe(0);
    });

    it('resolves with stdout as a string', async () => {
      const result = await executeApprovedCommand('appr-001', 'uname -a', TARGET);
      expect(typeof result.stdout).toBe('string');
    });

    it('resolves with stderr as a string', async () => {
      const result = await executeApprovedCommand('appr-001', 'uname -a', TARGET);
      expect(typeof result.stderr).toBe('string');
    });

    it('resolves with non-negative durationMs', async () => {
      const result = await executeApprovedCommand('appr-001', 'uname -a', TARGET);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('resolves with timedOut === false for a normally completing command', async () => {
      const result = await executeApprovedCommand('appr-001', 'uname -a', TARGET);
      expect(result.timedOut).toBe(false);
    });

    it('result has exactly the 5 required fields and no extras', async () => {
      const result = await executeApprovedCommand('appr-001', 'uname -a', TARGET);
      const keys = Object.keys(result).sort();
      expect(keys).toEqual(['durationMs', 'exitCode', 'stderr', 'stdout', 'timedOut']);
    });
  });

  describe('output cap', () => {
    it('caps stdout to at most REDACTION_CAP_BYTES when output exceeds the limit', async () => {
      channelFactory = () =>
        makeSshChannel({
          stdout: Buffer.alloc(REDACTION_CAP_BYTES + 1000, 0x78),
          stderr: null,
          exitCode: 0,
        });

      const result = await executeApprovedCommand('appr-002', 'cat large-file', TARGET);
      expect(result.stdout.length).toBeLessThanOrEqual(REDACTION_CAP_BYTES);
    });

    it('caps stderr to at most REDACTION_CAP_BYTES when stderr exceeds the limit', async () => {
      channelFactory = () =>
        makeSshChannel({
          stdout: null,
          stderr: Buffer.alloc(REDACTION_CAP_BYTES + 1000, 0x65),
          exitCode: 1,
        });

      const result = await executeApprovedCommand('appr-002', 'bad-cmd', TARGET);
      expect(result.stderr.length).toBeLessThanOrEqual(REDACTION_CAP_BYTES);
    });

    it('applies caps independently — large stdout does not consume the stderr cap', async () => {
      channelFactory = () =>
        makeSshChannel({
          stdout: Buffer.alloc(REDACTION_CAP_BYTES + 1000, 0x6f),
          stderr: Buffer.alloc(REDACTION_CAP_BYTES + 1000, 0x65),
          exitCode: 0,
        });

      const result = await executeApprovedCommand('appr-002', 'mixed-output', TARGET);
      expect(result.stdout.length).toBeLessThanOrEqual(REDACTION_CAP_BYTES);
      expect(result.stderr.length).toBeLessThanOrEqual(REDACTION_CAP_BYTES);
    });
  });

  describe('timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      channelFactory = () =>
        makeSshChannel({ stdout: null, stderr: null, exitCode: null, hang: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('sets timedOut to true when the command exceeds the 30s timeout', async () => {
      const resultPromise = executeApprovedCommand('appr-003', 'sleep 9999', TARGET);
      await vi.advanceTimersByTimeAsync(31_000);
      const result = await resultPromise;
      expect(result.timedOut).toBe(true);
    });

    it('resolves after timeout fires — does not hang indefinitely', async () => {
      const resultPromise = executeApprovedCommand('appr-003', 'sleep 9999', TARGET);
      await vi.advanceTimersByTimeAsync(31_000);
      await expect(resultPromise).resolves.toBeDefined();
    });
  });

  describe('bash -lc wrapping and LANG=C', () => {
    beforeEach(() => {
      channelFactory = () =>
        makeSshChannel({ stdout: Buffer.from('Linux'), stderr: null, exitCode: 0 });
    });

    it('wraps the command as "bash -lc <cmd>" in the ssh2 exec call', async () => {
      const ssh2 = await import('ssh2');
      const execSpy = vi.spyOn(ssh2.Client.prototype, 'exec');

      await executeApprovedCommand('appr-004', 'uname -a', TARGET);

      expect(execSpy).toHaveBeenCalled();
      const firstArg = execSpy.mock.calls[0][0] as string;
      expect(firstArg).toMatch(/^bash -lc /);

      execSpy.mockRestore();
    });

    it('passes LANG=C in the env option of the exec call', async () => {
      const ssh2 = await import('ssh2');
      const execSpy = vi.spyOn(ssh2.Client.prototype, 'exec');

      await executeApprovedCommand('appr-004', 'uname -a', TARGET);

      expect(execSpy).toHaveBeenCalled();
      const optsArg = execSpy.mock.calls[0][1] as { env?: Record<string, string> };
      expect(optsArg?.env).toMatchObject({ LANG: 'C' });

      execSpy.mockRestore();
    });
  });

  describe('anti-pattern A1 — executeApprovedCommand must not be a model tool', () => {
    it('is not imported or referenced in any ai/tools/ file', () => {
      const thisFile = fileURLToPath(import.meta.url);
      const aiToolsDir = path.resolve(path.dirname(thisFile), '..', 'ai', 'tools');
      // Comment-only lines are excluded by grepDir (the §A1 note in ssh-tools.ts
      // is an architect's warning, not an import or call).
      expect(grepDir(aiToolsDir, 'executeApprovedCommand')).toEqual([]);
    });
  });

  describe('preflight', () => {
    it('reports sudoAvailable=true, lang=C, and captured PATH when sudo -n succeeds', async () => {
      // Lazy factories — each channel must be created (and its emits scheduled)
      // only when exec() calls channelFactory(), so listeners attach in time.
      const responses = [
        () => makeSshChannel({ stdout: null, stderr: null, exitCode: 0 }), // sudo -n true
        () => makeSshChannel({ stdout: Buffer.from('/usr/bin:/bin'), stderr: null, exitCode: 0 }), // echo $PATH
      ];
      let call = 0;
      channelFactory = () => responses[call++]();

      const result = await runPreflight(TARGET);
      expect(result.sudoAvailable).toBe(true);
      expect(result.lang).toBe('C');
      expect(result.path).toBe('/usr/bin:/bin');
    });

    it('reports sudoAvailable=false (non-fatal) when sudo -n exits non-zero', async () => {
      const responses = [
        () => makeSshChannel({ stdout: null, stderr: Buffer.from('a password is required'), exitCode: 1 }),
        () => makeSshChannel({ stdout: Buffer.from('/usr/bin:/bin'), stderr: null, exitCode: 0 }),
      ];
      let call = 0;
      channelFactory = () => responses[call++]();

      const result = await runPreflight(TARGET);
      expect(result.sudoAvailable).toBe(false);
      expect(result.path).toBe('/usr/bin:/bin');
    });
  });

  describe('connection failure', () => {
    it('rejects with SshConnectionError when the connection errors', async () => {
      // Make the mocked Client emit 'error' instead of 'ready'.
      const ssh2 = await import('ssh2');
      const connectSpy = vi
        .spyOn(ssh2.Client.prototype, 'connect')
        .mockImplementation(function (this: import('node:events').EventEmitter) {
          process.nextTick(() => this.emit('error', new Error('ECONNREFUSED')));
          return this as unknown as ReturnType<typeof ssh2.Client.prototype.connect>;
        });

      await expect(executeApprovedCommand('appr-err', 'uname -a', TARGET)).rejects.toBeInstanceOf(
        SshConnectionError,
      );

      connectSpy.mockRestore();
    });
  });

});
