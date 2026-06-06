import { z } from 'zod';
import {
  type Activity,
  ActivitySchema,
  type ActivityCreate,
  type CustomerSystem,
  CustomerSystemSchema,
  type Employee,
  EmployeeSchema,
  type Ticket,
  TicketSchema,
  type TicketStatus,
} from './types.js';

export class PhoenixAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoenixAuthError';
  }
}

export class PhoenixNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoenixNotFoundError';
  }
}

export class PhoenixValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoenixValidationError';
  }
}

export class PhoenixNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoenixNetworkError';
  }
}

export class PhoenixClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  async listTickets(query?: {
    status?: TicketStatus;
    priority?: string;
    sort?: 'date' | 'priority' | 'status';
  }): Promise<Ticket[]> {
    const params: Record<string, string> = {};
    if (query?.status !== undefined) params['status'] = query.status;
    if (query?.priority !== undefined) params['priority'] = query.priority;
    if (query?.sort !== undefined) params['sort'] = query.sort;
    return this.request(z.array(TicketSchema), 'GET', '/api/v1/me/tickets', undefined, params);
  }

  async getTicket(ticketId: number): Promise<Ticket> {
    this.validateTicketId(ticketId);
    return this.request(TicketSchema, 'GET', `/api/v1/tickets/${ticketId}`);
  }

  async getCustomerSystem(ticketId: number): Promise<CustomerSystem> {
    this.validateTicketId(ticketId);
    return this.request(CustomerSystemSchema, 'GET', `/api/v1/tickets/${ticketId}/customer-system`);
  }

  async getMe(): Promise<Employee> {
    return this.request(EmployeeSchema, 'GET', '/api/v1/me');
  }

  async createActivity(body: ActivityCreate): Promise<Activity> {
    return this.request(ActivitySchema, 'POST', '/api/v1/activities/create', body);
  }

  async setStatus(ticketId: number, status: TicketStatus): Promise<Ticket> {
    this.validateTicketId(ticketId);
    return this.request(TicketSchema, 'PATCH', `/api/v1/tickets/${ticketId}/status`, { status });
  }

  private validateTicketId(ticketId: number): void {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      throw new TypeError(`ticketId must be a positive integer, got: ${ticketId}`);
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        // 5xx — retry once
        if (response.status >= 500 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
        return response;
      } catch (err) {
        clearTimeout(timer);
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
        throw new PhoenixNetworkError(`Network error: ${(err as Error).message}`);
      }
    }
    // Reached only when second attempt returned a 5xx response
    throw new PhoenixNetworkError('Phoenix returned 5xx after retry');
  }

  private async request<T>(
    schema: z.ZodType<T>,
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string>,
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (query && Object.keys(query).length > 0) {
      url += '?' + new URLSearchParams(query).toString();
    }

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await this.fetchWithRetry(url, options);

    if (response.ok) {
      const json = await response.json();
      try {
        return schema.parse(json);
      } catch (err) {
        throw new PhoenixValidationError(
          `Response shape mismatch: ${(err as Error).message}`,
        );
      }
    }

    switch (response.status) {
      case 401:
        throw new PhoenixAuthError('Phoenix returned 401');
      case 404:
        throw new PhoenixNotFoundError('Phoenix returned 404');
      case 422:
        throw new PhoenixValidationError('Phoenix returned 422');
      default:
        throw new PhoenixNetworkError(`Phoenix returned ${response.status}`);
    }
  }
}
