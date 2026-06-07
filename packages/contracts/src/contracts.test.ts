import { describe, expect, it } from "vitest";
import type { DashboardResponse, RunDetail } from "./index.js";
import { SOURCE_LABELS, SSE_EVENT_TYPES } from "./index.js";

// Must match the backend's actually-emitted audit/event types (see events.ts).
const EXPECTED_SSE_EVENTS = [
  "run.started",
  "preflight.completed",
  "agent.unavailable",
  "approval.required",
  "command.approved",
  "command.rejected",
  "command.blocked",
  "command.completed",
  "diagnosis.root_cause_found",
  "diagnosis.more_needed",
  "fix.failed",
  "fix.rollback_proposed",
  "fix.rollback_blocked",
  "validation.completed",
  "activity.drafted",
  "activity.fields_overridden",
  "activity.submitted",
  "ticket.status_updated",
  "ticket.status_update_failed",
  "ticket.left_open_unvalidated",
  "run.steps_capped",
  "run.aborted",
  "run.failed",
] as const;

describe("shared contracts", () => {
  it("exports the canonical SSE event tuple", () => {
    expect(SSE_EVENT_TYPES).toEqual(EXPECTED_SSE_EVENTS);
    expect(SSE_EVENT_TYPES).toHaveLength(23);
  });

  it("exports typed source labels", () => {
    expect(SOURCE_LABELS).toEqual(["live-backend", "mock-backend", "seed-data", "deferred"]);
  });

  it("models deferred memory and observability status", () => {
    const dashboard = buildDashboardResponse();

    expect(dashboard.memory).toEqual({
      status: "deferred",
      label: "Deferred",
      message: "Memory evidence is deferred to Phase 3 and Phase 4.",
      source: "deferred",
    });
    expect(dashboard.observability).toEqual({
      status: "deferred",
      label: "Deferred",
      message: "Operational signals are deferred to Phase 5.",
      source: "deferred",
    });
  });

  it("serializes dashboard data with typed sources and no unsupported metric fields", () => {
    const serialized = JSON.parse(JSON.stringify(buildDashboardResponse())) as Record<
      string,
      unknown
    >;

    expect(serialized).toHaveProperty("source.type", "mock-backend");
    expect(serialized).toHaveProperty("tickets.items.0.source", "mock-backend");
    expect(serialized).toHaveProperty("memory.source", "deferred");
    expect(serialized).toHaveProperty("observability.source", "deferred");

    const encoded = JSON.stringify(serialized);
    expect(encoded).not.toContain("throughput");
    expect(encoded).not.toContain("conversion");
    expect(encoded).not.toContain("revenue");
  });

  it("serializes run detail with direct-navigation context", () => {
    const serialized = JSON.parse(JSON.stringify(buildRunDetail())) as Record<string, unknown>;

    expect(serialized).toHaveProperty("ticketId", 7102);
    expect(serialized).toHaveProperty("customerSystemId", "10.42.0.24:22");
    expect(serialized).toHaveProperty("ticket.id", 7102);
    expect(serialized).toHaveProperty("target.ip", "10.42.0.24");
    expect(serialized).toHaveProperty("source", "mock-backend");
  });
});

function buildDashboardResponse(): DashboardResponse {
  return {
    generatedAt: "2026-06-07T05:40:00.000Z",
    source: {
      type: "mock-backend",
      label: "Mock backend",
    },
    health: {
      status: "ok",
      mode: "mock",
      store: {
        mode: "sqlite",
        durable: true,
      },
      source: "mock-backend",
    },
    tickets: {
      items: [
        {
          id: 7102,
          title: "Mail queue service is not accepting work",
          priority: "HIGH",
          status: "OPEN",
          customer_name: "Northwind Support",
          source: "mock-backend",
        },
      ],
      counts: {
        open: 1,
        pending: 0,
        done: 0,
        total: 1,
      },
    },
    runs: {
      active: [
        {
          runId: "run_01JZ8N4Y6BGWV1Y8S9KJ5J2K2V",
          ticketId: 7102,
          ticketTitle: "Mail queue service is not accepting work",
          customerName: "Northwind Support",
          status: "RUNNING",
          phase: "WAITING_FOR_APPROVAL",
          updatedAt: "2026-06-07T05:39:00.000Z",
          latestAuditAt: "2026-06-07T05:39:00.000Z",
          hasPendingApproval: true,
          source: "mock-backend",
        },
      ],
      terminal: [],
    },
    pendingApprovals: [
      {
        approvalId: "approval_01JZ8N4Y6BFQEXFRVSMY7CR4H9",
        runId: "run_01JZ8N4Y6BGWV1Y8S9KJ5J2K2V",
        ticketId: 7102,
        ticketTitle: "Mail queue service is not accepting work",
        proposedCommand: "systemctl status postfix --no-pager",
        riskLevel: "SAFE_READ_ONLY",
        createdAt: "2026-06-07T05:39:00.000Z",
        source: "mock-backend",
      },
    ],
    auditEvidence: [
      {
        id: "audit_01JZ8N4Y6BKAHB0E63ZHCAF6VP",
        runId: "run_01JZ8N4Y6BGWV1Y8S9KJ5J2K2V",
        type: "approval.required",
        actor: "agent",
        ts: "2026-06-07T05:39:00.000Z",
        payloadSummary: "Command approval is waiting for technician review.",
        source: "mock-backend",
      },
    ],
    activityStates: [
      {
        runId: "run_01JZ8N4Y6BGWV1Y8S9KJ5J2K2V",
        ticketId: 7102,
        state: "not-drafted",
        summary: null,
        validationResult: null,
        updatedAt: null,
        source: "mock-backend",
      },
    ],
    memory: {
      status: "deferred",
      label: "Deferred",
      message: "Memory evidence is deferred to Phase 3 and Phase 4.",
      source: "deferred",
    },
    observability: {
      status: "deferred",
      label: "Deferred",
      message: "Operational signals are deferred to Phase 5.",
      source: "deferred",
    },
  };
}

function buildRunDetail(): RunDetail {
  return {
    runId: "run_01JZ8N4Y6BGWV1Y8S9KJ5J2K2V",
    status: "RUNNING",
    phase: "WAITING_FOR_APPROVAL",
    timeline: [
      {
        id: "audit_01JZ8N4Y6BKAHB0E63ZHCAF6VP",
        run_id: "run_01JZ8N4Y6BGWV1Y8S9KJ5J2K2V",
        type: "approval.required",
        actor: "agent",
        ts: "2026-06-07T05:39:00.000Z",
        payload_json: '{"riskLevel":"SAFE_READ_ONLY"}',
      },
    ],
    pendingApproval: {
      id: "approval_01JZ8N4Y6BFQEXFRVSMY7CR4H9",
      run_id: "run_01JZ8N4Y6BGWV1Y8S9KJ5J2K2V",
      proposed_command: "systemctl status postfix --no-pager",
      edited_command: null,
      final_command: null,
      purpose: "Check service state before proposing a fix.",
      expected_signal: "Unit state and recent service log lines.",
      risk_level: "SAFE_READ_ONLY",
      safety_notes: "Read-only service inspection.",
      status: "PENDING",
      technician_reason: null,
      created_at: "2026-06-07T05:39:00.000Z",
      decided_at: null,
      executed_at: null,
    },
    activityDraft: null,
    ticketId: 7102,
    customerSystemId: "10.42.0.24:22",
    ticket: {
      id: 7102,
      title: "Mail queue service is not accepting work",
      priority: "HIGH",
      status: "OPEN",
      customer_name: "Northwind Support",
      source: "mock-backend",
    },
    target: {
      ip: "10.42.0.24",
      port: 22,
      username: "ubuntu",
      os: "Ubuntu 22.04 LTS",
    },
    source: "mock-backend",
  };
}
