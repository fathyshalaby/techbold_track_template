import { readFileSync } from 'node:fs';
import { Client } from 'ssh2';
import { SshConnectionError, type SshTarget } from './types.js';

export function createSshClient(target: SshTarget, keyPath: string): Promise<Client> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const privateKey = readFileSync(keyPath);

    console.debug(`[ssh] connecting ${target.host}:${target.port}`);

    conn.on('ready', () => resolve(conn));

    conn.on('error', (err: Error) => {
      conn.destroy();
      reject(
        new SshConnectionError(
          `SSH connection failed to ${target.host}:${target.port}: ${err.message}`,
          err,
        ),
      );
    });

    conn.connect({
      host: target.host,
      port: target.port,
      username: target.username,
      privateKey,
      readyTimeout: 10_000,
    });
  });
}
