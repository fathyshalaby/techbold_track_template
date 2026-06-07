import {
  Activity,
  ClipboardCheck,
  DatabaseZap,
  FileClock,
  Gauge,
  HeartPulse,
  ListChecks,
  Ticket,
} from "lucide-react";
import Link from "next/link";

export const SIDEBAR_ITEMS = [
  { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
  { label: "Runs", href: "/dashboard/runs", icon: ListChecks },
  { label: "Approvals", href: "/dashboard/approvals", icon: ClipboardCheck },
  { label: "Audit", href: "/dashboard/audit", icon: FileClock },
  { label: "Activity", href: "/dashboard/activity", icon: Activity },
  { label: "Memory", href: "/dashboard/memory", icon: DatabaseZap },
  { label: "Observability", href: "/dashboard/observability", icon: Gauge },
  { label: "Backend Status", href: "/dashboard/backend-status", icon: HeartPulse },
] as const;

export function AppSidebar() {
  return (
    <nav aria-label="Dashboard navigation" className="flex flex-col gap-1">
      <Link
        href="/dashboard"
        className="mb-3 rounded-md px-3 py-2 text-lg font-semibold text-foreground"
      >
        Service Desk Autopilot
      </Link>
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
