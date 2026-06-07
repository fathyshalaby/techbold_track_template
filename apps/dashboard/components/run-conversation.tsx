"use client";

import { type RunArtifact, RunArtifactPanel } from "@/components/run-artifact-panel";
import { RunTimelineView } from "@/components/run-timeline-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  abortRun,
  advanceRun,
  approveCommand,
  draftActivity,
  getRun,
  rejectCommand,
  submitActivity,
} from "@/lib/api";
import { subscribeToRunEvents } from "@/lib/events";
import { timelineToBlocks } from "@/lib/run-timeline";
import { cn } from "@/lib/utils";
import type { RunDetail } from "@techbold/contracts";
import { Loader2, MoreHorizontal, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RUN_BADGE_CLASS = "h-7 shrink-0 gap-1.5 px-2.5 text-xs font-normal";

const TERMINAL_STATUS = new Set(["COMPLETED", "FAILED", "ABORTED"]);
const PAUSE_PHASES = new Set([
  "WAITING_FOR_APPROVAL",
  "WAITING_FOR_ACTIVITY_REVIEW",
  "EXECUTING_COMMAND",
]);
const MAX_PUMP_ITERATIONS = 30;

function shouldPause(run: RunDetail): boolean {
  if (TERMINAL_STATUS.has(run.status)) return true;
  if (run.pendingApproval) return true;
  if (PAUSE_PHASES.has(run.phase)) return true;
  return false;
}

export function RunConversation({ initialRun }: { initialRun: RunDetail }) {
  const [run, setRun] = useState(initialRun);
  const [connected, setConnected] = useState(false);
  const [pumping, setPumping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<RunArtifact | null>(null);
  const pumpRef = useRef(false);
  const draftedRef = useRef(Boolean(initialRun.activityDraft));
  const runRef = useRef(initialRun);
  const autoOpenedResolutionRef = useRef(false);

  const blocks = useMemo(
    () => timelineToBlocks(run.timeline, run.phase),
    [run.timeline, run.phase],
  );

  const terminal = TERMINAL_STATUS.has(run.status);
  const effectivePendingApproval = terminal ? null : run.pendingApproval;
  const showResolutionAffordance = Boolean(run.activityDraft);
  const resolutionReadOnly =
    terminal ||
    Boolean(run.activityDraft?.submitted) ||
    run.phase !== "WAITING_FOR_ACTIVITY_REVIEW";

  // Background refreshes (SSE, polling, pump) must never throw: the backend can
  // blip for a moment (container restart, brief network drop) and an uncaught
  // rejection here surfaces as a fatal "Failed to fetch" runtime overlay. On
  // failure we mark the connection as dropped and keep the last known run.
  const refreshRun = useCallback(async () => {
    try {
      const refreshed = await getRun(runRef.current.runId);
      runRef.current = refreshed;
      setRun(refreshed);
      if (refreshed.activityDraft) draftedRef.current = true;
      return refreshed;
    } catch (err) {
      console.warn("[run] refresh failed; keeping last known run", err);
      setConnected(false);
      return runRef.current;
    }
  }, []);

  const pump = useCallback(async () => {
    if (pumpRef.current || terminal) return;
    pumpRef.current = true;
    setPumping(true);
    setActionError(null);

    try {
      let iterations = 0;
      // Start from the run we already loaded (server-rendered or last refresh)
      // instead of paying for an extra round-trip before the first advance.
      let current = runRef.current;

      while (iterations < MAX_PUMP_ITERATIONS) {
        if (shouldPause(current)) {
          if (
            current.phase === "WAITING_FOR_ACTIVITY_REVIEW" &&
            !current.activityDraft &&
            !draftedRef.current
          ) {
            await draftActivity(current.runId);
            draftedRef.current = true;
            current = await refreshRun();
          }
          break;
        }

        try {
          await advanceRun(current.runId);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          setActionError(message);
          break;
        }

        current = await refreshRun();
        iterations += 1;

        if (shouldPause(current)) {
          if (
            current.phase === "WAITING_FOR_ACTIVITY_REVIEW" &&
            !current.activityDraft &&
            !draftedRef.current
          ) {
            await draftActivity(current.runId);
            draftedRef.current = true;
            current = await refreshRun();
          }
          break;
        }
      }
    } finally {
      pumpRef.current = false;
      setPumping(false);
    }
  }, [refreshRun, terminal]);

  useEffect(() => {
    setRun(initialRun);
    runRef.current = initialRun;
    if (initialRun.activityDraft) draftedRef.current = true;
  }, [initialRun]);

  useEffect(() => {
    const unsubscribe = subscribeToRunEvents(run.runId, {
      onOpen: () => setConnected(true),
      onError: () => setConnected(false),
      onEvent: () => {
        void refreshRun();
      },
    });
    return unsubscribe;
  }, [run.runId, refreshRun]);

  useEffect(() => {
    if (!pumping) return;
    const interval = setInterval(() => {
      void refreshRun();
    }, 2000);
    return () => clearInterval(interval);
  }, [pumping, refreshRun]);

  // Auto-open the resolution panel once when the run enters review. Closing it
  // must stick, so this does not depend on `artifact` (which would re-fire and
  // reopen the panel on every close). The ref resets when the run leaves the
  // review phase, so a later re-entry opens it again.
  useEffect(() => {
    const inReview = run.phase === "WAITING_FOR_ACTIVITY_REVIEW" && Boolean(run.activityDraft);
    if (!inReview) {
      autoOpenedResolutionRef.current = false;
      return;
    }
    if (!autoOpenedResolutionRef.current) {
      autoOpenedResolutionRef.current = true;
      setArtifact({ kind: "resolution" });
    }
  }, [run.phase, run.activityDraft]);

  // The desktop artifact panel is a plain aside (not a dialog), so wire Escape
  // to close it. The mobile Sheet handles Escape on its own; a redundant close
  // there is harmless.
  useEffect(() => {
    if (!artifact) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setArtifact(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [artifact]);

  // Pump when pause conditions clear for this run instance.
  // biome-ignore lint/correctness/useExhaustiveDependencies: initialRun.runId scopes auto-run to one conversation mount
  useEffect(() => {
    if (!terminal && !run.pendingApproval && run.phase !== "WAITING_FOR_ACTIVITY_REVIEW") {
      void pump();
    }
  }, [initialRun.runId, terminal, run.pendingApproval, run.phase, pump]);

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await refreshRun();
      await pump();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitResolution(
    overrides: Partial<
      Record<
        "summary" | "rootCause" | "actionsTaken" | "commandsSummary" | "validationResult",
        string
      >
    >,
  ) {
    await runAction(() => submitActivity(run.runId, overrides));
  }

  const statusLabel = run.status.toLowerCase();
  const phaseLabel = run.phase.replaceAll("_", " ").toLowerCase();

  return (
    <section className="flex h-[calc(100dvh-7.5rem)] w-full flex-col">
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="mx-auto flex w-full max-w-3xl shrink-0 items-start justify-between gap-3 border-b pb-3">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-base font-semibold tracking-tight">
                  {run.ticket?.title ?? `Run ${run.runId.slice(0, 10)}`}
                </h1>
                <Badge variant="secondary" className={RUN_BADGE_CLASS}>
                  {phaseLabel}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {run.ticket && (
                  <span className="font-medium text-foreground">#{run.ticket.id} </span>
                )}
                <span className="capitalize">{statusLabel}</span>
                {run.target && (
                  <>
                    {" · "}
                    {run.target.username}@{run.target.ip}:{run.target.port}
                  </>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {(busy || pumping) && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
              )}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    connected ? "bg-emerald-500" : "bg-amber-500",
                  )}
                  aria-hidden="true"
                />
                {connected ? "Live" : "Reconnecting"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" size="icon-sm" variant="ghost" aria-label="Run actions" />
                  }
                >
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={busy || terminal}
                    onClick={() => void runAction(() => abortRun(run.runId))}
                  >
                    <Square className="size-4" aria-hidden="true" />
                    Abort run
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {actionError && (
            <div
              role="alert"
              className="mx-auto mt-3 flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <span>{actionError}</span>
              <Button type="button" size="sm" variant="outline" onClick={() => void pump()}>
                Retry
              </Button>
            </div>
          )}

          {terminal && (
            <div className="mx-auto mt-3 flex w-full max-w-3xl items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <span>Run {statusLabel}.</span>
              {run.activityDraft && (
                <Button
                  type="button"
                  size="sm"
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => setArtifact({ kind: "resolution" })}
                >
                  View resolution
                </Button>
              )}
            </div>
          )}

          <RunTimelineView
            className="flex-1"
            blocks={blocks}
            pumping={pumping}
            pendingApproval={effectivePendingApproval}
            activityDraft={run.activityDraft}
            showResolutionAffordance={showResolutionAffordance}
            busy={busy}
            onApprove={(editedCommand) =>
              void runAction(() =>
                approveCommand(run.runId, effectivePendingApproval!.id, {
                  ...(editedCommand ? { editedCommand } : {}),
                }),
              )
            }
            onReject={(reason) =>
              void runAction(() => rejectCommand(run.runId, effectivePendingApproval!.id, reason))
            }
            onOpenArtifact={(step) => setArtifact(step)}
            onOpenResolution={() => setArtifact({ kind: "resolution" })}
          />
        </div>

        {artifact && (
          <RunArtifactPanel
            artifact={artifact}
            blocks={blocks}
            activityDraft={run.activityDraft}
            resolutionReadOnly={resolutionReadOnly}
            busy={busy}
            onClose={() => setArtifact(null)}
            onSubmitResolution={(overrides) => void handleSubmitResolution(overrides)}
            onRegenerateDraft={
              !resolutionReadOnly ? () => void runAction(() => draftActivity(run.runId)) : undefined
            }
          />
        )}
      </div>
    </section>
  );
}
