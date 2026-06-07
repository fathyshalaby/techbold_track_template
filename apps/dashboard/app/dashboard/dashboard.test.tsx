import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppSidebar, SIDEBAR_ITEMS } from "@/components/app-sidebar";
import { RunWorkflow } from "@/components/run-workflow";
import { TicketTable } from "@/components/ticket-table";
import * as api from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import type { DashboardResponse, RunDetail } from "@techbold/contracts";
import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BackendStatusPage from "./backend-status/page";
import DashboardPage from "./page";
import RunsPage from "./runs/page";
import TicketDetailPage from "./tickets/[ticketId]/page";
import TicketsPage from "./tickets/page";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push, refresh }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/lib/events", () => ({
  subscribeToRunEvents: vi.fn(() => () => undefined),
  getRunEventsUrl: (runId: string) => `http://test-api.local/api/runs/${runId}/events`,
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getDashboard: vi.fn(),
    getTicket: vi.fn(),
    getCustomerSystem: vi.fn(),
    createRun: vi.fn(),
    getRun: vi.fn(),
    advanceRun: vi.fn(),
    abortRun: vi.fn(),
    approveCommand: vi.fn(),
    rejectCommand: vi.fn(),
    draftActivity: vi.fn(),
    submitActivity: vi.fn(),
  };
});

const mockedApi = vi.mocked(api);

describe("dashboard shell and data mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getDashboard.mockResolvedValue(dashboardFixture());
  });

  it("renders the operational overview from backend-shaped dashboard data", async () => {
    render(await DashboardPage());

    expect(screen.getByText("Operational overview")).toBeInTheDocument();
    expect(screen.getAllByText("Tickets").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Runs").length).toBeGreaterThan(0);
    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
    expect(screen.getByText("Audit evidence")).toBeInTheDocument();
    expect(screen.getByText("Activity state")).toBeInTheDocument();
    expect(
      screen.getAllByText("Memory evidence is deferred to Phase 3 and Phase 4.").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Operational signals are deferred to Phase 5.").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Backend status")).toBeInTheDocument();
    expect(screen.getAllByText("Mock backend").length).toBeGreaterThan(0);
    assertNoSampleContent();
  });

  it("renders empty dashboard states and the backend error message", async () => {
    mockedApi.getDashboard.mockResolvedValue(dashboardFixture({ empty: true }));
    render(await DashboardPage());
    expect(screen.getByText("No tickets available")).toBeInTheDocument();
    expect(screen.getByText("No active runs")).toBeInTheDocument();
    expect(screen.getByText("No pending approvals")).toBeInTheDocument();

    mockedApi.getDashboard.mockRejectedValueOnce(new Error("backend offline"));
    render(await DashboardPage());
    expect(
      screen.getByText("Could not load dashboard data. Check backend status and retry."),
    ).toBeInTheDocument();
  });

  it("renders ticket, run, and backend status routes without sample operational content", async () => {
    const pages = [await TicketsPage(), await RunsPage(), await BackendStatusPage()];
    for (const page of pages) {
      const { unmount } = render(page);
      assertNoSampleContent();
      unmount();
    }
  });

  it("renders all source label variants", () => {
    expect(sourceLabel("live-backend")).toBe("Live backend");
    expect(sourceLabel("mock-backend")).toBe("Mock backend");
    expect(sourceLabel("seed-data")).toBe("Seed data");
    expect(sourceLabel("deferred")).toBe("Deferred");
  });
});

describe("dashboard actions and routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getDashboard.mockResolvedValue(dashboardFixture());
  });

  it("starts a run from a ticket and navigates to run detail", async () => {
    mockedApi.createRun.mockResolvedValue({
      runId: "run-created",
      status: "LOADED_CONTEXT",
      ticket: dashboardFixture().tickets.items[0],
      customerSystem: { ip: "10.0.0.5", port: 22, username: "ops", os: "ubuntu" },
    });

    render(
      React.createElement(TicketTable, {
        tickets: dashboardFixture().tickets.items,
        dashboardSource: "mock-backend",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /start run/i }));

    await screen.findByText("Ticket queue");
    expect(mockedApi.createRun).toHaveBeenCalledWith(101);
    expect(push).toHaveBeenCalledWith("/dashboard/runs/run-created");
  });

  it("routes every sidebar item to a real page file", () => {
    render(React.createElement(AppSidebar));
    for (const item of SIDEBAR_ITEMS) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toHaveAttribute("href", item.href);
      expect(existsSync(routeFileFor(item.href))).toBe(true);
    }
  });

  it("renders ticket source from dashboard data on list and detail routes", async () => {
    const fixture = dashboardFixture();
    fixture.tickets.items[0].source = "seed-data";
    fixture.source = { type: "mock-backend", label: "Mock backend" };
    mockedApi.getDashboard.mockResolvedValue(fixture);
    mockedApi.getTicket.mockResolvedValue({
      id: 101,
      title: "Email service degraded",
      description: "Outbound mail queue is stalled",
      priority: "HIGH",
      status: "OPEN",
      customer_id: 11,
      customer_name: "Vienna Manufacturing",
    });
    mockedApi.getCustomerSystem.mockResolvedValue({
      ticket_id: 101,
      customer_id: 11,
      source: "live-backend",
      system: { ip: "10.0.0.5", port: 22, username: "ops", os: "ubuntu" },
    });

    const list = render(await TicketsPage());
    expect(within(list.container).getByText("Seed data")).toBeInTheDocument();
    list.unmount();

    render(await TicketDetailPage({ params: Promise.resolve({ ticketId: "101" }) }));
    expect(screen.getByText("Seed data")).toBeInTheDocument();
    expect(screen.queryByText("Live backend")).toBeInTheDocument();
  });

  it("approves with editedCommand and does not call a local command execution function", async () => {
    const localExecute = vi.fn();
    Reflect.set(globalThis, "executeCommand", localExecute);
    mockedApi.getRun.mockResolvedValue(runFixture({ pendingApproval: null }));
    mockedApi.approveCommand.mockResolvedValue({});

    render(React.createElement(RunWorkflow, { initialRun: runFixture() }));
    fireEvent.change(screen.getByLabelText("Command"), {
      target: { value: "systemctl restart postfix" },
    });
    fireEvent.click(screen.getByRole("button", { name: /approve and run/i }));

    expect(await screen.findByText("Run")).toBeInTheDocument();
    expect(mockedApi.approveCommand).toHaveBeenCalledWith("run-1", "approval-1", {
      editedCommand: "systemctl restart postfix",
    });
    expect(localExecute).not.toHaveBeenCalled();
    Reflect.deleteProperty(globalThis, "executeCommand");
  });
});

function assertNoSampleContent() {
  const text = document.body.textContent?.toLowerCase() ?? "";
  for (const forbidden of [
    "acme",
    "sample team",
    "fake metric",
    "fake chart",
    "placeholder document",
    "throughput",
    "conversion",
    "revenue",
    "lorem",
  ]) {
    expect(text).not.toContain(forbidden);
  }
}

function routeFileFor(href: string) {
  const base = join(process.cwd(), "app/dashboard");
  const route = href.replace("/dashboard", "") || "";
  return join(base, route, "page.tsx");
}

function dashboardFixture({ empty = false }: { empty?: boolean } = {}): DashboardResponse {
  return {
    generatedAt: "2026-06-07T08:00:00.000Z",
    source: { type: "mock-backend", label: "Mock backend" },
    health: {
      status: "ok",
      mode: "mock",
      store: { mode: "sqlite", durable: true },
      source: "mock-backend",
    },
    tickets: {
      items: empty
        ? []
        : [
            {
              id: 101,
              title: "Email service degraded",
              priority: "HIGH",
              status: "OPEN",
              customer_name: "Vienna Manufacturing",
              source: "mock-backend",
            },
          ],
      counts: empty
        ? { open: 0, pending: 0, done: 0, total: 0 }
        : { open: 1, pending: 0, done: 0, total: 1 },
    },
    runs: {
      active: empty
        ? []
        : [
            {
              runId: "run-1",
              ticketId: 101,
              ticketTitle: "Email service degraded",
              customerName: "Vienna Manufacturing",
              status: "RUNNING",
              phase: "WAITING_FOR_APPROVAL",
              updatedAt: "2026-06-07T08:01:00.000Z",
              latestAuditAt: "2026-06-07T08:01:00.000Z",
              hasPendingApproval: true,
              source: "mock-backend",
            },
          ],
      terminal: [],
    },
    pendingApprovals: empty
      ? []
      : [
          {
            approvalId: "approval-1",
            runId: "run-1",
            ticketId: 101,
            ticketTitle: "Email service degraded",
            proposedCommand: "systemctl status postfix",
            riskLevel: "SAFE_READ_ONLY",
            createdAt: "2026-06-07T08:01:00.000Z",
            source: "mock-backend",
          },
        ],
    auditEvidence: empty
      ? []
      : [
          {
            id: "audit-1",
            runId: "run-1",
            type: "approval.required",
            actor: "agent",
            ts: "2026-06-07T08:01:00.000Z",
            payloadSummary: "command proposed",
            source: "mock-backend",
          },
        ],
    activityStates: empty
      ? []
      : [
          {
            runId: "run-1",
            ticketId: 101,
            state: "drafted",
            summary: "Technician review pending",
            validationResult: null,
            updatedAt: "2026-06-07T08:01:00.000Z",
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

function runFixture({
  pendingApproval = approvalFixture(),
}: { pendingApproval?: RunDetail["pendingApproval"] } = {}): RunDetail {
  return {
    runId: "run-1",
    status: "RUNNING",
    phase: "WAITING_FOR_APPROVAL",
    timeline: [
      {
        id: "audit-1",
        run_id: "run-1",
        type: "approval.required",
        actor: "agent",
        ts: "2026-06-07T08:01:00.000Z",
        payload_json: '{"message":"approval required"}',
      },
    ],
    pendingApproval,
    activityDraft: null,
    ticketId: 101,
    customerSystemId: "10.0.0.5:22",
    ticket: {
      id: 101,
      title: "Email service degraded",
      priority: "HIGH",
      status: "OPEN",
      customer_name: "Vienna Manufacturing",
      source: "mock-backend",
    },
    target: { ip: "10.0.0.5", port: 22, username: "ops", os: "ubuntu" },
    source: "mock-backend",
  };
}

function approvalFixture() {
  return {
    id: "approval-1",
    run_id: "run-1",
    proposed_command: "systemctl status postfix",
    edited_command: null,
    final_command: null,
    purpose: "Check the service",
    expected_signal: "postfix state",
    risk_level: "SAFE_READ_ONLY" as const,
    safety_notes: "",
    status: "PENDING" as const,
    technician_reason: null,
    created_at: "2026-06-07T08:01:00.000Z",
    decided_at: null,
    executed_at: null,
  };
}
