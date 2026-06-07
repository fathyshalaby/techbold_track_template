"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useRef } from "react";

export function Conversation({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="conversation"
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ConversationContent({
  className,
  children,
  stickToBottom = true,
  centerWhenShort = false,
  ...props
}: ComponentProps<"div"> & { stickToBottom?: boolean; centerWhenShort?: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stickToBottom) return;
    if (typeof endRef.current?.scrollIntoView === "function") {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });

  return (
    <div
      data-slot="conversation-content"
      className={cn(
        "flex-1 overflow-y-auto px-1 py-3",
        centerWhenShort && "flex flex-col justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <div ref={endRef} aria-hidden="true" />
    </div>
  );
}

export function ConversationEmpty({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="conversation-empty"
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ConversationFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-slot="conversation-footer"
      className={cn("shrink-0 border-t bg-background/80 px-4 py-3 backdrop-blur-sm", className)}
    >
      {children}
    </div>
  );
}
