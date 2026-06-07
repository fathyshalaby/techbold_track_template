import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { RunWorkflow } from "@/components/run-workflow";
import { getDashboard, getRun } from "@/lib/api";

export default async function RunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  try {
    const { runId } = await params;
    const [dashboard, run] = await Promise.all([getDashboard(), getRun(runId)]);
    return (
      <DashboardShell sourceLabel={dashboard.source.label} healthLabel={dashboard.health.status}>
        <RunWorkflow initialRun={run} />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
