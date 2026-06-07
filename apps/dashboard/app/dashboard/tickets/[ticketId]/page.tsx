import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { RunConversation } from "@/components/run-conversation";
import { TicketDetailActions } from "@/components/ticket-detail-actions";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCustomerSystem, getDashboard, getRun, getTicket } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  try {
    const { ticketId } = await params;
    const id = Number(ticketId);
    const dashboard = await getDashboard();
    const [ticket, customerSystem] = await Promise.all([getTicket(id), getCustomerSystem(id)]);
    const dashboardTicket = dashboard.tickets.items.find((item) => item.id === id);
    if (!dashboardTicket) return <DashboardError />;

    const latestRun = [...dashboard.runs.active, ...dashboard.runs.terminal]
      .filter((item) => item.ticketId === id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const run = latestRun ? await getRun(latestRun.runId) : null;

    return (
      <DashboardShell
        sourceLabel={sourceLabel(dashboard.source.type)}
        healthLabel={dashboard.health.status}
      >
        <section className="flex w-full flex-col gap-4">
          <header className="space-y-3 border-b pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ticket #{ticket.id}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
                <p className="text-sm text-muted-foreground">{ticket.customer_name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{ticket.priority}</Badge>
                <Badge
                  variant={
                    ticket.status === "DONE"
                      ? "outline"
                      : ticket.status === "PENDING"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {ticket.status}
                </Badge>
                <Badge variant={dashboardTicket.source === "deferred" ? "secondary" : "outline"}>
                  {sourceLabel(dashboardTicket.source)}
                </Badge>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {customerSystem.system.username}@{customerSystem.system.ip}:
              {customerSystem.system.port} ({customerSystem.system.os})
            </p>
          </header>

          {run ? (
            <>
              {run.status === "COMPLETED" || run.status === "FAILED" || run.status === "ABORTED" ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    Latest run {run.status.toLowerCase()}. Start a new run to investigate again.
                  </p>
                  <TicketDetailActions ticketId={ticket.id} hasRun />
                </div>
              ) : null}
              <RunConversation initialRun={run} />
            </>
          ) : (
            <Empty className="min-h-[20rem] rounded-xl border">
              <EmptyHeader>
                <EmptyTitle>Nothing here yet</EmptyTitle>
                <EmptyDescription>
                  Start a run to let the autopilot investigate this ticket. You will only be asked
                  to approve commands or submit the final resolution.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <TicketDetailActions ticketId={ticket.id} />
              </EmptyContent>
            </Empty>
          )}
        </section>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
