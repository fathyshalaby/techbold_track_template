"use client";

import { Button } from "@/components/ui/button";
import { createRun } from "@/lib/api";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TicketDetailActions({ ticketId }: { ticketId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startRun() {
    setBusy(true);
    setError(null);
    try {
      const created = await createRun(ticketId);
      router.push(`/dashboard/runs/${created.runId}`);
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
        Start run
      </Button>
    </div>
  );
}
