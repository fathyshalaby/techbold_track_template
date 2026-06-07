import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { TicketDetailActions } from "@/components/ticket-detail-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerSystem, getDashboard, getTicket } from "@/lib/api";
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

    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ticket #{ticket.id}</CardTitle>
                <p className="text-sm text-muted-foreground">{ticket.customer_name}</p>
              </div>
              <Badge tone={dashboardTicket.source === "deferred" ? "warning" : "live"}>
                {sourceLabel(dashboardTicket.source)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <h1 className="text-2xl font-semibold">{ticket.title}</h1>
              <p>{ticket.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="live">{ticket.priority}</Badge>
                <Badge
                  tone={
                    ticket.status === "DONE"
                      ? "success"
                      : ticket.status === "PENDING"
                        ? "warning"
                        : "live"
                  }
                >
                  {ticket.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Safe target metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <code className="block rounded-md border bg-slate-50 p-3">
                {customerSystem.system.username}@{customerSystem.system.ip}:
                {customerSystem.system.port}
              </code>
              <p className="text-sm text-muted-foreground">{customerSystem.system.os}</p>
              <Badge tone={customerSystem.source === "deferred" ? "warning" : "live"}>
                {sourceLabel(customerSystem.source)}
              </Badge>
              <TicketDetailActions ticketId={ticket.id} />
            </CardContent>
          </Card>
        </section>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
