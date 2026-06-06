import type { ActivityDraft, Employee, Run, SystemInfo, Ticket } from "./types";

const BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch (e) {
    throw new Error(`Cannot reach backend at ${BASE} — is it running?`);
  }
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body?.detail?.error?.message || body?.detail?.message || body?.detail || msg;
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status}: ${msg}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export interface Health {
  status: string;
  backend: string;
  llm_provider?: string;
}

export const api = {
  base: BASE,
  health: () => req<Health>("/health"),
  me: () => req<Employee>("/api/me"),
  tickets: (p: { status?: string; priority?: string; sort?: string } = {}) => {
    const q = new URLSearchParams();
    if (p.status) q.set("status", p.status);
    if (p.priority) q.set("priority", p.priority);
    if (p.sort) q.set("sort", p.sort);
    const qs = q.toString();
    return req<Ticket[]>("/api/tickets" + (qs ? `?${qs}` : ""));
  },
  ticket: (id: number) => req<Ticket>(`/api/tickets/${id}`),
  system: (id: number) => req<SystemInfo>(`/api/tickets/${id}/system`),
  reset: () => req<{ message: string }>("/api/reset", { method: "POST" }),
  createRun: (ticket_id: number) =>
    req<Run>("/api/runs", { method: "POST", body: JSON.stringify({ ticket_id }) }),
  getRun: (id: string) => req<Run>(`/api/runs/${id}`),
  approve: (id: string, step_id: string, edited_command?: string) =>
    req<Run>(`/api/runs/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ step_id, edited_command }),
    }),
  reject: (id: string, step_id: string, reason?: string) =>
    req<Run>(`/api/runs/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ step_id, reason }),
    }),
  abort: (id: string) => req<Run>(`/api/runs/${id}/abort`, { method: "POST" }),
  draftActivity: (id: string) => req<ActivityDraft>(`/api/runs/${id}/activity/draft`, { method: "POST" }),
  submitActivity: (id: string, draft: ActivityDraft) =>
    req<{ activity: unknown; submitted: ActivityDraft }>(`/api/runs/${id}/activity/submit`, {
      method: "POST",
      body: JSON.stringify(draft),
    }),
};
