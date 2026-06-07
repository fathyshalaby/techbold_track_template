import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveSshKeyPaths } from "../ssh/keys.js";
import { MockSshExecutor } from "../ssh/mock.js";

describe("resolveSshKeyPaths", () => {
  it("returns sorted pem keys from a directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "mk-keys-"));
    for (const n of ["case1_key.pem", "case2_key.pem", "readme.txt"]) {
      writeFileSync(join(dir, n), "dummy");
    }
    const out = resolveSshKeyPaths({ SSH_PRIVATE_KEY_DIR: dir });
    expect(out).toEqual([join(dir, "case1_key.pem"), join(dir, "case2_key.pem")]);
  });

  it("returns a single configured key path", () => {
    const dir = mkdtempSync(join(tmpdir(), "mk-keys2-"));
    const primary = join(dir, "case2_key.pem");
    writeFileSync(primary, "dummy");
    const out = resolveSshKeyPaths({ SSH_PRIVATE_KEY_PATH: primary });
    expect(out).toEqual([primary]);
  });

  it("returns [] when nothing is configured", () => {
    expect(resolveSshKeyPaths({})).toEqual([]);
    expect(resolveSshKeyPaths({ SSH_PRIVATE_KEY_DIR: "/no/such/dir/xyz" })).toEqual([]);
  });
});

describe("MockSshExecutor testConnection", () => {
  it("reports reachable in mock mode", async () => {
    const result = await new MockSshExecutor().testConnection({
      host: "127.0.0.1",
      port: 22,
      username: "azureuser",
      privateKeyPaths: [],
    });
    expect(result.reachable).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
