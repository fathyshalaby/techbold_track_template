import type { Icon } from "@tabler/icons-react";
import {
  IconBrain,
  IconCircleCheck,
  IconClipboardCheck,
  IconPlayerPlay,
  IconShieldCheck,
  IconTerminal2,
  IconTool,
} from "@tabler/icons-react";
import type { RiskLevel } from "@techbold/contracts";

export type LabelMeta = {
  label: string;
  dot: string;
  badgeClass?: string;
};

export type AuditMeta = {
  label: string;
  dot: string;
  icon: Icon;
  iconClass: string;
};

function humanizeToken(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function riskMeta(level: RiskLevel | string): LabelMeta {
  switch (level) {
    case "SAFE_READ_ONLY":
      return {
        label: "Safe read-only",
        dot: "bg-emerald-500",
        badgeClass:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      };
    case "LOW_RISK_CHANGE":
      return {
        label: "Low risk",
        dot: "bg-blue-500",
        badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
      };
    case "MEDIUM_RISK_CHANGE":
      return {
        label: "Medium risk",
        dot: "bg-amber-500",
        badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
    case "HIGH_RISK_BLOCKED":
      return {
        label: "High risk blocked",
        dot: "bg-destructive",
        badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
      };
    default:
      return { label: humanizeToken(level), dot: "bg-muted-foreground" };
  }
}

export function runStatusMeta(status: string): LabelMeta {
  const value = status.toUpperCase();
  switch (value) {
    case "RUNNING":
    case "LOADED_CONTEXT":
      return { label: "Active", dot: "bg-blue-500" };
    case "COMPLETED":
      return { label: "Completed", dot: "bg-emerald-500" };
    case "FAILED":
      return { label: "Failed", dot: "bg-destructive" };
    case "ABORTED":
      return { label: "Aborted", dot: "bg-muted-foreground" };
    default:
      return { label: humanizeToken(status), dot: "bg-muted-foreground" };
  }
}

export function humanizePhase(phase: string): string {
  return humanizeToken(phase);
}

export function actorLabel(actor: string): string {
  switch (actor.toLowerCase()) {
    case "agent":
      return "Agent";
    case "technician":
      return "Technician";
    case "system":
      return "System";
    case "ssh":
      return "SSH";
    default:
      return humanizeToken(actor);
  }
}

export function auditMeta(type: string): AuditMeta {
  const [category = "", ...rest] = type.split(".");
  const action = rest.join(".");
  const label = action ? humanizeToken(action) : humanizeToken(type);

  switch (category.toLowerCase()) {
    case "run":
      return {
        label,
        dot: "bg-blue-500",
        icon: IconPlayerPlay,
        iconClass: "text-blue-600 dark:text-blue-400",
      };
    case "command":
      return {
        label,
        dot: "bg-violet-500",
        icon: IconTerminal2,
        iconClass: "text-violet-600 dark:text-violet-400",
      };
    case "approval":
      return {
        label,
        dot: "bg-amber-500",
        icon: IconShieldCheck,
        iconClass: "text-amber-600 dark:text-amber-400",
      };
    case "diagnosis":
      return {
        label,
        dot: "bg-cyan-500",
        icon: IconBrain,
        iconClass: "text-cyan-600 dark:text-cyan-400",
      };
    case "validation":
      return {
        label,
        dot: "bg-emerald-500",
        icon: IconClipboardCheck,
        iconClass: "text-emerald-600 dark:text-emerald-400",
      };
    case "activity":
      return {
        label,
        dot: "bg-indigo-500",
        icon: IconClipboardCheck,
        iconClass: "text-indigo-600 dark:text-indigo-400",
      };
    case "fix":
      return {
        label,
        dot: "bg-orange-500",
        icon: IconTool,
        iconClass: "text-orange-600 dark:text-orange-400",
      };
    case "agent":
      return {
        label,
        dot: "bg-purple-500",
        icon: IconBrain,
        iconClass: "text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        label: humanizeToken(type),
        dot: "bg-muted-foreground",
        icon: IconCircleCheck,
        iconClass: "text-muted-foreground",
      };
  }
}

export function relativeTime(iso: string): { relative: string; absolute: string } {
  const date = new Date(iso);
  const absolute = date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  let relative: string;
  if (diffSec < 60) relative = "Just now";
  else if (diffMin < 60) relative = `${diffMin} min ago`;
  else if (diffHour < 24) relative = `${diffHour} hr ago`;
  else if (diffDay < 7) relative = `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  else relative = absolute;

  return { relative, absolute };
}

export function formatDayHeader(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
