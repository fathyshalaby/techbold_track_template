import { EventEmitter } from 'node:events';

class RunEventBus {
  private readonly emitters = new Map<string, EventEmitter>();

  private getOrCreate(runId: string): EventEmitter {
    let emitter = this.emitters.get(runId);
    if (!emitter) {
      emitter = new EventEmitter();
      emitter.setMaxListeners(50);
      this.emitters.set(runId, emitter);
    }
    return emitter;
  }

  emit(runId: string, eventType: string, payload: unknown): void {
    const emitter = this.getOrCreate(runId);
    emitter.emit(eventType, payload);
    // Also fan out on a wildcard channel so one subscriber (the SSE stream) gets
    // EVERY event type without an allowlist that silently drifts from what the
    // orchestrator actually emits.
    emitter.emit('*', eventType, payload);
  }

  on(runId: string, eventType: string, listener: (payload: unknown) => void): void {
    this.getOrCreate(runId).on(eventType, listener);
  }

  off(runId: string, eventType: string, listener: (payload: unknown) => void): void {
    this.emitters.get(runId)?.off(eventType, listener);
  }

  // Subscribe to ALL events for a run; the listener receives (eventType, payload).
  onAny(runId: string, listener: (eventType: string, payload: unknown) => void): void {
    this.getOrCreate(runId).on('*', listener);
  }

  offAny(runId: string, listener: (eventType: string, payload: unknown) => void): void {
    this.emitters.get(runId)?.off('*', listener);
  }

  removeAllListeners(runId: string): void {
    const emitter = this.emitters.get(runId);
    if (emitter) {
      emitter.removeAllListeners();
      this.emitters.delete(runId);
    }
  }
}

export const runEventBus = new RunEventBus();
