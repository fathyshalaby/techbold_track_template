// Phoenix ERP client (mirror of backend-py/app/erp.py) — bearer auth, timeouts, retry on 5xx.
import { activePhoenixBaseUrl } from "./caseSource";
import { config } from "./config";

export class ERPError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function req(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | undefined>,
): Promise<any> {
  const url = new URL(activePhoenixBaseUrl() + path);
  if (params) for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);

  let last: unknown;
  for (let i = 0; i < 3; i++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${config.phoenixToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000),
      });
    } catch (e) {
      last = e;
      await sleep(400 * (i + 1));
      continue;
    }
    if (res.status >= 500) {
      last = new ERPError(`${res.status} from Phoenix ${path}`, res.status);
      await sleep(400 * (i + 1));
      continue;
    }
    if (res.status === 401) throw new ERPError("Phoenix auth failed — check PHOENIX_API_TOKEN", 401);
    if (res.status === 404) throw new ERPError(`Phoenix resource not found: ${path}`, 404);
    if (res.status >= 400) {
      const t = await res.text();
      throw new ERPError(`${res.status} from Phoenix ${path}: ${t.slice(0, 300)}`, res.status);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new ERPError(`Phoenix unreachable for ${path}: ${last}`, (last as ERPError)?.status || 502);
}

export const erp = {
  me: () => req("GET", "/api/v1/me"),
  listTickets: (p: { status?: string; priority?: string; sort?: string } = {}) =>
    req("GET", "/api/v1/me/tickets", undefined, { status: p.status, priority: p.priority, sort: p.sort || "date" }),
  getTicket: (id: number) => req("GET", `/api/v1/tickets/${id}`),
  getCustomerSystem: (id: number) => req("GET", `/api/v1/tickets/${id}/customer-system`),
  setStatus: (id: number, status: string) => req("PATCH", `/api/v1/tickets/${id}/status`, { status }),
  createActivity: (payload: unknown) => req("POST", "/api/v1/activities/create", payload),
  reset: () => req("POST", "/api/v1/me/reset"),
};
