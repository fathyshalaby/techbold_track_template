import { describe, expect, it } from "vitest";
import { latestObservationDisprovesUnitHypothesis } from "../ai/observe-guard.js";
import { sanitizeRunbookPlaceholders } from "../memory/sanitize-placeholders.js";

describe("sanitizeRunbookPlaceholders", () => {
  it("neutralizes generic runbook service names", () => {
    const input =
      "systemctl status myapp -l; journalctl -u myapp -n 100; ls -l /etc/myapp/; sudo -u appuser cat config";
    const sanitized = sanitizeRunbookPlaceholders(input);
    expect(sanitized).not.toContain("myapp");
    expect(sanitized).toContain("<SERVICE>");
    expect(sanitized).toContain("/etc/<SERVICE>");
    expect(sanitized).toContain("<SERVICE_USER>");
  });

  it("neutralizes UNIT placeholder", () => {
    expect(sanitizeRunbookPlaceholders("systemctl cat UNIT")).toContain("<UNIT>");
  });
});

describe("latestObservationDisprovesUnitHypothesis", () => {
  it("returns true for systemctl unit-not-found with exit 4", () => {
    const obs = [
      "$ systemctl is-enabled myapp",
      "exit_code: 4",
      "stderr:",
      "Failed to get unit file state of myapp.service: No such file or directory",
    ].join("\n");
    expect(latestObservationDisprovesUnitHypothesis(obs)).toBe(true);
  });

  it("returns false for exit 4 without systemd context", () => {
    const obs = ["$ ls /missing", "exit_code: 4", "stderr:", "No such file or directory"].join(
      "\n",
    );
    expect(latestObservationDisprovesUnitHypothesis(obs)).toBe(false);
  });

  it("returns false for systemctl success", () => {
    const obs = ["$ systemctl is-enabled nginx", "exit_code: 0", "stdout:", "enabled"].join("\n");
    expect(latestObservationDisprovesUnitHypothesis(obs)).toBe(false);
  });
});
