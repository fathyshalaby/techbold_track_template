import { Hono } from "hono";
import { z } from "zod";
import { getEnv } from "../env.js";
import { getMemoryStatus, listRecent, listVectorMap, searchSimilar, stats } from "./store.js";

export const memoryRouter = new Hono();

const SearchQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

const VectorQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

memoryRouter.get("/", async (c) => {
  const status = await getMemoryStatus();
  const recent = status.available ? await listRecent(20) : [];
  return c.json(
    {
      available: status.available,
      stats: status.stats,
      recent,
    },
    200,
  );
});

memoryRouter.get("/search", async (c) => {
  const parsed = SearchQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "invalid query parameters" }, 400);
  }

  const status = await getMemoryStatus();
  if (!status.available) {
    return c.json({ available: false, results: [] }, 200);
  }

  const limit = parsed.data.limit ?? getEnv().MEMORY_TOP_K;
  const results = await searchSimilar(parsed.data.q, limit, getEnv().MEMORY_MIN_SCORE);
  return c.json({ available: true, results }, 200);
});

memoryRouter.get("/stats", async (c) => {
  const status = await getMemoryStatus();
  if (!status.available) {
    return c.json({ available: false, stats: null }, 200);
  }
  const memoryStats = await stats();
  return c.json({ available: true, stats: memoryStats }, 200);
});

memoryRouter.get("/vectors", async (c) => {
  const parsed = VectorQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "invalid query parameters" }, 400);
  }

  const status = await getMemoryStatus();
  if (!status.available) {
    return c.json({ available: false, points: [] }, 200);
  }

  const limit = parsed.data.limit ?? 200;
  const points = await listVectorMap(parsed.data.q, limit);
  return c.json({ available: true, points }, 200);
});
