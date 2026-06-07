import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { TicketsDataTable } from "@/components/tickets-data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import {
  IconChecklist,
  IconCircleCheck,
  IconClock,
  IconInbox,
  IconPlayerPlay,
  IconShieldCheck,
} from "@tabler/icons-react";
import Link from "next/link";

export default async function DashboardPage() {
  let dashboard: Awaited<ReturnType<typeof getDashboard>>;
  try {
    dashboard = await getDashboard(50);
  } catch {
    return <DashboardError />;
  }

  const { tickets, runs, pendingApprovals } = dashboard;
  const activeRuns = runs.active;
  const source = sourceLabel(dashboard.source.type);

  return (
    <DashboardShell sourceLabel={source} healthLabel={dashboard.health.status}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Technician Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Triage the queue, approve proposed commands, and track runs in real time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>All incidents assigned to this technician console.</CardDescription>
        </CardHeader>
        <CardContent>
          <TicketsDataTable tickets={tickets.items} source={dashboard.source.type} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Pending approvals</CardTitle>
            <Badge variant={pendingApprovals.length > 0 ? "secondary" : "outline"}>
              {pendingApprovals.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <Empty className="border-0 py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconShieldCheck />
                  </EmptyMedia>
                  <EmptyTitle>Nothing here yet</EmptyTitle>
                  <EmptyDescription>No pending approvals.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingApprovals.slice(0, 5).map((approval) => (
                  <Link
                    key={approval.approvalId}
                    href={`/dashboard/runs/${approval.runId}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">Ticket #{approval.ticketId}</span>
                      <Badge variant="secondary">{approval.riskLevel}</Badge>
                    </div>
                    <code className="mt-1 block truncate text-xs text-muted-foreground">
                      {approval.proposedCommand}
                    </code>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Runs in progress</CardTitle>
            <Badge variant={activeRuns.length > 0 ? "secondary" : "outline"}>
              {activeRuns.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {activeRuns.length === 0 ? (
              <Empty className="border-0 py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconChecklist />
                  </EmptyMedia>
                  <EmptyTitle>Nothing here yet</EmptyTitle>
                  <EmptyDescription>No active runs.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-2">
                {activeRuns.slice(0, 5).map((run) => (
                  <Link
                    key={run.runId}
                    href={`/dashboard/runs/${run.runId}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {run.ticketTitle ?? `Ticket #${run.ticketId}`}
                      </span>
                      {run.hasPendingApproval && <Badge variant="secondary">Approval</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Ticket #{run.ticketId}</span>
                      <span aria-hidden="true">·</span>
                      <span>{run.phase}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
