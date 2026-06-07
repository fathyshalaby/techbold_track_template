"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createRun } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import type { SourceLabel, TicketSummary } from "@techbold/contracts";
import { ExternalLink, Play, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function TicketTable({
  tickets,
  dashboardSource,
}: {
  tickets: TicketSummary[];
  dashboardSource: SourceLabel;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busyTicket, setBusyTicket] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleTickets = useMemo(
    () => tickets.filter((ticket) => !status || ticket.status === status),
    [tickets, status],
  );

  async function onStart(ticketId: number) {
    setBusyTicket(ticketId);
    setError(null);
    try {
      const created = await createRun(ticketId);
      router.push(`/dashboard/runs/${created.runId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyTicket(null);
    }
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <div>
          <h2 className="text-lg font-semibold">Ticket queue</h2>
          <p className="text-sm text-muted-foreground">{sourceLabel(dashboardSource)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground"
            htmlFor="ticket-status"
          >
            Status
          </label>
          <select
            id="ticket-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-11 rounded-md border bg-white px-3"
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="DONE">Done</option>
          </select>
          <Button type="button" variant="secondary" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh data
          </Button>
        </div>
      </div>
      {error && (
        <div role="alert" className="border-b border-destructive bg-red-50 p-3 text-destructive">
          {error}
        </div>
      )}
      {visibleTickets.length === 0 ? (
        <div className="p-6">
          <h3 className="text-lg font-semibold">No tickets available</h3>
          <p className="text-sm text-muted-foreground">
            Refresh when the backend has assigned work.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <Link
                    className="font-semibold text-primary"
                    href={`/dashboard/tickets/${ticket.id}`}
                  >
                    #{ticket.id} {ticket.title}
                  </Link>
                </TableCell>
                <TableCell>{ticket.customer_name}</TableCell>
                <TableCell>{ticket.priority}</TableCell>
                <TableCell>
                  <Badge
                    tone={
                      ticket.status === "DONE"
                        ? "success"
                        : ticket.status === "PENDING"
                          ? "warning"
                          : "live"
                    }
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge tone={ticket.source === "deferred" ? "warning" : "live"}>
                    {sourceLabel(ticket.source)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Open
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void onStart(ticket.id)}
                      disabled={busyTicket === ticket.id || ticket.status === "DONE"}
                    >
                      <Play className="h-4 w-4" aria-hidden="true" />
                      Start run
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
