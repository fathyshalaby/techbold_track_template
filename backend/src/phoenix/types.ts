import { z } from 'zod';

// Core entities

export const TicketStatusSchema = z.enum(['OPEN', 'PENDING', 'DONE']);

export const SystemInfoSchema = z.object({
  ip: z.string(),
  port: z.number(),
  username: z.string(),
  os: z.string(),
  notes: z.string().optional(),
});

// .strict() rejects unknown keys at the Phoenix → backend trust boundary (T-02-01)
export const TicketSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  priority: z.string(),
  status: TicketStatusSchema,
  customer_id: z.number(),
  customer_name: z.string(),
  tags: z.array(z.string()).optional(),
  sla_due_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
}).strict();

// .strict() rejects unknown keys at the Phoenix → backend trust boundary (T-02-01)
export const CustomerSystemSchema = z.object({
  ticket_id: z.number(),
  customer_id: z.number(),
  system: SystemInfoSchema,
}).strict();

export const EmployeeSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  username: z.string(),
  teamname: z.string(),
});

export const CustomerSchema = z.object({
  id: z.number(),
  company_name: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  system: SystemInfoSchema,
});

// Request / response shapes

export const ActivityCreateSchema = z.object({
  ticket_id: z.number(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  description: z.string().optional(),
  summary: z.string().optional(),
  root_cause: z.string().optional(),
  actions_taken: z.string().optional(),
  commands_summary: z.string().optional(),
  validation_result: z.string().optional(),
});

export const ActivitySchema = z.object({
  id: z.number(),
  team_id: z.number(),
  team_name: z.string(),
  employee_id: z.number(),
  ticket_id: z.number(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  description: z.string(),
  summary: z.string().optional(),
  root_cause: z.string().optional(),
  actions_taken: z.string().optional(),
  commands_summary: z.string().optional(),
  validation_result: z.string().optional(),
  created_at: z.string().nullable().optional(),
});

// Error shapes

export const PhoenixErrorSchema = z.object({
  detail: z.string(),
});

export const PhoenixValidationErrorSchema = z.object({
  detail: z.array(
    z.object({
      loc: z.array(z.union([z.string(), z.number()])),
      msg: z.string(),
      type: z.string(),
    }),
  ),
});

// Inferred TypeScript types

export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type SystemInfo = z.infer<typeof SystemInfoSchema>;
export type CustomerSystem = z.infer<typeof CustomerSystemSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type ActivityCreate = z.infer<typeof ActivityCreateSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type PhoenixError = z.infer<typeof PhoenixErrorSchema>;
export type PhoenixValidationError = z.infer<typeof PhoenixValidationErrorSchema>;
