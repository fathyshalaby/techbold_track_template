"use client";

import { Button } from "@/components/ui/button";
import { createRun } from "@/lib/api";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TicketDetailActions({
  ticketId,
  hasRun = false,
}: {
  ticketId: number;
  hasRun?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startRun() {
    setBusy(true);
    setError(null);
    try {
      await createRun(ticketId);
      // Re-render the server component so the new run's conversation appears in place.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div role="alert" className="text-sm text-destructive">
          {error}
        </div>
      )}
      <Button type="button" onClick={() => void startRun()} disabled={busy}>
        <Play className="h-4 w-4" aria-hidden="true" />
        {hasRun ? "Start new run" : "Start run"}
      </Button>
    </div>
  );
}
