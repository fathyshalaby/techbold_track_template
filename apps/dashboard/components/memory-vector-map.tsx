"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import type { MemoryVectorPoint } from "@/lib/api";
import { cn } from "@/lib/utils";
import { IconSearch } from "@tabler/icons-react";
import type { MemoryStatsSummary } from "@techbold/contracts";
import { useMemo, useState } from "react";
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts";

const SOURCE_CONFIG = {
  "public-seed": { label: "Public seed", color: "oklch(0.62 0.19 250)" },
  runbook: { label: "Runbook", color: "oklch(0.64 0.17 165)" },
  "training-contract": { label: "Training", color: "oklch(0.70 0.16 55)" },
  run: { label: "Learned run", color: "oklch(0.62 0.20 305)" },
} as const;

const chartConfig = Object.fromEntries(
  Object.entries(SOURCE_CONFIG).map(([key, value]) => [
    key,
    { label: value.label, color: value.color },
  ]),
);

function VectorStripe({ preview, color }: { preview: number[]; color: string }) {
  const gradient = useMemo(() => {
    if (preview.length === 0) return "linear-gradient(90deg, transparent, transparent)";
    const stops = preview.map((value, index) => {
      const pct = (index / Math.max(preview.length - 1, 1)) * 100;
      const alpha = 0.35 + value * 0.65;
      return `${color.replace(")", ` / ${alpha})`)} ${pct}%`;
    });
    return `linear-gradient(90deg, ${stops.join(", ")})`;
  }, [color, preview]);

  return (
    <div className="overflow-hidden rounded-md border bg-muted/30 p-1">
      <div className="h-3 w-full rounded-sm" style={{ background: gradient }} />
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
        <span>dim 0</span>
        <span>{preview.length} samples</span>
        <span>dim n</span>
      </div>
    </div>
  );
}

type ScatterPoint = MemoryVectorPoint & {
  fill: string;
  radius: number;
  highlighted: boolean;
};

function buildScatterData(points: MemoryVectorPoint[], query: string): ScatterPoint[] {
  const hasQuery = query.trim().length > 0;
  return points.map((point) => {
    const highlighted = hasQuery && point.score !== undefined;
    return {
      ...point,
      fill: SOURCE_CONFIG[point.source]?.color ?? "oklch(0.55 0 0)",
      radius: highlighted ? 7 + (point.score ?? 0) * 6 : 4,
      highlighted,
    };
  });
}

type MemoryVectorMapProps = {
  points: MemoryVectorPoint[];
  stats: MemoryStatsSummary | null;
  available: boolean;
  message: string;
  initialQuery?: string;
};

export function MemoryVectorMap({
  points,
  stats,
  available,
  message,
  initialQuery = "",
}: MemoryVectorMapProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scatterData = useMemo(() => buildScatterData(points, query), [points, query]);
  const selected = scatterData.find((point) => point.id === selectedId) ?? null;
  const matchCount = scatterData.filter((point) => point.highlighted).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={available ? "default" : "secondary"}>
              {available ? "pgvector live" : "unavailable"}
            </Badge>
            {stats && (
              <>
                <Badge variant="outline">{stats.total} vectors</Badge>
                <Badge variant="outline">{stats.bySource.runbook} runbooks</Badge>
                <Badge variant="outline">{stats.bySource["public-seed"]} seeds</Badge>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <form action="/dashboard/memory" method="get" className="flex w-full max-w-md gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Highlight nearest vectors..."
              className="pl-8"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(SOURCE_CONFIG).map(([source, config]) => (
          <div key={source} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
              aria-hidden="true"
            />
            <span>{config.label}</span>
            {stats && (
              <span className="tabular-nums">
                ({stats.bySource[source as keyof typeof stats.bySource] ?? 0})
              </span>
            )}
          </div>
        ))}
        {query.trim() && (
          <div className="text-xs text-muted-foreground">
            {matchCount} vector{matchCount === 1 ? "" : "s"} highlighted
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Embedding space</CardTitle>
          <CardDescription>
            PCA projection of {points.length} vectors. Color encodes source; stripe preview shows
            sampled dimensions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {points.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{message}</p>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-video min-h-[420px] w-full">
              <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis type="number" dataKey="x" name="PC1" tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="PC2" tickLine={false} axisLine={false} />
                <ZAxis type="number" dataKey="radius" range={[40, 220]} />
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(_, __, item) => {
                        const payload = item.payload as ScatterPoint;
                        return (
                          <div className="grid max-w-xs gap-1">
                            <div className="font-medium">{payload.symptom}</div>
                            <div className="text-xs text-muted-foreground">{payload.source}</div>
                            {payload.score !== undefined && (
                              <div className="text-xs tabular-nums">
                                similarity {payload.score.toFixed(2)}
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Scatter
                  data={scatterData}
                  onClick={(data) => {
                    const payload = data?.payload as ScatterPoint | undefined;
                    if (payload?.id) setSelectedId(payload.id);
                  }}
                  shape={(props) => {
                    const { cx = 0, cy = 0, payload } = props;
                    const point = payload as ScatterPoint;
                    const isSelected = point.id === selectedId;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={point.radius}
                        fill={point.fill}
                        className={cn(
                          "cursor-pointer transition-opacity duration-150",
                          point.highlighted || isSelected ? "opacity-100" : "opacity-55",
                        )}
                        stroke={
                          isSelected || point.highlighted ? "var(--foreground)" : "transparent"
                        }
                        strokeWidth={isSelected ? 2 : point.highlighted ? 1.5 : 0}
                        strokeOpacity={0.35}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-base">{selected.symptom}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{selected.source}</Badge>
                  {selected.score !== undefined && (
                    <span className="tabular-nums">similarity {selected.score.toFixed(2)}</span>
                  )}
                </CardDescription>
              </div>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedId(null)}
              >
                Clear
              </button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <VectorStripe preview={selected.preview} color={selected.fill} />
            <div className="grid gap-3 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Root cause
                </div>
                <p className="mt-1">{selected.rootCause}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                  Fix
                </div>
                <p className="mt-1">{selected.fix}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
