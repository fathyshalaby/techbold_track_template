import type { RiskLevel } from "../types.js";

export function riskBadge(level: RiskLevel): { label: string; colorClass: string } {
  switch (level) {
    case "SAFE_READ_ONLY":
      return { label: "SAFE READ ONLY", colorClass: "badge--safe" };
    case "LOW_RISK_CHANGE":
      return { label: "LOW RISK", colorClass: "badge--low" };
    case "MEDIUM_RISK_CHANGE":
      return { label: "MEDIUM RISK", colorClass: "badge--medium" };
    case "HIGH_RISK_BLOCKED":
      return { label: "HIGH RISK — BLOCKED", colorClass: "badge--high" };
  }
}

export function sseEventLabel(type: string): { icon: string; label: string } {
  switch (type) {
    case "run.started":
      return { icon: "▶", label: "Run started" };
    case "agent.thought_summary":
      return { icon: "🧠", label: "Agent thinking" };
    case "command.proposed":
      return { icon: "💡", label: "Command proposed" };
    case "command.blocked":
      return { icon: "🚫", label: "Command blocked" };
    case "approval.required":
      return { icon: "⏳", label: "Approval required" };
    case "command.executing":
      return { icon: "⚙", label: "Executing command" };
    case "command.completed":
      return { icon: "✓", label: "Command completed" };
    case "observation.added":
      return { icon: "🔍", label: "Observation" };
    case "fix.proposed":
      return { icon: "🔧", label: "Fix proposed" };
    case "validation.completed":
      return { icon: "✅", label: "Validation complete" };
    case "activity.drafted":
      return { icon: "📝", label: "Activity drafted" };
    case "activity.submitted":
      return { icon: "📤", label: "Activity submitted" };
    case "run.completed":
      return { icon: "🏁", label: "Run completed" };
    case "run.failed":
      return { icon: "❌", label: "Run failed" };
    default:
      return { icon: "•", label: type };
  }
}
