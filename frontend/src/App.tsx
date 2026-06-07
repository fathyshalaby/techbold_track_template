import { useState } from "react";
import type { CustomerSystem, ActivityDraft, Ticket } from "./types.js";
import { createRun, draftActivity } from "./api.js";
import TicketListView from "./components/TicketListView.js";
import RunView from "./components/RunView.js";
import ActivityView from "./components/ActivityView.js";

type View = "list" | "run" | "activity";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("list");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeTicketTitle, setActiveTicketTitle] = useState("");
  const [customerSystem, setCustomerSystem] = useState<CustomerSystem | null>(null);
  const [activityDraft, setActivityDraft] = useState<ActivityDraft | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftingActivity, setDraftingActivity] = useState(false);

  async function onSelectTicket(ticket: Ticket) {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createRun(ticket.id);
      setActiveRunId(result.runId);
      setActiveTicketTitle(ticket.title);
      setCustomerSystem(result.customerSystem);
      setCurrentView("run");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to start run");
    } finally {
      setCreating(false);
    }
  }

  async function onActivityReady() {
    if (!activeRunId) return;
    setDraftingActivity(true);
    try {
      const draft = await draftActivity(activeRunId);
      setActivityDraft(draft);
      setCurrentView("activity");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to draft activity report");
    } finally {
      setDraftingActivity(false);
    }
  }

  function onBack() {
    setCurrentView("run");
  }

  function backToList() {
    setCurrentView("list");
    setActiveRunId(null);
    setCustomerSystem(null);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AI Service Desk Autopilot</h1>
        {currentView !== "list" && (
          <button className="back-btn" onClick={backToList}>
            ← Back to tickets
          </button>
        )}
      </header>

      <main className="app-main">
        {createError && (
          <div className="error-banner">
            <span>{createError}</span>
            <button onClick={() => setCreateError(null)}>✕</button>
          </div>
        )}

        {draftingActivity && (
          <div className="drafting-overlay">Drafting activity report…</div>
        )}

        {currentView === "list" && (
          <TicketListView onSelectTicket={onSelectTicket} creating={creating} />
        )}

        {currentView === "run" && activeRunId !== null && (
          <RunView
            runId={activeRunId}
            ticketTitle={activeTicketTitle}
            customerSystem={customerSystem}
            onActivityReady={onActivityReady}
          />
        )}

        {currentView === "activity" && activeRunId !== null && (
          <ActivityView
            runId={activeRunId}
            activityDraft={activityDraft}
            onBack={onBack}
          />
        )}
      </main>
    </div>
  );
}
