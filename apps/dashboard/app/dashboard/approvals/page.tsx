import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import Link from "next/link";

export default async function ApprovalsPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <Card>
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
            <Badge tone="live">{dashboard.source.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.pendingApprovals.length === 0 ? (
              <div>
                <h2 className="text-lg font-semibold">No pending approvals</h2>
                <p className="text-sm text-muted-foreground">
                  Runs that need technician approval appear here.
                </p>
              </div>
            ) : (
              dashboard.pendingApprovals.map((approval) => (
                <Link
                  key={approval.approvalId}
                  href={`/dashboard/runs/${approval.runId}`}
                  className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="font-semibold">Ticket #{approval.ticketId}</div>
                    <code className="text-sm">{approval.proposedCommand}</code>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="warning">{approval.riskLevel}</Badge>
                    <Badge tone={approval.source === "deferred" ? "warning" : "live"}>
                      {sourceLabel(approval.source)}
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
