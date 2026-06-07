import { ApprovalsList } from "@/components/approvals-list";
import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { getDashboard } from "@/lib/api";

export default async function ApprovalsPage() {
  try {
    const dashboard = await getDashboard();
    const approvals = dashboard.pendingApprovals;
    return (
      <DashboardShell
        title="Approvals"
        sourceLabel={undefined}
        healthLabel={dashboard.health.status}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
            <Badge variant={approvals.length > 0 ? "secondary" : "outline"}>
              {approvals.length} pending
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Review proposed commands and approve or reject them without leaving this page.
          </p>
        </div>
        <ApprovalsList approvals={approvals} />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
