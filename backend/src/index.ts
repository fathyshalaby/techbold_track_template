import { serve } from '@hono/node-server';
import { app } from './app.js';
import { getEnv } from './env.js';

// Fail fast on startup if any required env vars are missing.
getEnv();

const port = Number(process.env.PORT ?? 8000);

serve({ fetch: app.fetch, port });

console.log(`Backend listening on :${port}`);
