import type {
  ActivityDraft,
  CreateRunResult,
  CustomerSystemResponse,
  DashboardResponse,
  MemoryEntrySummary,
  MemoryStatsSummary,
  RunDetail,
  Ticket,
} from "@techbold/contracts";

const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

// Server-rendered fetches run inside the container/network, where the backend is
// reachable by its service hostname rather than the browser's host-mapped localhost.
// API_BASE_INTERNAL lets Compose point server-side requests at http://backend:8000
// while the browser keeps using the public host URL (and SSE stays on the public base).
const SERVER_API_BASE = process.env.API_BASE_INTERNAL || PUBLIC_API_BASE;

export const API_BASE = typeof window === "undefined" ? SERVER_API_BASE : PUBLIC_API_BASE;

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
    let message = `HTTP ${response.status}`;
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      if (typeof record.error === "string") {
        message = record.error;
        if (typeof record.detail === "string" && record.detail.trim()) {
          message = `${message}: ${record.detail}`;
        }
      }
    }
    throw new Error(message);
  }
  return body as T;
}

export function getDashboard(limit?: number) {
  return api<DashboardResponse>(`/api/dashboard${limit ? `?limit=${limit}` : ""}`);
}

export type MemoryResponse = {
  available: boolean;
  stats: MemoryStatsSummary | null;
  recent: MemoryEntrySummary[];
};

export type MemorySearchResponse = {
  available: boolean;
  results: MemoryEntrySummary[];
};

export type MemoryVectorPoint = {
  id: string;
  source: MemoryEntrySummary["source"];
  symptom: string;
  rootCause: string;
  fix: string;
  x: number;
  y: number;
  preview: number[];
  score?: number;
};

export type MemoryVectorsResponse = {
  available: boolean;
  points: MemoryVectorPoint[];
};

export function getMemory() {
  return api<MemoryResponse>("/api/memory");
}

export function getMemoryVectors(q?: string, limit = 200) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  params.set("limit", String(limit));
  return api<MemoryVectorsResponse>(`/api/memory/vectors?${params.toString()}`);
}

export function searchMemory(q: string, limit = 8) {
  return api<MemorySearchResponse>(`/api/memory/search?q=${encodeURIComponent(q)}&limit=${limit}`);
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

export type SandboxVmSummary = {
  ticketId: number;
  archetype: string;
  title: string;
  status: string;
  sshTarget: string;
  customerName: string;
};

export type GenerateVmsResult = {
  created: Array<{ ticketId: number; archetype: string; title: string; sshTarget: string }>;
  errors: Array<{ ticketId: number; error: string }>;
  tickets: Ticket[];
};

export function listVms() {
  return api<{ items: SandboxVmSummary[] }>("/api/sandbox/vms");
}

export function generateVms(body: {
  count: number;
  archetypes?: string[];
  randomize?: boolean;
}) {
  return api<GenerateVmsResult>("/api/sandbox/vms", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function resetVm(ticketId: number) {
  return api<{ ticket: Ticket; sshTarget: string }>(`/api/sandbox/vms/${ticketId}/reset`, {
    method: "POST",
  });
}

export function deleteVm(ticketId: number) {
  return api<{ deleted: number }>(`/api/sandbox/vms/${ticketId}`, { method: "DELETE" });
}

export function getModelSettings() {
  return api<import("@techbold/contracts").ModelSettingsResponse>("/api/settings/model");
}

export function setActiveModel(model: string) {
  return api<import("@techbold/contracts").ModelSettingsResponse>("/api/settings/model", {
    method: "PUT",
    body: JSON.stringify({ model }),
  });
}
