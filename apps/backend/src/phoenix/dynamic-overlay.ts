import { isSandboxProvisionerEnabled } from "../env.js";
import {
  dynamicCustomerSystems,
  dynamicTickets,
  getDynamicScenarioByTicketId,
  isDynamicTicketId,
} from "../sandbox/dynamic-store.js";
import type { CustomerSystem, Ticket } from "./types.js";

export function mergeDynamicTickets(tickets: Ticket[]): Ticket[] {
  if (!isSandboxProvisionerEnabled()) return tickets;
  const dynamic = dynamicTickets();
  if (dynamic.length === 0) return tickets;
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  for (const ticket of dynamic) byId.set(ticket.id, ticket as Ticket);
  return [...byId.values()];
}

export function getOverlayTicket(ticketId: number): Ticket | undefined {
  if (!isDynamicTicketId(ticketId)) return undefined;
  const scenario = getDynamicScenarioByTicketId(ticketId);
  return scenario ? ({ ...scenario.ticket } as Ticket) : undefined;
}

export function getOverlayCustomerSystem(ticketId: number): CustomerSystem | undefined {
  if (!isDynamicTicketId(ticketId)) return undefined;
  const systems = dynamicCustomerSystems();
  return systems[ticketId] as CustomerSystem | undefined;
}
