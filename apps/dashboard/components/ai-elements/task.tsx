"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, Circle, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

export type TaskStatus = "pending" | "in_progress" | "completed";

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === "completed") {
    return (
      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
    );
  }
  if (status === "in_progress") {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />;
  }
  return <Circle className="size-4 text-muted-foreground" aria-hidden="true" />;
}

export function Task({
  className,
  defaultOpen = true,
  children,
  ...props
}: ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      data-slot="task"
      defaultOpen={defaultOpen}
      className={cn("w-full rounded-lg border bg-card/30", className)}
      {...props}
    >
      {children}
    </Collapsible>
  );
}

export function TaskTrigger({
  className,
  title,
  status = "pending",
  ...props
}: ComponentProps<typeof CollapsibleTrigger> & { title: string; status?: TaskStatus }) {
  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40",
        className,
      )}
      {...props}
    >
      <TaskStatusIcon status={status} />
      <span className="font-medium">{title}</span>
      <ChevronRight
        className="ml-auto size-4 text-muted-foreground transition-transform in-data-[panel-open]:rotate-90"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export function TaskContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <CollapsibleContent
      className={cn("border-t px-3 py-2 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </CollapsibleContent>
  );
}
