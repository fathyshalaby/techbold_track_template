import { Hono } from 'hono';
import { getRunById } from '../store/runs.js';
import { createSseStream } from '../events/sse.js';

export const eventsRouter = new Hono();

eventsRouter.get('/:runId/events', async (c) => {
  const runId = c.req.param('runId');
  const run = getRunById(runId);
  if (!run) return c.json({ error: 'run not found' }, 404);
  return createSseStream(c, runId);
});
