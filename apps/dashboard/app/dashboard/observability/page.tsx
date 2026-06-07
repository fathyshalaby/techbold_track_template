import { BackendStatus } from "@/components/backend-status";
import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";

export default async function ObservabilityPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <Card>
          <CardHeader>
            <CardTitle>Observability</CardTitle>
            <Badge tone="warning">{sourceLabel(dashboard.observability.source)}</Badge>
          </CardHeader>
          <CardContent>
            <p>{dashboard.observability.message}</p>
          </CardContent>
        </Card>
        <BackendStatus
          health={dashboard.health}
          memory={dashboard.memory}
          observability={dashboard.observability}
        />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
