"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmpty,
} from "@/components/ai-elements/conversation";
import { TimelineBlockView } from "@/components/run-block-renderers";
import { Button } from "@/components/ui/button";
import type { TimelineBlock } from "@/lib/run-timeline";
import { cn } from "@/lib/utils";
import type { ActivityDraft, CommandApproval } from "@techbold/contracts";
import { Loader2 } from "lucide-react";

export function RunTimelineView({
  className,
  blocks,
  pumping,
  pendingApproval,
  activityDraft,
  showResolutionAffordance,
  busy,
  onApprove,
  onReject,
  onOpenArtifact,
  onOpenResolution,
}: {
  className?: string;
  blocks: TimelineBlock[];
  pumping: boolean;
  pendingApproval: CommandApproval | null;
  activityDraft: ActivityDraft | null;
  showResolutionAffordance: boolean;
  busy: boolean;
  onApprove: (editedCommand?: string) => void;
  onReject: (reason: string) => void;
  onOpenArtifact?: (artifact: { kind: "step"; id: string }) => void;
  onOpenResolution?: () => void;
}) {
  const isEmpty = blocks.length === 0 && !pendingApproval && !showResolutionAffordance;
  // The phase task line already renders a labeled "Diagnosing..." style spinner,
  // so a generic "Working..." row underneath it would be a redundant second spinner.
  const hasActiveTask = blocks.some(
    (block) => block.kind === "task" && block.status === "in_progress",
  );

  return (
    <Conversation className={cn("w-full", className)}>
      <ConversationContent className="space-y-4" centerWhenShort={isEmpty}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {isEmpty ? (
            <ConversationEmpty>
              {pumping ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  <span>Autopilot is starting...</span>
                </>
              ) : (
                "Waiting for the run to begin..."
              )}
            </ConversationEmpty>
          ) : (
            blocks.map((block) => (
              <TimelineBlockView
                key={block.id}
                block={block}
                onOpenArtifact={onOpenArtifact}
                pendingApproval={pendingApproval}
                busy={busy}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
          )}

          {showResolutionAffordance && activityDraft && onOpenResolution && (
            <div className="rounded-lg border bg-card px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Resolution ready</p>
                  <p className="text-sm text-muted-foreground">
                    Review and edit the activity log before submitting.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={onOpenResolution}>
                  View resolution
                </Button>
              </div>
            </div>
          )}

          {pumping && !isEmpty && !hasActiveTask && <WorkingRow />}
        </div>
      </ConversationContent>
    </Conversation>
  );
}

function WorkingRow() {
  return (
    <div className="flex items-center gap-2.5 px-1 py-0.5 text-sm font-medium text-foreground">
      <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
      <span>Working</span>
      <span className="text-muted-foreground">&hellip;</span>
    </div>
  );
}
