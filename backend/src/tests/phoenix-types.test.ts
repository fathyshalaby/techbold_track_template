import { describe, it, expect } from 'vitest';
import {
  TicketStatusSchema,
  TicketSchema,
  SystemInfoSchema,
  CustomerSystemSchema,
  EmployeeSchema,
  CustomerSchema,
  ActivityCreateSchema,
  ActivitySchema,
  PhoenixErrorSchema,
  PhoenixValidationErrorSchema,
} from '../phoenix/types.js';

describe('TicketStatusSchema', () => {
  it('parses OPEN, PENDING, DONE', () => {
    expect(TicketStatusSchema.parse('OPEN')).toBe('OPEN');
    expect(TicketStatusSchema.parse('PENDING')).toBe('PENDING');
    expect(TicketStatusSchema.parse('DONE')).toBe('DONE');
  });

  it('rejects unknown strings', () => {
    expect(TicketStatusSchema.safeParse('INVALID').success).toBe(false);
    expect(TicketStatusSchema.safeParse('open').success).toBe(false);
    expect(TicketStatusSchema.safeParse('').success).toBe(false);
  });
});

describe('TicketSchema', () => {
  const minimal = {
    id: 1,
    title: 't',
    description: 'd',
    priority: 'high',
    status: 'OPEN',
    customer_id: 1,
    customer_name: 'Acme',
  };

  it('parses a complete minimal ticket', () => {
    expect(() => TicketSchema.parse(minimal)).not.toThrow();
  });

  it('rejects ticket missing customer_name', () => {
    const { customer_name: _, ...withoutName } = minimal;
    expect(TicketSchema.safeParse(withoutName).success).toBe(false);
  });

  it('accepts sla_due_at as null', () => {
    expect(() => TicketSchema.parse({ ...minimal, sla_due_at: null })).not.toThrow();
  });

  it('accepts sla_due_at as a datetime string', () => {
    expect(() =>
      TicketSchema.parse({ ...minimal, sla_due_at: '2026-01-01T00:00:00Z' }),
    ).not.toThrow();
  });

  it('accepts created_at as null', () => {
    expect(() => TicketSchema.parse({ ...minimal, created_at: null })).not.toThrow();
  });

  it('accepts optional tags array', () => {
    expect(() => TicketSchema.parse({ ...minimal, tags: ['linux', 'ssh'] })).not.toThrow();
  });

  it('rejects missing required fields', () => {
    expect(TicketSchema.safeParse({ id: 1 }).success).toBe(false);
  });
});

describe('SystemInfoSchema', () => {
  const sysInfo = { ip: '10.0.0.1', port: 22, username: 'azureuser', os: 'Ubuntu 22.04' };

  it('parses a valid system info object', () => {
    expect(() => SystemInfoSchema.parse(sysInfo)).not.toThrow();
  });

  it('accepts optional notes', () => {
    expect(() => SystemInfoSchema.parse({ ...sysInfo, notes: 'passwordless sudo' })).not.toThrow();
  });

  it('rejects missing ip', () => {
    const { ip: _, ...withoutIp } = sysInfo;
    expect(SystemInfoSchema.safeParse(withoutIp).success).toBe(false);
  });
});

describe('CustomerSystemSchema', () => {
  it('parses a valid customer system', () => {
    expect(() =>
      CustomerSystemSchema.parse({
        ticket_id: 1,
        customer_id: 1,
        system: { ip: '10.0.0.1', port: 22, username: 'azureuser', os: 'Ubuntu 22.04' },
      }),
    ).not.toThrow();
  });

  it('rejects missing system', () => {
    expect(CustomerSystemSchema.safeParse({ ticket_id: 1, customer_id: 1 }).success).toBe(false);
  });
});

describe('EmployeeSchema', () => {
  it('parses a valid employee', () => {
    expect(() =>
      EmployeeSchema.parse({
        id: 1001,
        firstname: 'Max',
        lastname: 'Mustermann',
        username: 'm.mustermann',
        teamname: 'Remote Support',
      }),
    ).not.toThrow();
  });

  it('rejects missing teamname', () => {
    expect(
      EmployeeSchema.safeParse({ id: 1001, firstname: 'Max', lastname: 'Mustermann', username: 'mm' }).success,
    ).toBe(false);
  });
});

describe('CustomerSchema', () => {
  const sysInfo = { ip: '10.0.0.1', port: 22, username: 'azureuser', os: 'Ubuntu 22.04' };

  it('parses a valid customer', () => {
    expect(() =>
      CustomerSchema.parse({
        id: 5001,
        company_name: 'Nordlicht Logistik GmbH',
        firstname: 'Anna',
        lastname: 'Schmidt',
        system: sysInfo,
      }),
    ).not.toThrow();
  });

  it('rejects missing system', () => {
    expect(
      CustomerSchema.safeParse({ id: 5001, company_name: 'X', firstname: 'A', lastname: 'B' }).success,
    ).toBe(false);
  });
});

describe('ActivityCreateSchema', () => {
  it('parses with only required fields', () => {
    expect(() =>
      ActivityCreateSchema.parse({
        ticket_id: 1,
        start_datetime: '2026-01-01T00:00:00Z',
        end_datetime: '2026-01-01T01:00:00Z',
      }),
    ).not.toThrow();
  });

  it('accepts all optional documentation fields', () => {
    expect(() =>
      ActivityCreateSchema.parse({
        ticket_id: 1,
        start_datetime: '2026-01-01T00:00:00Z',
        end_datetime: '2026-01-01T01:00:00Z',
        description: 'Fixed nginx',
        summary: 'Restored service',
        root_cause: 'Misconfigured port',
        actions_taken: 'Updated config',
        commands_summary: 'nginx -t && systemctl restart nginx',
        validation_result: 'HTTP 200',
      }),
    ).not.toThrow();
  });

  it('rejects missing end_datetime', () => {
    expect(
      ActivityCreateSchema.safeParse({ ticket_id: 1, start_datetime: '2026-01-01T00:00:00Z' }).success,
    ).toBe(false);
  });
});

describe('ActivitySchema', () => {
  const minimal = {
    id: 1,
    team_id: 10,
    team_name: 'Remote Support',
    employee_id: 1001,
    ticket_id: 7001,
    start_datetime: '2026-01-01T00:00:00Z',
    end_datetime: '2026-01-01T01:00:00Z',
    description: 'Diagnosed and fixed nginx',
  };

  it('parses a minimal activity', () => {
    expect(() => ActivitySchema.parse(minimal)).not.toThrow();
  });

  it('accepts created_at as null', () => {
    expect(() => ActivitySchema.parse({ ...minimal, created_at: null })).not.toThrow();
  });

  it('rejects missing description', () => {
    const { description: _, ...withoutDesc } = minimal;
    expect(ActivitySchema.safeParse(withoutDesc).success).toBe(false);
  });
});

describe('PhoenixErrorSchema', () => {
  it('parses { detail: string }', () => {
    expect(() => PhoenixErrorSchema.parse({ detail: 'Not found' })).not.toThrow();
  });

  it('rejects missing detail', () => {
    expect(PhoenixErrorSchema.safeParse({}).success).toBe(false);
  });
});

describe('PhoenixValidationErrorSchema', () => {
  it('parses a validation error array', () => {
    expect(() =>
      PhoenixValidationErrorSchema.parse({
        detail: [{ loc: ['body', 'ticket_id'], msg: 'field required', type: 'missing' }],
      }),
    ).not.toThrow();
  });

  it('parses a validation error with integer loc index', () => {
    expect(() =>
      PhoenixValidationErrorSchema.parse({
        detail: [{ loc: ['body', 0, 'ticket_id'], msg: 'field required', type: 'missing' }],
      }),
    ).not.toThrow();
  });

  it('rejects detail as a plain string', () => {
    expect(PhoenixValidationErrorSchema.safeParse({ detail: 'bad' }).success).toBe(false);
  });
});

// Tolerance boundary: consuming an external API we don't control, we accept
// (and strip) unknown fields rather than reject — a benign extra field from the
// live ERP must NOT break ticket/customer-system loading. We still reject
// MISSING required fields and wrong types (covered above).
describe('TicketSchema tolerates unknown fields (strips, does not reject)', () => {
  it('accepts an extra field and strips it from the parsed result', () => {
    const base = {
      id: 1, title: 't', description: 'd', priority: 'high',
      status: 'OPEN', customer_id: 1, customer_name: 'Acme',
    };
    const parsed = TicketSchema.parse({ ...base, injected: 'x' });
    expect(parsed).not.toHaveProperty('injected');
    expect(parsed.id).toBe(1);
  });
});

describe('CustomerSystemSchema tolerates unknown fields (strips, does not reject)', () => {
  it('accepts an extra field and strips it from the parsed result', () => {
    const base = {
      ticket_id: 1, customer_id: 1,
      system: { ip: '10.0.0.1', port: 22, username: 'azureuser', os: 'Ubuntu 22.04' },
    };
    const parsed = CustomerSystemSchema.parse({ ...base, injected: 'x' });
    expect(parsed).not.toHaveProperty('injected');
    expect(parsed.ticket_id).toBe(1);
  });
});
