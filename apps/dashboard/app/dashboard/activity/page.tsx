import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import Link from "next/link";

export default async function ActivityPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <Badge tone="live">{dashboard.source.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.activityStates.length === 0 ? (
              <div>
                <h2 className="text-lg font-semibold">No activity states</h2>
                <p className="text-sm text-muted-foreground">
                  Activity drafts and submissions appear after run progress.
                </p>
              </div>
            ) : (
              dashboard.activityStates.map((state) => (
                <Link
                  key={state.runId}
                  href={`/dashboard/runs/${state.runId}`}
                  className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="font-semibold">Ticket #{state.ticketId}</div>
                    <div className="text-sm text-muted-foreground">
                      {state.summary ?? "No activity summary yet"}
                    </div>
                    {state.validationResult && (
                      <p className="mt-2 text-sm">{state.validationResult}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        state.state === "submitted"
                          ? "success"
                          : state.state === "drafted"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {state.state}
                    </Badge>
                    <Badge tone={state.source === "deferred" ? "warning" : "live"}>
                      {sourceLabel(state.source)}
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
