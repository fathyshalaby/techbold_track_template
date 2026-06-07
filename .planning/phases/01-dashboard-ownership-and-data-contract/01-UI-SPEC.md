---
phase: 1
slug: dashboard-ownership-and-data-contract
status: draft
shadcn_initialized: false
preset: not initialized in repository
created: 2026-06-07
---

# Phase 1 - UI Design Contract

Visual and interaction contract for establishing the primary technician dashboard path and binding its visible surfaces to backend-owned data contracts.

## Scope Boundary

Phase 1 owns the dashboard shell, routing, navigation, typed dashboard data contracts, backend callers, empty/loading/error states, Vite ownership decision, and smoke verification for dashboard ownership.

Phase 1 does not own Postgres implementation, pgvector retrieval, RAG memory implementation, observability instrumentation, autonomous remediation, auth, RBAC, or generic analytics. Memory and observability may appear only as dashboard status surfaces whose source is a real backend status contract or a clearly labeled deferred state.

Hono remains the source of truth for Phoenix, SSH, LLM, approval, safety, audit, activity, memory rules, and SSE events. Next.js may render, adapt, or proxy typed Hono responses, but it must not own those rules.

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn official, to be initialized during Phase 1 before dashboard scaffold work |
| Preset | Not initialized in repository as of this spec; initialize from official shadcn configuration only |
| Component library | shadcn components backed by Radix primitives after initialization |
| Scaffold | shadcn dashboard-01 may be used as source-owned layout scaffolding only |
| Icon library | lucide-react for navigation, status, action, and utility icons |
| Font | system-ui stack or the default Next.js system sans stack; no decorative display font |
| Current UI baseline | Vite React app in `apps/frontend` with direct fetch, EventSource, explicit loading and error state |

Scaffold contract:

- Remove all shadcn dashboard-01 sample teams, Acme content, generic users, fake charts, fake documents, and sample metrics before the dashboard enters the main path.
- Keep only reusable structure: sidebar, top bar, navigation groups, responsive content region, table/list scaffolding, and detail panels.
- Every visible main-path control must call a backend endpoint, navigate to a real route, change local UI state in a meaningful way, or be omitted.

## Product Shape

The dashboard must feel like a quiet operational product for technicians. It should be dense, scannable, restrained, and optimized for repeated troubleshooting work.

First screen contract:

- Left sidebar: primary navigation for Tickets, Runs, Approvals, Audit, Activity, Memory, Observability, and Backend Status.
- Header bar: product name, environment/source badge, backend health summary, and refresh control.
- Main content: work queue summary followed by ticket/run surfaces backed by Hono data.
- No marketing hero, decorative illustration, floating section cards, fake trend charts, or landing page.

Primary information architecture:

| Route | Purpose | Source |
|-------|---------|--------|
| `/dashboard` | Operational overview with real counts and status rollups | Dashboard aggregate endpoint or composed Hono calls |
| `/dashboard/tickets` | Ticket queue with filters and open-run affordance | `GET /api/tickets` |
| `/dashboard/tickets/:ticketId` | Ticket detail and start-run entry | `GET /api/tickets/:id`, `GET /api/tickets/:id/customer-system` |
| `/dashboard/runs/:runId` | Existing run workflow, approval, SSE, audit, activity | Existing run, approval, activity, and SSE endpoints |
| `/dashboard/approvals` | Pending approval queue linked into run detail | Backend run/approval contract, no local-only queue |
| `/dashboard/audit` | Read-focused audit evidence browser or per-run audit entry point | Existing run detail or dashboard aggregate endpoint |
| `/dashboard/activity` | Activity draft/submission visibility and entry points | Existing activity endpoints |
| `/dashboard/memory` | Deferred or advisory memory visibility status only | Real backend status contract or explicit deferred label |
| `/dashboard/observability` | Deferred or backend health/operational status only | `/health` or real status endpoint |

## Dashboard Surfaces

| Surface | Required Content | Interaction Contract |
|---------|------------------|----------------------|
| Ticket queue | ID, title, customer, priority, status, source label, latest run if known | Filter, refresh, open ticket, start run only when backend can create one |
| Run list or summary | Run ID, ticket ID, status, phase, latest audit timestamp, pending approval indicator | Open run detail, refresh; no fake throughput metrics |
| Run detail | Phase, status, target system metadata, pending approval, event stream, audit trail, activity state | Reuse existing `/next`, approve, reject, abort, draft, submit behavior |
| Approval panel | Proposed command, editable command, purpose, expected signal, risk, safety notes | Approve reruns safety recheck through backend; reject requires visible reason input |
| Audit evidence | Timestamp, actor, event type, redacted payload summary, append-only language | Read-only, copy safe redacted values only if implemented |
| Activity state | Draft fields, submitted status, validation result | Draft and submit call existing backend activity endpoints |
| Memory visibility | "Memory unavailable in Phase 1" or real backend status if available | Read-only status, no solved-memory claims |
| Observability status | Backend health, mode, store status, or "observability deferred to Phase 5" | Read-only status, no synthetic incident metrics |

## Data And Source Labels

Every visible dashboard surface must declare its source in code and UI.

| Source Type | UI Label | Allowed In Main Path |
|-------------|----------|----------------------|
| Live backend response | `Live backend` | Yes |
| Mock backend response | `Mock backend` | Yes when mock mode is active |
| Seeded local data from backend | `Seed data` | Yes only when backend marks it as seed/demo |
| Deferred later-phase capability | `Deferred` | Yes as read-only status only |
| Frontend constant or shadcn sample | Not allowed | No |

The dashboard must not show local-only constants, fake operational metrics, decorative charts, sample rows, or static counters as main-path product data.

## Interaction Flow

Primary flow:

1. Technician opens `/dashboard` and sees backend health, source mode, ticket queue, active runs, pending approvals, audit/activity status, and deferred memory/observability status.
2. Technician opens a ticket and starts a run through `POST /api/runs`.
3. Dashboard navigates to `/dashboard/runs/:runId`.
4. Run detail subscribes to the existing SSE event contract from `/api/runs/:runId/events`.
5. Technician advances the run only through `POST /api/runs/:runId/next`.
6. Approval actions call existing approve/reject endpoints and preserve edited-command safety recheck.
7. Activity draft and submit use existing activity endpoints.
8. Closing or returning to overview refreshes ticket/run state from backend APIs.

Navigation constraints:

- Navigating from summaries to run detail must not create a second event model.
- Existing SSE event names from `apps/frontend/src/types.ts` remain canonical for Phase 1.
- A pending approval must remain prominent and cannot be hidden behind a tab after entering run detail.
- Disabled controls must state the backend reason through visible text or accessible description.

## State Contract

| State | Visual Contract | Copy Contract |
|-------|-----------------|---------------|
| Loading | Skeleton rows or compact spinner in the affected region only | `Loading dashboard data...` |
| Empty tickets | Centered compact empty state in ticket region | `No tickets available` and `Refresh when the backend has assigned work.` |
| Empty runs | Compact empty state in run region | `No active runs` and `Start a run from an open ticket.` |
| Empty approvals | Compact empty state in approval region | `No pending approvals` and `Runs that need technician approval appear here.` |
| Backend error | Inline error banner scoped to failed surface | `Could not load dashboard data. Check backend status and retry.` |
| SSE disconnected | Status chip near live events | `Live events disconnected. Run state will refresh on demand.` |
| Deferred memory | Read-only status panel | `Memory evidence is deferred to Phase 3 and Phase 4.` |
| Deferred observability | Read-only status panel | `Operational signals are deferred to Phase 5.` |

Error states must not expose Phoenix tokens, SSH key paths, private host details beyond approved target metadata, raw secret-looking strings, or unredacted command output.

## Spacing Scale

Declared values are multiples of 4:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, status chip interiors, dense metadata gaps |
| sm | 8px | Button icon gaps, table cell vertical rhythm, compact row gaps |
| md | 16px | Default panel padding, toolbar gaps, form field groups |
| lg | 24px | Page content padding, major panel gaps |
| xl | 32px | Main grid gutters and dashboard region breaks |
| 2xl | 48px | Large viewport section breaks only |
| 3xl | 64px | Reserved for top-level shell breathing room, rarely used |

Exceptions: icon-only controls and touch targets must be at least 44px square. Dense desktop table rows may be 36px high if text and controls remain readable.

## Typography

Use exactly these sizes and only these two weights in the dashboard shell and main path.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Label | 12px | 600 | 1.3 |
| Body | 14px | 400 | 1.5 |
| Heading | 18px | 600 | 1.25 |
| Display | 24px | 600 | 1.2 |

Typography constraints:

- Use monospace only for command text, run IDs, event payload summaries, and target system metadata.
- Do not use viewport-scaled font sizes.
- Letter spacing is 0 except uppercase labels may use `0.04em`.
- Long IDs and commands must wrap or truncate inside their container without resizing the layout.

## Color

Restrained neutral palette with semantic accents. The interface must not become a purple-blue gradient theme or single-hue dashboard.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#f8fafc` | App background and page bands |
| Secondary (30%) | `#ffffff` | Panels, tables, sidebar groups, controls |
| Border | `#d9e0e8` | Panel borders, row dividers, input borders |
| Text | `#111827` | Primary text |
| Muted Text | `#667085` | Metadata, helper text, timestamps |
| Accent (10%) | `#2563eb` | Primary navigation selection, focused primary action, live link targets |
| Success | `#15803d` | Completed status, submitted activity, safe approval confirmation |
| Warning | `#b45309` | Pending approvals, medium-risk warnings, deferred status |
| Destructive | `#b91c1c` | Reject, abort, blocked, destructive error states only |

Accent reserved for: active navigation item, primary `Start run`, primary `Advance run`, focused link into run detail, selected table row, and focus ring.

Destructive reserved for: `Reject command`, `Abort run`, blocked-command status, and backend errors that require technician attention.

## Component Contract

| Need | Component Pattern |
|------|-------------------|
| Shell | shadcn dashboard sidebar layout with service-desk navigation labels |
| Lists | Dense data table or list rows with stable 36px or 44px row heights |
| Detail | Split content area with run state and right-side evidence panels on desktop, stacked on mobile |
| Status | Badge/chip with semantic color and text, never color alone |
| Commands | Monospace code block with horizontal scroll and wrapping fallback |
| Forms | Label, input or textarea, inline validation, explicit submit button |
| Dialogs | Only for confirmation when aborting a run or discarding edited activity text |
| Toasts | Optional for completion feedback; errors must also remain visible in the affected surface |

Do not put cards inside cards. Use panels for major dashboard regions and cards only for repeated ticket/run items where a table is not suitable.

## Copywriting Contract

| Element | Copy |
|---------|------|
| Product name | `Service Desk Autopilot` |
| Primary CTA | `Start run` |
| Secondary CTA | `Refresh data` |
| Run CTA | `Advance run` |
| Approval CTA | `Approve and run` |
| Reject CTA | `Reject command` |
| Abort CTA | `Abort run` |
| Activity CTA | `Submit activity` |
| Empty state heading | `No tickets available` |
| Empty state body | `Refresh when the backend has assigned work.` |
| Error state | `Could not load dashboard data. Check backend status and retry.` |
| Destructive confirmation | `Abort run`: `Abort this run? The backend will stop the workflow and preserve the audit trail.` |

Copy constraints:

- Use technician-facing verbs tied to real actions.
- Do not describe features, keyboard shortcuts, or implementation details inside the UI.
- Do not claim live Phoenix, SSH, LLM, memory, or observability validation unless the backend reports it.
- Use `Deferred` labels for later-phase memory and observability surfaces.

## Accessibility Contract

- All icon-only buttons require accessible names and hover/focus tooltips.
- Focus rings must be visible with `#2563eb` or equivalent shadcn ring token.
- Status chips require text labels in addition to color.
- Tables need column headers and row actions with descriptive labels.
- Command textareas must have persistent labels, not placeholder-only labels.
- Error banners must be announced by normal DOM placement near the failed surface and must not rely on toast-only feedback.
- The run approval panel must remain keyboard reachable before nonessential evidence panels.

## Responsive Contract

Desktop:

- Use a fixed-width sidebar and flexible main content.
- Overview may use a two-column grid where the primary work queue gets the wider column.
- Run detail may use a main column for workflow and a secondary column for audit/events/status.

Mobile:

- Sidebar collapses to a sheet or compact navigation trigger.
- Ticket, run, approval, audit, and activity surfaces stack in priority order.
- Approval controls remain together: command, approve, reject reason, reject.
- Minimum touch target is 44px for primary and destructive actions.

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | dashboard-01 scaffold, sidebar, button, badge, table, input, textarea, dialog, sheet, tooltip, skeleton | Official registry only; remove sample content before main path |
| third-party | none | Not allowed in Phase 1 |

Third-party registries are out of scope for Phase 1. If an implementation introduces one, it must be blocked until source is reviewed with `shadcn view` and the phase contract is updated.

## Verification Contract

Phase 1 UI verification must prove:

- No Acme, sample team, fake user, sample document, fake chart, fake metric, or local-only operational constant remains on the main dashboard path.
- Dashboard overview, ticket list, run detail, approval, audit, activity, memory status, observability status, and backend health surfaces either call backend data or display an explicit deferred/source label.
- Navigation from dashboard to run detail preserves existing safety, approval, SSE, audit, and activity behavior.
- Vite ownership decision is documented as replaced, retained temporarily with retirement criteria, or moved out of the main path.
- Contract or component tests cover dashboard data mapping, empty/error states, and at least one navigation path into an existing run workflow.
- A smoke check runs against mock backend data and captures the primary dashboard path.

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

Approval: pending
