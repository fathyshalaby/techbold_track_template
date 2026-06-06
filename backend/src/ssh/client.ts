// SSH connection client — fresh key-authenticated connection with a connect
// timeout. Stateless: one connection per command (the approval gate sequences
// execution), closed by the caller after the command completes.
import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';
import { SshConnectionError, type SshTarget } from './types.js';

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

    client.on('ready', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(client);
    });

    client.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      // Message names the failure only — never the key path or value (G-secret).
      reject(new SshConnectionError('SSH connection failed', err));
    });

    // Read the key lazily and tolerate a read failure: in real mode ssh2 then
    // emits an auth error (surfaced as SshConnectionError); in tests with a
    // mocked ssh2 the key is irrelevant. The key bytes are never logged.
    let privateKey: Buffer | undefined;
    try {
      privateKey = readFileSync(target.privateKeyPath);
    } catch {
      privateKey = undefined;
    }

    client.connect({
      host: target.host,
      port: target.port,
      username: target.username,
      privateKey,
      readyTimeout: CONNECT_TIMEOUT_MS,
    });
  });
}
