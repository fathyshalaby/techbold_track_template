"use client";

import { MarkdownContent } from "@/components/markdown-content";
import { ResolutionArtifact } from "@/components/resolution-artifact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { FindingBlock, TimelineBlock, ToolBlock, ValidationBlock } from "@/lib/run-timeline";
import type { ActivityDraft } from "@techbold/contracts";
import { ExternalLink, X } from "lucide-react";
import type { ReactNode } from "react";

export type RunArtifact = { kind: "resolution" } | { kind: "step"; id: string };

type FieldKey = "summary" | "rootCause" | "actionsTaken" | "commandsSummary" | "validationResult";

export function RunArtifactPanel({
  artifact,
  blocks,
  activityDraft,
  resolutionReadOnly,
  busy,
  onClose,
  onSubmitResolution,
  onRegenerateDraft,
}: {
  artifact: RunArtifact;
  blocks: TimelineBlock[];
  activityDraft: ActivityDraft | null;
  resolutionReadOnly: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmitResolution: (overrides: Partial<Record<FieldKey, string>>) => void;
  onRegenerateDraft?: () => void;
}) {
  const title = artifact.kind === "resolution" ? "Resolution" : stepTitle(blocks, artifact.id);
  const body =
    artifact.kind === "resolution" ? (
      activityDraft ? (
        <ResolutionArtifact
          draft={activityDraft}
          readOnly={resolutionReadOnly}
          busy={busy}
          onSubmit={onSubmitResolution}
          onRegenerate={onRegenerateDraft}
        />
      ) : (
        <p className="text-sm text-muted-foreground">No resolution draft yet.</p>
      )
    ) : (
      <StepArtifactDetail block={findStepBlock(blocks, artifact.id)} />
    );

  return (
    <>
      <aside className="hidden min-h-0 w-[min(28rem,42vw)] shrink-0 flex-col border-l bg-background lg:flex">
        <ArtifactPanelChrome title={title} onClose={onClose}>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{body}</div>
        </ArtifactPanelChrome>
      </aside>

      <div className="lg:hidden">
        <Sheet open onOpenChange={(open) => !open && onClose()}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{body}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function ArtifactPanelChrome({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Close panel"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {children}
    </div>
  );
}

function findStepBlock(blocks: TimelineBlock[], id: string): TimelineBlock | null {
  return blocks.find((block) => block.id === id) ?? null;
}

function stepTitle(blocks: TimelineBlock[], id: string): string {
  const block = findStepBlock(blocks, id);
  if (!block) return "Step detail";
  if (block.kind === "tool") return "Command step";
  if (block.kind === "validation") return "Validation";
  if (block.kind === "finding") return "Finding";
  return "Step detail";
}

function StepArtifactDetail({ block }: { block: TimelineBlock | null }) {
  if (!block) {
    return <p className="text-sm text-muted-foreground">Step not found.</p>;
  }
  if (block.kind === "tool") return <ToolStepDetail block={block} />;
  if (block.kind === "validation") return <ValidationStepDetail block={block} />;
  if (block.kind === "finding") return <FindingStepDetail block={block} />;
  return <p className="text-sm text-muted-foreground">No detail available for this step.</p>;
}

function ToolStepDetail({ block }: { block: ToolBlock }) {
  return (
    <div className="space-y-4 text-sm">
      {block.purpose && (
        <section>
          <h3 className="font-medium">Purpose</h3>
          <MarkdownContent className="mt-1">{block.purpose}</MarkdownContent>
        </section>
      )}
      <section>
        <h3 className="font-medium">Command</h3>
        <pre className="mt-2 overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs">
          <code>$ {block.command}</code>
        </pre>
      </section>
      {block.hypotheses.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-medium">Hypotheses</h3>
          {block.hypotheses.map((hypothesis) => (
            <div
              key={`${hypothesis.cause}-${hypothesis.confidence}`}
              className="rounded-md border px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{hypothesis.cause}</span>
                <Badge variant="outline">{Math.round(hypothesis.confidence * 100)}%</Badge>
              </div>
              {hypothesis.evidence && (
                <MarkdownContent className="mt-1">{hypothesis.evidence}</MarkdownContent>
              )}
            </div>
          ))}
        </section>
      )}
      {block.rootCause && (
        <section>
          <h3 className="font-medium">Root cause</h3>
          <MarkdownContent className="mt-1">{block.rootCause}</MarkdownContent>
        </section>
      )}
      {block.rationale && (
        <section>
          <h3 className="font-medium">Rationale</h3>
          <MarkdownContent className="mt-1">{block.rationale}</MarkdownContent>
        </section>
      )}
      {block.expectedSignal && (
        <section>
          <h3 className="font-medium">Expected signal</h3>
          <MarkdownContent className="mt-1">{block.expectedSignal}</MarkdownContent>
        </section>
      )}
      {block.riskNotes && (
        <section>
          <h3 className="font-medium">Risk notes</h3>
          <MarkdownContent className="mt-1">{block.riskNotes}</MarkdownContent>
        </section>
      )}
      {block.rollbackCommand && (
        <section>
          <h3 className="font-medium">Rollback</h3>
          <pre className="mt-2 overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs">
            <code>$ {block.rollbackCommand}</code>
          </pre>
        </section>
      )}
      {block.persistenceNote && (
        <section>
          <h3 className="font-medium">Persistence note</h3>
          <MarkdownContent className="mt-1">{block.persistenceNote}</MarkdownContent>
        </section>
      )}
      {block.output && (
        <section>
          <h3 className="font-medium">Output</h3>
          <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted/50 p-3 font-mono text-xs whitespace-pre-wrap">
            {block.output}
          </pre>
        </section>
      )}
    </div>
  );
}

function ValidationStepDetail({ block }: { block: ValidationBlock }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">Status</span>
        <Badge variant="outline">{block.status.replaceAll("_", " ").toLowerCase()}</Badge>
      </div>
      {block.benefitCheck && (
        <section>
          <h3 className="font-medium">Benefit check</h3>
          <MarkdownContent className="mt-1">{block.benefitCheck}</MarkdownContent>
        </section>
      )}
      {block.persistenceCheck && (
        <section>
          <h3 className="font-medium">Persistence check</h3>
          <MarkdownContent className="mt-1">{block.persistenceCheck}</MarkdownContent>
        </section>
      )}
      {block.evidence.length > 0 && (
        <section>
          <h3 className="font-medium">Evidence</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {block.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function FindingStepDetail({ block }: { block: FindingBlock }) {
  return (
    <div className="space-y-2 text-sm">
      <h3 className="font-medium">{block.title}</h3>
      <MarkdownContent>{block.content}</MarkdownContent>
    </div>
  );
}

export function OpenArtifactButton({
  label = "Open",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-7 gap-1 px-2 text-xs text-muted-foreground"
      onClick={onClick}
    >
      <ExternalLink className="size-3.5" aria-hidden="true" />
      {label}
    </Button>
  );
}
