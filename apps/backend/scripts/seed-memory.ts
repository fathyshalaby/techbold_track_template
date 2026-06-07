import { runMemorySeed } from "../src/memory/seed/index.js";

const force = process.argv.includes("--force");
runMemorySeed(force).catch((err) => {
  console.error("[seed] failed:", (err as Error).message);
  process.exit(1);
});
