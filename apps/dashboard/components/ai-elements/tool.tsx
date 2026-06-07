"use client";

import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, Circle, Loader2, XCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export type ToolStatus =
  | "pending"
  | "awaiting-approval"
  | "running"
  | "completed"
  | "error"
  | "denied"
  | "blocked";

const STATUS_LABEL: Record<ToolStatus, string> = {
  pending: "Pending",
  "awaiting-approval": "Awaiting approval",
  running: "Running",
  completed: "Completed",
  error: "Error",
  denied: "Denied",
  blocked: "Blocked",
};

function StatusIcon({ status }: { status: ToolStatus }) {
  if (status === "running") {
    return <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />;
  }
  if (status === "completed") {
    return (
      <CheckCircle2
        className="size-3.5 text-emerald-600 dark:text-emerald-400"
        aria-hidden="true"
      />
    );
  }
  if (status === "error" || status === "blocked" || status === "denied") {
    return <XCircle className="size-3.5 text-destructive" aria-hidden="true" />;
  }
  return <Circle className="size-3.5 text-muted-foreground" aria-hidden="true" />;
}

export function Tool({
  className,
  defaultOpen = false,
  children,
  ...props
}: ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      data-slot="tool"
      defaultOpen={defaultOpen}
      className={cn("w-full rounded-xl border bg-card/50", className)}
      {...props}
    >
      {children}
    </Collapsible>
  );
}

export function ToolHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50",
        className,
      )}
    >
      {children}
      <ChevronRight
        className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-90"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export function ToolTitle({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("font-medium", className)} {...props}>
      {children}
    </span>
  );
}

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      <StatusIcon status={status} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function ToolContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <CollapsibleContent className={cn("border-t px-3 py-3", className)} {...props}>
      {children}
    </CollapsibleContent>
  );
}

export function ToolInput({ className, children, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs",
        className,
      )}
      {...props}
    >
      <code>{children}</code>
    </pre>
  );
}

export function ToolOutput({
  className,
  children,
  label = "Output",
}: {
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className={cn("mt-3 space-y-1", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}
