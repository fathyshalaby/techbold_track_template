import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import Link from "next/link";

export default async function AuditPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <Card>
          <CardHeader>
            <CardTitle>Audit evidence</CardTitle>
            <Badge tone="live">{dashboard.source.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.auditEvidence.length === 0 ? (
              <div>
                <h2 className="text-lg font-semibold">No audit evidence</h2>
                <p className="text-sm text-muted-foreground">
                  Run evidence appears after backend workflow events.
                </p>
              </div>
            ) : (
              dashboard.auditEvidence.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/runs/${event.runId}`}
                  className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="font-semibold">{event.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.actor} · {event.ts} · run {event.runId}
                    </div>
                    <p className="mt-2 text-sm">{event.payloadSummary}</p>
                  </div>
                  <Badge tone={event.source === "deferred" ? "warning" : "live"}>
                    {sourceLabel(event.source)}
                  </Badge>
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
