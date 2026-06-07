"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ObservabilityMetrics } from "@techbold/contracts";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

const runStatusChartConfig = {
  active: { label: "Active", color: "var(--chart-1)" },
  completed: { label: "Completed", color: "var(--chart-2)" },
  failed: { label: "Failed", color: "var(--chart-3)" },
  aborted: { label: "Aborted", color: "var(--chart-4)" },
} as const;

const riskChartConfig = {
  SAFE_READ_ONLY: { label: "Safe read-only", color: "var(--chart-1)" },
  LOW_RISK_CHANGE: { label: "Low risk", color: "var(--chart-2)" },
  MEDIUM_RISK_CHANGE: { label: "Medium risk", color: "var(--chart-3)" },
  HIGH_RISK_BLOCKED: { label: "High risk blocked", color: "var(--chart-4)" },
} as const;

function formatRiskLabel(key: string) {
  return riskChartConfig[key as keyof typeof riskChartConfig]?.label ?? key;
}

export function ObservabilityCharts({ metrics }: { metrics: ObservabilityMetrics }) {
  const runStatusData = [
    { status: "active", count: metrics.runs.active, fill: "var(--color-active)" },
    { status: "completed", count: metrics.runs.completed, fill: "var(--color-completed)" },
    { status: "failed", count: metrics.runs.failed, fill: "var(--color-failed)" },
    { status: "aborted", count: metrics.runs.aborted, fill: "var(--color-aborted)" },
  ].filter((entry) => entry.count > 0);

  const riskData = Object.entries(metrics.approvals.byRisk)
    .map(([risk, count]) => ({
      risk,
      count,
      fill: `var(--color-${risk})`,
    }))
    .filter((entry) => entry.count > 0);

  const auditData = Object.entries(metrics.auditByActor).map(([actor, count]) => ({
    actor,
    count,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Runs by status</CardTitle>
          <CardDescription>Active and terminal run distribution.</CardDescription>
        </CardHeader>
        <CardContent>
          {runStatusData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs recorded yet.</p>
          ) : (
            <ChartContainer config={runStatusChartConfig} className="aspect-[4/3] w-full">
              <BarChart data={runStatusData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    runStatusChartConfig[value as keyof typeof runStatusChartConfig]?.label ?? value
                  }
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approvals by risk</CardTitle>
          <CardDescription>Command proposals grouped by safety classification.</CardDescription>
        </CardHeader>
        <CardContent>
          {riskData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approvals recorded yet.</p>
          ) : (
            <ChartContainer
              config={riskChartConfig}
              className="mx-auto aspect-square max-h-[280px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="risk"
                      formatter={(value, name) => [value, formatRiskLabel(String(name))]}
                    />
                  }
                />
                <Pie
                  data={riskData}
                  dataKey="count"
                  nameKey="risk"
                  innerRadius={56}
                  strokeWidth={2}
                >
                  {riskData.map((entry) => (
                    <Cell key={entry.risk} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {auditData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Audit events by actor</CardTitle>
            <CardDescription>Who initiated actions across the audit trail.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                auditData.map((entry, index) => [
                  entry.actor,
                  { label: entry.actor, color: `var(--chart-${(index % 5) + 1})` },
                ]),
              )}
              className="aspect-[3/1] w-full"
            >
              <BarChart data={auditData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="actor" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
