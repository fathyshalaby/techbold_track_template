import { AppSidebar } from "@/components/app-sidebar";
import { RefreshButton } from "@/components/refresh-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";

export function DashboardShell({
  children,
  sourceLabel,
  healthLabel,
}: {
  children: ReactNode;
  sourceLabel?: string;
  healthLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white p-4 lg:block">
        <AppSidebar />
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="secondary" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <AppSidebar />
              </SheetContent>
            </Sheet>
            <div>
              <div className="text-lg font-semibold leading-tight">Service Desk Autopilot</div>
              <div className="text-xs text-muted-foreground">Technician dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sourceLabel && (
              <Badge tone={sourceLabel === "Deferred" ? "warning" : "live"}>{sourceLabel}</Badge>
            )}
            {healthLabel && (
              <Badge tone={healthLabel === "ok" ? "success" : "destructive"}>{healthLabel}</Badge>
            )}
            <RefreshButton />
          </div>
        </header>
        <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

export function DashboardError() {
  return (
    <DashboardShell>
      <div role="alert" className="panel border-destructive bg-red-50 p-4 text-destructive">
        Could not load dashboard data. Check backend status and retry.
      </div>
    </DashboardShell>
  );
}
