import { BackendStatus } from "@/components/backend-status";
import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import Link from "next/link";

export default async function DashboardPage() {
  try {
    const dashboard = await getDashboard();
    const allRuns = [...dashboard.runs.active, ...dashboard.runs.terminal];
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Operational overview</CardTitle>
                <CardDescription>{dashboard.source.label}</CardDescription>
              </div>
              <Badge tone="live">{dashboard.tickets.counts.total} tickets</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <StatusCount
                label="Open tickets"
                value={dashboard.tickets.counts.open}
                source={dashboard.source.label}
              />
              <StatusCount
                label="Pending tickets"
                value={dashboard.tickets.counts.pending}
                source={dashboard.source.label}
              />
              <StatusCount
                label="Done tickets"
                value={dashboard.tickets.counts.done}
                source={dashboard.source.label}
              />
            </CardContent>
          </Card>
          <BackendStatus
            health={dashboard.health}
            memory={dashboard.memory}
            observability={dashboard.observability}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <Link className="text-sm font-semibold text-primary" href="/dashboard/tickets">
                Open queue
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboard.tickets.items.length === 0 ? (
                <Empty
                  heading="No tickets available"
                  body="Refresh when the backend has assigned work."
                />
              ) : (
                dashboard.tickets.items.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    className="flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2"
                    href={`/dashboard/tickets/${ticket.id}`}
                  >
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      #{ticket.id} {ticket.title}
                    </span>
                    <Badge className="shrink-0" tone="live">
                      {sourceLabel(ticket.source)}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Runs</CardTitle>
              <Link className="text-sm font-semibold text-primary" href="/dashboard/runs">
                Open runs
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {allRuns.length === 0 ? (
                <Empty heading="No active runs" body="Start a run from an open ticket." />
              ) : (
                allRuns.slice(0, 5).map((run) => (
                  <Link
                    key={run.runId}
                    className="flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2"
                    href={`/dashboard/runs/${run.runId}`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <code>{run.runId.slice(0, 12)}</code> {run.phase}
                    </span>
                    <Badge className="shrink-0" tone={run.hasPendingApproval ? "warning" : "live"}>
                      {run.status}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <SummaryList
            title="Pending approvals"
            emptyHeading="No pending approvals"
            emptyBody="Runs that need technician approval appear here."
            items={dashboard.pendingApprovals.map((approval) => ({
              key: approval.approvalId,
              href: `/dashboard/runs/${approval.runId}`,
              label: approval.proposedCommand,
              source: sourceLabel(approval.source),
            }))}
          />
          <SummaryList
            title="Audit evidence"
            emptyHeading="No audit evidence"
            emptyBody="Run evidence appears after backend workflow events."
            items={dashboard.auditEvidence.map((event) => ({
              key: event.id,
              href: `/dashboard/runs/${event.runId}`,
              label: `${event.type} by ${event.actor}`,
              source: sourceLabel(event.source),
            }))}
          />
          <SummaryList
            title="Activity state"
            emptyHeading="No activity states"
            emptyBody="Activity drafts and submissions appear after run progress."
            items={dashboard.activityStates.map((state) => ({
              key: state.runId,
              href: `/dashboard/runs/${state.runId}`,
              label: `${state.state} for ticket #${state.ticketId}`,
              source: sourceLabel(state.source),
            }))}
          />
          <Card>
            <CardHeader>
              <CardTitle>Memory and observability</CardTitle>
              <Badge tone="warning">Deferred</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>{dashboard.memory.message}</p>
              <p>{dashboard.observability.message}</p>
            </CardContent>
          </Card>
        </section>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}

function StatusCount({ label, value, source }: { label: string; value: number; source: string }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <Badge className="mt-2" tone="live">
        {source}
      </Badge>
    </div>
  );
}

function Empty({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="rounded-md border bg-slate-50 p-4">
      <h3 className="font-semibold">{heading}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function SummaryList({
  title,
  emptyHeading,
  emptyBody,
  items,
}: {
  title: string;
  emptyHeading: string;
  emptyBody: string;
  items: Array<{ key: string; href: string; label: string; source: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <Empty heading={emptyHeading} body={emptyBody} />
        ) : (
          items.slice(0, 5).map((item) => (
            <Link
              key={item.key}
              className="flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2"
              href={item.href}
            >
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <Badge className="shrink-0" tone={item.source === "Deferred" ? "warning" : "live"}>
                {item.source}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
