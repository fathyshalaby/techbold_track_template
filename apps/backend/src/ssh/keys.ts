import { readdirSync } from "node:fs";
import { join } from "node:path";

interface SshKeySource {
  SSH_PRIVATE_KEY_DIR?: string;
  SSH_PRIVATE_KEY_PATH?: string;
}

// Resolve the candidate SSH private keys for a connection.
//
// Two configs are supported (checked in this order):
//   - SSH_PRIVATE_KEY_DIR: a directory of *.pem keys. Every key in it becomes a
//     candidate; the executor tries each until the target VM accepts one. This
//     is how the fleet works - one keypair per VM, host->key mapping unknown at
//     runtime, so we offer all keys (incident-agnostic, no hardcoded mapping).
//   - SSH_PRIVATE_KEY_PATH: a single key file (the simple one-VM case).
//
// Reads process.env by default (no full-env validation - the caller is on the
// command-execution hot path) and is testable via the optional source arg.
// Returns paths sorted for determinism; empty when neither var is set (real SSH
// mode rejects that at startup via env.ts).
export function resolveSshKeyPaths(source: SshKeySource = process.env): string[] {
  const dir = (source.SSH_PRIVATE_KEY_DIR ?? "").trim();
  if (dir !== "") {
    try {
      return readdirSync(dir)
        .filter((name) => name.toLowerCase().endsWith(".pem"))
        .sort()
        .map((name) => join(dir, name));
    } catch {
      // Unreadable/missing dir: fall through to the single-key path so a
      // misconfigured dir doesn't mask an otherwise-valid single key.
    }
  }
  const single = (source.SSH_PRIVATE_KEY_PATH ?? "").trim();
  return single !== "" ? [single] : [];
}
