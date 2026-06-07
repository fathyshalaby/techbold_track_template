// Technician workspace for the AI Service Desk Autopilot.
//
// Flow: pick a ticket -> start a run -> drive the agent one step at a time
// (POST /next) -> approve / edit / reject each proposed command -> watch the
// live event stream (SSE) -> review and submit the ERP activity. The AI only
// ever proposes; nothing runs on a system without the technician's approval.
//
// Talks to the backend at VITE_API_BASE (default http://localhost:8000).

import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE: string =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ??
  'http://localhost:8000';

// ─── API types (subset of the backend contract) ────────────────────────────
interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: 'OPEN' | 'PENDING' | 'DONE';
  customer_name: string;
}
interface CustomerSystem {
  ip: string;
  port: number;
  username: string;
  os: string;
}
interface Approval {
  id: string;
  proposed_command: string;
  purpose: string;
  expected_signal: string;
  risk_level: string;
  safety_notes: string;
  status: string;
}
interface ActivityDraft {
  summary: string;
  root_cause: string;
  actions_taken: string;
  commands_summary: string;
  validation_result: string;
  submitted?: number;
}
interface RunView {
  runId: string;
  status: string;
  phase: string;
  timeline: Array<{ id: string; type: string; actor: string; ts: string; payload_json?: string }>;
  pendingApproval: Approval | null;
  activityDraft: ActivityDraft | null;
}
interface LiveEvent {
  id: string;
  type: string;
  ts: string;
}

const RISK_COLORS: Record<string, string> = {
  SAFE_READ_ONLY: '#1a7f37',
  LOW_RISK_CHANGE: '#9a6700',
  MEDIUM_RISK_CHANGE: '#bc4c00',
  HIGH_RISK_BLOCKED: '#cf222e',
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const msg = (body as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [run, setRun] = useState<RunView | null>(null);
  const [system, setSystem] = useState<CustomerSystem | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [editCmd, setEditCmd] = useState('');
  const [reason, setReason] = useState('');
  const [draft, setDraft] = useState<ActivityDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : String(e));

  const loadTickets = useCallback(async () => {
    setError(null);
    try {
      setTickets(await api<Ticket[]>('/api/tickets'));
    } catch (e) {
      fail(e);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const refreshRun = useCallback(async (runId: string) => {
    try {
      const r = await api<RunView>(`/api/runs/${runId}`);
      setRun(r);
      setEditCmd(r.pendingApproval?.proposed_command ?? '');
      if (r.activityDraft) setDraft(r.activityDraft);
    } catch (e) {
      fail(e);
    }
  }, []);

  // Subscribe to the run's SSE stream; refresh the aggregate on every event.
  const openStream = useCallback(
    (runId: string) => {
      esRef.current?.close();
      const es = new EventSource(`${API_BASE}/api/runs/${runId}/events`);
      es.onmessage = (m) => {
        try {
          const ev = JSON.parse(m.data) as { type: string; ts: string };
          setEvents((prev) => [...prev, { id: `${ev.ts}-${ev.type}-${prev.length}`, type: ev.type, ts: ev.ts }]);
        } catch {
          /* ignore keepalive / non-JSON frames */
        }
        void refreshRun(runId);
      };
      es.onerror = () => {
        /* the browser auto-reconnects; backfill replays history on reconnect */
      };
      esRef.current = es;
    },
    [refreshRun],
  );

  useEffect(() => () => esRef.current?.close(), []);

  const startRun = async (ticket: Ticket) => {
    setBusy(true);
    setError(null);
    setEvents([]);
    setDraft(null);
    try {
      const created = await api<{ runId: string; status: string; customerSystem: CustomerSystem }>('/api/runs', {
        method: 'POST',
        body: JSON.stringify({ ticketId: ticket.id }),
      });
      setSystem(created.customerSystem);
      openStream(created.runId);
      await refreshRun(created.runId);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const act = async (fn: () => Promise<unknown>) => {
    if (!run) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refreshRun(run.runId);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const next = () => act(() => api(`/api/runs/${run!.runId}/next`, { method: 'POST' }));
  const abort = () => act(() => api(`/api/runs/${run!.runId}/abort`, { method: 'POST' }));
  const approve = (a: Approval) =>
    act(() => {
      const edited = editCmd.trim();
      const reqBody = edited && edited !== a.proposed_command ? { editedCommand: edited } : {};
      return api(`/api/runs/${run!.runId}/approvals/${a.id}/approve`, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });
    });
  const reject = (a: Approval) =>
    act(() =>
      api(`/api/runs/${run!.runId}/approvals/${a.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() || 'Rejected by technician' }),
      }),
    );
  const draftActivity = () =>
    act(async () => {
      const d = await api<ActivityDraft>(`/api/runs/${run!.runId}/activity/draft`, { method: 'POST' });
      setDraft(d);
    });
  const submitActivity = () =>
    act(() => {
      // The draft is snake_case (mirrors the DB row); the submit endpoint expects
      // camelCase. Map explicitly so technician edits to ALL fields reach Phoenix
      // (a silent snake/camel mismatch previously dropped 4 of 5 edited fields).
      const d = draft ?? run!.activityDraft;
      const body = d
        ? {
            summary: d.summary,
            rootCause: d.root_cause,
            actionsTaken: d.actions_taken,
            commandsSummary: d.commands_summary,
            validationResult: d.validation_result,
          }
        : {};
      return api(`/api/runs/${run!.runId}/activity/submit`, { method: 'POST', body: JSON.stringify(body) });
    });

  const closeRun = () => {
    esRef.current?.close();
    setRun(null);
    setSystem(null);
    setEvents([]);
    setDraft(null);
    void loadTickets();
  };

  // ─── styles ─────────────────────────────────────────────────────────────
  const wrap: React.CSSProperties = { fontFamily: 'system-ui, sans-serif', maxWidth: 920, margin: '4vh auto', padding: 24 };
  const card: React.CSSProperties = { border: '1px solid #d0d7de', borderRadius: 8, padding: 16, marginBottom: 16 };
  const btn: React.CSSProperties = { padding: '8px 14px', borderRadius: 6, border: '1px solid #d0d7de', cursor: 'pointer', background: '#f6f8fa' };

  return (
    <main style={wrap}>
      <h1 style={{ marginBottom: 4 }}>AI Service Desk Autopilot</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Technician workspace — the AI proposes, you approve every action. <code>{API_BASE}</code>
      </p>

      {error && (
        <div style={{ ...card, borderColor: '#cf222e', background: '#ffebe9', color: '#cf222e' }}>⚠ {error}</div>
      )}

      {!run && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Tickets</h2>
            <button style={btn} onClick={() => void loadTickets()} disabled={busy}>↻ Refresh</button>
          </div>
          {tickets.length === 0 && <p style={{ color: '#666' }}>No tickets (or backend unreachable).</p>}
          {tickets.map((t) => (
            <div key={t.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>#{t.id} — {t.title}</strong>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    {t.customer_name} · priority {t.priority} · <Badge text={t.status} />
                  </div>
                  <p style={{ fontSize: 14, marginBottom: 0 }}>{t.description}</p>
                </div>
                <button
                  style={{ ...btn, alignSelf: 'start', background: '#0969da', color: '#fff', borderColor: '#0969da' }}
                  onClick={() => void startRun(t)}
                  disabled={busy || t.status === 'DONE'}
                >
                  Start run →
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {run && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginBottom: 0 }}>Run <code>{run.runId.slice(0, 12)}</code></h2>
            <button style={btn} onClick={closeRun}>← Back to tickets</button>
          </div>
          <div style={{ color: '#666', margin: '6px 0 16px' }}>
            phase <strong>{run.phase}</strong> · status <strong>{run.status}</strong>
            {system && (
              <> · target <code>{system.username}@{system.ip}:{system.port}</code> ({system.os})</>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              style={{ ...btn, background: '#0969da', color: '#fff', borderColor: '#0969da' }}
              onClick={next}
              disabled={busy || !!run.pendingApproval || run.status === 'COMPLETED'}
            >
              Advance agent (/next)
            </button>
            {run.phase === 'WAITING_FOR_ACTIVITY_REVIEW' && (
              <button style={btn} onClick={draftActivity} disabled={busy}>Draft activity</button>
            )}
            <button style={{ ...btn, color: '#cf222e' }} onClick={abort} disabled={busy}>Abort</button>
          </div>

          {run.pendingApproval && (
            <ApprovalCard
              card={card}
              btn={btn}
              a={run.pendingApproval}
              editCmd={editCmd}
              setEditCmd={setEditCmd}
              reason={reason}
              setReason={setReason}
              busy={busy}
              onApprove={() => void approve(run.pendingApproval!)}
              onReject={() => void reject(run.pendingApproval!)}
            />
          )}

          {(draft ?? run.activityDraft) && (
            <DraftPanel
              card={card}
              btn={btn}
              draft={(draft ?? run.activityDraft)!}
              setDraft={setDraft}
              submitted={run.status === 'COMPLETED'}
              busy={busy}
              onSubmit={() => void submitActivity()}
            />
          )}

          <AuditTrail card={card} timeline={run.timeline} />

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Live events</h3>
            <div style={{ maxHeight: 200, overflow: 'auto', fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>
              {events.length === 0 && <span style={{ color: '#666' }}>Waiting for events…</span>}
              {events.map((e) => (
                <div key={e.id}>
                  <span style={{ color: '#666' }}>{new Date(e.ts).toLocaleTimeString()}</span> {e.type}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

// One-line, human-readable summary of an audit event's (already-redacted) payload.
function summarizePayload(payloadJson?: string): string {
  if (!payloadJson) return '';
  try {
    const p = JSON.parse(payloadJson) as Record<string, unknown>;
    const pick = (k: string) => (p[k] === undefined || p[k] === null ? '' : String(p[k]));
    if (p.command !== undefined) return `$ ${pick('command')}`;
    if (p.exitCode !== undefined) return `exit ${pick('exitCode')}`;
    if (p.reason !== undefined) return pick('reason');
    if (p.status !== undefined) return pick('status');
    if (p.hypothesis !== undefined) return pick('hypothesis');
    if (p.message !== undefined) return pick('message');
    if (p.ticketDescription !== undefined) return pick('ticketDescription').slice(0, 120);
    if (p.proposal !== undefined && typeof p.proposal === 'object') {
      const c = (p.proposal as Record<string, unknown>).command;
      if (c) return `$ ${String(c)}`;
    }
    const keys = Object.keys(p);
    return keys.length ? keys.map((k) => `${k}=${pick(k)}`).join(' ').slice(0, 120) : '';
  } catch {
    return '';
  }
}

const ACTOR_COLORS: Record<string, string> = {
  system: '#57606a',
  technician: '#0969da',
  agent: '#8250df',
  ssh: '#bc4c00',
  phoenix: '#1a7f37',
};

// The audit trail — the persisted, redacted source of truth (rubric C). Rendered
// from GET /api/runs/:id `timeline`, so it shows even if the live SSE stream is idle.
function AuditTrail({ card, timeline }: { card: React.CSSProperties; timeline: RunView['timeline'] }) {
  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>Audit trail <span style={{ color: '#666', fontWeight: 400, fontSize: 13 }}>· {timeline.length} events · redacted, append-only</span></h3>
      <div style={{ maxHeight: 300, overflow: 'auto', fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }}>
        {timeline.length === 0 && <span style={{ color: '#666' }}>No audit events yet.</span>}
        {timeline.map((e) => {
          const summary = summarizePayload(e.payload_json);
          return (
            <div key={e.id} style={{ padding: '3px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#666' }}>{new Date(e.ts).toLocaleTimeString()}</span>{' '}
              <span style={{ color: ACTOR_COLORS[e.actor] ?? '#666', fontWeight: 600 }}>{e.actor}</span>{' '}
              <span>{e.type}</span>
              {summary && <span style={{ color: '#444' }}> — {summary}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  const color = text === 'DONE' ? '#1a7f37' : text === 'PENDING' ? '#9a6700' : '#0969da';
  return <span style={{ color, fontWeight: 600 }}>{text}</span>;
}

function ApprovalCard(props: {
  card: React.CSSProperties;
  btn: React.CSSProperties;
  a: Approval;
  editCmd: string;
  setEditCmd: (v: string) => void;
  reason: string;
  setReason: (v: string) => void;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { card, btn, a, editCmd, setEditCmd, reason, setReason, busy, onApprove, onReject } = props;
  const risk = RISK_COLORS[a.risk_level] ?? '#666';
  return (
    <div style={{ ...card, borderColor: risk, borderWidth: 2 }}>
      <h3 style={{ marginTop: 0 }}>
        Approval required <span style={{ color: risk }}>· {a.risk_level}</span>
      </h3>
      <p style={{ margin: '4px 0' }}><strong>Purpose:</strong> {a.purpose}</p>
      <p style={{ margin: '4px 0' }}><strong>Expected:</strong> {a.expected_signal}</p>
      {a.safety_notes && <p style={{ margin: '4px 0', color: '#bc4c00' }}><strong>Safety:</strong> {a.safety_notes}</p>}
      <label style={{ display: 'block', fontSize: 13, color: '#666', marginTop: 8 }}>Command (editable before approving):</label>
      <textarea
        value={editCmd}
        onChange={(e) => setEditCmd(e.target.value)}
        rows={2}
        style={{ width: '100%', fontFamily: 'ui-monospace, monospace', padding: 8, boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={{ ...btn, background: '#1a7f37', color: '#fff', borderColor: '#1a7f37' }} onClick={onApprove} disabled={busy}>
          Approve &amp; run
        </button>
        <input
          placeholder="reason to reject"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ padding: 8, flex: 1, minWidth: 160 }}
        />
        <button style={{ ...btn, color: '#cf222e' }} onClick={onReject} disabled={busy}>Reject</button>
      </div>
    </div>
  );
}

function DraftPanel(props: {
  card: React.CSSProperties;
  btn: React.CSSProperties;
  draft: ActivityDraft;
  setDraft: (d: ActivityDraft) => void;
  submitted: boolean;
  busy: boolean;
  onSubmit: () => void;
}) {
  const { card, btn, draft, setDraft, submitted, busy, onSubmit } = props;
  const fields: Array<[keyof ActivityDraft, string]> = [
    ['summary', 'Summary'],
    ['root_cause', 'Root cause'],
    ['actions_taken', 'Actions taken'],
    ['commands_summary', 'Commands'],
    ['validation_result', 'Validation'],
  ];
  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>
        ERP activity {submitted && <span style={{ color: '#1a7f37' }}>· submitted ✓</span>}
      </h3>
      {fields.map(([k, label]) => (
        <div key={k} style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#666' }}>{label}</label>
          <textarea
            value={String(draft[k] ?? '')}
            rows={2}
            disabled={submitted}
            onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
      ))}
      {!submitted && (
        <button style={{ ...btn, background: '#0969da', color: '#fff', borderColor: '#0969da' }} onClick={onSubmit} disabled={busy}>
          Submit to ERP &amp; close ticket
        </button>
      )}
    </div>
  );
}
