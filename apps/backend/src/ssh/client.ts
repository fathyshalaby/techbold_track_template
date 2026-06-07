import { readFileSync } from "node:fs";
// SSH connection client - fresh key-authenticated connection with a connect
// timeout. Connections are pooled per username@host:port in pool.ts; this module
// opens one handshake and returns the client for the pool to reuse.
import { Client, type ConnectConfig, type PublicKeyAuthMethod } from "ssh2";
import { SshConnectionError, type SshTarget } from "./types.js";

export const CONNECT_TIMEOUT_MS = 10_000;

// Open a fresh SSH connection authenticated by private key. Resolves once the
// connection is 'ready'; rejects with SshConnectionError on auth/connect failure
// or if the handshake exceeds CONNECT_TIMEOUT_MS. The caller MUST `client.end()`.
export function openSshConnection(target: SshTarget): Promise<Client> {
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

    // Read candidate keys lazily and tolerate a read failure: in real mode ssh2
    // then emits an auth error (surfaced as SshConnectionError); in tests with a
    // mocked ssh2 the keys are irrelevant. Key bytes are never logged.
    const keys: Buffer[] = [];
    for (const path of target.privateKeyPaths) {
      try {
        keys.push(readFileSync(path));
      } catch {
        // Skip an unreadable candidate; another key (or the auth error) handles it.
      }
    }

    const connectConfig: ConnectConfig = {
      host: target.host,
      port: target.port,
      username: target.username,
      readyTimeout: CONNECT_TIMEOUT_MS,
      // The connection is pooled and reused across a run's commands (see pool.ts).
      // Keepalives stop an idle session from being dropped between approvals and
      // let ssh2 detect a dead peer (e.g. the VM was reset) so the pool evicts it.
      keepaliveInterval: 15_000,
      keepaliveCountMax: 3,
    };

    if (keys.length > 1) {
      // Each VM has its own keypair and we don't know which one matches this
      // host, so try every candidate via the auth handler: ssh2 attempts each
      // publickey in turn and stops at the first the server accepts. A wrong key
      // is rejected in well under a second, so this stays fast.
      connectConfig.authHandler = keys.map(
        (key): PublicKeyAuthMethod => ({ type: "publickey", username: target.username, key }),
      );
    } else {
      connectConfig.privateKey = keys[0];
    }

    client.connect(connectConfig);
  });
}
