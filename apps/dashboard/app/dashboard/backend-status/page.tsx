import { BackendStatus } from "@/components/backend-status";
import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard, getModelSettings } from "@/lib/api";
import { runtimeModeLabel } from "@/lib/runtime-labels";
import { sourceLabel } from "@/lib/source-labels";
import {
  MAC_MLX_HOST,
  MAC_MLX_PORT,
  MAC_MODEL_SERVE_CMD,
  MAC_MODEL_TRAIN_CMD,
  isCustomModelId,
  modelLabel,
} from "@techbold/contracts";

export default async function BackendStatusPage() {
  try {
    const [dashboard, modelSettings] = await Promise.all([getDashboard(), getModelSettings()]);
    const source = sourceLabel(dashboard.source.type);
    const activeModelLabel = modelLabel(modelSettings.model);
    const macModelActive = isCustomModelId(modelSettings.model);
    return (
      <DashboardShell
        title="Backend status"
        sourceLabel={source}
        healthLabel={dashboard.health.status}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Backend status</h1>
          <p className="text-sm text-muted-foreground">
            Connection, persistence, and runtime mode of the autopilot backend.
          </p>
        </div>
        <BackendStatus
          health={dashboard.health}
          memory={dashboard.memory}
          observability={dashboard.observability}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Runtime</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Mode" value={runtimeModeLabel(dashboard.health.mode)} />
            <Field label="Store" value={dashboard.health.store.mode} />
            <Field label="Source" value={source} />
            <Field
              label="Active model"
              value={macModelActive ? `${activeModelLabel} (Mac MLX)` : activeModelLabel}
            />
          </CardContent>
          {macModelActive && (
            <CardContent className="border-t pt-4 text-sm text-muted-foreground">
              Mac-only local inference. Agent calls route to the trained MLX adapter at{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                {MAC_MLX_HOST}:{MAC_MLX_PORT}
              </code>{" "}
              when <code className="rounded bg-muted px-1 py-0.5 text-xs">MOCK_LLM=false</code>.
              Train with{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">{MAC_MODEL_TRAIN_CMD}</code>,
              then serve with{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">{MAC_MODEL_SERVE_CMD}</code>.
            </CardContent>
          )}
        </Card>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
