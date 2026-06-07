import { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type CaseSourceSelection, type Health } from "./api";
import type { ActivityDraft, AuditEntry, ConnectionCheck, Employee, Run, Step, SystemInfo, Ticket } from "./types";

const PHASES = ["Analyze", "Diagnose", "Fix", "Validate", "Document"];
const THEME_STORAGE_KEY = "sphinx-theme";

type ThemeMode = "light" | "dark";

function SphinxMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id={`sphinx-mark-${id}`}>
          <rect width="32" height="32" fill="black" />
          <path
            d="M16 2.5 C10.2 2.5 6.6 6.2 6.4 11.6 L4.7 23.2 C4.4 25.6 5.9 27.4 8.4 27.4 L23.6 27.4 C26.1 27.4 27.6 25.6 27.3 23.2 L25.6 11.6 C25.4 6.2 21.8 2.5 16 2.5 Z"
            fill="white"
          />
          <rect x="5.6" y="10.9" width="20.8" height="1.7" rx="0.85" fill="black" />
          <path d="M11 16.4 q1.7 -1.6 3.4 0 q-1.7 1.5 -3.4 0 Z" fill="black" />
          <path d="M17.6 16.4 q1.7 -1.6 3.4 0 q-1.7 1.5 -3.4 0 Z" fill="black" />
          <path d="M8 19.5 L6.7 26.6" stroke="black" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M10.4 20 L9.7 26.8" stroke="black" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M24 19.5 L25.3 26.6" stroke="black" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M21.6 20 L22.3 26.8" stroke="black" strokeWidth="1.15" strokeLinecap="round" />
        </mask>
      </defs>
      <rect width="32" height="32" fill="currentColor" mask={`url(#sphinx-mark-${id})`} />
      <path
        d="M14.3 27.4 L17.7 27.4 L17.1 30.6 C17.1 31.5 14.9 31.5 14.9 30.6 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function readStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(value) ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function initialTheme(): ThemeMode {
  return readStoredTheme() ?? systemTheme();
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

const START_THEME = initialTheme();
applyTheme(START_THEME);

function reachedPhase(run: Run): number {
  if (run.status === "done") return 4;
  let r = run.steps.length ? 1 : 0;
  if (run.steps.some((s) => s.kind === "fix")) r = Math.max(r, 2);
  if (run.steps.some((s) => s.kind === "validate")) r = Math.max(r, 3);
  return r;
}

type Guard = <T>(label: string, fn: () => Promise<T>) => Promise<T | undefined>;
type ConnectionState = ConnectionCheck | {
  status: "checking";
  reachable: false;
  checked_at?: string;
  latency_ms?: number;
  message?: string;
};
type ActivityPreviewField = {
  key: keyof ActivityDraft;
  title: string;
};

const ACTIVITY_PREVIEW_FIELDS: ActivityPreviewField[] = [
  { key: "summary", title: "Summary" },
  { key: "root_cause", title: "Root cause" },
  { key: "actions_taken", title: "Actions taken" },
  { key: "commands_summary", title: "Commands summary" },
  { key: "validation_result", title: "Validation result" },
  { key: "description", title: "Description" },
];

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(START_THEME);
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
  const [connection, setConnection] = useState<ConnectionState | null>(null);
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
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!readStoredTheme()) setTheme(systemTheme());
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
    api.me().then(setMe).catch((e) => setError(String(e.message || e)));
  }, []);

  // Live trace via Server-Sent Events: stream run snapshots as the agent works.
  const runId = run?.id ?? null;
  useEffect(() => {
    if (!runId) return;
    const es = new EventSource(`${api.base}/api/runs/${runId}/events`);
    es.onmessage = (e) => {
      try {
        const r = JSON.parse(e.data) as Run;
        setRun(r);
        if (["done", "aborted", "error"].includes(r.status)) es.close();
      } catch {
        /* ignore malformed frame */
      }
    };
    return () => es.close();
  }, [runId]);

  useEffect(() => {
    setLoading(true);
    api
      .tickets({ status: statusF, priority: priorityF, sort })
      .then((t) => { setTickets(t); setError(null); })
      .catch((e) => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [statusF, priorityF, sort, selectedSource]);

  useEffect(() => {
    if (!selected || !system) {
      setConnection(null);
      return;
    }
    let cancelled = false;
    setConnection({ status: "checking", reachable: false, message: "Checking SSH reachability" });
    api
      .connection(selected.id)
      .then((check) => {
        if (!cancelled) setConnection(check);
      })
      .catch(() => {
        if (!cancelled) {
          setConnection({
            status: "unreachable",
            reachable: false,
            checked_at: new Date().toISOString(),
            message: "Connection check failed.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.id, system?.ip, system?.port, system?.username]);

  async function selectTicket(t: Ticket) {
    setSelected(t); setSystem(null); setConnection(null); setRun(null); setError(null);
    try { setSystem(await api.system(t.id)); } catch (e) { setError(String((e as Error).message)); }
  }

  const guard: Guard = async (label, fn) => {
    setBusy(label); setError(null);
    try { return await fn(); }
    catch (e) { setError(String((e as Error).message)); return undefined; }
    finally { setBusy(null); }
  };

  async function startRun() {
    if (!selected || !connection?.reachable) return;
    const r = await guard("analysing incident", () => api.createRun(selected.id));
    if (r) setRun(r);
  }
  async function reset() {
    if (!confirm("Reset all your VMs and clear your activities in the ERP?")) return;
    await guard("resetting VMs", () => api.reset());
    setRun(null);
    api.tickets({ status: statusF, priority: priorityF, sort }).then(setTickets).catch(() => {});
  }
  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }
  async function switchCaseSource(source: CaseSourceSelection) {
    const next = await guard("switching case source", () => api.setCaseSource(source));
    if (!next) return;
    setHealth(next);
    setSelected(null);
    setSystem(null);
    setConnection(null);
    setRun(null);
    api.me().then(setMe).catch(() => {});
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <SphinxMark className="brand-logo" size={28} />
          <div className="brand-copy">
            <b>Sphinx</b> <span className="sub">· AI Service Desk Autopilot</span>
          </div>
        </div>
        <div className="spacer" />
        {health && (
          <span className="pill"><span className="led" /> {health.backend} · {health.llm_provider}</span>
        )}
        {me && <span className="who">{me.firstname} {me.lastname} · {me.teamname}</span>}
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-pressed={theme === "dark"}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
        >
          <span className="theme-switch" aria-hidden="true"><span /></span>
          <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
        </button>
        <button className="btn ghost sm" onClick={reset}>Reset VMs</button>
      </header>

      {error && <div className="banner error banner-top">Error: {error}</div>}

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
            {loading && <div className="micro list-state">loading...</div>}
            {!loading && tickets.length === 0 && <div className="micro list-state">no tickets</div>}
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
                <div className="card session-card">
                  <div className="session-actions">
                    <button className="btn primary" disabled={!system || !connection?.reachable || !!busy} onClick={startRun}>
                      {busy ? <Thinking label={busy} /> : "Start AI troubleshooting session"}
                    </button>
                    <ConnectionIndicator connection={connection} system={system} />
                  </div>
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

function ConnectionIndicator({ connection, system }: { connection: ConnectionState | null; system: SystemInfo | null }) {
  const status = !system ? "checking" : connection?.status ?? "checking";
  const isChecking = status === "checking";
  const isConnected = status === "connected";
  const icon = isConnected ? "🟢" : isChecking ? "🟡" : "🔴";
  const label = !system
    ? "Loading target metadata"
    : isChecking
      ? `Checking SSH connection to ${system.ip}:${system.port}`
      : isConnected
        ? `Client connected: ${system.ip}:${system.port}`
        : connection?.message || `Client offline: ${system.ip}:${system.port}`;

  return (
    <span className={`connection-dot c-${status}`} title={label} aria-label={label} aria-live="polite">
      {icon}
    </span>
  );
}

function TicketHead({ ticket, system }: { ticket: Ticket; system: SystemInfo | null }) {
  return (
    <div className="card ticket-head">
      <div className="row">
        <div className="ticket-title">
          <h2>{ticket.title}</h2>
          <div className="micro ticket-meta">#{ticket.id} · {ticket.customer_name}</div>
        </div>
        <div className="badge-row">
          <span className={`badge b-${(ticket.priority || "low").toLowerCase()}`}>{ticket.priority}</span>
          <span className={`badge b-${ticket.status}`}>{ticket.status}</span>
        </div>
      </div>
      <MarkdownBlock content={ticket.description} className="report" />
      {system && (
        <div className="sysgrid">
          <div className="cell"><div className="micro">host</div><div className="v">{system.ip}:{system.port}</div></div>
          <div className="cell"><div className="micro">user</div><div className="v">{system.username}</div></div>
          <div className="cell"><div className="micro">os</div><div className="v">{system.os}</div></div>
          <div className="cell"><div className="micro">notes</div><div className="v">{system.notes || "-"}</div></div>
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
            <button className="btn reject sm" disabled={!!busy} onClick={abort}>Abort</button>
          )}
        </div>

        <div className="phases">
          {PHASES.map((p, i) => {
            const cls = i < reached ? "done" : i === reached ? (run.status === "done" ? "done active" : "active") : "";
            return (
              <div key={p} className={`phase ${cls}`}>
                <div className="node">{i + 1}</div>
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
              <span className="terminal-prompt">agent</span>
              <span className="working-copy">reasoning over evidence</span>
              <span className="dots" aria-hidden="true"><span /><span /><span /></span>
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
        {step.rationale && <MarkdownBlock content={step.rationale} className="why" compact />}

        {pending && !blocked
          ? <textarea className="cmd-edit" value={edited} onChange={(e) => setEdited(e.target.value)} spellCheck={false} />
          : <div className="cmd">{step.edited_command || step.command}</div>}

        {blocked && <div className="out out-danger">blocked by safety: {step.safety?.reason}</div>}

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
              {edited.trim() !== step.command.trim() ? "Approve edited" : "Approve and run"}
            </button>
            <button className="btn reject sm" disabled={!!busy} onClick={reject}>Reject</button>
            <input className="reason" placeholder="reason / guidance for the agent..." value={reason} onChange={(e) => setReason(e.target.value)} />
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
  const preview = draft ? activityPreviewMarkdown(draft) : "";

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
      <div className="micro section-kicker">Activity · documentation to ERP</div>
      {run.conclusion && (
        <div className="conclusion-note">
          <div className="conclusion-label">Root cause</div>
          <MarkdownBlock content={run.conclusion.root_cause} compact />
        </div>
      )}
      {!draft && <button className="btn primary" onClick={generate}>Generate documentation from the trace</button>}
      {draft && (
        <>
          <div className="report-preview">
            <div className="report-preview-head">
              <div>
                <div className="micro">Final report preview</div>
                <h3>Technician-facing documentation</h3>
              </div>
            </div>
            {preview
              ? <MarkdownBlock content={preview} className="report" />
              : <div className="micro list-state">No report fields have content yet.</div>}
          </div>
          <details className="activity-editor">
            <summary>Edit ERP fields</summary>
            <div className="activity-editor-body">
              {field("summary", "Summary")}
              {field("root_cause", "Root cause (technical)")}
              {field("actions_taken", "Actions taken (in order)", 3)}
              {field("commands_summary", "Commands summary (no secrets)")}
              {field("validation_result", "Validation result (proof)")}
              {field("description", "Description")}
            </div>
          </details>
          {submitted
            ? <div className="banner success inline-banner">Activity submitted · ticket set to DONE</div>
            : <button className="btn primary" onClick={submit}>Submit activity to ERP</button>}
        </>
      )}
    </div>
  );
}

function activityPreviewMarkdown(draft: ActivityDraft): string {
  return ACTIVITY_PREVIEW_FIELDS
    .map(({ key, title }) => {
      const body = formatReportField(draft[key]);
      return body ? `## ${title}\n\n${body}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function formatReportField(value: ActivityDraft[keyof ActivityDraft]): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.includes("\n")) return denseNumberedListToMarkdown(trimmed);
  if (hasMarkdownStructure(trimmed)) return trimmed;
  return denseNumberedListToMarkdown(trimmed);
}

function hasMarkdownStructure(value: string): boolean {
  return /(^|\n)\s*(#{1,6}\s|\*{0,2}\d+[.)]\s|[-*+]\s|>\s|```|\|.+\|)/.test(value);
}

function denseNumberedListToMarkdown(value: string): string {
  const matches = Array.from(value.matchAll(/(?:^|\s)(\d+)\)\s+/g));
  if (matches.length < 2 || matches[0].index !== 0) return value;

  return matches
    .map((match, index) => {
      const next = matches[index + 1];
      const start = (match.index ?? 0) + match[0].length;
      const end = next?.index ?? value.length;
      const item = value.slice(start, end).trim();
      return item ? `${match[1]}. ${item}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

function EventLog({ audit }: { audit: AuditEntry[] }) {
  if (!audit.length) return <div className="log"><div className="micro list-state">start a session to stream agent events</div></div>;
  return (
    <div className="log">
      {audit.map((a, i) => (
        <div key={i} className="ev">
          <span className="t">{a.ts.slice(11, 19)}</span>
          <span className={`ac ac-${a.actor}`}>{a.actor}</span>
          <div className="msg">
            <div className="event-title">
              <span className="ty">{a.type.replace("_", " ")}</span>
              {a.command ? <> · <span className="mono">{a.command}</span></> : ""}
              {a.exit_code != null ? ` (exit ${a.exit_code})` : ""}
            </div>
            {a.note && <MarkdownBlock content={a.note} className="event-note" compact />}
          </div>
        </div>
      ))}
    </div>
  );
}

function Thinking({ label }: { label: string }) {
  return (
    <span className="thinking" aria-live="polite">
      <span className="thinking-led" aria-hidden="true" />
      <span className="thinking-label">{label}</span>
      <span className="thinking-dots" aria-hidden="true"><span /><span /><span /></span>
    </span>
  );
}

function MarkdownBlock({ content, className = "", compact = false }: {
  content?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const trimmed = content?.trim();
  if (!trimmed) return null;
  const classes = ["markdown", compact ? "compact" : "", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{trimmed}</ReactMarkdown>
    </div>
  );
}
