import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { RunConversation } from "@/components/run-conversation";
import { getDashboard, getRun } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";

export default async function RunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  try {
    const { runId } = await params;
    const [dashboard, run] = await Promise.all([getDashboard(), getRun(runId)]);
    return (
      <DashboardShell
        sourceLabel={sourceLabel(dashboard.source.type)}
        healthLabel={dashboard.health.status}
      >
        <RunConversation initialRun={run} />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
