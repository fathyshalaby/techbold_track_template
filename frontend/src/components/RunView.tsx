import { useEffect, useRef, useState } from "react";
import type { CustomerSystem, SseEvent } from "../types.js";
import { useRunEvents } from "../hooks/useRunEvents.js";
import { useRun } from "../hooks/useRun.js";
import { advanceRun, abortRun } from "../api.js";
import { ApprovalCard } from "./ApprovalCard.js";
import { sseEventLabel } from "../utils/mappers.js";

interface RunViewProps {
  runId: string;
  ticketTitle: string;
  customerSystem: CustomerSystem | null;
  onActivityReady: () => void;
}

const TERMINAL_PHASES = new Set(["COMPLETED", "FAILED", "ABORTED"]);

const REFRESH_EVENTS = new Set([
  "approval.required",
  "command.executing",
  "command.completed",
  "run.completed",
  "run.failed",
  "validation.completed",
]);

function payloadCommand(payload: unknown): string | null {
  if (payload !== null && typeof payload === "object" && !Array.isArray(payload)) {
    const p = payload as Record<string, unknown>;
    if (typeof p["command"] === "string") return p["command"];
  }
  return null;
}

function payloadSummary(payload: unknown): string | null {
  if (payload !== null && typeof payload === "object" && !Array.isArray(payload)) {
    const p = payload as Record<string, unknown>;
    if (typeof p["summary"] === "string") return p["summary"];
  }
  return null;
}

export default function RunView({ runId, ticketTitle, customerSystem, onActivityReady }: RunViewProps) {
  const { events, connected } = useRunEvents(runId);
  const { run, refresh } = useRun(runId);

  const pendingApproval = run?.pendingApproval ?? null;
  const phase = run?.phase ?? "";

  const [aborting, setAborting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (events.length === 0) return;
    const last = events[events.length - 1];
    if (REFRESH_EVENTS.has(last.type)) {
      refresh();
    }
  }, [events.length]);

  useEffect(() => {
    timelineRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  async function handleAbort() {
    setAborting(true);
    setActionError(null);
    try {
      await abortRun(runId);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Abort failed");
    } finally {
      setAborting(false);
    }
  }

  async function handleAdvance() {
    setAdvancing(true);
    setActionError(null);
    try {
      await advanceRun(runId);
      refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Advance failed");
    } finally {
      setAdvancing(false);
    }
  }

  const ip = customerSystem?.ip ?? "–";
  const port = customerSystem?.port != null ? String(customerSystem.port) : "–";
  const username = customerSystem?.username ?? "–";
  const os = customerSystem?.os ?? "–";

  const isTerminal = TERMINAL_PHASES.has(phase);
  const isWaitingActivity = phase === "WAITING_FOR_ACTIVITY_REVIEW";
  const showAdvance = pendingApproval === null && !isTerminal && !isWaitingActivity;

  return (
    <div className="run-view">
      <div className="run-header">
        <h2>{ticketTitle}</h2>
        <div className="customer-system-info">
          <span>IP: {ip}</span>
          <span>Port: {port}</span>
          <span>User: {username}</span>
          <span>OS: {os}</span>
        </div>
        <div className="run-header-meta">
          <span className="phase-label">{phase}</span>
          <span className="connection-indicator">{connected ? "● live" : "○ connecting"}</span>
          <button
            className="btn btn-abort"
            disabled={aborting}
            onClick={() => void handleAbort()}
          >
            {aborting ? "Aborting…" : "Abort"}
          </button>
        </div>
      </div>

      {pendingApproval !== null && (
        <div className="approval-slot">
          <ApprovalCard
            approval={pendingApproval}
            runId={runId}
            onDecided={refresh}
          />
        </div>
      )}

      <div className="timeline">
        {events.map((event: SseEvent, idx: number) => {
          const { icon, label } = sseEventLabel(event.type);
          const cmd = payloadCommand(event.payload);
          const summary = payloadSummary(event.payload);
          return (
            <div
              key={idx}
              className={`timeline-event timeline-event-${event.type.replace(".", "-")}`}
            >
              <span className="event-time">
                {new Date(event.ts).toLocaleTimeString()}
              </span>
              <span className="event-icon">{icon}</span>
              <span className="event-label">{label}</span>
              {cmd !== null && <pre className="event-command">{cmd}</pre>}
              {summary !== null && <p className="event-summary">{summary}</p>}
            </div>
          );
        })}
        <div ref={timelineRef} />
      </div>

      <div className="run-controls">
        {actionError && <div className="action-error">{actionError}</div>}
        {showAdvance && (
          <button
            className="btn btn-advance"
            disabled={advancing}
            onClick={() => void handleAdvance()}
          >
            {advancing ? "Advancing…" : "Advance"}
          </button>
        )}
        {isWaitingActivity && (
          <button className="btn btn-activity" onClick={onActivityReady}>
            Review Activity Report
          </button>
        )}
      </div>
    </div>
  );
}
