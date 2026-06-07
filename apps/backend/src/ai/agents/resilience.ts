const AGENT_TIMEOUT_MS = 30_000;

// Distinct sentinel so the wrapper can tell a model/transport failure (worth one
// retry) from a hard timeout (the full budget was already spent; retrying would
// only double the wait).
class AgentTimeoutError extends Error {
  constructor() {
    super("timeout");
    this.name = "AgentTimeoutError";
  }
}

export class AgentUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AgentUnavailableError";
  }
}

// Wrap a single agent model call with the timeout + single-retry contract from
// docs/ARCHITECTURE.md. Small local models intermittently emit JSON that fails
// schema validation, so one retry recovers many transient failures. On final
// failure the underlying error is preserved as `cause` (and logged) so the 502
// is debuggable instead of an opaque "agent unavailable".
export async function runAgentObject<T>(agentName: string, run: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new AgentTimeoutError()), AGENT_TIMEOUT_MS);
      });
      return await Promise.race([run(), timeout]);
    } catch (err) {
      lastError = err;
      const detail = err instanceof Error ? err.message : String(err);
      console.warn(`[agent] ${agentName} attempt ${attempt} failed: ${detail}`);
      // A timeout already consumed the full budget; retrying only doubles the wait.
      if (err instanceof AgentTimeoutError) break;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw new AgentUnavailableError(`agent unavailable: ${agentName}`, { cause: lastError });
}
