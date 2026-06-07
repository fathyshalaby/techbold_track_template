"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export function Confirmation({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="confirmation"
      className={cn("w-full rounded-lg border border-primary/20 bg-primary/5 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ConfirmationTitle({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("text-sm font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

export function ConfirmationDescription({ className, children, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("mt-1 text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function ConfirmationBody({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mt-3 space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

export function ConfirmationActions({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mt-4 flex flex-wrap items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function ConfirmationApprove({
  busy,
  onClick,
  label = "Approve",
}: {
  busy?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button type="button" size="sm" disabled={busy} onClick={onClick}>
      <Check className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

export function ConfirmationReject({
  busy,
  onClick,
  label = "Reject",
}: {
  busy?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={onClick}>
      <X className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

export function ConfirmationRejectForm({
  reason,
  onReasonChange,
  onSubmit,
  onCancel,
  busy,
}: {
  reason: string;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        aria-label="Reject reason"
        placeholder="Reason for rejection"
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="flex-1"
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={onSubmit}
          disabled={busy || reason.trim().length === 0}
        >
          Confirm reject
        </Button>
      </div>
    </div>
  );
}

export function ConfirmationPreview({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap",
        className,
      )}
    >
      {children}
    </pre>
  );
}
