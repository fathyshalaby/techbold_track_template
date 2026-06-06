import { describe, it, expect, beforeEach } from 'vitest';
import MockPhoenixClient, { MOCK_TICKETS, MOCK_CUSTOMER_SYSTEMS } from '../phoenix/mock.js';
import { PhoenixNotFoundError } from '../phoenix/client.js';

describe('MockPhoenixClient', () => {
  let client: MockPhoenixClient;

  beforeEach(() => {
    client = new MockPhoenixClient();
  });

  describe('MOCK_TICKETS constant', () => {
    it('has exactly 4 tickets', () => {
      expect(MOCK_TICKETS).toHaveLength(4);
    });

    it('spans OPEN, PENDING, DONE statuses', () => {
      const statuses = MOCK_TICKETS.map((t) => t.status);
      expect(statuses.filter((s) => s === 'OPEN')).toHaveLength(2);
      expect(statuses.filter((s) => s === 'PENDING')).toHaveLength(1);
      expect(statuses.filter((s) => s === 'DONE')).toHaveLength(1);
    });

    it('has varied priorities: high, high, medium, low', () => {
      const priorities = MOCK_TICKETS.map((t) => t.priority).sort();
      expect(priorities).toEqual(['high', 'high', 'low', 'medium']);
    });

    it('contains no real hostnames or public IP addresses in ticket content', () => {
      for (const t of MOCK_TICKETS) {
        expect(t.title).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
        expect(t.description).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
      }
    });
  });

  describe('MOCK_CUSTOMER_SYSTEMS constant', () => {
    it('has an entry for each ticket id', () => {
      for (const t of MOCK_TICKETS) {
        expect(MOCK_CUSTOMER_SYSTEMS[t.id]).toBeDefined();
      }
    });

    it('uses private-range IPs only', () => {
      for (const cs of Object.values(MOCK_CUSTOMER_SYSTEMS)) {
        expect(cs.system.ip).toMatch(/^10\./);
      }
    });
  });

  describe('listTickets', () => {
    it('returns all 4 tickets with no filter', async () => {
      const result = await client.listTickets();
      expect(result).toHaveLength(4);
    });

    it('filters by status=OPEN', async () => {
      const result = await client.listTickets({ status: 'OPEN' });
      expect(result.every((t) => t.status === 'OPEN')).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('filters by status=DONE', async () => {
      const result = await client.listTickets({ status: 'DONE' });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('DONE');
    });

    it('filters by priority', async () => {
      const result = await client.listTickets({ priority: 'high' });
      expect(result.every((t) => t.priority === 'high')).toBe(true);
    });

    it('sorts by priority: high before medium before low', async () => {
      const result = await client.listTickets({ sort: 'priority' });
      const priorities = result.map((t) => t.priority);
      const highIdx = priorities.findIndex((p) => p === 'high');
      const medIdx = priorities.findIndex((p) => p === 'medium');
      const lowIdx = priorities.lastIndexOf('low');
      expect(highIdx).toBeLessThan(medIdx);
      expect(medIdx).toBeLessThan(lowIdx);
    });

    it('sorts by date (id ascending)', async () => {
      const result = await client.listTickets({ sort: 'date' });
      for (let i = 1; i < result.length; i++) {
        expect(result[i].id).toBeGreaterThanOrEqual(result[i - 1].id);
      }
    });

    it('returns a shallow copy — does not mutate MOCK_TICKETS', async () => {
      const result = await client.listTickets();
      expect(result).not.toBe(MOCK_TICKETS);
    });
  });

  describe('getTicket', () => {
    it('returns ticket by id', async () => {
      const first = MOCK_TICKETS[0];
      const result = await client.getTicket(first.id);
      expect(result.id).toBe(first.id);
      expect(result.title).toBe(first.title);
    });

    it('throws PhoenixNotFoundError for unknown id', async () => {
      await expect(client.getTicket(9999)).rejects.toBeInstanceOf(PhoenixNotFoundError);
    });

    it('throws TypeError for non-positive id', async () => {
      await expect(client.getTicket(0)).rejects.toBeInstanceOf(TypeError);
      await expect(client.getTicket(-1)).rejects.toBeInstanceOf(TypeError);
    });
  });

  describe('getCustomerSystem', () => {
    it('returns customer system for valid ticket id', async () => {
      const first = MOCK_TICKETS[0];
      const result = await client.getCustomerSystem(first.id);
      expect(result.ticket_id).toBe(first.id);
      expect(result.system.port).toBe(22);
      expect(result.system.username).toBe('azureuser');
    });

    it('throws PhoenixNotFoundError for unknown id', async () => {
      await expect(client.getCustomerSystem(9999)).rejects.toBeInstanceOf(PhoenixNotFoundError);
    });

    it('throws TypeError for non-positive id', async () => {
      await expect(client.getCustomerSystem(0)).rejects.toBeInstanceOf(TypeError);
    });
  });

  describe('getMe', () => {
    it('returns demo employee', async () => {
      const result = await client.getMe();
      expect(result.id).toBe(1);
      expect(result.firstname).toBe('Demo');
      expect(result.lastname).toBe('Tech');
      expect(result.username).toBe('demo.tech');
      expect(result.teamname).toBe('Support');
    });
  });

  describe('createActivity', () => {
    it('returns activity with id and team fields added', async () => {
      const body = {
        ticket_id: MOCK_TICKETS[0].id,
        start_datetime: '2026-06-01T10:00:00Z',
        end_datetime: '2026-06-01T11:00:00Z',
        description: 'Investigated service outage',
      };
      const result = await client.createActivity(body);
      expect(result.id).toBe(1);
      expect(result.team_id).toBe(1);
      expect(result.team_name).toBe('Support');
      expect(result.employee_id).toBe(1);
      expect(result.ticket_id).toBe(body.ticket_id);
      expect(result.description).toBe(body.description);
    });

    it('defaults description to empty string if not provided', async () => {
      const result = await client.createActivity({
        ticket_id: 1,
        start_datetime: '2026-06-01T10:00:00Z',
        end_datetime: '2026-06-01T11:00:00Z',
      });
      expect(result.description).toBe('');
    });
  });

  describe('setStatus', () => {
    it('mutates ticket status and returns updated ticket', async () => {
      const ticket = MOCK_TICKETS.find((t) => t.status === 'OPEN')!;
      const result = await client.setStatus(ticket.id, 'DONE');
      expect(result.status).toBe('DONE');
      expect(result.id).toBe(ticket.id);
      // verify in-place mutation
      expect(MOCK_TICKETS.find((t) => t.id === ticket.id)!.status).toBe('DONE');
    });

    it('throws PhoenixNotFoundError for unknown id', async () => {
      await expect(client.setStatus(9999, 'DONE')).rejects.toBeInstanceOf(PhoenixNotFoundError);
    });
  });
});
