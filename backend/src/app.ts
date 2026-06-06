import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { healthRouter } from './routes/health.js';
import { ticketsRouter } from './routes/tickets.js';

export const app = new Hono();

// Open CORS — intentional for this single-machine local tool (ARCHITECTURE.md §10)
app.use('*', cors());

app.route('/health', healthRouter);
app.route('/api/tickets', ticketsRouter);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal server error' }, 500);
});
