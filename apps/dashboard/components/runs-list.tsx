"use client";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { humanizePhase, relativeTime, runStatusMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { IconChevronRight, IconPlayerPlay, IconSearch } from "@tabler/icons-react";
import type { DashboardRunSummary } from "@techbold/contracts";
import Link from "next/link";
import { useMemo, useState } from "react";

type RunsListProps = {
  active: DashboardRunSummary[];
  terminal: DashboardRunSummary[];
};

function filterRuns(runs: DashboardRunSummary[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return runs;
  return runs.filter((run) => {
    const title = run.ticketTitle?.toLowerCase() ?? "";
    return (
      title.includes(needle) ||
      run.runId.toLowerCase().includes(needle) ||
      String(run.ticketId).includes(needle) ||
      run.customerName?.toLowerCase().includes(needle)
    );
  });
}

function RunRow({ run }: { run: DashboardRunSummary }) {
  const status = runStatusMeta(run.status);
  const time = relativeTime(run.updatedAt);

  return (
    <Link
      href={`/dashboard/runs/${run.runId}`}
      className="group flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{run.ticketTitle ?? `Ticket #${run.ticketId}`}</p>
          {run.hasPendingApproval && (
            <Badge variant="secondary" className="font-normal">
              Needs approval
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>Ticket #{run.ticketId}</span>
          {run.customerName && (
            <>
              <span aria-hidden="true">·</span>
              <span>{run.customerName}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{humanizePhase(run.phase)}</span>
          <span aria-hidden="true">·</span>
          <span title={time.absolute}>{time.relative}</span>
        </div>
      </div>

      <Badge variant="outline" className="hidden shrink-0 gap-1.5 font-normal sm:inline-flex">
        <span className={cn("size-1.5 rounded-full", status.dot)} aria-hidden="true" />
        {status.label}
      </Badge>

      <IconChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function RunsSection({
  runs,
  emptyMessage,
}: { runs: DashboardRunSummary[]; emptyMessage: string }) {
  if (runs.length === 0) {
    return (
      <Empty className="border-0 py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconPlayerPlay />
          </EmptyMedia>
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {runs.map((run) => (
        <RunRow key={run.runId} run={run} />
      ))}
    </div>
  );
}

export function RunsList({ active, terminal }: RunsListProps) {
  const [query, setQuery] = useState("");
  const all = useMemo(() => [...active, ...terminal], [active, terminal]);

  const filteredAll = useMemo(() => filterRuns(all, query), [all, query]);
  const filteredActive = useMemo(() => filterRuns(active, query), [active, query]);
  const filteredTerminal = useMemo(() => filterRuns(terminal, query), [terminal, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by ticket, customer, or run ID..."
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredAll.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filteredActive.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filteredTerminal.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <RunsSection
            runs={filteredAll}
            emptyMessage={
              query
                ? "No runs match your search."
                : "No runs yet. Start one from a ticket to see it here."
            }
          />
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <RunsSection
            runs={filteredActive}
            emptyMessage={query ? "No active runs match your search." : "No active runs right now."}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <RunsSection
            runs={filteredTerminal}
            emptyMessage={query ? "No completed runs match your search." : "No completed runs yet."}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
