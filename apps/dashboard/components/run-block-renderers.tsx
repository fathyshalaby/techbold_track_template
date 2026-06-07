"use client";

import {
  ConfirmationActions,
  ConfirmationApprove,
  ConfirmationBody,
  ConfirmationPreview,
  ConfirmationReject,
  ConfirmationRejectForm,
} from "@/components/ai-elements/confirmation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { MarkdownContent } from "@/components/markdown-content";
import { OpenArtifactButton } from "@/components/run-artifact-panel";
import { Textarea } from "@/components/ui/textarea";
import type {
  FindingBlock,
  MemoryBlock,
  MessageBlock,
  ReasoningBlock,
  SystemBlock,
  TaskBlock,
  TimelineBlock,
  ToolBlock,
  ValidationBlock,
} from "@/lib/run-timeline";
import { cn } from "@/lib/utils";
import type { CommandApproval } from "@techbold/contracts";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { useEffect, useId, useState } from "react";

export type OpenArtifactHandler = (artifact: { kind: "step"; id: string }) => void;

export type TimelineBlockViewProps = {
  block: TimelineBlock;
  onOpenArtifact?: OpenArtifactHandler;
  pendingApproval?: CommandApproval | null;
  busy?: boolean;
  onApprove?: (editedCommand?: string) => void;
  onReject?: (reason: string) => void;
};

function BlockFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("w-full space-y-2", className)}>{children}</div>;
}

export function TimelineBlockView({
  block,
  onOpenArtifact,
  pendingApproval,
  busy,
  onApprove,
  onReject,
}: TimelineBlockViewProps) {
  switch (block.kind) {
    case "system":
      return <SystemPill block={block} />;
    case "tool":
      return block.status === "blocked" ? (
        <SafetyBlockedCard block={block} onOpenArtifact={onOpenArtifact} />
      ) : (
        <CommandTerminal
          block={block}
          onOpenArtifact={onOpenArtifact}
          pendingApproval={pendingApproval}
          busy={busy}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
    case "validation":
      return <ValidationResultCard block={block} onOpenArtifact={onOpenArtifact} />;
    case "finding":
      return <RootCauseCard block={block} onOpenArtifact={onOpenArtifact} />;
    case "reasoning":
      return <ReasoningLine block={block} />;
    case "memory":
      return <RecalledMemoryCard block={block} />;
    case "task":
      return <TaskStatusLine block={block} />;
    case "message":
      return <MessageText block={block} />;
    default:
      return null;
  }
}

const SYSTEM_TONE_DOT: Record<SystemBlock["tone"], string> = {
  default: "bg-muted-foreground/40",
  danger: "bg-destructive",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
};

const SYSTEM_TONE_TEXT: Record<SystemBlock["tone"], string> = {
  default: "text-muted-foreground",
  danger: "text-destructive",
  warning: "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
};

function SystemPill({ block }: { block: SystemBlock }) {
  // Long-form system events (such as the run brief) read better as a calm,
  // left-aligned card than as text crammed into a centered pill.
  if (block.body && block.body.length > 80) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span
            className={cn("size-1.5 rounded-full", SYSTEM_TONE_DOT[block.tone])}
            aria-hidden="true"
          />
          <span
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              SYSTEM_TONE_TEXT[block.tone],
            )}
          >
            {block.title}
          </span>
        </div>
        <MarkdownContent className="mt-2">{block.body}</MarkdownContent>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-1">
      <div
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs",
          SYSTEM_TONE_TEXT[block.tone],
        )}
      >
        <span
          className={cn("size-1.5 rounded-full", SYSTEM_TONE_DOT[block.tone])}
          aria-hidden="true"
        />
        <span className="font-medium">{block.title}</span>
        {block.body && <span className="opacity-80">{block.body}</span>}
      </div>
    </div>
  );
}

function ThinkingSection({
  block,
  defaultOpen,
}: {
  block: ToolBlock;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  const hasThinking =
    block.hypotheses.length > 0 ||
    Boolean(block.riskNotes) ||
    Boolean(block.expectedSignal) ||
    Boolean(block.rootCause) ||
    Boolean(block.rationale);

  if (!hasThinking) return null;

  return (
    <Reasoning open={open} onOpenChange={setOpen} className="mb-2">
      <ReasoningTrigger title="Thinking" className="px-0" />
      <ReasoningContent className="pl-0">
        <div className="space-y-3">
          {block.hypotheses.map((hypothesis) => (
            <div key={`${hypothesis.cause}-${hypothesis.confidence}`} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{hypothesis.cause}</span>
                <ConfidenceMeter value={hypothesis.confidence} />
              </div>
              {hypothesis.evidence && <MarkdownContent>{hypothesis.evidence}</MarkdownContent>}
            </div>
          ))}
          {block.rootCause && (
            <div>
              <span className="font-medium text-foreground">Root cause:</span>
              <MarkdownContent className="mt-1">{block.rootCause}</MarkdownContent>
            </div>
          )}
          {block.rationale && (
            <div>
              <span className="font-medium text-foreground">Rationale:</span>
              <MarkdownContent className="mt-1">{block.rationale}</MarkdownContent>
            </div>
          )}
          {block.expectedSignal && (
            <div>
              <span className="font-medium text-foreground">Expected signal:</span>
              <MarkdownContent className="mt-1">{block.expectedSignal}</MarkdownContent>
            </div>
          )}
          {block.riskNotes && (
            <div>
              <span className="font-medium text-foreground">Risk:</span>
              <MarkdownContent className="mt-1">{block.riskNotes}</MarkdownContent>
            </div>
          )}
        </div>
      </ReasoningContent>
    </Reasoning>
  );
}

function InlineApproval({
  pendingApproval,
  busy,
  onApprove,
  onReject,
}: {
  pendingApproval: CommandApproval;
  busy?: boolean;
  onApprove?: (editedCommand?: string) => void;
  onReject?: (reason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [editedCommand, setEditedCommand] = useState(pendingApproval.proposed_command);
  const editCommandId = useId();

  useEffect(() => {
    setEditedCommand(pendingApproval.proposed_command);
    setRejecting(false);
    setRejectReason("");
  }, [pendingApproval.proposed_command]);

  return (
    <div className="mt-3 space-y-3 border-t border-border/50 pt-3">
      <p className="text-xs text-muted-foreground">
        Approval required
        {" · "}
        {pendingApproval.risk_level.replaceAll("_", " ").toLowerCase()}
      </p>
      <ConfirmationBody className="mt-0 space-y-3">
        <label htmlFor={editCommandId} className="flex flex-col gap-1.5 text-xs">
          <span className="font-medium text-muted-foreground">Edit before approve (optional)</span>
          <Textarea
            id={editCommandId}
            value={editedCommand}
            onChange={(event) => setEditedCommand(event.target.value)}
            rows={3}
            className="font-mono text-xs"
            spellCheck={false}
          />
        </label>
        {pendingApproval.expected_signal && (
          <p className="text-xs text-muted-foreground">
            Expected: {pendingApproval.expected_signal}
          </p>
        )}
      </ConfirmationBody>
      {!rejecting ? (
        <ConfirmationActions className="mt-0">
          <ConfirmationApprove
            busy={busy}
            onClick={() => {
              const trimmed = editedCommand.trim();
              const original = pendingApproval.proposed_command.trim();
              onApprove?.(trimmed !== original && trimmed !== "" ? trimmed : undefined);
            }}
            label="Approve"
          />
          <ConfirmationReject busy={busy} onClick={() => setRejecting(true)} />
        </ConfirmationActions>
      ) : (
        <ConfirmationRejectForm
          reason={rejectReason}
          onReasonChange={setRejectReason}
          busy={busy}
          onCancel={() => {
            setRejecting(false);
            setRejectReason("");
          }}
          onSubmit={() => {
            onReject?.(rejectReason.trim());
            setRejecting(false);
            setRejectReason("");
          }}
        />
      )}
    </div>
  );
}

function CommandTerminal({
  block,
  onOpenArtifact,
  pendingApproval,
  busy,
  onApprove,
  onReject,
}: {
  block: ToolBlock;
  onOpenArtifact?: OpenArtifactHandler;
  pendingApproval?: CommandApproval | null;
  busy?: boolean;
  onApprove?: (editedCommand?: string) => void;
  onReject?: (reason: string) => void;
}) {
  const showInlineApproval =
    block.status === "awaiting-approval" &&
    pendingApproval &&
    block.approvalId === pendingApproval.id;

  return (
    <BlockFrame
      className={cn(showInlineApproval && "rounded-lg border-l-2 border-l-primary pl-3 py-1")}
    >
      <div className="flex items-start justify-between gap-2">
        {block.purpose ? (
          <MarkdownContent className="text-sm">{block.purpose}</MarkdownContent>
        ) : (
          <span />
        )}
        {onOpenArtifact && (
          <OpenArtifactButton onClick={() => onOpenArtifact({ kind: "step", id: block.id })} />
        )}
      </div>

      <ThinkingSection block={block} defaultOpen={block.status === "awaiting-approval"} />

      <ConfirmationPreview className="mt-0 bg-muted/40">
        <code className="break-all">$ {block.command}</code>
      </ConfirmationPreview>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CommandStatus status={block.status} exitCode={block.exitCode} />
      </div>

      {showInlineApproval && (
        <InlineApproval
          pendingApproval={pendingApproval}
          busy={busy}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </BlockFrame>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>;
}

function CommandStatus({
  status,
  exitCode,
}: {
  status: ToolBlock["status"];
  exitCode: number | null;
}) {
  if (status === "running" || status === "pending") {
    return (
      <>
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        <span>Running...</span>
      </>
    );
  }
  if (status === "awaiting-approval") {
    return <span>Awaiting approval</span>;
  }
  if (status === "completed" && exitCode === 0) {
    return (
      <>
        <CheckCircle2
          className="size-3.5 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        />
        <span>Exit 0</span>
      </>
    );
  }
  if (status === "error" || (exitCode !== null && exitCode !== 0)) {
    return (
      <>
        <XCircle className="size-3.5 text-destructive" aria-hidden="true" />
        <span>Exit {exitCode ?? "?"}</span>
      </>
    );
  }
  if (status === "denied") {
    return (
      <>
        <XCircle className="size-3.5 text-destructive" aria-hidden="true" />
        <span>Rejected</span>
      </>
    );
  }
  return <span>Finished</span>;
}

function SafetyBlockedCard({
  block,
  onOpenArtifact,
}: {
  block: ToolBlock;
  onOpenArtifact?: OpenArtifactHandler;
}) {
  return (
    <BlockFrame>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
          Command blocked by safety policy
        </div>
        {onOpenArtifact && (
          <OpenArtifactButton onClick={() => onOpenArtifact({ kind: "step", id: block.id })} />
        )}
      </div>
      {block.blockReason && <p className="text-sm text-muted-foreground">{block.blockReason}</p>}
      <ConfirmationPreview className="mt-0 bg-muted/40">
        <code>$ {block.command}</code>
      </ConfirmationPreview>
    </BlockFrame>
  );
}

function ValidationResultCard({
  block,
  onOpenArtifact,
}: {
  block: ValidationBlock;
  onOpenArtifact?: OpenArtifactHandler;
}) {
  const passed = block.status === "VERIFIED_FIXED" || block.status === "LIKELY_FIXED";
  const statusLabel = block.status.replaceAll("_", " ").toLowerCase();

  return (
    <BlockFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {passed ? (
            <CheckCircle2
              className="size-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="size-4 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          )}
          <span className="font-medium">Validation</span>
          <span className="text-muted-foreground">&middot; {statusLabel}</span>
        </div>
        {onOpenArtifact && (
          <OpenArtifactButton onClick={() => onOpenArtifact({ kind: "step", id: block.id })} />
        )}
      </div>
      {block.benefitCheck && (
        <div className="text-sm">
          <span className="font-medium text-foreground">Benefit:</span>
          <MarkdownContent className="mt-1">{block.benefitCheck}</MarkdownContent>
        </div>
      )}
      {block.persistenceCheck && (
        <div className="text-sm">
          <span className="font-medium text-foreground">Persistence:</span>
          <MarkdownContent className="mt-1">{block.persistenceCheck}</MarkdownContent>
        </div>
      )}
      {block.evidence.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {block.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {block.body && <MarkdownContent className="text-sm">{block.body}</MarkdownContent>}
    </BlockFrame>
  );
}

function RootCauseCard({
  block,
  onOpenArtifact,
}: {
  block: FindingBlock;
  onOpenArtifact?: OpenArtifactHandler;
}) {
  return (
    <BlockFrame>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{block.title}</p>
        {onOpenArtifact && (
          <OpenArtifactButton onClick={() => onOpenArtifact({ kind: "step", id: block.id })} />
        )}
      </div>
      <MarkdownContent className="text-sm">{block.content}</MarkdownContent>
    </BlockFrame>
  );
}

function RecalledMemoryCard({ block }: { block: MemoryBlock }) {
  return (
    <Reasoning defaultOpen>
      <ReasoningTrigger
        title={`Recalled ${block.count} similar incident${block.count === 1 ? "" : "s"}`}
        className="px-0"
      />
      <ReasoningContent className="pl-0">
        <div className="space-y-2">
          {block.results.map((result) => (
            <div key={result.id} className="rounded-md bg-muted/20 px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{result.symptom}</span>
                <span className="text-xs text-muted-foreground">{result.source}</span>
                {result.score > 0 && result.score < 1 && (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {result.score.toFixed(2)}
                  </span>
                )}
              </div>
              {result.rootCause && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Root cause:</span>{" "}
                  {result.rootCause}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Fix:</span> {result.fix}
              </p>
            </div>
          ))}
        </div>
      </ReasoningContent>
    </Reasoning>
  );
}

function ReasoningLine({ block }: { block: ReasoningBlock }) {
  return (
    <Reasoning defaultOpen={false}>
      <ReasoningTrigger title={block.title} className="px-0" />
      <ReasoningContent className="pl-0">
        <MarkdownContent>{block.content}</MarkdownContent>
      </ReasoningContent>
    </Reasoning>
  );
}

function TaskStatusLine({ block }: { block: TaskBlock }) {
  if (block.status !== "in_progress") return null;
  return (
    <div className="flex items-center gap-2.5 px-1 py-0.5 text-sm font-medium text-foreground">
      <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
      <span>{block.title}</span>
      <span className="text-muted-foreground">&hellip;</span>
    </div>
  );
}

function MessageText({ block }: { block: MessageBlock }) {
  return (
    <Message from="assistant">
      <MessageContent>
        <div className="font-medium">{block.title}</div>
        <MessageResponse>{block.body}</MessageResponse>
      </MessageContent>
    </Message>
  );
}
