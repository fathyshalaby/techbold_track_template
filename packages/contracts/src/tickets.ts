export const SOURCE_LABELS = ["live-backend", "mock-backend", "seed-data", "deferred"] as const;

export type SourceLabel = (typeof SOURCE_LABELS)[number];

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: "OPEN" | "PENDING" | "DONE";
  customer_id: number;
  customer_name: string;
  tags?: string[];
  sla_due_at?: string | null;
  created_at?: string | null;
}

export interface TicketSummary {
  id: number;
  title: string;
  priority: string;
  status: Ticket["status"] | string;
  customer_name: string;
  source: SourceLabel;
}

export interface SafeTarget {
  ip: string;
  port: number;
  username: string;
  os: string;
  notes?: string;
}

export interface CustomerSystem {
  ticket_id: number;
  customer_id: number;
  system: SafeTarget;
}

export interface CustomerSystemResponse {
  ticket_id: number;
  customer_id: number;
  system: SafeTarget;
  source: SourceLabel;
}
