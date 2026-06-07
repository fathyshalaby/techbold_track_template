import type { Client } from "ssh2";
import { openSshConnection } from "./client.js";
import type { SshTarget } from "./types.js";

// Per-host SSH connection pool.
//
// Why: the executor runs ONE command per exec channel, but a single incident
// needs many commands. Opening a fresh TCP+SSH connection per command makes the
// customer VMs' rate limiting (fail2ban / NSG) ban our source IP after a few
// rapid connects, which then times out every later command. Reusing one live
// connection per host across all of a run's commands keeps us to a single
// connect, well under any rate limit.
//
// A connection is evicted when it closes/errors (e.g. the VM was reset) so the
// next command transparently reconnects, and after an idle period so a finished
// run does not hold a socket open forever.

const IDLE_MS = 5 * 60_000;

interface Entry {
  client: Client;
  idle?: ReturnType<typeof setTimeout>;
}

const pool = new Map<string, Entry>();

function keyOf(target: SshTarget): string {
  return `${target.username}@${target.host}:${target.port}`;
}

function armIdle(key: string, entry: Entry): void {
  if (entry.idle) clearTimeout(entry.idle);
  entry.idle = setTimeout(() => {
    if (pool.get(key) === entry) {
      pool.delete(key);
      try {
        entry.client.end();
      } catch {
        /* already closed */
      }
    }
  }, IDLE_MS);
  // Don't keep the process alive just for the idle timer.
  entry.idle.unref?.();
}

// Return a live, reusable SSH client for the target, opening one if needed.
export async function acquireConnection(target: SshTarget): Promise<Client> {
  const key = keyOf(target);
  const existing = pool.get(key);
  if (existing) {
    armIdle(key, existing);
    return existing.client;
  }

  const client = await openSshConnection(target);
  const entry: Entry = { client };
  const drop = () => {
    if (pool.get(key) === entry) {
      pool.delete(key);
      if (entry.idle) clearTimeout(entry.idle);
    }
  };
  client.on("close", drop);
  client.on("error", drop);
  pool.set(key, entry);
  armIdle(key, entry);
  return client;
}

// Force a target's connection closed (used after a command times out, so a
// runaway process and a possibly-wedged channel never get reused).
export function dropConnection(target: SshTarget): void {
  const key = keyOf(target);
  const entry = pool.get(key);
  if (!entry) return;
  pool.delete(key);
  if (entry.idle) clearTimeout(entry.idle);
  try {
    entry.client.end();
  } catch {
    /* already closed */
  }
}

// Close every pooled connection (graceful shutdown / test teardown).
export function closeAllConnections(): void {
  for (const [key, entry] of pool) {
    pool.delete(key);
    if (entry.idle) clearTimeout(entry.idle);
    try {
      entry.client.end();
    } catch {
      /* already closed */
    }
  }
}
