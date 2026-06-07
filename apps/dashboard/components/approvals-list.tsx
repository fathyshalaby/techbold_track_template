"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approveCommand, rejectCommand } from "@/lib/api";
import { relativeTime, riskMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { IconExternalLink, IconLoader2, IconShieldCheck } from "@tabler/icons-react";
import type { PendingApprovalSummary } from "@techbold/contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ApprovalsList({ approvals }: { approvals: PendingApprovalSummary[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingApprovalSummary | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleApprove(approval: PendingApprovalSummary) {
    setBusyId(approval.approvalId);
    setError(null);
    try {
      await approveCommand(approval.runId, approval.approvalId);
      toast.success("Command approved");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setBusyId(rejectTarget.approvalId);
    setError(null);
    try {
      await rejectCommand(rejectTarget.runId, rejectTarget.approvalId, reason);
      toast.success("Command rejected");
      setRejectTarget(null);
      setRejectReason("");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  }

  if (approvals.length === 0) {
    return (
      <Empty className="border py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconShieldCheck />
          </EmptyMedia>
          <EmptyTitle>All clear</EmptyTitle>
          <EmptyDescription>
            No commands waiting for your decision. New proposals appear here automatically.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {approvals.map((approval) => {
          const risk = riskMeta(approval.riskLevel);
          const time = relativeTime(approval.createdAt);
          const busy = busyId === approval.approvalId;

          return (
            <Card key={approval.approvalId} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("gap-1.5 font-normal", risk.badgeClass)}>
                      <span className={cn("size-1.5 rounded-full", risk.dot)} aria-hidden="true" />
                      {risk.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground" title={time.absolute}>
                      {time.relative}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium leading-snug">
                      Ticket #{approval.ticketId}
                      {approval.ticketTitle ? ` · ${approval.ticketTitle}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The agent wants to run this command on the customer system:
                    </p>
                  </div>

                  <pre className="overflow-x-auto rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs leading-relaxed">
                    {approval.proposedCommand}
                  </pre>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() => void handleApprove(approval)}
                    >
                      {busy ? (
                        <IconLoader2 className="size-4 animate-spin" aria-hidden="true" />
                      ) : null}
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        setRejectTarget(approval);
                        setRejectReason("");
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                  <Link
                    href={`/dashboard/runs/${approval.runId}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Open run
                    <IconExternalLink className="size-3" aria-hidden="true" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject command</DialogTitle>
            <DialogDescription>
              Tell the agent why this command should not run. It will propose an alternative.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="e.g. Need to verify backup before restarting the service"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busyId !== null}
              onClick={() => void handleReject()}
            >
              Reject command
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
