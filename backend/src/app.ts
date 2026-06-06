import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { healthRouter } from './routes/health.js';
import { ticketsRouter } from './routes/tickets.js';
import { runsRouter } from './routes/runs.js';

// Log details server-side; return a generic message so internal details (and any
// secret-bearing error text) never leak to the client. Exported so it is unit-testable.
export function errorHandler(err: Error, c: Context) {
  console.error('[unhandled]', err);
  return c.json({ error: 'Internal Server Error' }, 500);
}

export const app = new Hono();

// Open CORS — intentional for this single-machine local tool (ARCHITECTURE.md §10)
app.use('*', cors());

app.route('/health', healthRouter);
app.route('/api/tickets', ticketsRouter);
app.route('/api/runs', runsRouter);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal server error' }, 500);
});
