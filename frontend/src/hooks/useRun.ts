import { useState, useEffect } from "react";
import type { Run } from "../types.js";
import { getRun } from "../api.js";

export function useRun(runId: string | null): {
  run: Run | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(runId !== null);
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState(0);

  const refresh = () => setCounter((c) => c + 1);

  useEffect(() => {
    if (runId === null) return;

    let cancelled = false;
    setLoading(true);

    getRun(runId)
      .then((data) => {
        if (cancelled) return;
        setRun(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load run";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [runId, counter]);

  return { run, loading, error, refresh };
}
