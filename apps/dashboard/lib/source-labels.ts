import type { SourceLabel } from "@techbold/contracts";

export const SOURCE_LABEL_UI: Record<SourceLabel, string> = {
  "live-backend": "Live backend",
  "mock-backend": "Mock backend",
  "seed-data": "Seed data",
  deferred: "Deferred",
};

export function sourceLabel(source: SourceLabel): string {
  return SOURCE_LABEL_UI[source];
}
