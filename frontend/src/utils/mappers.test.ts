import { describe, it, expect } from "vitest";
import { riskBadge, sseEventLabel } from "./mappers.js";

describe("riskBadge", () => {
  it('maps SAFE_READ_ONLY', () => {
    expect(riskBadge("SAFE_READ_ONLY")).toEqual({ label: "SAFE READ ONLY", colorClass: "badge--safe" });
  });
  it('maps LOW_RISK_CHANGE', () => {
    expect(riskBadge("LOW_RISK_CHANGE")).toEqual({ label: "LOW RISK", colorClass: "badge--low" });
  });
  it('maps MEDIUM_RISK_CHANGE', () => {
    expect(riskBadge("MEDIUM_RISK_CHANGE")).toEqual({ label: "MEDIUM RISK", colorClass: "badge--medium" });
  });
  it('maps HIGH_RISK_BLOCKED', () => {
    expect(riskBadge("HIGH_RISK_BLOCKED")).toEqual({ label: "HIGH RISK — BLOCKED", colorClass: "badge--high" });
  });
});

describe("sseEventLabel", () => {
  it('maps run.started', () => {
    expect(sseEventLabel("run.started")).toEqual({ icon: "▶", label: "Run started" });
  });
  it('maps approval.required', () => {
    expect(sseEventLabel("approval.required")).toEqual({ icon: "⏳", label: "Approval required" });
  });
  it('maps command.proposed', () => {
    expect(sseEventLabel("command.proposed")).toEqual({ icon: "💡", label: "Command proposed" });
  });
  it('maps command.blocked', () => {
    expect(sseEventLabel("command.blocked")).toEqual({ icon: "🚫", label: "Command blocked" });
  });
  it('maps command.executing', () => {
    expect(sseEventLabel("command.executing")).toEqual({ icon: "⚙", label: "Executing command" });
  });
  it('maps command.completed', () => {
    expect(sseEventLabel("command.completed")).toEqual({ icon: "✓", label: "Command completed" });
  });
  it('maps observation.added', () => {
    expect(sseEventLabel("observation.added")).toEqual({ icon: "🔍", label: "Observation" });
  });
  it('maps fix.proposed', () => {
    expect(sseEventLabel("fix.proposed")).toEqual({ icon: "🔧", label: "Fix proposed" });
  });
  it('maps validation.completed', () => {
    expect(sseEventLabel("validation.completed")).toEqual({ icon: "✅", label: "Validation complete" });
  });
  it('maps activity.drafted', () => {
    expect(sseEventLabel("activity.drafted")).toEqual({ icon: "📝", label: "Activity drafted" });
  });
  it('maps activity.submitted', () => {
    expect(sseEventLabel("activity.submitted")).toEqual({ icon: "📤", label: "Activity submitted" });
  });
  it('maps run.completed', () => {
    expect(sseEventLabel("run.completed")).toEqual({ icon: "🏁", label: "Run completed" });
  });
  it('maps run.failed', () => {
    expect(sseEventLabel("run.failed")).toEqual({ icon: "❌", label: "Run failed" });
  });
  it('maps agent.thought_summary', () => {
    expect(sseEventLabel("agent.thought_summary")).toEqual({ icon: "🧠", label: "Agent thinking" });
  });
  it('returns default for unknown type', () => {
    expect(sseEventLabel("something.unknown")).toEqual({ icon: "•", label: "something.unknown" });
  });
});
