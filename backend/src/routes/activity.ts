import { Hono } from 'hono';
import { z } from 'zod';

export const activityRouter = new Hono();

export const SubmitBodySchema = z.object({
  summary: z.string().optional(),
  rootCause: z.string().optional(),
  actionsTaken: z.string().optional(),
  commandsSummary: z.string().optional(),
  validationResult: z.string().optional(),
});

activityRouter.post('/:runId/activity/draft', (c) => {
  return c.json({ error: 'not implemented' }, 501);
});

activityRouter.post('/:runId/activity/submit', (c) => {
  return c.json({ error: 'not implemented' }, 501);
});
