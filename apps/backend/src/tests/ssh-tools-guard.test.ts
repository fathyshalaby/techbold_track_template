import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sshToolsSrc = readFileSync(join(__dirname, "../ai/tools/ssh-tools.ts"), "utf8");

describe("anti-pattern A1 - executeApprovedCommand is never registered as a model tool", () => {
  it("proposeSshCommand is defined using tool()", () => {
    expect(sshToolsSrc).toContain("proposeSshCommand");
    expect(sshToolsSrc).toMatch(/tool\s*\(/);
  });

  it("executeApprovedCommand is never passed to tool()", () => {
    expect(sshToolsSrc).not.toMatch(/tool\s*\([^)]*executeApprovedCommand/);
  });

  it("executeApprovedCommand is not inlined as an execute: property pointing to the backend function", () => {
    expect(sshToolsSrc).not.toMatch(/execute\s*:.*executeApprovedCommand/);
  });
});
