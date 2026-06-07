import { scenarioCustomerSystems, scenarioTickets } from "../sandbox/registry.js";
import { PhoenixNotFoundError } from "./client.js";
import type {
  Activity,
  ActivityCreate,
  CustomerSystem,
  Employee,
  Ticket,
  TicketStatus,
} from "./types.js";

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 1,
    title: "Service unavailable",
    description: "Web service is not responding to requests.",
    priority: "high",
    status: "OPEN",
    customer_id: 1001,
    customer_name: "Acme Corp",
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    id: 2,
    title: "Login fails",
    description: "Users cannot authenticate via the web portal.",
    priority: "high",
    status: "OPEN",
    customer_id: 1002,
    customer_name: "Globex Industries",
    created_at: "2026-06-02T09:15:00Z",
  },
  {
    id: 3,
    title: "Disk usage alert",
    description: "Disk utilisation above 90% on primary volume.",
    priority: "medium",
    status: "PENDING",
    customer_id: 1003,
    customer_name: "Initech Solutions",
    created_at: "2026-06-03T11:30:00Z",
  },
  {
    id: 4,
    title: "Scheduled task not running",
    description: "Nightly backup job has not completed for three days.",
    priority: "low",
    status: "DONE",
    customer_id: 1004,
    customer_name: "Umbrella Services",
    created_at: "2026-06-04T14:00:00Z",
  },
];

export const MOCK_CUSTOMER_SYSTEMS: Record<number, CustomerSystem> = {
  1: {
    ticket_id: 1,
    customer_id: 1001,
    system: { ip: "10.0.0.1", port: 22, username: "azureuser", os: "Ubuntu 22.04 LTS" },
  },
  2: {
    ticket_id: 2,
    customer_id: 1002,
    system: { ip: "10.0.0.2", port: 22, username: "azureuser", os: "Ubuntu 22.04 LTS" },
  },
  3: {
    ticket_id: 3,
    customer_id: 1003,
    system: { ip: "10.0.0.3", port: 22, username: "azureuser", os: "Ubuntu 22.04 LTS" },
  },
  4: {
    ticket_id: 4,
    customer_id: 1004,
    system: { ip: "10.0.0.4", port: 22, username: "azureuser", os: "Ubuntu 22.04 LTS" },
  },
};

// Realistic-incident dataset from the sandbox scenario catalog. Module-level and
// mutable so per-request mock clients share state (a status change persists).
// Opt-in via the constructor (MOCK_SCENARIOS env) so the fixtures above stay the
// deterministic 4-ticket set the unit tests pin.
export const SCENARIO_TICKETS: Ticket[] = scenarioTickets() as Ticket[];
export const SCENARIO_CUSTOMER_SYSTEMS: Record<number, CustomerSystem> = scenarioCustomerSystems();

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export interface MockPhoenixOptions {
  // When true, serve the realistic sandbox incident catalog instead of the
  // generic 4-ticket fixture set (used for the MOCK_MODE demo).
  seedScenarios?: boolean;
}

export default class MockPhoenixClient {
  private readonly tickets: Ticket[];
  private readonly customerSystems: Record<number, CustomerSystem>;

  constructor(opts?: MockPhoenixOptions) {
    // Hold the shared module-level arrays by reference so setStatus mutations
    // persist across per-request client instances (matches prior behaviour).
    this.tickets = opts?.seedScenarios ? SCENARIO_TICKETS : MOCK_TICKETS;
    this.customerSystems = opts?.seedScenarios ? SCENARIO_CUSTOMER_SYSTEMS : MOCK_CUSTOMER_SYSTEMS;
  }

  async listTickets(query?: {
    status?: TicketStatus;
    priority?: string;
    sort?: "date" | "priority" | "status";
  }): Promise<Ticket[]> {
    let result = [...this.tickets];

    if (query?.status !== undefined) {
      result = result.filter((t) => t.status === query.status);
    }
    if (query?.priority !== undefined) {
      result = result.filter((t) => t.priority === query.priority);
    }

    if (query?.sort === "priority") {
      result.sort(
        (a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99),
      );
    } else if (query?.sort === "status") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    } else if (query?.sort === "date") {
      result.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
    }

    return Promise.resolve(result);
  }

  async getTicket(ticketId: number): Promise<Ticket> {
    this.validateTicketId(ticketId);
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new PhoenixNotFoundError(`Ticket ${ticketId} not found`);
    return Promise.resolve(ticket);
  }

  async getCustomerSystem(ticketId: number): Promise<CustomerSystem> {
    this.validateTicketId(ticketId);
    const cs = this.customerSystems[ticketId];
    if (!cs) throw new PhoenixNotFoundError(`CustomerSystem for ticket ${ticketId} not found`);
    return Promise.resolve(cs);
  }

  async reset(): Promise<{ message?: string; detail?: string }> {
    return Promise.resolve({ message: "mock reset: activities cleared, VMs rebooted" });
  }

  async getMe(): Promise<Employee> {
    return Promise.resolve({
      id: 1,
      firstname: "Demo",
      lastname: "Tech",
      username: "demo.tech",
      teamname: "Support",
    });
  }

  async createActivity(body: ActivityCreate): Promise<Activity> {
    return Promise.resolve({
      id: 1,
      team_id: 1,
      team_name: "Support",
      employee_id: 1,
      ticket_id: body.ticket_id,
      start_datetime: body.start_datetime,
      end_datetime: body.end_datetime,
      description: body.description ?? "",
      summary: body.summary,
      root_cause: body.root_cause,
      actions_taken: body.actions_taken,
      commands_summary: body.commands_summary,
      validation_result: body.validation_result,
    });
  }

  async setStatus(ticketId: number, status: TicketStatus): Promise<Ticket> {
    this.validateTicketId(ticketId);
    const idx = this.tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) throw new PhoenixNotFoundError(`Ticket ${ticketId} not found`);
    this.tickets[idx] = { ...this.tickets[idx], status };
    return Promise.resolve({ ...this.tickets[idx] });
  }

  private validateTicketId(ticketId: number): void {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      throw new TypeError(`ticketId must be a positive integer, got: ${ticketId}`);
    }
  }
}
