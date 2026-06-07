import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveCandidateKeys } from "../ssh/keys.js";
import { MockSshExecutor } from "../ssh/mock.js";

describe("resolveCandidateKeys (multi-key SSH)", () => {
  it("returns the primary key first, then other keys in its directory, deduped", () => {
    const dir = mkdtempSync(join(tmpdir(), "mk-keys-"));
    for (const n of ["case1_key.pem", "case2_key.pem", "id_rsa", "readme.txt"]) {
      writeFileSync(join(dir, n), "dummy");
    }
    const primary = join(dir, "case2_key.pem");
    const out = resolveCandidateKeys(primary);

    expect(out[0]).toBe(primary); // configured key tried first
    expect(out).toContain(join(dir, "case1_key.pem"));
    expect(out).toContain(join(dir, "id_rsa"));
    expect(out).not.toContain(join(dir, "readme.txt")); // non-key files excluded
    expect(new Set(out).size).toBe(out.length); // no duplicates
  });

  it("globs an explicit keyDir when given", () => {
    const dir = mkdtempSync(join(tmpdir(), "mk-keys2-"));
    writeFileSync(join(dir, "case3_key.pem"), "dummy");
    const out = resolveCandidateKeys("", dir);
    expect(out).toContain(join(dir, "case3_key.pem"));
  });

  it("returns [] when nothing exists (preserves single-attempt fallback)", () => {
    expect(resolveCandidateKeys("", "/no/such/dir/xyz")).toEqual([]);
    expect(resolveCandidateKeys("/no/such/key.pem")).toEqual([]);
  });
});

describe("MockSshExecutor — merged capabilities", () => {
  it("testConnection reports reachable in mock mode", async () => {
    const result = await new MockSshExecutor().testConnection({
      host: "127.0.0.1",
      port: 22,
      username: "azureuser",
      privateKeyPath: "",
    });
    expect(result.reachable).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
