"use client";

import { MarkdownContent } from "@/components/markdown-content";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Message({
  from,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { from: "assistant" | "user" | "system" }) {
  return (
    <div
      data-slot="message"
      data-from={from}
      className={cn(
        "group/message flex w-full",
        from === "user" && "justify-end",
        from === "system" && "justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MessageContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "max-w-[85%] text-sm leading-relaxed text-foreground",
        "group-data-[from=assistant]/message:max-w-full group-data-[from=assistant]/message:p-0",
        "group-data-[from=user]/message:rounded-2xl group-data-[from=user]/message:bg-secondary group-data-[from=user]/message:px-4 group-data-[from=user]/message:py-2.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MessageResponse({
  className,
  children,
  ...props
}: ComponentProps<"div"> & { children?: string }) {
  if (typeof children !== "string") {
    return (
      <div data-slot="message-response" className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div data-slot="message-response" className={className} {...props}>
      <MarkdownContent>{children}</MarkdownContent>
    </div>
  );
}
