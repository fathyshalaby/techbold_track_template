import { useEffect, useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type CaseSourceSelection, type Health, type ModelSelection } from "./api";
import type { ActivityDraft, AuditEntry, ConnectionCheck, Employee, Run, Step, SystemInfo, Ticket } from "./types";

const THEME_STORAGE_KEY = "sphinx-theme";
const SORT_OPTIONS = [
  ["date", "Date"],
  ["priority", "Priority"],
  ["status", "Status"],
] as const;

type ThemePreference = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";
type Guard = <T>(label: string, fn: () => Promise<T>) => Promise<T | undefined>;
type ConnectionState =
  | ConnectionCheck
  | {
      status: "checking";
      reachable: false;
      checked_at?: string;
      latency_ms?: number;
      message?: string;
    };

type IconName =
  | "alert"
  | "check"
  | "copy"
  | "doc"
  | "edit"
  | "link"
  | "moon"
  | "play"
  | "refresh"
  | "send"
  | "server"
  | "shield"
  | "spark"
  | "stop"
  | "sun"
  | "terminal"
  | "user"
  | "x";

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

function Icon({ name, size = 16, className = "" }: { name: IconName; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
    focusable: false,
  };
  const filled = { fill: "currentColor", stroke: "none" };

  return (
    <svg {...common}>
      {name === "alert" && (
        <>
          <path d="M12 3 2 20h20Z" />
          <line x1="12" y1="9" x2="12" y2="14" />
          <circle cx="12" cy="17.2" r="0.5" {...filled} />
        </>
      )}
      {name === "check" && <polyline points="20 6 9 17 4 12" />}
      {name === "copy" && (
        <>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </>
      )}
      {name === "doc" && (
        <>
          <path d="M6 3h8l5 5v13H6Z" />
          <path d="M14 3v5h5" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="16.5" x2="15" y2="16.5" />
        </>
      )}
      {name === "edit" && (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </>
      )}
      {name === "link" && (
        <>
          <path d="M10 14a4 4 0 0 0 5.6 0l2.8-2.8a4 4 0 0 0-5.6-5.6L11 7" />
          <path d="M14 10a4 4 0 0 0-5.6 0L5.6 12.8a4 4 0 0 0 5.6 5.6L13 17" />
        </>
      )}
      {name === "moon" && <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />}
      {name === "play" && <polygon points="6 4 20 12 6 20 6 4" {...filled} />}
      {name === "refresh" && (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </>
      )}
      {name === "send" && (
        <>
          <path d="M22 2 11 13" />
          <path d="M22 2l-7 20-4-9-9-4Z" />
        </>
      )}
      {name === "server" && (
        <>
          <rect x="3" y="4" width="18" height="7" rx="1.8" />
          <rect x="3" y="13" width="18" height="7" rx="1.8" />
          <line x1="7" y1="7.5" x2="7.2" y2="7.5" />
          <line x1="7" y1="16.5" x2="7.2" y2="16.5" />
        </>
      )}
      {name === "shield" && (
        <>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6Z" />
          <path d="M9.2 12l2 2 3.6-4" />
        </>
      )}
      {name === "spark" && <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" {...filled} />}
      {name === "stop" && <rect x="6" y="6" width="12" height="12" rx="2" {...filled} />}
      {name === "sun" && (
        <>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </>
      )}
      {name === "terminal" && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2.2" />
          <polyline points="7 9 10 12 7 15" />
          <line x1="13" y1="15" x2="17" y2="15" />
        </>
      )}
      {name === "user" && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" />
        </>
      )}
      {name === "x" && (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      )}
    </svg>
  );
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(value)) return value;
    if (value === null) return "system";
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function systemTheme(): EffectiveTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function effectiveTheme(theme: ThemePreference): EffectiveTheme {
  return theme === "system" ? systemTheme() : theme;
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") return;
  const effective = effectiveTheme(theme);
  document.documentElement.dataset.theme = effective;
  document.documentElement.dataset.themeMode = theme;
  document.documentElement.style.colorScheme = effective;
}

const START_THEME = readStoredTheme();
applyTheme(START_THEME);

export default function App() {
  const [theme, setTheme] = useState<ThemePreference>(START_THEME);
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
  const [modelSelection, setModelSelection] = useState<ModelSelection | null>(null);
  const [modelBusy, setModelBusy] = useState(false);
  const defaultCaseSourceChecked = useRef(false);

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
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") applyTheme("system");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
    api.models().then(setModelSelection).catch(() => {});
    api.me().then(setMe).catch((e) => setError(String(e.message || e)));
  }, []);

  useEffect(() => {
    if (!health || defaultCaseSourceChecked.current) return;
    defaultCaseSourceChecked.current = true;
    if (!health.sandbox_available || health.case_source === "sandbox_cases") return;
    api
      .setCaseSource("sandbox_cases")
      .then((next) => {
        setHealth(next);
        setSelected(null);
        setSystem(null);
        setConnection(null);
        setRun(null);
      })
      .catch((e) => setError(String(e.message || e)));
  }, [health]);

  const runId = run?.id ?? null;
  useEffect(() => {
    if (!runId) return;
    const es = new EventSource(`${api.base}/api/runs/${runId}/events`);
    es.onmessage = (e) => {
      try {
        const next = JSON.parse(e.data) as Run;
        setRun(next);
        if (["done", "aborted", "error"].includes(next.status)) es.close();
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
      .then((next) => {
        setTickets(next);
        setError(null);
      })
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

  async function refreshTickets() {
    return api.tickets({ status: statusF, priority: priorityF, sort }).then(setTickets).catch(() => {});
  }

  async function selectTicket(ticket: Ticket) {
    setSelected(ticket);
    setSystem(null);
    setConnection(null);
    setRun(null);
    setError(null);
    try {
      setSystem(await api.system(ticket.id));
    } catch (e) {
      setError(String((e as Error).message));
    }
  }

  const guard: Guard = async (label, fn) => {
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
  };

  async function startRun() {
    if (!selected || !connection?.reachable) return;
    const next = await guard("analysing incident", () => api.createRun(selected.id));
    if (next) setRun(next);
  }

  async function reset() {
    if (!confirm("Reset all your VMs and clear your activities in the ERP?")) return;
    await guard("resetting VMs", () => api.reset());
    setRun(null);
    await refreshTickets();
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

  async function switchModel(modelId: string) {
    const selectedModel = modelSelection?.models.find((model) => model.id === modelId);
    if (!selectedModel) return;
    setModelBusy(true);
    setError(null);
    try {
      setModelSelection(await api.selectModel(selectedModel.provider, selectedModel.model));
      api.health().then(setHealth).catch(() => {});
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally {
      setModelBusy(false);
    }
  }

  return (
    <div className="app">
      <TopBar
        theme={theme}
        setTheme={setTheme}
        health={health}
        modelSelection={modelSelection}
        modelBusy={modelBusy}
        onModelChange={switchModel}
        me={me}
        system={system}
        connection={connection}
        onReset={reset}
      />

      {error && <div className="banner error banner-top">Error: {error}</div>}

      <div className="workspace">
        <QueueRail
          sourceLabel={sourceLabel}
          selectedSource={selectedSource}
          sandboxAvailable={!!health?.sandbox_available}
          sandboxCount={health?.sandbox_case_count}
          busy={busy}
          tickets={tickets}
          selected={selected}
          loading={loading}
          statusF={statusF}
          priorityF={priorityF}
          sort={sort}
          setStatusF={setStatusF}
          setPriorityF={setPriorityF}
          setSort={setSort}
          onSelect={selectTicket}
          onSwitchSource={switchCaseSource}
        />

        <main className="center">
          {!selected ? (
            <EmptyState />
          ) : (
            <>
              <TicketDetail ticket={selected} system={system} />
              {!run ? (
                <ConnectGate ticket={selected} system={system} connection={connection} busy={busy} onStart={startRun} />
              ) : (
                <RunView run={run} busy={busy} setRun={setRun} guard={guard} />
              )}
            </>
          )}
        </main>

        <aside className="right">
          <ActivityRail run={run} busy={busy} guard={guard} onSubmitted={refreshTickets} />
          <AuditTrail audit={run?.audit ?? []} />
        </aside>
      </div>
    </div>
  );
}

function TopBar({
  theme,
  setTheme,
  health,
  modelSelection,
  modelBusy,
  onModelChange,
  me,
  system,
  connection,
  onReset,
}: {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  health: Health | null;
  modelSelection: ModelSelection | null;
  modelBusy: boolean;
  onModelChange: (modelId: string) => void;
  me: Employee | null;
  system: SystemInfo | null;
  connection: ConnectionState | null;
  onReset: () => void;
}) {
  return (
    <header className="topbar">
      <div className="wordmark">
        <SphinxMark className="brand-logo" size={28} />
        <div className="brand-copy">
          <b>Sphinx</b>
          <span>AI Service Desk Autopilot</span>
        </div>
        <span className="topbar-tag">AUTOPILOT</span>
      </div>
      <div className="spacer" />
      <ModelSelector selection={modelSelection} backend={health?.backend} busy={modelBusy} onChange={onModelChange} />
      <ConnectionChip system={system} connection={connection} />
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <button className="btn sm ghost reset-btn" type="button" title="Reset VMs" onClick={onReset}>
        <Icon name="refresh" size={13} />
        Reset VMs
      </button>
      {me && (
        <div className="me">
          <Avatar name={`${me.firstname} ${me.lastname}`} />
          <div className="me-copy">
            <span>{me.firstname} {me.lastname}</span>
            <small>{me.teamname}</small>
          </div>
        </div>
      )}
    </header>
  );
}

function ModelSelector({
  selection,
  backend,
  busy,
  onChange,
}: {
  selection: ModelSelection | null;
  backend?: string;
  busy: boolean;
  onChange: (modelId: string) => void;
}) {
  const models = selection?.models ?? [];
  const active = models.find((model) => model.active)?.id ?? selection?.active?.id ?? "";
  return (
    <label className="model-select-wrap" title={models.length ? "Model selector" : "No configured models"}>
      <span className="model-led" />
      <select className="model-select" value={active} disabled={busy || models.length === 0} onChange={(e) => onChange(e.target.value)}>
        {models.length === 0 ? (
          <option value="">{backend ? `${backend} · no model` : "No model configured"}</option>
        ) : (
          models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))
        )}
      </select>
    </label>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: ThemePreference; setTheme: (theme: ThemePreference) => void }) {
  const options: Array<{ value: ThemePreference; label: string; icon?: IconName }> = [
    { value: "light", label: "Light", icon: "sun" },
    { value: "system", label: "Auto" },
    { value: "dark", label: "Dark", icon: "moon" },
  ];
  return (
    <div className="seg theme-seg" role="group" aria-label="Theme">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`seg-btn${theme === option.value ? " on" : ""}`}
          aria-pressed={theme === option.value}
          title={option.label}
          onClick={() => setTheme(option.value)}
        >
          {option.icon ? <Icon name={option.icon} size={14} /> : <span className="auto-label">AUTO</span>}
        </button>
      ))}
    </div>
  );
}

function QueueRail({
  sourceLabel,
  selectedSource,
  sandboxAvailable,
  sandboxCount,
  busy,
  tickets,
  selected,
  loading,
  statusF,
  priorityF,
  sort,
  setStatusF,
  setPriorityF,
  setSort,
  onSelect,
  onSwitchSource,
}: {
  sourceLabel: string;
  selectedSource: CaseSourceSelection;
  sandboxAvailable: boolean;
  sandboxCount?: number;
  busy: string | null;
  tickets: Ticket[];
  selected: Ticket | null;
  loading: boolean;
  statusF: string;
  priorityF: string;
  sort: string;
  setStatusF: (value: string) => void;
  setPriorityF: (value: string) => void;
  setSort: (value: string) => void;
  onSelect: (ticket: Ticket) => void;
  onSwitchSource: (source: CaseSourceSelection) => void;
}) {
  return (
    <aside className="rail-left">
      <div className="rail-head">
        <div className="rail-title">
          <h2>My tickets</h2>
          <span className="badge">{tickets.length} cases</span>
        </div>
        <label className="source-control">
          <span className="eyebrow">Case source</span>
          <select
            value={selectedSource}
            disabled={!!busy}
            onChange={(e) => onSwitchSource(e.target.value as CaseSourceSelection)}
          >
            <option value="real_erp">{sourceLabel === "Local/offline ERP cases" ? "Local/offline ERP" : "Real Phoenix ERP"}</option>
            <option value="sandbox_cases" disabled={!sandboxAvailable}>
              Docker sandbox cases{sandboxCount ? ` (${sandboxCount})` : ""}
            </option>
          </select>
        </label>
        <div className="seg sort" role="group" aria-label="Sort tickets">
          {SORT_OPTIONS.map(([value, label]) => (
            <button key={value} type="button" className={`seg-btn${sort === value ? " on" : ""}`} onClick={() => setSort(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="filters">
          <label>
            <span className="eyebrow">Status</span>
            <select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label>
            <span className="eyebrow">Priority</span>
            <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)}>
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>
      </div>
      <div className="rail-list">
        {loading && <p className="empty-note">Loading tickets...</p>}
        {!loading && tickets.length === 0 && <p className="empty-note">No tickets match these filters.</p>}
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            className={`qcard${selected?.id === ticket.id ? " on" : ""}`}
            onClick={() => onSelect(ticket)}
          >
            <div className="qrow">
              <span className="mono qid">#{ticket.id}</span>
              <span className="ticket-tags">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </span>
            </div>
            <p className="qtitle">{ticket.title}</p>
            <div className="qrow">
              <span className="qcust">{ticket.customer_name}</span>
            </div>
            <span className="qage">{ticket.created_at ? formatTicketDate(ticket.created_at) : "no date"}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="empty-main">
      <SphinxMark size={44} />
      <h1>Select a ticket to open a session</h1>
      <p>Sphinx proposes commands, you approve every write, and the full trace becomes ERP documentation.</p>
    </div>
  );
}

function TicketDetail({ ticket, system }: { ticket: Ticket; system: SystemInfo | null }) {
  return (
    <section className="card detail">
      <div className="detail-head">
        <div className="col gap-2 minw">
          <div className="row gap-2 wrap">
            <span className="mono detail-id">#{ticket.id}</span>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
          <h1>{ticket.title}</h1>
          <div className="detail-meta">
            <span><Icon name="user" size={13} />{ticket.customer_name}</span>
            {ticket.sla_due_at && <span>SLA {formatTicketDate(ticket.sla_due_at)}</span>}
          </div>
        </div>
      </div>

      <blockquote className="customer-report">
        <span className="eyebrow">Customer report</span>
        <MarkdownBlock content={ticket.description || "No description provided."} className="report" />
      </blockquote>

      <div className="sysinfo">
        <div className="row gap-2 wrap">
          <Icon name="server" size={15} className="accent-icon" />
          <span className="eyebrow strong">Customer system · loaded from ERP</span>
        </div>
        {system ? (
          <div className="sysgrid">
            <Field label="Address" mono>{system.ip}:{system.port}</Field>
            <Field label="SSH user" mono>{system.username}</Field>
            <Field label="Operating system">{system.os}</Field>
            <Field label="Notes">{system.notes || "-"}</Field>
          </div>
        ) : (
          <p className="empty-note">Loading system metadata...</p>
        )}
      </div>
    </section>
  );
}

function ConnectGate({
  ticket,
  system,
  connection,
  busy,
  onStart,
}: {
  ticket: Ticket;
  system: SystemInfo | null;
  connection: ConnectionState | null;
  busy: string | null;
  onStart: () => void;
}) {
  const label = connectionLabel(system, connection);
  const canStart = !!system && !!connection?.reachable && !busy;
  return (
    <section className="gate card">
      <div className="gate-icon"><Icon name="link" size={20} /></div>
      <div className="col gap-2 minw">
        <span className="eyebrow accent-text">Approval required · run setup</span>
        <h2>Start a guided troubleshooting run?</h2>
        <p className="muted">
          Sphinx will inspect ticket <span className="mono">#{ticket.id}</span> and use the customer system metadata from the ERP.
          Read-only checks may auto-run when allowed by policy; writes still require your approval.
        </p>
        <div className={`conn large ${connectionClass(system, connection)}`}>
          <span className="conn-dot" />
          <span>{label}</span>
        </div>
        <div className="row gap-2 wrap">
          <button className="btn primary lg" type="button" disabled={!canStart} onClick={onStart}>
            {busy ? <Thinking label={busy} /> : <><Icon name="play" size={15} />Start AI troubleshooting session</>}
          </button>
        </div>
      </div>
    </section>
  );
}

function RunView({ run, busy, setRun, guard }: {
  run: Run;
  busy: string | null;
  setRun: (run: Run) => void;
  guard: Guard;
}) {
  const pending = run.pending_step_id ? run.steps.find((step) => step.id === run.pending_step_id) : undefined;
  const working = !!busy || (["running", "analyzing", "validating"].includes(run.status) && !pending);
  const orbState = working ? "run" : run.status === "done" ? "done" : run.status === "aborted" ? "off" : "idle";
  const activity = runActivity(run.status, working, busy, !!pending);

  async function abort() {
    const next = await guard("aborting", () => api.abort(run.id));
    if (next) setRun(next);
  }

  return (
    <section className="agent">
      <div className="agent-head">
        <div className="row gap-2">
          <span className="agent-orb" data-on={orbState}>
            <Icon name="spark" size={14} />
          </span>
          <div className="col agent-title">
            <h2>Sphinx · guided run</h2>
            <span>{activity.detail}</span>
          </div>
        </div>
        <div className="row gap-2 wrap">
          <span className={`badge ${statusToneClass(run.status)}`}><span className="dot" />{run.status.replace("_", " ")}</span>
          <span className="mono run-id">{run.id}</span>
          {busy && <Thinking label={busy} />}
          {!["done", "aborted"].includes(run.status) && (
            <button className="btn sm danger-ghost" type="button" disabled={!!busy} onClick={abort}>
              <Icon name="stop" size={13} />
              Abort session
            </button>
          )}
        </div>
      </div>

      <div className="ai-intro">
        <span className="ai-av"><Icon name="spark" size={13} /></span>
        <p>
          I am working from the live ticket, system metadata, safety layer, and command results. Every proposed write pauses here
          for technician approval before it touches the customer machine.
        </p>
      </div>

      <div className="timeline">
        {run.steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            pending={step.id === run.pending_step_id}
            runId={run.id}
            busy={busy}
            setRun={setRun}
            guard={guard}
          />
        ))}
        {working && (
          <div className="step active working-step">
            <span className="step-node"><span className="node-run" /></span>
            <div className={`step-body card lift run-state-card ${activity.tone}`}>
              <div className="run-state-head">
                <div className="col gap-1 minw">
                  <span className="step-kind">Current status</span>
                  <h3>{activity.label}</h3>
                </div>
                <span className={`badge ${runActivityBadgeTone(activity.tone)}`}>{activityStatusLabel(activity.label)}</span>
              </div>
              <p className="run-state-detail">{activity.detail}</p>
            </div>
          </div>
        )}
        {run.steps.length === 0 && !working && <p className="empty-note">No steps yet.</p>}
      </div>

      {isTerminalRun(run.status) && <RunEndSummary run={run} />}
    </section>
  );
}

function RunEndSummary({ run }: { run: Run }) {
  const outcome = runOutcome(run);
  const successful = run.steps.filter((step) => step.status === "succeeded");
  const validations = successful.filter((step) => step.kind === "validate");
  const fixes = successful.filter((step) => step.kind === "fix");
  const issues = run.steps.filter((step) => ["failed", "blocked", "rejected"].includes(step.status));
  const lastValidation = validations.at(-1);
  const importantSteps = [...fixes, ...validations].slice(-4);

  return (
    <section className={`card run-end-summary ${outcome.tone}`} aria-live="polite">
      <div className="run-end-head">
        <span className="run-end-icon"><Icon name={outcome.icon} size={17} /></span>
        <div className="col gap-1 minw">
          <span className="eyebrow">{outcome.eyebrow}</span>
          <h3>{outcome.title}</h3>
          <p>{outcome.detail}</p>
        </div>
      </div>

      <div className="run-end-grid">
        <div className="run-end-stat">
          <span>{successful.length}</span>
          <small>completed steps</small>
        </div>
        <div className="run-end-stat">
          <span>{fixes.length}</span>
          <small>fix actions</small>
        </div>
        <div className="run-end-stat">
          <span>{validations.length}</span>
          <small>validations</small>
        </div>
        <div className={`run-end-stat ${issues.length ? "warn" : "ok"}`}>
          <span>{issues.length}</span>
          <small>needs review</small>
        </div>
      </div>

      {(run.conclusion?.root_cause || lastValidation?.result?.stdout || importantSteps.length > 0) && (
        <div className="run-end-body">
          {run.conclusion?.root_cause && (
            <div className="run-end-note">
              <span className="eyebrow">Root cause</span>
              <MarkdownBlock content={run.conclusion.root_cause} compact />
            </div>
          )}
          {lastValidation?.result?.stdout && (
            <div className="run-end-note">
              <span className="eyebrow">Last validation</span>
              <MarkdownBlock content={lastValidation.result.stdout} compact />
            </div>
          )}
          {importantSteps.length > 0 && (
            <div className="run-end-note">
              <span className="eyebrow">What happened</span>
              <ul className="run-end-list">
                {importantSteps.map((step) => (
                  <li key={step.id}>
                    <span>{stepKindLabel(step.kind)}</span>
                    <code>{step.edited_command || step.command}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StepCard({ step, pending, runId, busy, setRun, guard }: {
  step: Step;
  pending: boolean;
  runId: string;
  busy: string | null;
  setRun: (run: Run) => void;
  guard: Guard;
}) {
  const [edited, setEdited] = useState(step.command);
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEdited(step.command);
    setOpen(false);
  }, [step.command, step.id]);

  const safetyClass = step.safety?.classification || step.risk;
  const blocked = safetyClass === "blocked";
  const auto = !pending && safetyClass === "low_risk" && step.status === "succeeded" && !step.edited_command;
  const command = step.edited_command || step.command;
  const canExpand = ["succeeded", "failed", "rejected", "skipped"].includes(step.status);
  const expanded = pending || step.status === "running" || blocked || !canExpand || open;

  async function approve() {
    const changed = edited.trim() !== step.command.trim();
    const next = await guard("running command", () => api.approve(runId, step.id, changed ? edited : undefined));
    if (next) setRun(next);
  }

  async function reject() {
    const next = await guard("re-planning", () => api.reject(runId, step.id, reason || undefined));
    if (next) setRun(next);
  }

  async function copyCommand() {
    try {
      await navigator.clipboard?.writeText(edited || command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={`step ${stepStateClass(step.status)}${pending ? " needs-approval" : ""}`}>
      <span className="step-node"><StepNodeIcon status={step.status} pending={pending} /></span>
      <div className={`step-body card${pending || step.status === "running" ? " lift" : ""}`}>
        <button
          className="step-head"
          type="button"
          disabled={!canExpand}
          onClick={() => canExpand && setOpen((value) => !value)}
        >
          <div className="col gap-1 minw">
            <span className="row gap-2 wrap">
              <span className="step-kind">{stepKindLabel(step.kind)}</span>
              <RiskTag risk={safetyClass} />
              {auto && <span className="badge muted">auto-run</span>}
            </span>
            <h3>{stepTitle(step)}</h3>
          </div>
          <span className={`badge ${stepStatusTone(step.status)}`}>{step.status.replace("_", " ")}</span>
        </button>

        {expanded && (
          <div className="step-detail">
            {step.rationale && <MarkdownBlock content={step.rationale} className="step-plain" compact />}

            <div className="cmd-row">
              <span className="eyebrow">Command</span>
              <button className="iconbtn" type="button" title="Copy command" onClick={copyCommand}>
                <Icon name={copied ? "check" : "copy"} size={13} />
              </button>
            </div>
            {pending && !blocked ? (
              <textarea className="cmd-edit mono" value={edited} onChange={(e) => setEdited(e.target.value)} spellCheck={false} />
            ) : (
              <div className="cmd mono"><span className="cmd-pre">$</span>{command}</div>
            )}

            {blocked && (
              <div className="evidence danger">
                <Icon name="shield" size={14} />
                <span>Blocked by safety: {step.safety?.reason || "This command will not run."}</span>
              </div>
            )}

            {step.result && (
              <div className="console-output mono">
                <span className={step.result.exit_code === 0 ? "cl ok" : "cl err"}>exit {step.result.exit_code}</span>
                {step.result.stdout && <span className="cl out">{step.result.stdout}</span>}
                {step.result.stderr && <span className="cl err">[stderr] {step.result.stderr}</span>}
              </div>
            )}

            {pending && !blocked && (
              <div className="step-actions">
                <button className="btn primary lg" type="button" disabled={!!busy} onClick={approve}>
                  <Icon name="shield" size={15} />
                  {edited.trim() !== step.command.trim() ? "Approve edited" : "Approve and run"}
                </button>
                <button className="btn lg danger-ghost" type="button" disabled={!!busy} onClick={reject}>
                  <Icon name="x" size={15} />
                  Reject
                </button>
                <input
                  className="reason"
                  placeholder="Reason or guidance for the agent..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityRail({ run, busy, guard, onSubmitted }: {
  run: Run | null;
  busy: string | null;
  guard: Guard;
  onSubmitted: () => void;
}) {
  const [draft, setDraft] = useState<ActivityDraft | null>(run?.activity_draft ?? null);
  const [submitted, setSubmitted] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    setDraft(run?.activity_draft ?? null);
    setSubmitted(false);
    setEditorOpen(false);
  }, [run?.id, run?.activity_draft]);

  async function generate() {
    if (!run) return;
    const next = await guard("drafting activity", () => api.draftActivity(run.id));
    if (next) setDraft(next);
  }

  async function submit() {
    if (!run || !draft) return;
    const result = await guard("submitting to ERP", () => api.submitActivity(run.id, draft));
    if (result) {
      setSubmitted(true);
      onSubmitted();
    }
  }

  function updateDraft(key: keyof ActivityDraft, value: string) {
    setDraft((current) => ({ ...(current ?? {}), [key]: value }));
  }

  const canDraft = run?.status === "done" && !draft;
  const canSubmit = !!draft && run?.status === "done" && !submitted && !busy;

  return (
    <section className="card panel activity-panel">
      <div className="panel-head">
        <div className="row gap-2">
          <Icon name="doc" size={15} className="accent-icon" />
          <h3>Activity draft</h3>
        </div>
        <span className={`badge ${draft ? "accent" : "muted"}`}>{draft ? "ready" : "waiting"}</span>
      </div>

      {!run && (
        <div className="activity-body">
          <p className="empty-note">Approved steps and validations will become the ERP activity draft here.</p>
        </div>
      )}

      {run && !draft && (
        <div className="activity-body">
          {run.conclusion && (
            <div className="af">
              <span className="eyebrow">Root cause</span>
              <MarkdownBlock content={run.conclusion.root_cause} className="af-text-md" compact />
            </div>
          )}
          <ActivityTraceSummary run={run} />
        </div>
      )}

      {draft && (
        <div className="activity-body">
          {submitted ? (
            <div className="submitted">
              <div className="ok-burst"><Icon name="check" size={24} /></div>
              <h3>Activity written to the ERP</h3>
              <p className="muted">The ticket activity was submitted and the queue has been refreshed.</p>
            </div>
          ) : (
            <>
              <ReportPreview draft={draft} steps={run?.steps ?? []} onEdit={() => setEditorOpen(true)} />
              <details className="activity-editor" open={editorOpen} onToggle={(e) => setEditorOpen(e.currentTarget.open)}>
                <summary>Edit ERP fields</summary>
                <div className="activity-editor-body">
                  <DraftField label="Summary" value={draft.summary} onChange={(value) => updateDraft("summary", value)} />
                  <DraftField label="Root cause" value={draft.root_cause} onChange={(value) => updateDraft("root_cause", value)} />
                  <DraftField label="Actions taken" value={draft.actions_taken} rows={4} onChange={(value) => updateDraft("actions_taken", value)} />
                  <DraftField label="Commands summary" value={draft.commands_summary} rows={3} onChange={(value) => updateDraft("commands_summary", value)} />
                  <DraftField label="Validation result" value={draft.validation_result} onChange={(value) => updateDraft("validation_result", value)} />
                  <DraftField label="Description" value={draft.description} rows={4} onChange={(value) => updateDraft("description", value)} />
                </div>
              </details>
            </>
          )}
        </div>
      )}

      <div className="activity-foot">
        {!draft && (
          <button className="btn primary block lg" type="button" disabled={!canDraft || !!busy} onClick={generate}>
            {busy ? <Thinking label={busy} /> : <><Icon name="spark" size={15} />Generate documentation</>}
          </button>
        )}
        {draft && !submitted && (
          <button className="btn primary block lg" type="button" disabled={!canSubmit} onClick={submit}>
            {busy ? <Thinking label={busy} /> : <><Icon name="send" size={15} />Submit activity to ERP</>}
          </button>
        )}
      </div>
    </section>
  );
}

function ActivityTraceSummary({ run }: { run: Run }) {
  const completed = run.steps.filter((step) => step.status === "succeeded");
  const validations = completed.filter((step) => step.kind === "validate");
  return (
    <>
      <div className="af">
        <span className="eyebrow">Actions taken</span>
        {completed.length ? (
          <ol className="af-list">
            {completed.slice(0, 6).map((step) => <li key={step.id}>{stepKindLabel(step.kind)}: {step.command}</li>)}
          </ol>
        ) : (
          <p className="empty-note">No completed commands yet.</p>
        )}
      </div>
      <div className="af">
        <span className="eyebrow">Validation</span>
        {validations.length ? (
          <ul className="af-valid">
            {validations.map((step) => <li key={step.id}><Icon name="check" size={13} />{step.result?.stdout || step.command}</li>)}
          </ul>
        ) : (
          <p className="empty-note">Validation results appear when the run completes.</p>
        )}
      </div>
    </>
  );
}

function AuditTrail({ audit }: { audit: AuditEntry[] }) {
  return (
    <section className="card panel audit-panel">
      <div className="panel-head">
        <div className="row gap-2">
          <Icon name="terminal" size={15} className="accent-icon" />
          <h3>Audit trail</h3>
        </div>
        <span className="badge">{audit.length} entries</span>
      </div>
      <div className="audit-body">
        {audit.length === 0 && <p className="empty-note">Every proposal, approval, command, and ERP write is recorded here.</p>}
        {audit.map((entry, index) => (
          <div className="logrow" key={`${entry.ts}-${index}`}>
            <span className={`log-ic ${actorClass(entry.actor)}`}><Icon name={actorIcon(entry.actor)} size={12} /></span>
            <div className="col gap-1 minw">
              <div className="log-top">
                <span className="log-actor">{actorLabel(entry.actor)}</span>
                <span className="log-time mono">{entry.ts.slice(11, 19)}</span>
              </div>
              <span className="log-text">{entry.type.replace("_", " ")}</span>
              {entry.note && <MarkdownBlock content={entry.note} className="event-note" compact />}
              {entry.command && (
                <div className="log-cmd mono">
                  <span className="cmd-pre">$</span>
                  <span>{entry.command}</span>
                  {entry.exit_code != null && <span className={`exit ${entry.exit_code === 0 ? "ok" : "err"}`}>exit {entry.exit_code}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportPreview({ draft, steps, onEdit }: { draft: ActivityDraft; steps: Step[]; onEdit: () => void }) {
  const summary = reportText(draft.summary);
  const rootCause = reportText(draft.root_cause);
  const validation = reportText(draft.validation_result);
  const description = reportText(draft.description);
  const actions = actionListItems(reportText(draft.actions_taken));
  const commands = commandSummaryItems(reportText(draft.commands_summary));
  const hasContent = [summary, rootCause, validation, description].some(Boolean) || actions.length > 0 || commands.length > 0;

  return (
    <div className="report-preview">
      <div className="report-preview-head">
        <div>
          <span className="eyebrow">Final report preview</span>
          <h3>Technician-facing documentation</h3>
        </div>
        <button className="btn sm ghost report-edit-btn" type="button" onClick={onEdit}>
          <Icon name="edit" size={13} />
          Edit
        </button>
      </div>
      {hasContent ? (
        <div className="report-doc">
          <ReportTextSection title="Summary" content={summary} />
          <ReportTextSection title="Root cause" content={rootCause} />
          {actions.length > 0 && (
            <section className="report-section">
              <h4>Actions taken</h4>
              {actions.length > 1 ? (
                <ol className="report-action-list">
                  {actions.map((action, index) => (
                    <li key={`${action}-${index}`}><MarkdownBlock content={action} className="report-inline-md" compact /></li>
                  ))}
                </ol>
              ) : (
                <MarkdownBlock content={actions[0]} className="report-inline-md" compact />
              )}
            </section>
          )}
          {commands.length > 0 && (
            <section className="report-section">
              <h4>Commands referenced</h4>
              <div className="report-command-list">
                {commands.map((command, index) => (
                  <div className="report-command-row" key={`${command.command}-${index}`}>
                    <code>{command.command}</code>
                    {command.note && <span>{command.note}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}
          <ReportTextSection title="Validation result" content={validation} />
          <ReportTextSection title="Description" content={description} />
        </div>
      ) : (
        <p className="empty-note">No report fields have content yet.</p>
      )}
      <CommandHistory steps={steps} />
    </div>
  );
}

function ReportTextSection({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  return (
    <section className="report-section">
      <h4>{title}</h4>
      <MarkdownBlock content={content} className="report-inline-md" compact />
    </section>
  );
}

function CommandHistory({ steps }: { steps: Step[] }) {
  const ran = steps.filter((step) => step.command && ["succeeded", "failed"].includes(step.status));
  if (!ran.length) return null;
  const succeeded = ran.filter((step) => step.status === "succeeded").length;
  const failed = ran.filter((step) => step.status === "failed").length;
  const meta = [
    `${ran.length} command${ran.length === 1 ? "" : "s"}`,
    succeeded ? `${succeeded} succeeded` : "",
    failed ? `${failed} failed` : "",
  ].filter(Boolean).join(" · ");

  return (
    <details className="command-history">
      <summary>
        <span>Command history</span>
        <span>{meta}</span>
      </summary>
      <div className="command-history-list">
        {ran.map((step) => (
          <div className="command-history-row" key={step.id}>
            <div className="command-history-meta">
              <span>{step.kind}</span>
              <span className={`command-status ${step.status}`}>{step.status}</span>
              {step.result?.exit_code != null && <span>exit {step.result.exit_code}</span>}
            </div>
            <code>{step.edited_command || step.command}</code>
          </div>
        ))}
      </div>
    </details>
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

function DraftField({ label, value, rows = 2, onChange }: {
  label: string;
  value?: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span className="eyebrow">{label}</span>
      <textarea rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Field({ label, children, mono = false }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="field-read">
      <span className="eyebrow">{label}</span>
      <span className={mono ? "mono" : ""}>{children}</span>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return <span className="avatar" aria-hidden="true">{initials || "U"}</span>;
}

function PriorityBadge({ priority }: { priority?: string }) {
  return <span className={`badge ${priorityToneClass(priority)}`}><span className="dot" />{priority || "low"} priority</span>;
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  return <span className={`badge ${statusToneClass(status)}`}><span className="dot" />{status}</span>;
}

function RiskTag({ risk }: { risk?: string }) {
  const tone = risk === "blocked" ? "danger" : risk === "needs_review" ? "warn" : "ok";
  const label = risk === "low_risk" || risk === "low" ? "Read-only" : risk === "blocked" ? "Blocked" : "Needs review";
  return (
    <span className={`risk ${tone}`}>
      <Icon name={risk === "blocked" ? "alert" : "shield"} size={14} />
      {label}
    </span>
  );
}

function StepNodeIcon({ status, pending }: { status: string; pending: boolean }) {
  if (["succeeded", "done"].includes(status)) return <span className="node-done"><Icon name="check" size={13} /></span>;
  if (["failed", "blocked"].includes(status)) return <span className="node-rej"><Icon name="x" size={13} /></span>;
  if (status === "running") return <span className="node-run" />;
  if (pending || status === "pending_approval") return <span className="node-active" />;
  return <span className="node-dot" />;
}

function ConnectionChip({ system, connection }: { system: SystemInfo | null; connection: ConnectionState | null }) {
  const cls = connectionClass(system, connection);
  return (
    <div className={`conn ${cls}`} title={connectionLabel(system, connection)}>
      <span className="conn-dot" />
      <span>{connectionShortLabel(system, connection)}</span>
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

function actionListItems(value: string): string[] {
  if (!value) return [];
  const arrayItems = arrayLikeItems(value);
  if (arrayItems.length > 1) return arrayItems;

  const numberedItems = denseNumberedListItems(value);
  if (numberedItems.length > 1) return numberedItems;

  return [value];
}

function commandListItems(value: string): string[] {
  if (!value) return [];
  const structuredItems = actionListItems(value);
  if (structuredItems.length > 1) return structuredItems;

  const semicolonItems = splitReadableList(value, ";");
  if (semicolonItems.length > 1) return semicolonItems;

  return [value];
}

function arrayLikeItems(value: string): string[] {
  if (!/^\[\s*(['"])/.test(value) || !/\]\s*$/.test(value)) return [];
  const items = Array.from(value.matchAll(/(['"])((?:\\.|(?!\1).)*?)\1/g))
    .map((match) => match[2].replace(/\\(['"])/g, "$1").trim())
    .filter(Boolean);
  return items.length > 1 ? items : [];
}

function denseNumberedListItems(value: string): string[] {
  const matches = Array.from(value.matchAll(/(?:^|\s)(\d+)\)\s+/g));
  if (matches.length < 2 || matches[0].index !== 0) return [];

  return matches
    .map((match, index) => {
      const next = matches[index + 1];
      const start = (match.index ?? 0) + match[0].length;
      const end = next?.index ?? value.length;
      return value.slice(start, end).trim();
    })
    .filter(Boolean);
}

function splitReadableList(value: string, delimiter: ";" | ","): string[] {
  if (!value.includes(delimiter)) return [];
  const parts = value.split(delimiter).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return [];
  const tooFragmented = parts.some((part) => part.split(/\s+/).length < 2 && !looksCommandLike(part));
  return tooFragmented ? [] : parts;
}

function commandSummaryItems(value: string): Array<{ command: string; note: string }> {
  return commandListItems(value)
    .map((item) => {
      const match = item.match(/^(.+?)\s+\((.+)\)$/);
      return {
        command: (match ? match[1] : item).trim(),
        note: (match ? match[2] : "").trim(),
      };
    })
    .filter((item) => item.command);
}

function looksCommandLike(value: string): boolean {
  return /^(?:sudo\s+)?(?:systemctl|journalctl|ss|netstat|lsof|curl|grep|sed|awk|find|cat|chmod|chown|mkdir|rm|cp|mv|touch|python3?|node|bun|npm|docker|psql)\b/i.test(value);
}

function reportText(value: ActivityDraft[keyof ActivityDraft]): string {
  return typeof value === "string" ? value.trim() : "";
}

function formatTicketDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function priorityClass(priority?: string): string {
  const normalized = (priority || "low").toLowerCase();
  if (normalized.startsWith("h")) return "hi";
  if (normalized.startsWith("m")) return "md";
  return "lo";
}

function priorityToneClass(priority?: string): string {
  const normalized = (priority || "low").toLowerCase();
  if (normalized.startsWith("h")) return "danger";
  if (normalized.startsWith("m")) return "warn";
  return "muted";
}

function statusToneClass(status?: string): string {
  if (status === "DONE" || status === "done") return "ok";
  if (status === "PENDING" || status === "awaiting_approval") return "warn";
  if (status === "error" || status === "aborted") return "danger";
  if (["running", "analyzing", "validating"].includes(status || "")) return "accent";
  return "muted";
}

function stepStateClass(status: string): string {
  if (["succeeded", "done"].includes(status)) return "done";
  if (["failed", "blocked"].includes(status)) return "rejected";
  if (status === "running") return "running";
  if (status === "pending_approval") return "active";
  return "up";
}

function stepStatusTone(status: string): string {
  if (["succeeded", "done"].includes(status)) return "ok";
  if (["failed", "blocked"].includes(status)) return "danger";
  if (status === "running") return "accent";
  if (status === "pending_approval") return "warn";
  return "muted";
}

function stepKindLabel(kind: string): string {
  if (kind === "fix") return "Fix";
  if (kind === "validate") return "Validation";
  return "Diagnostic";
}

function stepTitle(step: Step): string {
  const first = step.rationale?.split(/[.\n]/).map((part) => part.trim()).find(Boolean);
  return first || `${stepKindLabel(step.kind)} command ${step.index + 1}`;
}

function isTerminalRun(status: string): boolean {
  return ["done", "aborted", "error"].includes(status);
}

function runOutcome(run: Run): { eyebrow: string; title: string; detail: string; tone: string; icon: IconName } {
  if (run.status === "done") {
    const fixed = run.conclusion?.fixed !== false;
    return {
      eyebrow: "End event",
      title: fixed ? "Fix applied and verified" : "Run completed with follow-up needed",
      detail: fixed
        ? "The agent reached a terminal state after applying the fix and validating the customer-facing result."
        : "The session stopped cleanly, but the final validation did not confirm a complete fix.",
      tone: fixed ? "ok" : "warn",
      icon: fixed ? "check" : "alert",
    };
  }
  if (run.status === "aborted") {
    return {
      eyebrow: "Session stopped",
      title: "Run aborted by the technician",
      detail: "No command is running now. Review the audit trail before restarting or closing the ticket.",
      tone: "danger",
      icon: "stop",
    };
  }
  return {
    eyebrow: "Needs attention",
    title: "The run stopped on an error",
    detail: "The workflow ended before a verified fix. Check failed steps and command output before retrying.",
    tone: "danger",
    icon: "alert",
  };
}

function runActivityBadgeTone(tone: string): string {
  if (tone === "waiting") return "warn";
  if (tone === "danger") return "danger";
  if (["done", "reporting", "validating"].includes(tone)) return "ok";
  return "accent";
}

function activityStatusLabel(label: string): string {
  return label.toLowerCase();
}

function runActivity(status: string, working: boolean, busy: string | null, hasPending: boolean): { label: string; detail: string; tone: string } {
  const busyText = (busy || "").toLowerCase();
  if (busyText.includes("draft") || busyText.includes("submit")) {
    return { label: "Reporting", detail: "Preparing ERP documentation", tone: "reporting" };
  }
  if (busyText.includes("abort")) return { label: "Stopping", detail: "Halting the active session", tone: "danger" };
  if (busyText.includes("run") || status === "running") return { label: "Executing", detail: "Running an approved command", tone: "executing" };
  if (status === "awaiting_approval" || hasPending) return { label: "Waiting for approval", detail: "A command is ready for review", tone: "waiting" };
  if (status === "analyzing") return { label: "Thinking", detail: "Reading ticket context and system state", tone: "thinking" };
  if (status === "validating") return { label: "Validating", detail: "Checking whether the fix holds", tone: "validating" };
  if (status === "done") return { label: "Completed", detail: "Fix and documentation are ready", tone: "done" };
  if (status === "aborted") return { label: "Stopped", detail: "No command is running", tone: "danger" };
  if (status === "error") return { label: "Needs attention", detail: "The run hit an error", tone: "danger" };
  if (working) return { label: "Planning", detail: "Choosing the next safe step", tone: "planning" };
  return { label: "Planning", detail: "Ready for the next step", tone: "planning" };
}

function connectionClass(system: SystemInfo | null, connection: ConnectionState | null): string {
  if (!system || !connection || connection.status === "checking") return "checking";
  return connection.reachable ? "on" : "off";
}

function connectionLabel(system: SystemInfo | null, connection: ConnectionState | null): string {
  if (!system) return "Loading target metadata";
  if (!connection || connection.status === "checking") return `Checking SSH connection to ${system.ip}:${system.port}`;
  if (connection.reachable) return `SSH reachable: ${system.username}@${system.ip}:${system.port}`;
  return connection.message || `SSH unreachable: ${system.ip}:${system.port}`;
}

function connectionShortLabel(system: SystemInfo | null, connection: ConnectionState | null): string {
  if (!system) return "No target";
  if (!connection || connection.status === "checking") return "Checking SSH";
  if (connection.reachable) return `SSH · ${system.ip}`;
  return "SSH offline";
}

function actorClass(actor: string): string {
  if (actor === "agent") return "ai";
  if (actor === "technician") return "tech";
  return "sys";
}

function actorLabel(actor: string): string {
  if (actor === "agent") return "Sphinx";
  if (actor === "technician") return "Technician";
  return "System";
}

function actorIcon(actor: string): IconName {
  if (actor === "agent") return "spark";
  if (actor === "technician") return "user";
  return "server";
}
