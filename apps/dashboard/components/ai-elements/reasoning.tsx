"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Brain, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

export function Reasoning({
  className,
  defaultOpen = false,
  children,
  ...props
}: ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      data-slot="reasoning"
      defaultOpen={defaultOpen}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </Collapsible>
  );
}

export function ReasoningTrigger({
  className,
  title = "Reasoning",
  ...props
}: ComponentProps<typeof CollapsibleTrigger> & { title?: string }) {
  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    >
      <Brain className="size-4 shrink-0" aria-hidden="true" />
      <span className="font-medium">{title}</span>
      <ChevronRight
        className="ml-auto size-4 transition-transform in-data-[panel-open]:rotate-90"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export function ReasoningContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <CollapsibleContent className={cn("pb-2 pl-6 text-sm", className)} {...props}>
      <div className="text-muted-foreground">{children}</div>
    </CollapsibleContent>
  );
}
