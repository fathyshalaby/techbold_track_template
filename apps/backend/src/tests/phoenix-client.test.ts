import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PhoenixAuthError,
  PhoenixClient,
  PhoenixNetworkError,
  PhoenixNotFoundError,
  PhoenixValidationError,
} from "../phoenix/client.js";

const BASE_URL = "http://phoenix.test";
const TOKEN = "test-token";

const mockTicket = {
  id: 1,
  title: "Test ticket",
  description: "Something broken",
  priority: "high",
  status: "OPEN",
  customer_id: 5001,
  customer_name: "Test Corp",
};

const mockActivity = {
  id: 99,
  team_id: 1,
  team_name: "Support",
  employee_id: 42,
  ticket_id: 1,
  start_datetime: "2026-01-01T10:00:00Z",
  end_datetime: "2026-01-01T11:00:00Z",
  description: "Fixed it",
};

const mockCustomerSystem = {
  ticket_id: 1,
  customer_id: 5001,
  system: { ip: "10.0.0.1", port: 22, username: "azureuser", os: "Ubuntu 22.04" },
};

const mockEmployee = {
  id: 1001,
  firstname: "Max",
  lastname: "Mustermann",
  username: "m.mustermann",
  teamname: "Remote Support",
};

function makeFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("phoenix-client", () => {
  let client: PhoenixClient;

  beforeEach(() => {
    client = new PhoenixClient(BASE_URL, TOKEN);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("listTickets", () => {
    it("happy path: returns ticket array", async () => {
      vi.stubGlobal("fetch", makeFetch(200, [mockTicket]));
      const result = await client.listTickets();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("empty list: returns []", async () => {
      vi.stubGlobal("fetch", makeFetch(200, []));
      const result = await client.listTickets();
      expect(result).toEqual([]);
    });

    it("401: throws PhoenixAuthError", async () => {
      vi.stubGlobal("fetch", makeFetch(401, { detail: "Unauthorized" }));
      await expect(client.listTickets()).rejects.toBeInstanceOf(PhoenixAuthError);
    });

    it("passes query params correctly", async () => {
      const fetchMock = makeFetch(200, []);
      vi.stubGlobal("fetch", fetchMock);
      await client.listTickets({ status: "OPEN", sort: "date" });
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain("status=OPEN");
      expect(calledUrl).toContain("sort=date");
    });
  });

  describe("getTicket", () => {
    it("happy path: returns single ticket", async () => {
      vi.stubGlobal("fetch", makeFetch(200, mockTicket));
      const result = await client.getTicket(1);
      expect(result.id).toBe(1);
      expect(result.title).toBe("Test ticket");
    });

    it("404: throws PhoenixNotFoundError", async () => {
      vi.stubGlobal("fetch", makeFetch(404, { detail: "Not found" }));
      await expect(client.getTicket(1)).rejects.toBeInstanceOf(PhoenixNotFoundError);
    });

    it("invalid ticketId: throws TypeError", async () => {
      await expect(client.getTicket(0)).rejects.toBeInstanceOf(TypeError);
      await expect(client.getTicket(-1)).rejects.toBeInstanceOf(TypeError);
    });
  });

  describe("getCustomerSystem", () => {
    it("happy path: returns customer system", async () => {
      vi.stubGlobal("fetch", makeFetch(200, mockCustomerSystem));
      const result = await client.getCustomerSystem(1);
      expect(result.ticket_id).toBe(1);
      expect(result.system.ip).toBe("10.0.0.1");
    });
  });

  describe("getMe", () => {
    it("happy path: returns employee", async () => {
      vi.stubGlobal("fetch", makeFetch(200, mockEmployee));
      const result = await client.getMe();
      expect(result.id).toBe(1001);
      expect(result.username).toBe("m.mustermann");
    });
  });

  describe("createActivity", () => {
    it("happy path: 201 returns Activity", async () => {
      vi.stubGlobal("fetch", makeFetch(201, mockActivity));
      const result = await client.createActivity({
        ticket_id: 1,
        start_datetime: "2026-01-01T10:00:00Z",
        end_datetime: "2026-01-01T11:00:00Z",
      });
      expect(result.ticket_id).toBe(1);
      expect(result.id).toBe(99);
    });

    it("422: throws PhoenixValidationError", async () => {
      vi.stubGlobal(
        "fetch",
        makeFetch(422, { detail: [{ loc: ["body"], msg: "field required", type: "missing" }] }),
      );
      await expect(
        client.createActivity({ ticket_id: 1, start_datetime: "", end_datetime: "" }),
      ).rejects.toBeInstanceOf(PhoenixValidationError);
    });
  });

  describe("setStatus", () => {
    it("happy path: returns updated ticket", async () => {
      const updated = { ...mockTicket, status: "DONE" };
      vi.stubGlobal("fetch", makeFetch(200, updated));
      const result = await client.setStatus(1, "DONE");
      expect(result.status).toBe("DONE");
    });
  });

  describe("retry behaviour", () => {
    it("retries once on network error then succeeds", async () => {
      let calls = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(() => {
          calls++;
          if (calls === 1) return Promise.reject(new Error("network failure"));
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockTicket]),
          });
        }),
      );
      const result = await client.listTickets();
      expect(result).toHaveLength(1);
      expect(calls).toBe(2);
    });

    it("throws PhoenixNetworkError after two consecutive network failures", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failure")));
      await expect(client.listTickets()).rejects.toBeInstanceOf(PhoenixNetworkError);
    });

    it("does not retry on 401 - fetch called exactly once", async () => {
      const fetchMock = makeFetch(401, { detail: "Unauthorized" });
      vi.stubGlobal("fetch", fetchMock);
      await expect(client.listTickets()).rejects.toBeInstanceOf(PhoenixAuthError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not retry on 404 - fetch called exactly once", async () => {
      const fetchMock = makeFetch(404, { detail: "Not found" });
      vi.stubGlobal("fetch", fetchMock);
      await expect(client.getTicket(1)).rejects.toBeInstanceOf(PhoenixNotFoundError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does NOT retry POST createActivity on network error - fetch called once (no duplicate ERP records)", async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error("network failure"));
      vi.stubGlobal("fetch", fetchMock);
      await expect(
        client.createActivity({
          ticket_id: 1,
          start_datetime: "2026-01-01T00:00:00Z",
          end_datetime: "2026-01-01T01:00:00Z",
        }),
      ).rejects.toBeInstanceOf(PhoenixNetworkError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Authorization header", () => {
    it("sends Bearer token on every request", async () => {
      const fetchMock = makeFetch(200, []);
      vi.stubGlobal("fetch", fetchMock);
      await client.listTickets();
      const opts = fetchMock.mock.calls[0][1] as RequestInit;
      expect((opts.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    });
  });
});
