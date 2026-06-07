import { readFileSync } from "node:fs";
// SSH connection client - fresh key-authenticated connection with a connect
// timeout. Stateless: one connection per command (the approval gate sequences
// execution), closed by the caller after the command completes.
import { Client } from "ssh2";
import { resolveCandidateKeys } from "./keys.js";
import { SshConnectionError, type SshTarget } from "./types.js";

export const CONNECT_TIMEOUT_MS = 10_000;

// An ssh2 error whose level is authentication means THIS key was rejected — try
// the next candidate key. Any other error (network/host/timeout) is not a key
// problem, so we fail fast rather than retrying every key against a dead host.
function isAuthError(err: unknown): boolean {
  const level = (err as { level?: string } | null)?.level;
  return level === "client-authentication";
}

// Single connect attempt with one (optional) key. Resolves on 'ready'; rejects
// on error/timeout. The key bytes are never logged.
function connectWithKey(target: SshTarget, privateKey: Buffer | undefined): Promise<Client> {
  return new Promise<Client>((resolve, reject) => {
    const client = new Client();
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        client.end();
      } catch {
        /* connection may not be open */
      }
      reject(new SshConnectionError(`SSH connect timed out after ${CONNECT_TIMEOUT_MS}ms`));
    }, CONNECT_TIMEOUT_MS);

    client.on("ready", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(client);
    });

    client.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      // Message names the failure only - never the key path or value (G-secret).
      reject(new SshConnectionError("SSH connection failed", err));
    });

    client.connect({
      host: target.host,
      port: target.port,
      username: target.username,
      privateKey,
      readyTimeout: CONNECT_TIMEOUT_MS,
    });
  });
}

// Open a fresh SSH connection. Tries the configured key first, then any other
// key in the key directory (multi-key, merged from the python backend) so one
// backend can reach VMs that use different keys. On an AUTH rejection it advances
// to the next key; on a network/host error it fails fast. Resolves on the first
// 'ready'. The caller MUST `client.end()`.
export async function openSshConnection(target: SshTarget): Promise<Client> {
  const candidatePaths = resolveCandidateKeys(target.privateKeyPath, target.keyDir);

  // No real key files (e.g. mock/test): single attempt with no key — ssh2 then
  // surfaces an auth error in real mode; a mocked ssh2 ignores the key.
  if (candidatePaths.length === 0) {
    return connectWithKey(target, undefined);
  }

  let lastError: unknown;
  for (const keyPath of candidatePaths) {
    let privateKey: Buffer;
    try {
      privateKey = readFileSync(keyPath);
    } catch {
      continue; // unreadable key — try the next candidate
    }
    try {
      return await connectWithKey(target, privateKey);
    } catch (err) {
      lastError = err;
      const cause = err instanceof SshConnectionError ? err.cause : err;
      // Network/host/timeout is not a key problem — stop trying other keys.
      if (!isAuthError(cause)) throw err;
      // else: this key was rejected, try the next candidate
    }
  }
  throw new SshConnectionError(
    `SSH authentication failed for all ${candidatePaths.length} candidate key(s)`,
    lastError,
  );
}
