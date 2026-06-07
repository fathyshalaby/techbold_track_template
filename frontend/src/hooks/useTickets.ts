import { useState, useEffect } from "react";
import type { Ticket } from "../types.js";
import { listTickets } from "../api.js";

interface UseTicketsParams {
  status?: string;
  priority?: string;
  sort?: string;
}

export function useTickets(params?: UseTicketsParams): {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
} {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // JSON.stringify as dep avoids object identity churn on each render
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listTickets(params)
      .then((data) => {
        if (cancelled) return;
        setTickets(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setTickets([]);
        const message =
          err instanceof Error ? err.message : "Failed to load tickets";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { tickets, loading, error };
}
