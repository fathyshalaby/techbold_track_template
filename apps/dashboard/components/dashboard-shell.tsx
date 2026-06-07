import { AppSidebar } from "@/components/app-sidebar";
import { ModelSelector } from "@/components/model-selector";
import { RefreshButton } from "@/components/refresh-button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { ReactNode } from "react";

const HEADER_CONTROL_CLASS = "h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium";

function HealthIndicator({ status }: { status?: string }) {
  if (!status) return null;
  const tone =
    status === "ok"
      ? { dot: "bg-emerald-500", label: "Operational" }
      : status === "degraded"
        ? { dot: "bg-amber-500", label: "Degraded" }
        : { dot: "bg-destructive", label: "Down" };
  return (
    <div
      className={cn(HEADER_CONTROL_CLASS, "inline-flex shrink-0 items-center border bg-background")}
    >
      <span className={cn("size-1.5 rounded-full", tone.dot)} aria-hidden="true" />
      {tone.label}
    </div>
  );
}

export function DashboardShell({
  children,
  title = "Sphinx",
  sourceLabel,
  healthLabel,
}: {
  children: ReactNode;
  title?: string;
  sourceLabel?: string;
  healthLabel?: string;
}) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" healthStatus={healthLabel} sourceLabelText={sourceLabel} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
            <span className="truncate text-sm font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector />
            <HealthIndicator status={healthLabel} />
            <RefreshButton />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardError() {
  return (
    <DashboardShell>
      <Empty className="min-h-[60vh] border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconAlertTriangle />
          </EmptyMedia>
          <EmptyTitle>Could not load dashboard data</EmptyTitle>
          <EmptyDescription>
            Could not load dashboard data. Check backend status and retry.
          </EmptyDescription>
        </EmptyHeader>
        <RefreshButton />
      </Empty>
    </DashboardShell>
  );
}
