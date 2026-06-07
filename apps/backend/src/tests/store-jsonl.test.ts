import { describe, expect, it } from "vitest";
import { makeJsonlAdapter } from "../store/db.js";

describe("JSONL adapter UPDATE with COALESCE", () => {
  it("aligns params correctly across COALESCE expressions (id is last param)", () => {
    const db = makeJsonlAdapter();
    db.run(
      "INSERT INTO command_approvals (id, run_id, status, edited_command, final_command, technician_reason, decided_at, executed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ["appr_1", "run_1", "PENDING", null, null, null, null, null],
    );

    // Same SET shape as updateApprovalStatus: COALESCE(?, col) with internal commas
    db.run(
      "UPDATE command_approvals SET status = ?, edited_command = COALESCE(?, edited_command), final_command = COALESCE(?, final_command), technician_reason = COALESCE(?, technician_reason), decided_at = COALESCE(?, decided_at), executed_at = COALESCE(?, executed_at) WHERE id = ?",
      [
        "APPROVED",
        "ls -la /tmp",
        "ls -la /tmp",
        "looks safe",
        "2026-06-06T00:00:00Z",
        null,
        "appr_1",
      ],
    );

    const row = db.get<Record<string, unknown>>("SELECT * FROM command_approvals WHERE id = ?", [
      "appr_1",
    ]);
    expect(row?.status).toBe("APPROVED");
    expect(row?.final_command).toBe("ls -la /tmp");
    expect(row?.technician_reason).toBe("looks safe");
    expect(row?.decided_at).toBe("2026-06-06T00:00:00Z");
  });

  it("COALESCE with null param preserves the existing value", () => {
    const db = makeJsonlAdapter();
    db.run("INSERT INTO command_approvals (id, status, final_command) VALUES (?, ?, ?)", [
      "appr_2",
      "PENDING",
      "original-cmd",
    ]);
    db.run(
      "UPDATE command_approvals SET status = ?, final_command = COALESCE(?, final_command) WHERE id = ?",
      ["REJECTED", null, "appr_2"],
    );
    const row = db.get<Record<string, unknown>>("SELECT * FROM command_approvals WHERE id = ?", [
      "appr_2",
    ]);
    expect(row?.status).toBe("REJECTED");
    expect(row?.final_command).toBe("original-cmd");
  });

  it("get returns the latest row for non-id WHERE clauses", () => {
    const db = makeJsonlAdapter();
    db.run(
      "INSERT INTO command_results (id, approval_id, command, exit_code, created_at) VALUES (?, ?, ?, ?, ?)",
      ["res_1", "appr_1", "systemctl status status-api", 3, "2026-06-07T00:00:00Z"],
    );
    db.run(
      "INSERT INTO command_results (id, approval_id, command, exit_code, created_at) VALUES (?, ?, ?, ?, ?)",
      ["res_2", "appr_1", "sudo systemctl restart status-api", 0, "2026-06-07T00:01:00Z"],
    );

    const row = db.get<Record<string, unknown>>(
      "SELECT * FROM command_results WHERE approval_id = ? ORDER BY created_at DESC LIMIT 1",
      ["appr_1"],
    );

    expect(row?.id).toBe("res_2");
    expect(row?.exit_code).toBe(0);
  });

  it("applies numeric literal assignments in UPDATE statements", () => {
    const db = makeJsonlAdapter();
    db.run("INSERT INTO activity_drafts (id, submitted, submitted_at) VALUES (?, ?, ?)", [
      "act_1",
      0,
      null,
    ]);

    db.run("UPDATE activity_drafts SET submitted = 1, submitted_at = ? WHERE id = ?", [
      "2026-06-07T00:00:00Z",
      "act_1",
    ]);

    const row = db.get<Record<string, unknown>>("SELECT * FROM activity_drafts WHERE id = ?", [
      "act_1",
    ]);
    expect(row?.submitted).toBe(1);
    expect(row?.submitted_at).toBe("2026-06-07T00:00:00Z");
  });

  it("rejects UPDATE and DELETE on audit_events (append-only)", () => {
    const db = makeJsonlAdapter();
    expect(() => db.run("UPDATE audit_events SET type = ? WHERE id = ?", ["x", "ev_1"])).toThrow(
      /append-only/,
    );
    expect(() => db.run("DELETE FROM audit_events WHERE id = ?", ["ev_1"])).toThrow(/append-only/);
  });
});
