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
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let lastEvent: SseEvent | undefined;

  const scheduleEvent = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      if (lastEvent) handlers.onEvent?.(lastEvent);
    }, 250);
  };

  const handleEvent = (message: MessageEvent<string>) => {
    try {
      // Forward the real event (debounced) so the live view reflects actual types.
      lastEvent = JSON.parse(message.data) as SseEvent;
      scheduleEvent();
    } catch {
      // Ignore malformed SSE payloads; pump/refresh still drives the UI.
    }
  };

  for (const eventType of SSE_EVENT_TYPES) {
    eventSource.addEventListener(eventType satisfies SseEventType, handleEvent);
  }

  eventSource.onopen = () => handlers.onOpen?.();
  eventSource.onerror = () => handlers.onError?.();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    eventSource.close();
  };
}
