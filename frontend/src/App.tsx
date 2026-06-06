import { useEffect, useMemo, useState } from "react";
import { api, type Health } from "./api";
import type { ActivityDraft, AuditEntry, Employee, Run, Step, SystemInfo, Ticket } from "./types";

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [me, setMe] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [sort, setSort] = useState<string>("date");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [system, setSystem] = useState<SystemInfo | null>(null);

  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // label of in-flight agent action

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
    api.me().then(setMe).catch((e) => setError(String(e.message || e)));
  }, []);

  useEffect(() => {
    setLoadingTickets(true);
    api
      .tickets({ status: statusFilter, priority: priorityFilter, sort })
      .then((t) => { setTickets(t); setError(null); })
      .catch((e) => setError(String(e.message || e)))
      .finally(() => setLoadingTickets(false));
  }, [statusFilter, priorityFilter, sort]);

  async function selectTicket(t: Ticket) {
    setSelected(t);
    setSystem(null);
    setRun(null);
    setError(null);
    try {
      setSystem(await api.system(t.id));
    } catch (e) {
      setError(String((e as Error).message));
    }
  }

  async function guard<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(label);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(String((e as Error).message));
      return undefined;
    } finally {
      setBusy(null);
    }
  }

  async function startRun() {
    if (!selected) return;
    const r = await guard("Starting run & analysing…", () => api.createRun(selected.id));
    if (r) setRun(r);
  }

  async function reset() {
    if (!confirm("Reset all your VMs and clear your activities in the ERP?")) return;
    await guard("Resetting VMs…", () => api.reset());
    setRun(null);
    // refresh tickets
    api.tickets({ status: statusFilter, priority: priorityFilter, sort }).then(setTickets).catch(() => {});
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span className="brand-dot" /> AI Service Desk Autopilot</div>
        <div className="spacer" />
        {health && <span className="pill">backend: {health.backend}{health.llm_provider ? ` · ${health.llm_provider}` : ""}</span>}
        {me && <span className="meta">{me.firstname} {me.lastname} · {me.teamname}</span>}
        <button className="btn ghost small" onClick={reset}>Reset VMs</button>
      </header>

      {error && <div className="banner error" style={{ marginTop: 10 }}>⚠ {error}</div>}

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-head">
            <h2>Tickets</h2>
            <div className="filters">
              <div>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="OPEN">Open</option>
                  <option value="PENDING">Pending</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label>Sort</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="date">Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
          <div className="ticket-list">
            {loadingTickets && <p className="muted" style={{ padding: 8 }}>Loading…</p>}
            {!loadingTickets && tickets.length === 0 && <p className="muted" style={{ padding: 8 }}>No tickets.</p>}
            {tickets.map((t) => (
              <div key={t.id} className={"ticket-card" + (selected?.id === t.id ? " active" : "")} onClick={() => selectTicket(t)}>
                <div className="ticket-title">{t.title}</div>
                <div className="ticket-sub">#{t.id} · {t.customer_name}</div>
                <div className="badges">
                  <span className={"badge prio-" + (t.priority || "low").toLowerCase()}>{t.priority}</span>
                  <span className={"badge status-" + t.status}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="main">
          {!selected && <div className="empty"><div><p>Select a ticket to begin.</p><p className="muted">The AI proposes each step — you approve, edit, or reject every command.</p></div></div>}

          {selected && (
            <>
              <TicketDetail ticket={selected} system={system} />
              {!run && (
                <div className="panel">
                  <button className="btn primary" disabled={!system || !!busy} onClick={startRun}>
                    {busy ? <Thinking label={busy} /> : "Start AI troubleshooting run"}
                  </button>
                  <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                    Connects to {system?.ip} over SSH. Every command needs your approval.
                  </p>
                </div>
              )}
              {run && <RunPanel run={run} busy={busy} setRun={setRun} guard={guard} onSubmitted={() => api.tickets({ status: statusFilter, priority: priorityFilter, sort }).then(setTickets).catch(() => {})} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function TicketDetail({ ticket, system }: { ticket: Ticket; system: SystemInfo | null }) {
  return (
    <div className="panel">
      <div className="row between">
        <h2>{ticket.title}</h2>
        <div className="badges">
          <span className={"badge prio-" + (ticket.priority || "low").toLowerCase()}>{ticket.priority}</span>
          <span className={"badge status-" + ticket.status}>{ticket.status}</span>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 4 }}>#{ticket.id} · {ticket.customer_name}</p>
      <h3 style={{ marginTop: 14 }}>Customer report</h3>
      <p className="report">{ticket.description}</p>
      <h3 style={{ marginTop: 14 }}>Customer system</h3>
      {!system && <p className="muted">Loading system info…</p>}
      {system && (
        <div className="system-grid">
          <div><div className="k">Host</div><div className="v">{system.ip}:{system.port}</div></div>
          <div><div className="k">User</div><div className="v">{system.username}</div></div>
          <div><div className="k">OS</div><div className="v">{system.os}</div></div>
          <div><div className="k">Notes</div><div className="v">{system.notes || "—"}</div></div>
        </div>
      )}
    </div>
  );
}

function RunPanel({
  run, busy, setRun, guard, onSubmitted,
}: {
  run: Run; busy: string | null; setRun: (r: Run) => void;
  guard: <T>(label: string, fn: () => Promise<T>) => Promise<T | undefined>;
  onSubmitted: () => void;
}) {
  const pending: Step | undefined = run.pending_step_id ? run.steps.find((s) => s.id === run.pending_step_id) : undefined;

  async function abort() {
    const r = await guard("Aborting…", () => api.abort(run.id));
    if (r) setRun(r);
  }

  return (
    <>
      <div className="panel">
        <div className="run-status">
          <span className={"dot run-" + run.status} />
          <strong>Run {run.id}</strong>
          <span className="muted">· {run.status.replace("_", " ")}</span>
          <div className="spacer" />
          {busy && <Thinking label={busy} />}
          {run.status !== "done" && run.status !== "aborted" && (
            <button className="btn reject small" disabled={!!busy} onClick={abort}>Abort</button>
          )}
        </div>

        <div className="steps">
          {run.steps.map((s) => (
            <StepCard key={s.id} step={s} isPending={s.id === run.pending_step_id} runId={run.id} busy={busy} setRun={setRun} guard={guard} />
          ))}
          {run.steps.length === 0 && <p className="muted">Agent is analysing the incident…</p>}
        </div>

        {!pending && run.status !== "done" && run.status !== "aborted" && run.status !== "error" && !busy && (
          <p className="muted" style={{ marginTop: 10 }}>Agent is working…</p>
        )}
      </div>

      {run.status === "done" && <ActivityPanel run={run} setRun={setRun} guard={guard} onSubmitted={onSubmitted} />}

      <AuditLog audit={run.audit} />
    </>
  );
}

function StepCard({
  step, isPending, runId, busy, setRun, guard,
}: {
  step: Step; isPending: boolean; runId: string; busy: string | null;
  setRun: (r: Run) => void;
  guard: <T>(label: string, fn: () => Promise<T>) => Promise<T | undefined>;
}) {
  const [edited, setEdited] = useState(step.command);
  const [reason, setReason] = useState("");
  useEffect(() => { setEdited(step.command); }, [step.command, step.id]);

  async function approve() {
    const changed = edited.trim() !== step.command.trim();
    const r = await guard("Approving & running…", () => api.approve(runId, step.id, changed ? edited : undefined));
    if (r) setRun(r);
  }
  async function reject() {
    const r = await guard("Rejecting…", () => api.reject(runId, step.id, reason || undefined));
    if (r) setRun(r);
  }

  const blocked = step.safety?.classification === "blocked";

  return (
    <div className={"step" + (isPending ? " pending" : "")}>
      <div className="step-head">
        <span className="badge kind">{step.kind}</span>
        <span className={"badge risk-" + (step.risk || "needs_review")}>{(step.safety?.classification || step.risk || "needs_review").replace("_", " ")}</span>
        <span className="muted" style={{ fontSize: 12 }}>{step.id}</span>
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 12 }}>{step.status.replace("_", " ")}</span>
      </div>

      {step.rationale && <div className="step-rationale">{step.rationale}</div>}

      {isPending && !blocked ? (
        <textarea className="cmd-edit" value={edited} onChange={(e) => setEdited(e.target.value)} />
      ) : (
        <div className="cmd">{step.edited_command || step.command}</div>
      )}

      {blocked && <p className="banner error" style={{ margin: "8px 0" }}>Blocked by safety: {step.safety?.reason}</p>}

      {step.result && (
        <pre className="output">
          <span className={step.result.exit_code === 0 ? "exit-ok" : "exit-bad"}>exit {step.result.exit_code}</span>
          {step.result.stdout ? "\n" + step.result.stdout : ""}
          {step.result.stderr ? "\n[stderr] " + step.result.stderr : ""}
        </pre>
      )}

      {isPending && !blocked && (
        <>
          <div className="actions">
            <button className="btn approve" disabled={!!busy} onClick={approve}>
              {edited.trim() !== step.command.trim() ? "Approve edited & run" : "Approve & run"}
            </button>
            <button className="btn reject" disabled={!!busy} onClick={reject}>Reject</button>
          </div>
          <div className="reject-row">
            <input placeholder="Optional reason for reject / guidance for the agent…" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </>
      )}
    </div>
  );
}

function ActivityPanel({
  run, setRun, guard, onSubmitted,
}: {
  run: Run; setRun: (r: Run) => void;
  guard: <T>(label: string, fn: () => Promise<T>) => Promise<T | undefined>;
  onSubmitted: () => void;
}) {
  const [draft, setDraft] = useState<ActivityDraft | null>(run.activity_draft ?? null);
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    const d = await guard("Drafting activity…", () => api.draftActivity(run.id));
    if (d) setDraft(d);
  }
  async function submit() {
    if (!draft) return;
    const r = await guard("Submitting to ERP…", () => api.submitActivity(run.id, draft));
    if (r) { setSubmitted(true); onSubmitted(); }
  }
  function field(key: keyof ActivityDraft, label: string, rows = 2) {
    return (
      <div className="field">
        <label>{label}</label>
        <textarea rows={rows} value={(draft?.[key] as string) || ""} onChange={(e) => setDraft({ ...(draft as ActivityDraft), [key]: e.target.value })} />
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>Activity (documentation → ERP)</h3>
      {run.conclusion && (
        <p className="muted" style={{ marginBottom: 10 }}>
          Root cause: {run.conclusion.root_cause} · Fixed: {String(run.conclusion.fixed)}
        </p>
      )}
      {!draft && <button className="btn primary" onClick={generate}>Generate documentation from the run</button>}
      {draft && (
        <>
          {field("summary", "Summary", 2)}
          {field("root_cause", "Root cause (technical)", 2)}
          {field("actions_taken", "Actions taken (in order)", 3)}
          {field("commands_summary", "Commands summary (no secrets)", 2)}
          {field("validation_result", "Validation result (proof)", 2)}
          {field("description", "Description", 2)}
          {submitted ? (
            <div className="banner success">✓ Activity submitted to the ERP and ticket set to DONE.</div>
          ) : (
            <button className="btn primary" onClick={submit}>Submit activity to ERP</button>
          )}
        </>
      )}
    </div>
  );
}

function AuditLog({ audit }: { audit: AuditEntry[] }) {
  if (!audit.length) return null;
  return (
    <div className="panel">
      <h3>Audit trail ({audit.length})</h3>
      <div className="audit">
        {audit.map((a, i) => (
          <div key={i} className="audit-row">
            <span className="audit-ts">{a.ts.slice(11, 19)}</span>
            <span className={"audit-actor actor-" + a.actor}>{a.actor}</span>
            <span>{a.type}</span>
            <span className="muted">{a.command ? `$ ${a.command}` : a.note || ""}{a.exit_code != null ? ` (exit ${a.exit_code})` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Thinking({ label }: { label: string }) {
  return <span className="thinking"><span className="spinner" /> {label}</span>;
}
