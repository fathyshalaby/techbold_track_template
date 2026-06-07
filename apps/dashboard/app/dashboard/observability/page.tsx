import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { ObservabilityCharts } from "@/components/observability-charts";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getDashboard } from "@/lib/api";
import {
  IconAlertTriangle,
  IconChartBar,
  IconClock,
  IconPlayerPlay,
  IconShieldCheck,
  IconTerminal2,
} from "@tabler/icons-react";

function formatPercent(rate: number | null) {
  if (rate === null) return "N/A";
  return `${Math.round(rate * 100)}%`;
}

function formatDuration(ms: number | null) {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export default async function ObservabilityPage() {
  try {
    const dashboard = await getDashboard();
    const metrics = dashboard.observability.metrics;

    return (
      <DashboardShell
        title="Observability"
        sourceLabel={undefined}
        healthLabel={dashboard.health.status}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Observability</h1>
          <p className="text-sm text-muted-foreground">
            Operational signals, traces, and metrics for the autopilot.
          </p>
        </div>

        {!metrics ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operational signals</CardTitle>
            </CardHeader>
            <CardContent>
              <Empty className="border-0 py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconChartBar />
                  </EmptyMedia>
                  <EmptyTitle>Nothing here yet</EmptyTitle>
                  <EmptyDescription>{dashboard.observability.message}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard
                label="Total runs"
                value={metrics.runs.total}
                icon={IconPlayerPlay}
                hint={`${metrics.runs.active} active`}
              />
              <StatCard
                label="Success rate"
                value={formatPercent(metrics.runs.successRate)}
                icon={IconChartBar}
                hint="Completed / terminal"
                accent={metrics.runs.successRate !== null && metrics.runs.successRate >= 0.8}
              />
              <StatCard
                label="Pending approvals"
                value={metrics.approvals.pending}
                icon={IconShieldCheck}
                hint={`${metrics.approvals.total} total`}
                accent={metrics.approvals.pending > 0}
              />
              <StatCard
                label="Commands executed"
                value={metrics.commands.executed}
                icon={IconTerminal2}
                hint={`Avg ${formatDuration(metrics.commands.avgDurationMs)}`}
              />
              <StatCard
                label="Command failures"
                value={metrics.commands.failed}
                icon={IconAlertTriangle}
                hint="Non-zero exit codes"
                accent={metrics.commands.failed > 0}
              />
              <StatCard
                label="Timeouts"
                value={metrics.commands.timedOut}
                icon={IconClock}
                hint="SSH command timeouts"
                accent={metrics.commands.timedOut > 0}
              />
            </div>

            <ObservabilityCharts metrics={metrics} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Approval decisions</CardTitle>
                <CardDescription>
                  Technician decisions across all proposed commands.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <MetricField label="Approved" value={metrics.approvals.approved} />
                <MetricField label="Rejected" value={metrics.approvals.rejected} />
                <MetricField label="Pending" value={metrics.approvals.pending} />
              </CardContent>
            </Card>
          </>
        )}
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}

function MetricField({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
