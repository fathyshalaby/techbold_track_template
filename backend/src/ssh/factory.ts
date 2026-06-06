// SSH executor factory — selects the mock or real executor from the resolved
// client mode, mirroring the phoenix mock/real selection pattern. Backend-only.
import { resolveClientMode } from '../env.js';
import { createMockSshExecutor } from './mock.js';
import { createRealSshExecutor } from './executor.js';
import type { SshExecutor } from './types.js';

export function createSshExecutor(): SshExecutor {
  return resolveClientMode('ssh') === 'mock' ? createMockSshExecutor() : createRealSshExecutor();
}
