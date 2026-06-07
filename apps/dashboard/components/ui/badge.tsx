import { cn } from "@/lib/utils";
import type * as React from "react";

const toneClass = {
  neutral: "border-border bg-white text-foreground",
  live: "border-primary/30 bg-blue-50 text-primary",
  success: "border-success/30 bg-green-50 text-success",
  warning: "border-warning/30 bg-amber-50 text-warning",
  destructive: "border-destructive/30 bg-red-50 text-destructive",
} as const;

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof toneClass }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
