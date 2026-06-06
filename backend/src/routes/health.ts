import { Hono } from 'hono';
import { isMockMode } from '../env.js';

export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
  return c.json({ status: 'ok', mode: isMockMode() ? 'mock' : 'real' });
});
