import { Hono } from 'hono';
import { z } from 'zod';
import { getEnv, resolveClientMode } from '../env.js';
import { PhoenixClient, PhoenixAuthError, PhoenixNotFoundError, PhoenixNetworkError, PhoenixValidationError } from '../phoenix/client.js';
import MockPhoenixClient from '../phoenix/mock.js';
import { TicketStatusSchema } from '../phoenix/types.js';

export const ticketsRouter = new Hono();

const ListQuerySchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: z.string().optional(),
  sort: z.enum(['date', 'priority', 'status']).optional(),
});

function getClient() {
  if (resolveClientMode('phoenix') === 'mock') {
    return new MockPhoenixClient();
  }
  const env = getEnv();
  return new PhoenixClient(env.PHOENIX_API_BASE_URL, env.PHOENIX_API_TOKEN);
}

ticketsRouter.get('/', async (c) => {
  const parsed = ListQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'invalid query parameters' }, 400);
  }
  const query = parsed.data;

  try {
    const tickets = await getClient().listTickets(query);
    return c.json(tickets, 200);
  } catch (err) {
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: 'upstream authentication failed' }, 502);
    }
    if (err instanceof PhoenixNotFoundError) {
      return c.json([], 200);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: 'ERP unavailable' }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: 'ERP returned an unexpected response' }, 502);
    }
    throw err;
  }
});

ticketsRouter.get('/:id/customer-system', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (Number.isNaN(id)) {
    return c.json({ error: 'invalid ticket id' }, 400);
  }

  try {
    const customerSystem = await getClient().getCustomerSystem(id);
    return c.json(customerSystem, 200);
  } catch (err) {
    if (err instanceof PhoenixNotFoundError || err instanceof TypeError) {
      return c.json({ error: 'customer system not found' }, 404);
    }
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: 'upstream authentication failed' }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: 'ERP unavailable' }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: 'ERP returned an unexpected response' }, 502);
    }
    throw err;
  }
});

ticketsRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (Number.isNaN(id)) {
    return c.json({ error: 'invalid ticket id' }, 400);
  }

  try {
    const ticket = await getClient().getTicket(id);
    return c.json(ticket, 200);
  } catch (err) {
    if (err instanceof PhoenixNotFoundError || err instanceof TypeError) {
      return c.json({ error: 'ticket not found' }, 404);
    }
    if (err instanceof PhoenixAuthError) {
      return c.json({ error: 'upstream authentication failed' }, 502);
    }
    if (err instanceof PhoenixNetworkError) {
      return c.json({ error: 'ERP unavailable' }, 502);
    }
    if (err instanceof PhoenixValidationError) {
      return c.json({ error: 'ERP returned an unexpected response' }, 502);
    }
    throw err;
  }
});
