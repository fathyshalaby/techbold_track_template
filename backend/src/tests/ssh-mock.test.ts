import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import {
  MockSshExecutor,
  createMockSshExecutor,
  MOCK_SSH_FIXTURES,
  DEFAULT_FALLBACK_RESULT,
} from '../ssh/mock.js';
import type { SshTarget } from '../ssh/types.js';

// Cross-platform recursive substring scan (non-comment lines). Replaces a
// bash-only `execSync('grep … || true')` that threw under Windows cmd.exe.
function grepDir(dir: string, needle: string): string[] {
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
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
          if (line.trim().startsWith('//')) return;
          if (line.includes(needle)) hits.push(`${full}:${i + 1}`);
        });
    }
  }
  return hits;
}

const TARGET: SshTarget = {
  host: '10.0.0.1',
  port: 22,
  username: 'azureuser',
  privateKeyPath: '/keys/test.pem',
};

describe('ssh-mock', () => {
  describe('fixture lookup — exact command match', () => {
    it('returns Linux stdout with exitCode 0 and timedOut false for uname -a', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.executeApprovedCommand('appr-001', 'uname -a', TARGET);
      expect(result.stdout).toContain('Linux');
      expect(result.exitCode).toBe(0);
      expect(result.timedOut).toBe(false);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('fixture lookup — systemctl status', () => {
    it('returns non-empty stdout and a numeric exitCode for systemctl status status-api', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.executeApprovedCommand(
        'appr-002',
        'systemctl status status-api --no-pager',
        TARGET,
      );
      expect(result.stdout.length).toBeGreaterThan(0);
      expect(result.stdout).toMatch(/active|failed/);
      expect(typeof result.exitCode).toBe('number');
    });
  });

  describe('fallback for unknown command', () => {
    it('returns DEFAULT_FALLBACK_RESULT shape for an unrecognised command', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.executeApprovedCommand(
        'appr-003',
        'some-unknown-command-xyz',
        TARGET,
      );
      expect(result.exitCode).toBe(0);
      expect(typeof result.stdout).toBe('string');
      expect(result.stdout.length).toBeGreaterThan(0);
      expect(result.timedOut).toBe(false);
    });
  });

  describe('result shape conformance', () => {
    it('every result has exactly the 5 required fields and no extras', async () => {
      const executor = createMockSshExecutor();
      for (const command of ['uname -a', 'df -h', 'totally-unknown-command-abc']) {
        const result = await executor.executeApprovedCommand('appr-004', command, TARGET);
        const keys = Object.keys(result).sort();
        expect(keys).toEqual(['durationMs', 'exitCode', 'stderr', 'stdout', 'timedOut']);
      }
    });
  });

  describe('preflight always succeeds', () => {
    it('runPreflight returns sudoAvailable true, lang C, and non-empty path', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.runPreflight(TARGET);
      expect(result.sudoAvailable).toBe(true);
      expect(result.lang).toBe('C');
      expect(typeof result.path).toBe('string');
      expect(result.path.length).toBeGreaterThan(0);
    });
  });

  describe('preflight is idempotent', () => {
    it('runPreflight called twice returns the same object reference (cached)', async () => {
      const executor = new MockSshExecutor();
      const first = await executor.runPreflight(TARGET);
      const second = await executor.runPreflight(TARGET);
      expect(first).toBe(second);
    });
  });

  describe('SshExecutor interface conformance', () => {
    it('createMockSshExecutor returns an object with executeApprovedCommand and runPreflight functions', () => {
      const executor = createMockSshExecutor();
      expect(typeof executor.executeApprovedCommand).toBe('function');
      expect(typeof executor.runPreflight).toBe('function');
    });
  });

  describe('practice loop coverage — fix cycle', () => {
    it('sudo systemctl restart status-api returns exitCode 0', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.executeApprovedCommand(
        'appr-005',
        'sudo systemctl restart status-api',
        TARGET,
      );
      expect(result.exitCode).toBe(0);
    });

    it('sudo systemctl enable status-api returns exitCode 0', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.executeApprovedCommand(
        'appr-006',
        'sudo systemctl enable status-api',
        TARGET,
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('practice loop coverage — validation', () => {
    it('systemctl is-active status-api returns stdout.trim() === active', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.executeApprovedCommand(
        'appr-007',
        'systemctl is-active status-api',
        TARGET,
      );
      expect(result.stdout.trim()).toBe('active');
    });

    it('curl health check returns stdout containing 200', async () => {
      const executor = createMockSshExecutor();
      const result = await executor.executeApprovedCommand(
        'appr-008',
        'curl -s -o /dev/null -w "%{http_code}" localhost:8080',
        TARGET,
      );
      expect(result.stdout).toContain('200');
    });
  });

  describe('anti-pattern A1 guard', () => {
    it('executeApprovedCommand from mock is not imported in any ai/tools/ file', () => {
      const thisFile = fileURLToPath(import.meta.url);
      const aiToolsDir = path.resolve(path.dirname(thisFile), '..', 'ai', 'tools');

      expect(grepDir(aiToolsDir, 'ssh/mock')).toEqual([]);
    });
  });

  describe('MOCK_SSH_FIXTURES and DEFAULT_FALLBACK_RESULT exports', () => {
    it('MOCK_SSH_FIXTURES is a plain object (not a Map)', () => {
      expect(MOCK_SSH_FIXTURES).toBeDefined();
      expect(MOCK_SSH_FIXTURES instanceof Map).toBe(false);
      expect(typeof MOCK_SSH_FIXTURES).toBe('object');
    });

    it('DEFAULT_FALLBACK_RESULT has the correct shape', () => {
      expect(DEFAULT_FALLBACK_RESULT.exitCode).toBe(0);
      expect(typeof DEFAULT_FALLBACK_RESULT.stdout).toBe('string');
      expect(DEFAULT_FALLBACK_RESULT.stdout.length).toBeGreaterThan(0);
      expect(DEFAULT_FALLBACK_RESULT.timedOut).toBe(false);
    });
  });
});
