import { useEffect, useState } from "react";
import { api, type CaseSourceSelection, type Health } from "./api";
import type { ActivityDraft, AuditEntry, Employee, Run, Step, SystemInfo, Ticket } from "./types";

const PHASES = ["Analyze", "Diagnose", "Fix", "Validate", "Document"];

function reachedPhase(run: Run): number {
  if (run.status === "done") return 4;
  let r = run.steps.length ? 1 : 0;
  if (run.steps.some((s) => s.kind === "fix")) r = Math.max(r, 2);
  if (run.steps.some((s) => s.kind === "validate")) r = Math.max(r, 3);
  return r;
}

type Guard = <T>(label: string, fn: () => Promise<T>) => Promise<T | undefined>;

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [me, setMe] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [statusF, setStatusF] = useState("");
  const [priorityF, setPriorityF] = useState("");
  const [sort, setSort] = useState("date");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const selectedSource: CaseSourceSelection =
    health?.case_source ?? (health?.erp_source === "sandbox_cases" ? "sandbox_cases" : "real_erp");
  const sourceLabel =
    selectedSource === "sandbox_cases"
      ? "Docker sandbox cases"
      : health?.erp_source === "local_or_mock"
        ? "Local/offline ERP cases"
        : "Real Phoenix ERP cases";

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
    api.me().then(setMe).catch((e) => setError(String(e.message || e)));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .tickets({ status: statusF, priority: priorityF, sort })
      .then((t) => { setTickets(t); setError(null); })
      .catch((e) => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [statusF, priorityF, sort, selectedSource]);

  async function selectTicket(t: Ticket) {
    setSelected(t); setSystem(null); setRun(null); setError(null);
    try { setSystem(await api.system(t.id)); } catch (e) { setError(String((e as Error).message)); }
  }

  const guard: Guard = async (label, fn) => {
    setBusy(label); setError(null);
    try { return await fn(); }
    catch (e) { setError(String((e as Error).message)); return undefined; }
    finally { setBusy(null); }
  };

  async function startRun() {
    if (!selected) return;
    const r = await guard("analysing incident", () => api.createRun(selected.id));
    if (r) setRun(r);
  }
  async function reset() {
    if (!confirm("Reset all your VMs and clear your activities in the ERP?")) return;
    await guard("resetting VMs", () => api.reset());
    setRun(null);
    api.tickets({ status: statusF, priority: priorityF, sort }).then(setTickets).catch(() => {});
  }
  async function switchCaseSource(source: CaseSourceSelection) {
    const next = await guard("switching case source", () => api.setCaseSource(source));
    if (!next) return;
    setHealth(next);
    setSelected(null);
    setSystem(null);
    setRun(null);
    api.me().then(setMe).catch(() => {});
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="glyph">S</span>
          <div>
            <b>Sphinx</b> <span className="sub">· AI Service Desk Autopilot</span>
          </div>
        </div>
        <div className="spacer" />
        {health && (
          <span className="pill"><span className="led" /> {health.backend} · {health.llm_provider}</span>
        )}
        {me && <span className="who">{me.firstname} {me.lastname} · {me.teamname}</span>}
        <button className="btn ghost sm" onClick={reset}>Reset VMs</button>
      </header>

      {error && <div className="banner error" style={{ marginTop: 10 }}>⚠ {error}</div>}

      <div className="console">
        {/* ── ticket queue ── */}
        <aside className="queue">
          <div className="queue-head">
            <div className="source-control">
              <div className="micro">Case Source</div>
              <select
                className="source-select"
                value={selectedSource}
                disabled={!!busy}
                onChange={(e) => switchCaseSource(e.target.value as CaseSourceSelection)}
              >
                <option value="real_erp">{sourceLabel === "Local/offline ERP cases" ? "Local/offline ERP" : "Real Phoenix ERP"}</option>
                <option value="sandbox_cases" disabled={!health?.sandbox_available}>
                  Docker sandbox cases{health?.sandbox_case_count ? ` (${health.sandbox_case_count})` : ""}
                </option>
              </select>
            </div>
            <span className="pill mini">{tickets.length} cases</span>
          </div>
          <div className="filters">
            <label><div className="micro">Status</div>
              <select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
                <option value="">All</option><option value="OPEN">Open</option>
                <option value="PENDING">Pending</option><option value="DONE">Done</option>
              </select></label>
            <label><div className="micro">Priority</div>
              <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)}>
                <option value="">All</option><option value="high">High</option>
                <option value="medium">Medium</option><option value="low">Low</option>
              </select></label>
            <label><div className="micro">Sort</div>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="date">Date</option><option value="priority">Priority</option>
                <option value="status">Status</option>
              </select></label>
          </div>
          <div className="tickets">
            {loading && <div className="micro" style={{ padding: 8 }}>loading…</div>}
            {!loading && tickets.length === 0 && <div className="micro" style={{ padding: 8 }}>no tickets</div>}
            {tickets.map((t) => (
              <button key={t.id} className={`tk p-${(t.priority || "low").toLowerCase()}${selected?.id === t.id ? " active" : ""}`} onClick={() => selectTicket(t)}>
                <div className="ttl">{t.title}</div>
                <div className="meta">
                  <span className="id">#{t.id}</span>
                  <span className={`badge b-${(t.priority || "low").toLowerCase()}`}>{t.priority}</span>
                  <span className={`badge b-${t.status}`}>{t.status}</span>
                </div>
                <div className="cust">{t.customer_name}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* ── stage ── */}
        <main className="stage">
          {!selected && (
            <div className="empty"><div>
              <div className="big">Select a ticket to open a session</div>
              <div className="micro">the agent proposes · you approve every write · all actions traced</div>
            </div></div>
          )}
          {selected && (
            <>
              <TicketHead ticket={selected} system={system} />
              {!run ? (
                <div className="card">
                  <button className="btn primary" disabled={!system || !!busy} onClick={startRun}>
                    {busy ? <Thinking label={busy} /> : "▸ Start AI troubleshooting session"}
                  </button>
                  <p className="micro" style={{ marginTop: 10 }}>
                    connects to {system?.ip} over ssh · read-only diagnostics run automatically · writes require your approval
                  </p>
                </div>
              ) : (
                <RunView run={run} busy={busy} setRun={setRun} guard={guard}
                  onSubmitted={() => api.tickets({ status: statusF, priority: priorityF, sort }).then(setTickets).catch(() => {})} />
              )}
            </>
          )}
        </main>

        {/* ── observability rail ── */}
        <aside className="rail">
          <div className="pane-head"><div className="micro">Observability</div>
            {run && <span className="micro">{run.audit.length} events</span>}</div>
          <EventLog audit={run?.audit ?? []} />
        </aside>
      </div>
    </div>
  );
}

function TicketHead({ ticket, system }: { ticket: Ticket; system: SystemInfo | null }) {
  return (
    <div className="card ticket-head">
      <div className="row">
        <div>
          <h2>{ticket.title}</h2>
          <div className="micro" style={{ marginTop: 6 }}>#{ticket.id} · {ticket.customer_name}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className={`badge b-${(ticket.priority || "low").toLowerCase()}`}>{ticket.priority}</span>
          <span className={`badge b-${ticket.status}`}>{ticket.status}</span>
        </div>
      </div>
      <p className="report" style={{ marginTop: 12 }}>{ticket.description}</p>
      {system && (
        <div className="sysgrid">
          <div className="cell"><div className="micro">host</div><div className="v">{system.ip}:{system.port}</div></div>
          <div className="cell"><div className="micro">user</div><div className="v">{system.username}</div></div>
          <div className="cell"><div className="micro">os</div><div className="v">{system.os}</div></div>
          <div className="cell"><div className="micro">notes</div><div className="v">{system.notes || "—"}</div></div>
        </div>
      )}
    </div>
  );
}

function RunView({ run, busy, setRun, guard, onSubmitted }: {
  run: Run; busy: string | null; setRun: (r: Run) => void; guard: Guard; onSubmitted: () => void;
}) {
  const reached = reachedPhase(run);
  const pending = run.pending_step_id ? run.steps.find((s) => s.id === run.pending_step_id) : undefined;
  const working = !!busy || (["running", "analyzing", "validating"].includes(run.status) && !pending);

  async function abort() {
    const r = await guard("aborting", () => api.abort(run.id));
    if (r) setRun(r);
  }

  return (
    <>
      <div className="card">
        <div className="runbar">
          <span className="rid">trace {run.id}</span>
          <span className={`status-chip s-${run.status}`}><span className="led" /> {run.status.replace("_", " ")}</span>
          <div className="spacer" />
          {busy && <Thinking label={busy} />}
          {!["done", "aborted"].includes(run.status) && (
            <button className="btn reject sm" disabled={!!busy} onClick={abort}>■ Abort</button>
          )}
        </div>

        <div className="phases">
          {PHASES.map((p, i) => {
            const cls = i < reached ? "done" : i === reached ? (run.status === "done" ? "done active" : "active") : "";
            return (
              <div key={p} className={`phase ${cls}`}>
                <div className="node">{cls.includes("done") ? "✓" : i + 1}</div>
                <div className="lbl">{p}</div>
                {i < PHASES.length - 1 && <div className="bar" />}
              </div>
            );
          })}
        </div>

        <div className="trace">
          {run.steps.map((s) => (
            <StepNode key={s.id} step={s} pending={s.id === run.pending_step_id} runId={run.id} busy={busy} setRun={setRun} guard={guard} />
          ))}
          {working && (
            <div className="working">
              <span className="dots"><span /><span /><span /></span>
              <span>agent is reasoning over the evidence…</span>
            </div>
          )}
          {run.steps.length === 0 && !working && <div className="micro">no steps yet</div>}
        </div>
      </div>

      {run.status === "done" && <ActivityPanel run={run} guard={guard} onSubmitted={onSubmitted} />}
    </>
  );
}

function StepNode({ step, pending, runId, busy, setRun, guard }: {
  step: Step; pending: boolean; runId: string; busy: string | null; setRun: (r: Run) => void; guard: Guard;
}) {
  const [edited, setEdited] = useState(step.command);
  const [reason, setReason] = useState("");
  useEffect(() => { setEdited(step.command); }, [step.command, step.id]);

  const cls = step.safety?.classification || step.risk;
  const blocked = cls === "blocked";
  const auto = !pending && (cls === "low_risk") && step.status === "succeeded" && !step.edited_command;

  async function approve() {
    const changed = edited.trim() !== step.command.trim();
    const r = await guard("running command", () => api.approve(runId, step.id, changed ? edited : undefined));
    if (r) setRun(r);
  }
  async function reject() {
    const r = await guard("re-planning", () => api.reject(runId, step.id, reason || undefined));
    if (r) setRun(r);
  }

  return (
    <div className={`tnode ${step.status}`}>
      <span className="dot" />
      <div className="tcard">
        <div className="top">
          <span className={`badge b-${step.kind}`}>{step.kind}</span>
          <span className={`badge b-${cls}`}>{(cls || "").replace("_", " ")}</span>
          {auto && <span className="auto-tag">auto-run</span>}
          <div className="spacer" />
          <span className="micro">{step.status.replace("_", " ")}</span>
        </div>
        {step.rationale && <div className="why">{step.rationale}</div>}

        {pending && !blocked
          ? <textarea className="cmd-edit" value={edited} onChange={(e) => setEdited(e.target.value)} spellCheck={false} />
          : <div className="cmd">{step.edited_command || step.command}</div>}

        {blocked && <div className="out" style={{ color: "#ff9b97" }}>⛔ blocked by safety: {step.safety?.reason}</div>}

        {step.result && (
          <div className="out">
            <span className={step.result.exit_code === 0 ? "exit-ok" : "exit-bad"}>exit {step.result.exit_code}</span>
            {step.result.stdout ? "\n" + step.result.stdout : ""}
            {step.result.stderr ? "\n[stderr] " + step.result.stderr : ""}
          </div>
        )}

        {pending && !blocked && (
          <div className="actions">
            <button className="btn approve sm" disabled={!!busy} onClick={approve}>
              ✓ {edited.trim() !== step.command.trim() ? "Approve edited" : "Approve & run"}
            </button>
            <button className="btn reject sm" disabled={!!busy} onClick={reject}>✕ Reject</button>
            <input className="reason" placeholder="reason / guidance for the agent…" value={reason} onChange={(e) => setReason(e.target.value)} />
            <span className="gate-note">human gate · write</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityPanel({ run, guard, onSubmitted }: { run: Run; guard: Guard; onSubmitted: () => void }) {
  const [draft, setDraft] = useState<ActivityDraft | null>(run.activity_draft ?? null);
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    const d = await guard("drafting activity", () => api.draftActivity(run.id));
    if (d) setDraft(d);
  }
  async function submit() {
    if (!draft) return;
    const r = await guard("submitting to ERP", () => api.submitActivity(run.id, draft));
    if (r) { setSubmitted(true); onSubmitted(); }
  }
  const field = (k: keyof ActivityDraft, label: string, rows = 2) => (
    <div className="field">
      <div className="micro">{label}</div>
      <textarea rows={rows} value={(draft?.[k] as string) || ""} onChange={(e) => setDraft({ ...(draft as ActivityDraft), [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="card">
      <div className="micro" style={{ marginBottom: 10 }}>Activity · documentation → ERP</div>
      {run.conclusion && (
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          <b style={{ color: "var(--ink)" }}>Root cause:</b> {run.conclusion.root_cause}
        </p>
      )}
      {!draft && <button className="btn primary" onClick={generate}>✦ Generate documentation from the trace</button>}
      {draft && (
        <>
          {field("summary", "Summary")}
          {field("root_cause", "Root cause (technical)")}
          {field("actions_taken", "Actions taken (in order)", 3)}
          {field("commands_summary", "Commands summary (no secrets)")}
          {field("validation_result", "Validation result (proof)")}
          {field("description", "Description")}
          {submitted
            ? <div className="banner success" style={{ margin: 0 }}>✓ Activity submitted · ticket set to DONE</div>
            : <button className="btn primary" onClick={submit}>↗ Submit activity to ERP</button>}
        </>
      )}
    </div>
  );
}

function EventLog({ audit }: { audit: AuditEntry[] }) {
  if (!audit.length) return <div className="log"><div className="micro" style={{ padding: 8 }}>start a session to stream agent events</div></div>;
  return (
    <div className="log">
      {audit.map((a, i) => (
        <div key={i} className="ev">
          <span className="t">{a.ts.slice(11, 19)}</span>
          <span className={`ac ac-${a.actor}`}>{a.actor}</span>
          <span className="msg">
            <span className="ty">{a.type.replace("_", " ")}</span>
            {a.command ? <> · <span className="mono">{a.command}</span></> : a.note ? ` · ${a.note}` : ""}
            {a.exit_code != null ? ` (exit ${a.exit_code})` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function Thinking({ label }: { label: string }) {
  return <span className="thinking"><span className="spinner" /> {label}…</span>;
}
