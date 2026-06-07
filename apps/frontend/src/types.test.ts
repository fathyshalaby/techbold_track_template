import { SSE_EVENT_TYPES as CONTRACT_SSE_EVENT_TYPES } from "@techbold/contracts";
import { describe, expect, it } from "vitest";
import { SSE_EVENT_TYPES } from "./types";

describe("SSE_EVENT_TYPES", () => {
  it("contains the canonical frontend event contract without legacy aliases", () => {
    expect(SSE_EVENT_TYPES).toContain("validation.completed");
    expect(SSE_EVENT_TYPES).toContain("activity.drafted");
    expect(SSE_EVENT_TYPES).not.toContain("validation.complete");
    expect(SSE_EVENT_TYPES).not.toContain("activity.draft_ready");
    expect(new Set(SSE_EVENT_TYPES).size).toBe(SSE_EVENT_TYPES.length);
  });

  it("matches the shared contracts package tuple", () => {
    expect(SSE_EVENT_TYPES).toEqual(CONTRACT_SSE_EVENT_TYPES);
  });
});
