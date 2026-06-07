import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";

export default async function MemoryPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <Card>
          <CardHeader>
            <CardTitle>Memory</CardTitle>
            <Badge tone="warning">{sourceLabel(dashboard.memory.source)}</Badge>
          </CardHeader>
          <CardContent>
            <p>{dashboard.memory.message}</p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
