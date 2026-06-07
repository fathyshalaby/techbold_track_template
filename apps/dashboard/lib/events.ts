import { SSE_EVENT_TYPES, type SseEvent, type SseEventType } from "@techbold/contracts";
import { API_BASE } from "./api";

export function getRunEventsUrl(runId: string) {
  return `${API_BASE}/api/runs/${runId}/events`;
}

export type RunEventHandlers = {
  onEvent?: (event: SseEvent) => void;
  onOpen?: () => void;
  onError?: () => void;
};

export function subscribeToRunEvents(runId: string, handlers: RunEventHandlers) {
  const eventSource = new EventSource(getRunEventsUrl(runId));

  const handleEvent = (message: MessageEvent<string>) => {
    const parsed = JSON.parse(message.data) as SseEvent;
    handlers.onEvent?.(parsed);
  };

  for (const eventType of SSE_EVENT_TYPES) {
    eventSource.addEventListener(eventType satisfies SseEventType, handleEvent);
  }

  eventSource.onopen = () => handlers.onOpen?.();
  eventSource.onerror = () => handlers.onError?.();

  return () => eventSource.close();
}
