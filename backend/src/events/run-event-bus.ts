import { EventEmitter } from 'node:events';

const busMap = new Map<string, EventEmitter>();

function getBus(runId: string): EventEmitter {
  let bus = busMap.get(runId);
  if (!bus) {
    bus = new EventEmitter();
    bus.setMaxListeners(50);
    busMap.set(runId, bus);
  }
  return bus;
}

export const runEventBus = {
  emit(runId: string, eventType: string, payload: unknown): void {
    getBus(runId).emit(eventType, payload);
    getBus(runId).emit('*', { eventType, payload });
  },

  on(runId: string, eventType: string, listener: (payload: unknown) => void): void {
    getBus(runId).on(eventType, listener);
  },

  off(runId: string, eventType: string, listener: (payload: unknown) => void): void {
    getBus(runId).off(eventType, listener);
  },

  onAny(runId: string, listener: (event: { eventType: string; payload: unknown }) => void): void {
    getBus(runId).on('*', listener);
  },

  offAny(runId: string, listener: (event: { eventType: string; payload: unknown }) => void): void {
    getBus(runId).off('*', listener);
  },

  removeAll(runId: string): void {
    busMap.delete(runId);
  },
};
