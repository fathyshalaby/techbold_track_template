import type {
  ActivityDraft,
  CreateRunResult,
  CustomerSystemResponse,
  DashboardResponse,
  RunDetail,
  Ticket,
} from "@techbold/contracts";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

type TicketParams = {
  status?: "OPEN" | "PENDING" | "DONE";
  priority?: string;
  sort?: "date" | "priority" | "status";
};

type ActivitySubmitFields = {
  summary?: string;
  rootCause?: string;
  actionsTaken?: string;
  commandsSummary?: string;
  validationResult?: string;
};

function toUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function dashboardUrl(path: string, params?: Record<string, string | number | undefined>) {
  return toUrl(path, params);
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(toUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export function getDashboard(limit?: number) {
  return api<DashboardResponse>(`/api/dashboard${limit ? `?limit=${limit}` : ""}`);
}

export function listTickets(params?: TicketParams) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.priority) search.set("priority", params.priority);
  if (params?.sort) search.set("sort", params.sort);
  const query = search.toString();
  return api<Ticket[]>(`/api/tickets${query ? `?${query}` : ""}`);
}

export function getTicket(ticketId: number) {
  return api<Ticket>(`/api/tickets/${ticketId}`);
}

export function getCustomerSystem(ticketId: number) {
  return api<CustomerSystemResponse>(`/api/tickets/${ticketId}/customer-system`);
}

export function createRun(ticketId: number) {
  return api<CreateRunResult>("/api/runs", {
    method: "POST",
    body: JSON.stringify({ ticketId }),
  });
}

export function getRun(runId: string) {
  return api<RunDetail>(`/api/runs/${runId}`);
}

export function advanceRun(runId: string) {
  return api<{ status: string; phase: string; pendingApproval: RunDetail["pendingApproval"] }>(
    `/api/runs/${runId}/next`,
    { method: "POST" },
  );
}

export function abortRun(runId: string) {
  return api<{ status: string; phase: string }>(`/api/runs/${runId}/abort`, { method: "POST" });
}

export function approveCommand(
  runId: string,
  approvalId: string,
  body: { editedCommand?: string; reason?: string } = {},
) {
  return api(`/api/runs/${runId}/approvals/${approvalId}/approve`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function rejectCommand(runId: string, approvalId: string, reason: string) {
  const trimmed = reason.trim();
  if (!trimmed) throw new Error("reason is required");
  return api(`/api/runs/${runId}/approvals/${approvalId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: trimmed }),
  });
}

export function draftActivity(runId: string) {
  return api<ActivityDraft>(`/api/runs/${runId}/activity/draft`, { method: "POST" });
}

export function submitActivity(runId: string, fields: ActivitySubmitFields) {
  return api(`/api/runs/${runId}/activity/submit`, {
    method: "POST",
    body: JSON.stringify(fields),
  });
}
