import { BackendStatus } from "@/components/backend-status";
import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";

export default async function BackendStatusPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <BackendStatus
          health={dashboard.health}
          memory={dashboard.memory}
          observability={dashboard.observability}
        />
        <Card>
          <CardHeader>
            <CardTitle>Backend source</CardTitle>
            <Badge tone="live">{dashboard.source.label}</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                Mode
              </div>
              <div>{dashboard.health.mode}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                Store
              </div>
              <div>{dashboard.health.store.mode}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                Source
              </div>
              <div>{sourceLabel(dashboard.source.type)}</div>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
