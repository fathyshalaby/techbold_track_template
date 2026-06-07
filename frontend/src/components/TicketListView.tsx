import { useState } from "react";
import type { Ticket } from "../types.js";
import { useTickets } from "../hooks/useTickets.js";

interface TicketListViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  creating: boolean;
}

export default function TicketListView({ onSelectTicket, creating }: TicketListViewProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<"date" | "priority" | "status" | "">("");

  const { tickets, loading, error } = useTickets({
    status: statusFilter || undefined,
    sort: sortField || undefined,
  });

  return (
    <div className="ticket-list-view">
      <div className="filter-toolbar">
        <label>
          Status:{" "}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="PENDING">PENDING</option>
            <option value="DONE">DONE</option>
          </select>
        </label>
        <label>
          Sort:{" "}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as typeof sortField)}
          >
            <option value="">Default</option>
            <option value="date">by Date</option>
            <option value="priority">by Priority</option>
            <option value="status">by Status</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="erp-banner">
          ERP unavailable: {error}
        </div>
      )}

      {loading && <p className="loading-text">Loading tickets…</p>}

      {!loading && tickets.length === 0 && (
        <p className="empty-state">No tickets found.</p>
      )}

      {tickets.length > 0 && (
        <ul className="ticket-list">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button
                className="ticket-row"
                disabled={creating}
                onClick={() => onSelectTicket(ticket)}
              >
                <span className="ticket-title">
                  <strong>{ticket.title}</strong>
                </span>
                <span className="ticket-customer">{ticket.customer_name}</span>
                <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
                  {ticket.priority}
                </span>
                <span className={`badge status-${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
