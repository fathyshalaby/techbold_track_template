import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { getEnv } from "./env.js";
import { getStoreStatus } from "./store/db.js";

// Fail fast on startup if any required env vars are missing; PORT is
// validated/coerced by the env schema (no raw NaN). getEnv() throws on a
// misconfig. This is the single place that turns that into a clean exit.
let PORT: number;
let store: ReturnType<typeof getStoreStatus>;
try {
  ({ PORT } = getEnv());
  store = getStoreStatus();
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

const server = serve({ fetch: app.fetch, port: PORT });

console.log(`Backend listening on :${PORT}`);
console.log(`Store mode: ${store.mode} (${store.durable ? "durable" : "non-durable"})`);

// Graceful shutdown: on SIGTERM/SIGINT (e.g. `docker compose down`) stop
// accepting connections and exit cleanly. Important before stateful subsystems
// (SQLite audit log, SSH sessions) land in later phases. An interrupted write
// must not corrupt the audit trail.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    console.log(`Received ${signal}, shutting down...`);
    server.close(() => process.exit(0));
    // Force-exit if connections don't drain promptly.
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
