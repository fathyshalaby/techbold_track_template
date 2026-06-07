"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { actorLabel, auditMeta, formatDayHeader, relativeTime } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { IconChevronRight, IconClipboardList, IconSearch } from "@tabler/icons-react";
import type { AuditEvidenceSummary } from "@techbold/contracts";
import Link from "next/link";
import { useMemo, useState } from "react";

const ACTOR_FILTERS = [
  { value: "all", label: "All" },
  { value: "agent", label: "Agent" },
  { value: "technician", label: "Technician" },
  { value: "system", label: "System" },
  { value: "ssh", label: "SSH" },
] as const;

function filterEvents(events: AuditEvidenceSummary[], query: string, actor: string) {
  const needle = query.trim().toLowerCase();
  return events.filter((event) => {
    if (actor !== "all" && event.actor.toLowerCase() !== actor) return false;
    if (!needle) return true;
    return (
      event.type.toLowerCase().includes(needle) ||
      event.actor.toLowerCase().includes(needle) ||
      event.payloadSummary.toLowerCase().includes(needle) ||
      event.runId.toLowerCase().includes(needle)
    );
  });
}

function groupByDay(events: AuditEvidenceSummary[]) {
  const groups = new Map<string, AuditEvidenceSummary[]>();
  for (const event of events) {
    const dayKey = event.ts.slice(0, 10);
    const list = groups.get(dayKey) ?? [];
    list.push(event);
    groups.set(dayKey, list);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}

export function AuditList({ events }: { events: AuditEvidenceSummary[] }) {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState<string>("all");

  const filtered = useMemo(() => filterEvents(events, query, actor), [events, query, actor]);
  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  if (events.length === 0) {
    return (
      <Empty className="border py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconClipboardList />
          </EmptyMedia>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>
            Actions from agents and technicians are recorded here as they happen.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {ACTOR_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={actor === filter.value ? "default" : "outline"}
              className="h-7 rounded-full px-3 text-xs"
              onClick={() => setActor(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <IconSearch
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events..."
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="border-0 py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconClipboardList />
            </EmptyMedia>
            <EmptyTitle>No matches</EmptyTitle>
            <EmptyDescription>Try a different search or filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-8">
          {grouped.map(([dayKey, dayEvents]) => (
            <section key={dayKey}>
              <h2 className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {formatDayHeader(dayEvents[0]?.ts ?? dayKey)}
              </h2>
              <div className="relative space-y-0 pl-6">
                <span
                  className="absolute top-2 bottom-2 left-[7px] w-px bg-border"
                  aria-hidden="true"
                />
                {dayEvents.map((event) => {
                  const meta = auditMeta(event.type);
                  const Icon = meta.icon;
                  const time = relativeTime(event.ts);

                  return (
                    <Link
                      key={event.id}
                      href={`/dashboard/runs/${event.runId}`}
                      className="group relative flex gap-3 rounded-lg py-3 pr-2 pl-2 transition-colors hover:bg-muted/40"
                    >
                      <span
                        className={cn(
                          "absolute top-4 -left-6 flex size-4 items-center justify-center rounded-full border bg-background",
                        )}
                        aria-hidden="true"
                      >
                        <span className={cn("size-2 rounded-full", meta.dot)} />
                      </span>

                      <div
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/30",
                          meta.iconClass,
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{meta.label}</p>
                          <Badge variant="outline" className="font-normal">
                            {actorLabel(event.actor)}
                          </Badge>
                          <span className="text-xs text-muted-foreground" title={time.absolute}>
                            {time.relative}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.payloadSummary}</p>
                        <p className="font-mono text-xs text-muted-foreground/80">
                          Run {event.runId.slice(0, 8)}
                        </p>
                      </div>

                      <IconChevronRight
                        className="mt-2 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
