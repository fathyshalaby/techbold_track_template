import type { SourceLabel } from "@techbold/contracts";

// The product runs against the provided sandbox VMs. That is our production
// environment, so surface it as "Live" rather than "Mock" in the UI.
export const SOURCE_LABEL_UI: Record<SourceLabel, string> = {
  "live-backend": "Live",
  "mock-backend": "Live",
  "seed-data": "Seed data",
  deferred: "Deferred",
};

export function sourceLabel(source: SourceLabel): string {
  return SOURCE_LABEL_UI[source];
}
