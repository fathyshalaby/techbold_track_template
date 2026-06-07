import { Hono } from 'hono';
import { isMockMode } from '../env.js';
import { getStoreStatus } from '../store/db.js';

export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
  return c.json({
    status: 'ok',
    mode: isMockMode() ? 'mock' : 'real',
    store: getStoreStatus(),
  });
});
