import { describe, expect, it } from "vitest";
import { type CommandResult, SshConnectionError } from "../ssh/types.js";

describe("SshConnectionError", () => {
  it("has name SSHConnectionError and preserves message", () => {
    const err = new SshConnectionError("connect failed");
    expect(err.name).toBe("SSHConnectionError");
    expect(err.message).toBe("connect failed");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("CommandResult", () => {
  it("structural: object literal with exactly 5 fields satisfies the interface", () => {
    const result: CommandResult = {
      exitCode: 0,
      stdout: "output",
      stderr: "",
      durationMs: 123,
      timedOut: false,
    };

    expect(typeof result.exitCode).toBe("number");
    expect(typeof result.stdout).toBe("string");
    expect(typeof result.stderr).toBe("string");
    expect(typeof result.durationMs).toBe("number");
    expect(typeof result.timedOut).toBe("boolean");
  });
});
