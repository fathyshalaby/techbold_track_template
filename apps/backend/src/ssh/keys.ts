import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

// Merged from the python backend: resolve an ordered, de-duplicated list of
// candidate private-key files. The configured key is tried first, then any other
// plausible key in the same directory (the contest ships 5 case keys in /keys, one
// per VM). This lets a SINGLE backend reach VMs that use different keys without
// per-ticket key configuration — the executor tries each until one authenticates.
const KEY_NAME = /\.pem$|_key$|^id_[a-z0-9]+$|\.key$/i;

export function resolveCandidateKeys(primaryKeyPath: string, keyDir?: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (p: string): void => {
    if (!p || seen.has(p)) return;
    try {
      if (existsSync(p) && statSync(p).isFile()) {
        seen.add(p);
        out.push(p);
      }
    } catch {
      /* unreadable path — skip */
    }
  };

  if (primaryKeyPath) add(primaryKeyPath);

  const dir = keyDir?.trim() || (primaryKeyPath ? dirname(primaryKeyPath) : "");
  if (dir && existsSync(dir)) {
    try {
      for (const name of readdirSync(dir).sort()) {
        if (KEY_NAME.test(name)) add(join(dir, name));
      }
    } catch {
      /* unreadable dir — the primary key (if any) is still tried */
    }
  }
  return out;
}
