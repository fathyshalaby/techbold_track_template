import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { RunsList } from "@/components/runs-list";
import { Badge } from "@/components/ui/badge";
import { getDashboard } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";

export default async function RunsPage() {
  try {
    const dashboard = await getDashboard();
    const { active, terminal } = dashboard.runs;
    const total = active.length + terminal.length;
    return (
      <DashboardShell
        title="Runs"
        sourceLabel={sourceLabel(dashboard.source.type)}
        healthLabel={dashboard.health.status}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Runs</h1>
            <Badge variant="outline">{total} total</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Track troubleshooting progress across all tickets. Active runs need attention; completed
            runs show what was resolved.
          </p>
        </div>
        <RunsList active={active} terminal={terminal} />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
