import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { TicketTable } from "@/components/ticket-table";
import { getDashboard } from "@/lib/api";

export default async function TicketsPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <TicketTable tickets={dashboard.tickets.items} dashboardSource={dashboard.source.type} />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
