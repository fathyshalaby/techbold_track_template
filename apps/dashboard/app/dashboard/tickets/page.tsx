import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { GenerateVmsDialog } from "@/components/generate-vms-dialog";
import { TicketsDataTable } from "@/components/tickets-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";

export default async function TicketsPage() {
  try {
    const dashboard = await getDashboard();
    return (
      <DashboardShell
        title="Tickets"
        sourceLabel={sourceLabel(dashboard.source.type)}
        healthLabel={dashboard.health.status}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Every incident assigned to this technician console.
          </p>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle>Ticket queue</CardTitle>
              <CardDescription>
                Filter, sort, and start runs directly from the table.
              </CardDescription>
            </div>
            <GenerateVmsDialog />
          </CardHeader>
          <CardContent>
            <TicketsDataTable tickets={dashboard.tickets.items} source={dashboard.source.type} />
          </CardContent>
        </Card>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
