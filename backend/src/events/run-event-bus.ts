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
    this.getOrCreate(runId).emit(eventType, payload);
  }

  on(runId: string, eventType: string, listener: (payload: unknown) => void): void {
    this.getOrCreate(runId).on(eventType, listener);
  }

  off(runId: string, eventType: string, listener: (payload: unknown) => void): void {
    this.emitters.get(runId)?.off(eventType, listener);
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
