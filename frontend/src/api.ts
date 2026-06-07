import type {
  Ticket,
  CustomerSystem,
  Run,
  CommandApproval,
  ActivityDraft,
  CreateRunResult,
} from "./types.js";

export const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export function getEventsUrl(runId: string): string {
  return `${BASE}/api/runs/${runId}/events`;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as Record<string, unknown>;
      if (typeof body["error"] === "string") {
        message = body["error"];
      }
    } catch {
      // body not JSON — use statusText as fallback
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function listTickets(params?: {
  status?: string;
  priority?: string;
  sort?: string;
}): Promise<Ticket[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.priority) qs.set("priority", params.priority);
  if (params?.sort) qs.set("sort", params.sort);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  try {
    const result = await apiFetch<Ticket[]>(`/api/tickets${query}`);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export function getTicket(id: number): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${id}`);
}

export function getCustomerSystem(id: number): Promise<CustomerSystem> {
  return apiFetch<CustomerSystem>(`/api/tickets/${id}/customer-system`);
}

export function createRun(ticketId: number): Promise<CreateRunResult> {
  return apiFetch<CreateRunResult>("/api/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketId }),
  });
}

export function getRun(runId: string): Promise<Run> {
  return apiFetch<Run>(`/api/runs/${runId}`);
}

export function advanceRun(
  runId: string,
): Promise<{ status: string; phase: string; pendingApproval: CommandApproval | null }> {
  return apiFetch(`/api/runs/${runId}/next`, { method: "POST" });
}

export function abortRun(runId: string): Promise<{ status: string; phase: string }> {
  return apiFetch(`/api/runs/${runId}/abort`, { method: "POST" });
}

export function approveCommand(
  runId: string,
  approvalId: string,
  editedCommand?: string,
): Promise<unknown> {
  const body: Record<string, string> = {};
  if (editedCommand !== undefined) {
    body["editedCommand"] = editedCommand;
  }
  return apiFetch(`/api/runs/${runId}/approvals/${approvalId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function rejectCommand(
  runId: string,
  approvalId: string,
  reason: string,
): Promise<unknown> {
  return apiFetch(`/api/runs/${runId}/approvals/${approvalId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export function draftActivity(runId: string): Promise<ActivityDraft> {
  return apiFetch<ActivityDraft>(`/api/runs/${runId}/activity/draft`, {
    method: "POST",
  });
}

export function submitActivity(
  runId: string,
  overrides: Partial<ActivityDraft>,
): Promise<unknown> {
  const body: Record<string, string> = {};
  if (overrides.summary !== undefined) body["summary"] = overrides.summary;
  if (overrides.root_cause !== undefined) body["rootCause"] = overrides.root_cause;
  if (overrides.actions_taken !== undefined) body["actionsTaken"] = overrides.actions_taken;
  if (overrides.commands_summary !== undefined) body["commandsSummary"] = overrides.commands_summary;
  if (overrides.validation_result !== undefined) body["validationResult"] = overrides.validation_result;
  return apiFetch(`/api/runs/${runId}/activity/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
