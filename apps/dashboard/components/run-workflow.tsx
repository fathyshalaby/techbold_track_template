"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  abortRun,
  advanceRun,
  approveCommand,
  draftActivity,
  getRun,
  rejectCommand,
  submitActivity,
} from "@/lib/api";
import { subscribeToRunEvents } from "@/lib/events";
import { sourceLabel } from "@/lib/source-labels";
import type {
  ActivityDraft,
  AuditEvent,
  CommandApproval,
  RunDetail,
  SseEvent,
} from "@techbold/contracts";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  Radio,
  Send,
  Square,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ActivityFields = {
  summary: string;
  rootCause: string;
  actionsTaken: string;
  commandsSummary: string;
  validationResult: string;
};

export function RunWorkflow({ initialRun }: { initialRun: RunDetail }) {
  const [run, setRun] = useState(initialRun);
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editedCommand, setEditedCommand] = useState(
    initialRun.pendingApproval?.proposed_command ?? "",
  );
  const [rejectReason, setRejectReason] = useState("");
  const [activity, setActivity] = useState<ActivityFields>(() =>
    toActivityFields(initialRun.activityDraft),
  );

  useEffect(() => {
    setEditedCommand(run.pendingApproval?.proposed_command ?? "");
    setActivity(toActivityFields(run.activityDraft));
  }, [run.pendingApproval, run.activityDraft]);

  useEffect(() => {
    const unsubscribe = subscribeToRunEvents(run.runId, {
      onOpen: () => setConnected(true),
      onError: () => setConnected(false),
      onEvent: (event) => {
        setEvents((current) => [...current, event]);
        void refreshRun();
      },
    });
    return unsubscribe;
  }, [run.runId]);

  async function refreshRun() {
    const refreshed = await getRun(run.runId);
    setRun(refreshed);
  }

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await refreshRun();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const terminal = ["COMPLETED", "FAILED", "ABORTED"].includes(run.status);
  const auditSummaries = useMemo(() => run.timeline.map(toAuditSummary), [run.timeline]);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.3fr_0.8fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                Run <code>{run.runId.slice(0, 12)}</code>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                phase {run.phase} · status {run.status}
              </p>
            </div>
            <Badge tone={run.source === "deferred" ? "warning" : "live"}>
              {sourceLabel(run.source)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {run.ticket && (
              <div className="rounded-md border bg-white p-3">
                <div className="font-semibold">
                  Ticket #{run.ticket.id}: {run.ticket.title}
                </div>
                <div className="text-sm text-muted-foreground">{run.ticket.customer_name}</div>
              </div>
            )}
            {run.target && (
              <code className="block rounded-md border bg-slate-50 p-3">
                {run.target.username}@{run.target.ip}:{run.target.port} ({run.target.os})
              </code>
            )}
            {actionError && (
              <div
                role="alert"
                className="rounded-md border border-destructive bg-red-50 p-3 text-destructive"
              >
                {actionError}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void runAction(() => advanceRun(run.runId))}
                disabled={busy || terminal || Boolean(run.pendingApproval)}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                Advance run
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void runAction(() => draftActivity(run.runId))}
                disabled={busy || run.phase !== "WAITING_FOR_ACTIVITY_REVIEW"}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Draft activity
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={busy || terminal}>
                    <Square className="h-4 w-4" aria-hidden="true" />
                    Abort run
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Abort run</DialogTitle>
                    <DialogDescription>
                      Abort this run? The backend will stop the workflow and preserve the audit
                      trail.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => void runAction(() => abortRun(run.runId))}
                      >
                        Abort run
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {run.pendingApproval && (
          <ApprovalPanel
            approval={run.pendingApproval}
            editedCommand={editedCommand}
            rejectReason={rejectReason}
            busy={busy}
            onEditedCommand={setEditedCommand}
            onRejectReason={setRejectReason}
            onApprove={() =>
              runAction(() => {
                const trimmed = editedCommand.trim();
                const body =
                  trimmed && trimmed !== run.pendingApproval?.proposed_command
                    ? { editedCommand: trimmed }
                    : {};
                return approveCommand(run.runId, run.pendingApproval!.id, body);
              })
            }
            onReject={() =>
              runAction(() => rejectCommand(run.runId, run.pendingApproval!.id, rejectReason))
            }
          />
        )}

        {(run.activityDraft ||
          run.phase === "WAITING_FOR_ACTIVITY_REVIEW" ||
          run.status === "COMPLETED") && (
          <ActivityPanel
            activity={activity}
            busy={busy}
            submitted={Boolean(run.activityDraft?.submitted)}
            onChange={setActivity}
            onSubmit={() => runAction(() => submitActivity(run.runId, activity))}
          />
        )}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Live events</CardTitle>
            <Badge tone={connected ? "success" : "warning"}>
              {connected
                ? "Connected"
                : "Live events disconnected. Run state will refresh on demand."}
            </Badge>
          </CardHeader>
          <CardContent className="max-h-64 space-y-2 overflow-auto">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Waiting for events...</p>
            ) : (
              events.map((event, index) => (
                <div
                  key={`${event.ts}-${event.type}-${index}`}
                  className="rounded-md border bg-slate-50 p-2 text-sm"
                >
                  <div className="font-semibold">{event.type}</div>
                  <div className="text-xs text-muted-foreground">{event.ts}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
            <Badge tone="live">{run.timeline.length} events</Badge>
          </CardHeader>
          <CardContent className="max-h-96 space-y-2 overflow-auto">
            {auditSummaries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit events yet.</p>
            ) : (
              auditSummaries.map((event) => (
                <div key={event.id} className="rounded-md border bg-white p-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={event.actor === "technician" ? "live" : "neutral"}>
                      {event.actor}
                    </Badge>
                    <span className="font-semibold">{event.type}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{event.ts}</div>
                  {event.summary && <p className="mt-2">{event.summary}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}

function ApprovalPanel({
  approval,
  editedCommand,
  rejectReason,
  busy,
  onEditedCommand,
  onRejectReason,
  onApprove,
  onReject,
}: {
  approval: CommandApproval;
  editedCommand: string;
  rejectReason: string;
  busy: boolean;
  onEditedCommand: (value: string) => void;
  onRejectReason: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <Card className="border-warning">
      <CardHeader>
        <div>
          <CardTitle>Approval required</CardTitle>
          <p className="text-sm text-muted-foreground">{approval.purpose}</p>
        </div>
        <Badge tone="warning">{approval.risk_level}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            Expected signal
          </div>
          <p>{approval.expected_signal}</p>
        </div>
        {approval.safety_notes && (
          <div className="rounded-md border border-warning bg-amber-50 p-3 text-warning">
            <AlertTriangle className="mr-2 inline h-4 w-4" aria-hidden="true" />
            {approval.safety_notes}
          </div>
        )}
        <label className="block space-y-1" htmlFor="edited-command">
          <span className="text-sm font-semibold">Command</span>
          <Textarea
            id="edited-command"
            value={editedCommand}
            onChange={(event) => onEditedCommand(event.target.value)}
            className="font-mono"
          />
        </label>
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <label className="block space-y-1" htmlFor="reject-reason">
            <span className="text-sm font-semibold">Reject reason</span>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => onRejectReason(event.target.value)}
            />
          </label>
          <Button type="button" className="self-end" onClick={onApprove} disabled={busy}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Approve and run
          </Button>
          <Button
            type="button"
            className="self-end"
            variant="destructive"
            onClick={onReject}
            disabled={busy || rejectReason.trim().length === 0}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Reject command
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityPanel({
  activity,
  busy,
  submitted,
  onChange,
  onSubmit,
}: {
  activity: ActivityFields;
  busy: boolean;
  submitted: boolean;
  onChange: (fields: ActivityFields) => void;
  onSubmit: () => void;
}) {
  const update = (key: keyof ActivityFields, value: string) =>
    onChange({ ...activity, [key]: value });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <Badge tone={submitted ? "success" : "warning"}>
          {submitted ? "submitted" : "drafted"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <ActivityField
          label="Summary"
          value={activity.summary}
          onChange={(value) => update("summary", value)}
        />
        <ActivityField
          label="Root cause"
          value={activity.rootCause}
          onChange={(value) => update("rootCause", value)}
        />
        <ActivityField
          label="Actions taken"
          value={activity.actionsTaken}
          onChange={(value) => update("actionsTaken", value)}
        />
        <ActivityField
          label="Commands summary"
          value={activity.commandsSummary}
          onChange={(value) => update("commandsSummary", value)}
        />
        <ActivityField
          label="Validation result"
          value={activity.validationResult}
          onChange={(value) => update("validationResult", value)}
        />
        <Button type="button" onClick={onSubmit} disabled={busy || submitted}>
          <Send className="h-4 w-4" aria-hidden="true" />
          Submit activity
        </Button>
      </CardContent>
    </Card>
  );
}

function ActivityField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className="block space-y-1" htmlFor={id}>
      <span className="text-sm font-semibold">{label}</span>
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function toActivityFields(draft: ActivityDraft | null): ActivityFields {
  return {
    summary: draft?.summary ?? "",
    rootCause: draft?.root_cause ?? "",
    actionsTaken: draft?.actions_taken ?? "",
    commandsSummary: draft?.commands_summary ?? "",
    validationResult: draft?.validation_result ?? "",
  };
}

function toAuditSummary(event: AuditEvent) {
  return {
    id: event.id,
    type: event.type,
    actor: event.actor,
    ts: event.ts,
    summary: summarizePayload(event.payload_json),
  };
}

function summarizePayload(payloadJson?: string): string {
  if (!payloadJson) return "";
  try {
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    if (typeof payload.command === "string") return `$ ${payload.command}`;
    if (typeof payload.reason === "string") return payload.reason;
    if (typeof payload.status === "string") return payload.status;
    if (typeof payload.message === "string") return payload.message;
    return Object.entries(payload)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(" ")
      .slice(0, 140);
  } catch {
    return "";
  }
}
