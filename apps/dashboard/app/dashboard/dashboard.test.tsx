import { existsSync } from "node:fs";
import { join } from "node:path";
import { AppSidebar, SIDEBAR_ITEMS } from "@/components/app-sidebar";
import { RunConversation } from "@/components/run-conversation";
import { TicketsDataTable } from "@/components/tickets-data-table";
import { SidebarProvider } from "@/components/ui/sidebar";
import * as api from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import type { DashboardResponse, RunDetail } from "@techbold/contracts";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  usePathname: () => "/dashboard",
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

    expect(screen.getByText("Technician Dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("Tickets").length).toBeGreaterThan(0);
    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
    expect(screen.getByText("Runs in progress")).toBeInTheDocument();
    expect(screen.getAllByText("Email service degraded").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Runs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Live").length).toBeGreaterThan(0);
    assertNoSampleContent();
  });

  it("renders empty dashboard states and the backend error message", async () => {
    mockedApi.getDashboard.mockResolvedValue(dashboardFixture({ empty: true }));
    render(await DashboardPage());
    expect(screen.getAllByText("Nothing here yet").length).toBeGreaterThan(0);
    expect(screen.getByText(/No tickets match this view/)).toBeInTheDocument();
    expect(screen.getByText(/No pending approvals/)).toBeInTheDocument();
    expect(screen.getByText(/No active runs/)).toBeInTheDocument();

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

  it("renders all source label variants without the word mock", () => {
    expect(sourceLabel("live-backend")).toBe("Live");
    expect(sourceLabel("mock-backend")).toBe("Live");
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
      React.createElement(TicketsDataTable, {
        tickets: dashboardFixture().tickets.items,
        source: "mock-backend",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /start run/i }));

    await waitFor(() => {
      expect(mockedApi.createRun).toHaveBeenCalledWith(101);
      expect(push).toHaveBeenCalledWith("/dashboard/runs/run-created");
    });
  });

  it("routes every sidebar item to a real page file", () => {
    render(React.createElement(SidebarProvider, null, React.createElement(AppSidebar)));
    for (const item of SIDEBAR_ITEMS) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toHaveAttribute("href", item.href);
      expect(existsSync(routeFileFor(item.href))).toBe(true);
    }
  });

  it("renders ticket source from dashboard data on list and detail routes", async () => {
    const fixture = dashboardFixture();
    fixture.tickets.items[0].source = "seed-data";
    fixture.source = { type: "mock-backend", label: "Live backend" };
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
  });

  it("does not render approve on terminal runs with a lingering pending approval", () => {
    mockedApi.getRun.mockResolvedValue(
      runFixture({
        pendingApproval: approvalFixture(),
        status: "ABORTED",
        phase: "ABORTED",
      }),
    );

    render(
      React.createElement(RunConversation, {
        initialRun: runFixture({
          pendingApproval: approvalFixture(),
          status: "ABORTED",
          phase: "ABORTED",
        }),
      }),
    );

    expect(screen.queryByRole("button", { name: /^approve$/i })).not.toBeInTheDocument();
  });

  it("renders resolution artifact fields when resolution panel is open", async () => {
    const draft = {
      summary: "Restored mail queue",
      root_cause: "Postfix stalled",
      actions_taken: "Restarted postfix",
      commands_summary: "systemctl restart postfix",
      validation_result: "Queue draining",
    };

    render(
      React.createElement(RunConversation, {
        initialRun: runFixture({
          pendingApproval: null,
          status: "RUNNING",
          phase: "WAITING_FOR_ACTIVITY_REVIEW",
          activityDraft: draft,
        }),
      }),
    );

    expect(await screen.findByLabelText("Summary")).toHaveValue("Restored mail queue");
    expect(screen.getByLabelText("Root cause")).toHaveValue("Postfix stalled");
    expect(screen.getByRole("button", { name: /submit resolution/i })).toBeInTheDocument();
  });

  it("approves without editing and does not call a local command execution function", async () => {
    const localExecute = vi.fn();
    Reflect.set(globalThis, "executeCommand", localExecute);
    mockedApi.advanceRun.mockResolvedValue({
      status: "RUNNING",
      phase: "WAITING_FOR_APPROVAL",
      pendingApproval: approvalFixture(),
    });
    mockedApi.getRun.mockResolvedValue(runFixture({ pendingApproval: null }));
    mockedApi.approveCommand.mockResolvedValue({});

    render(React.createElement(RunConversation, { initialRun: runFixture() }));
    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }));

    await waitFor(() => {
      expect(mockedApi.approveCommand).toHaveBeenCalledWith("run-1", "approval-1", {});
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
    "mock backend",
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
    source: { type: "mock-backend", label: "Live backend" },
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
      status: "available",
      label: "Live backend",
      message: "1 resolved incident in recall.",
      source: "mock-backend",
      incidents: empty
        ? []
        : [
            {
              runId: "run-completed",
              ticketId: 101,
              ticketTitle: "Email service degraded",
              customerName: "Vienna Manufacturing",
              status: "COMPLETED",
              rootCause: "Postfix stalled",
              durableFix: "Restarted postfix",
              validationResult: "Queue draining",
              resolvedAt: "2026-06-07T08:02:00.000Z",
              state: "submitted",
              source: "mock-backend",
            },
          ],
    },
    observability: {
      status: "available",
      label: "Live backend",
      message: "1 run tracked.",
      source: "mock-backend",
      metrics: empty
        ? {
            runs: {
              total: 0,
              active: 0,
              completed: 0,
              failed: 0,
              aborted: 0,
              successRate: null,
            },
            approvals: {
              total: 0,
              pending: 0,
              approved: 0,
              rejected: 0,
              byRisk: {
                SAFE_READ_ONLY: 0,
                LOW_RISK_CHANGE: 0,
                MEDIUM_RISK_CHANGE: 0,
                HIGH_RISK_BLOCKED: 0,
              },
            },
            commands: { executed: 0, failed: 0, timedOut: 0, avgDurationMs: null },
            auditByActor: {},
          }
        : {
            runs: {
              total: 1,
              active: 1,
              completed: 0,
              failed: 0,
              aborted: 0,
              successRate: null,
            },
            approvals: {
              total: 1,
              pending: 1,
              approved: 0,
              rejected: 0,
              byRisk: {
                SAFE_READ_ONLY: 1,
                LOW_RISK_CHANGE: 0,
                MEDIUM_RISK_CHANGE: 0,
                HIGH_RISK_BLOCKED: 0,
              },
            },
            commands: { executed: 0, failed: 0, timedOut: 0, avgDurationMs: null },
            auditByActor: { agent: 1 },
          },
    },
  };
}

function runFixture({
  pendingApproval = approvalFixture(),
  status = "RUNNING",
  phase = "WAITING_FOR_APPROVAL",
  activityDraft = null,
}: {
  pendingApproval?: RunDetail["pendingApproval"];
  status?: string;
  phase?: string;
  activityDraft?: RunDetail["activityDraft"];
} = {}): RunDetail {
  return {
    runId: "run-1",
    status,
    phase,
    timeline: [
      {
        id: "audit-1",
        run_id: "run-1",
        type: "approval.required",
        actor: "agent",
        ts: "2026-06-07T08:01:00.000Z",
        payload_json:
          '{"approvalId":"approval-1","proposed_command":"systemctl status postfix","purpose":"Check the service","expected_signal":"postfix state"}',
      },
    ],
    pendingApproval,
    activityDraft,
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
