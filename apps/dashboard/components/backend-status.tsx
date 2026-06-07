import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sourceLabel } from "@/lib/source-labels";
import type {
  DashboardMemoryStatus,
  DashboardObservabilityStatus,
  HealthSummary,
} from "@techbold/contracts";

export function BackendStatus({
  health,
  memory,
  observability,
}: {
  health: HealthSummary;
  memory: DashboardMemoryStatus;
  observability: DashboardObservabilityStatus;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend status</CardTitle>
        <Badge tone={health.status === "ok" ? "success" : "destructive"}>{health.status}</Badge>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm md:grid-cols-2">
        <StatusLine label="Mode" value={health.mode} source={sourceLabel(health.source)} />
        <StatusLine
          label="Store"
          value={`${health.store.mode} ${health.store.durable ? "durable" : "not durable"}`}
          source={sourceLabel(health.source)}
        />
        <StatusLine label="Memory" value={memory.message} source={sourceLabel(memory.source)} />
        <StatusLine
          label="Observability"
          value={observability.message}
          source={sourceLabel(observability.source)}
        />
      </CardContent>
    </Card>
  );
}

function StatusLine({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
      <Badge className="mt-2" tone={source === "Deferred" ? "warning" : "live"}>
        {source}
      </Badge>
    </div>
  );
}
