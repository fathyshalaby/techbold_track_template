import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import Link from "next/link";

export default async function RunsPage() {
  try {
    const dashboard = await getDashboard();
    const runs = [...dashboard.runs.active, ...dashboard.runs.terminal];
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <Card>
          <CardHeader>
            <CardTitle>Runs</CardTitle>
            <Badge tone="live">{dashboard.source.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {runs.length === 0 ? (
              <div>
                <h2 className="text-lg font-semibold">No active runs</h2>
                <p className="text-sm text-muted-foreground">Start a run from an open ticket.</p>
              </div>
            ) : (
              runs.map((run) => (
                <Link
                  key={run.runId}
                  href={`/dashboard/runs/${run.runId}`}
                  className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="font-semibold">
                      <code>{run.runId}</code>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ticket #{run.ticketId} · {run.ticketTitle ?? "ticket unavailable"} ·{" "}
                      {run.phase}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {run.hasPendingApproval && <Badge tone="warning">Approval pending</Badge>}
                    <Badge tone="live">{run.status}</Badge>
                    <Badge tone={run.source === "deferred" ? "warning" : "live"}>
                      {sourceLabel(run.source)}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
