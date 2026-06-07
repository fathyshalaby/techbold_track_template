import { useState, useEffect } from "react";
import type { SseEvent, SseEventType } from "../types.js";
import { getEventsUrl } from "../api.js";

const SSE_EVENT_TYPES: SseEventType[] = [
  "run.started",
  "agent.thought_summary",
  "command.proposed",
  "command.blocked",
  "approval.required",
  "command.executing",
  "command.completed",
  "observation.added",
  "fix.proposed",
  "validation.completed",
  "activity.drafted",
  "activity.submitted",
  "run.completed",
  "run.failed",
];

export function useRunEvents(runId: string | null): {
  events: SseEvent[];
  connected: boolean;
} {
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (runId === null) return;

    const es = new EventSource(getEventsUrl(runId));

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    for (const eventType of SSE_EVENT_TYPES) {
      es.addEventListener(eventType, (e: MessageEvent) => {
        const parsed = JSON.parse(e.data as string) as SseEvent;
        setEvents((prev) => [...prev, parsed]);
      });
    }

    return () => {
      es.close();
      setConnected(false);
    };
  }, [runId]);

  return { events, connected };
}
