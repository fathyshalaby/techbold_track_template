import { AuditList } from "@/components/audit-list";
import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { getDashboard } from "@/lib/api";

export default async function AuditPage() {
  try {
    const dashboard = await getDashboard();
    const events = dashboard.auditEvidence;
    return (
      <DashboardShell title="Audit" sourceLabel={undefined} healthLabel={dashboard.health.status}>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Audit trail</h1>
            <Badge variant="outline">{events.length} events</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            A chronological record of what the agent and technicians did on each run.
          </p>
        </div>
        <AuditList events={events} />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
