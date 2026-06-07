import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getDashboard } from "@/lib/api";
import { IconClipboardCheck } from "@tabler/icons-react";
import Link from "next/link";

export default async function ResolutionsPage() {
  try {
    const dashboard = await getDashboard();
    const states = dashboard.activityStates;
    return (
      <DashboardShell
        title="Resolutions"
        sourceLabel={undefined}
        healthLabel={dashboard.health.status}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Resolutions</h1>
          <p className="text-sm text-muted-foreground">
            Drafted and submitted resolution write-ups generated from runs.
          </p>
        </div>
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Resolutions</CardTitle>
            <Badge variant="outline">{states.length}</Badge>
          </CardHeader>
          <CardContent>
            {states.length === 0 ? (
              <Empty className="border-0 py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconClipboardCheck />
                  </EmptyMedia>
                  <EmptyTitle>Nothing here yet</EmptyTitle>
                  <EmptyDescription>
                    Resolution drafts and submissions appear after run progress.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-2">
                {states.map((state) => (
                  <Link
                    key={state.runId}
                    href={`/dashboard/runs/${state.runId}`}
                    className="grid gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 md:grid-cols-[1fr_auto] md:items-start"
                  >
                    <div className="min-w-0">
                      <div className="font-medium">Ticket #{state.ticketId}</div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        {state.summary ?? "No resolution summary yet"}
                      </div>
                      {state.validationResult && (
                        <p className="mt-1.5 text-sm">{state.validationResult}</p>
                      )}
                    </div>
                    <Badge variant={state.state === "submitted" ? "default" : "secondary"}>
                      {state.state}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
