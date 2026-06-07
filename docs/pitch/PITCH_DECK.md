---
marp: true
paginate: true
size: 16:9
title: "Service Desk Autopilot — techbold START Hack Vienna '26"
author: "Service Desk Autopilot team"
description: "A technician-controlled AI that diagnoses, fixes, and documents Linux service incidents — safely, auditably, and never on its own."
math: false
style: |
  :root {
    --bg: #0B1220;
    --bg-soft: #0F1A2E;
    --ink: #0F172A;
    --paper: #FFFFFF;
    --paper-soft: #F1F5F9;
    --muted: #5B6B85;
    --line: #E2E8F0;
    --brand: #3B82F6;
    --brand-2: #22D3EE;
    --ok: #10B981;
    --warn: #F59E0B;
    --danger: #EF4444;
    --violet: #8B5CF6;
  }
  section {
    font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 26px;
    line-height: 1.45;
    color: var(--ink);
    background: var(--paper);
    padding: 56px 68px;
  }
  h1 { font-size: 50px; color: var(--ink); letter-spacing: -0.02em; margin: 0 0 12px; }
  h2 { font-size: 38px; color: var(--ink); letter-spacing: -0.01em; margin: 0 0 18px; border-bottom: 3px solid var(--brand); padding-bottom: 10px; }
  h3 { font-size: 27px; color: var(--brand); margin: 6px 0; }
  strong { color: var(--ink); }
  a { color: var(--brand); }
  code { background: var(--paper-soft); padding: 1px 7px; border-radius: 6px; font-size: 0.86em; color: #0B3D91; }
  ul, ol { margin: 6px 0; }
  li { margin: 7px 0; }
  table { font-size: 22px; border-collapse: collapse; width: 100%; }
  th { background: var(--bg-soft); color: #fff; text-align: left; padding: 9px 12px; }
  td { border-bottom: 1px solid var(--line); padding: 9px 12px; vertical-align: top; }
  blockquote { border-left: 5px solid var(--brand); background: var(--paper-soft); margin: 10px 0; padding: 12px 20px; font-size: 0.95em; color: #243049; }
  footer { color: var(--muted); font-size: 14px; }
  header { color: var(--muted); font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; }
  section::after { color: var(--muted); font-size: 15px; }

  /* ---------- Dark section dividers ---------- */
  section.lead, section.section, section.close {
    background: radial-gradient(1200px 600px at 78% -10%, #16284A 0%, var(--bg) 55%);
    color: #E6EEFC;
  }
  section.lead h1, section.section h1, section.close h1 { color: #fff; font-size: 56px; }
  section.lead h2, section.section h2, section.close h2 { color: #fff; border: none; }
  section.lead h3, section.section h3, section.close h3 { color: var(--brand-2); }
  section.lead strong, section.section strong, section.close strong { color: #fff; }
  section.lead a, section.close a { color: var(--brand-2); }
  .kicker { color: var(--brand-2); font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; font-size: 16px; }
  .tagline { font-size: 30px; color: #C7D6F5; line-height: 1.35; margin-top: 6px; }
  .byline { color: #93A8CE; font-size: 19px; margin-top: 26px; }

  /* ---------- Reusable building blocks ---------- */
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .card { background: var(--paper-soft); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; }
  .card.dark { background: #142440; border-color: #21365C; color: #E6EEFC; }
  .card h3 { margin-top: 0; }
  .pill { display: inline-block; border-radius: 999px; padding: 3px 12px; font-size: 16px; font-weight: 700; }
  .pill.ok { background: rgba(16,185,129,.14); color: #047857; }
  .pill.warn { background: rgba(245,158,11,.16); color: #B45309; }
  .pill.danger { background: rgba(239,68,68,.14); color: #B91C1C; }
  .pill.brand { background: rgba(59,130,246,.14); color: #1D4ED8; }
  .big { font-size: 64px; font-weight: 800; line-height: 1; color: var(--brand); }
  .small { font-size: 18px; color: var(--muted); }
  .flow { font-family: "JetBrains Mono", "SF Mono", Consolas, monospace; font-size: 19px; background: var(--bg-soft); color: #DCEAFF; border-radius: 12px; padding: 16px 18px; line-height: 1.7; }
  .flow .b { color: var(--brand-2); }
  .flow .g { color: #6EE7B7; }
  .flow .r { color: #FCA5A5; }
  .rule { color: var(--danger); font-weight: 700; }
  .center { text-align: center; }
---

<!-- _class: lead -->
<!-- _paginate: false -->

<span class="kicker">techbold START Hack · Vienna '26 · Service Desk track</span>

# Service Desk Autopilot

<p class="tagline">A technician-controlled AI that <strong>diagnoses, fixes, and documents</strong> Linux service incidents — safely, auditably, and <strong>never on its own.</strong></p>

<p class="byline">The AI proposes one command at a time. A human approves every action. A deterministic backend executes. The model can't touch the VM.</p>

<!--
Speaker (0:00–0:25): "Service desk technicians spend their day SSH-ing into customer Linux boxes to fix incidents they've never seen — under time pressure, often without writing it down. We built an AI copilot that makes that fast AND safe, where a human stays in control of every single command. The headline: our AI literally cannot run anything on the VM. It proposes; the human approves; a deterministic backend executes."
-->

---

## The job, today

<div class="grid2">
<div>

A technician picks up a ticket:

> *"The status API is **sometimes** down."*

They SSH into the customer's Linux VM, poke around, guess, fix something, and — **if they remember** — write it up in the ERP.

</div>
<div class="card">

**Four problems, every ticket:**

1. The ticket is a **symptom** — the root cause is hidden on the box.
2. Manual SSH under time pressure is **slow and easy to get wrong**.
3. The write-up is an afterthought — yet it's what the business **keeps**.
4. **No audit trail** of what ran on a customer system → a trust & compliance gap.

</div>
</div>

<!--
Speaker (0:25–0:55): "Here's the reality. Tickets describe symptoms, not causes. Manual troubleshooting under pressure is where mistakes happen. The documentation — the thing the business actually keeps and bills against — is rushed or missing. And there's usually no record of what a technician ran on a customer's machine. That last one is a real liability."
-->

---

## Why this is hard — and risky

<div class="grid3">
<div class="card">
<div class="big" style="color:var(--danger)">1×</div>

A single mistyped `rm -rf` deletes a **customer database**. No undo.

</div>
<div class="card">
<div class="big" style="color:var(--warn)">∞</div>

An undocumented fix **can't be repeated** the next time the same incident appears.

</div>
<div class="card">
<div class="big">?</div>

A "fix" that passes once but **dies on reboot** isn't a fix — it's a callback.

</div>
</div>

<br>

> Speed without control is dangerous. Control without speed is the status quo. **We need both — with a paper trail.**

<!--
Speaker (0:55–1:20): "And the stakes are high. One wrong recursive delete and a customer's data is gone. A fix nobody documented gets re-solved from scratch next week. A fix that doesn't survive a reboot just generates another ticket. The challenge isn't 'make the AI smart' — it's make it fast, safe, durable, and accountable, all at once."
-->

---

<!-- _class: section -->

# The solution

## A controlled, human-in-the-loop run

<span class="kicker">load → propose → approve → execute → observe → fix → validate → document</span>

<!--
Speaker (1:20–1:30): "So here's what we built — Service Desk Autopilot turns that messy manual process into one controlled loop."
-->

---

## One loop, the human in command

<div class="flow">
load ticket + SSH target from <span class="b">Phoenix ERP</span><br>
&nbsp;&nbsp;→ AI proposes <span class="b">ONE</span> command (purpose · expected signal · risk)<br>
&nbsp;&nbsp;→ <span class="r">safety layer</span> classifies / blocks <span class="small">(deterministic, before execution)</span><br>
&nbsp;&nbsp;→ technician <span class="g">approves / edits / rejects</span><br>
&nbsp;&nbsp;→ backend executes over <span class="b">SSH</span> <span class="small">(timeout · output cap · redaction)</span><br>
&nbsp;&nbsp;→ observe → repeat until root cause<br>
&nbsp;&nbsp;→ propose <span class="g">minimal, reversible</span> fix → approve → execute<br>
&nbsp;&nbsp;→ <span class="b">validate</span> (re-run the benefit test, check it survives a reboot)<br>
&nbsp;&nbsp;→ draft ERP activity <span class="g">from the audit trail only</span> → human edits → submit
</div>

<div class="grid2" style="margin-top:14px">
<div><strong>The backend owns:</strong> state, safety, approval gating, SSH execution, audit, ERP writes.</div>
<div><strong>The AI owns:</strong> proposing commands, interpreting output, drafting prose. <em>That separation is the whole product.</em></div>
</div>

<!--
Speaker (1:30–2:05): "The loop: we load the ticket and SSH target from the Phoenix ERP. The AI proposes exactly one command — with its purpose, the signal it expects, and a risk level. Our safety layer classifies it before anything runs. The technician approves, edits, or rejects. Only then does the backend execute it over SSH, with timeouts and redaction. We observe, iterate to the root cause, propose a minimal reversible fix, validate it survives a reboot, and finally draft the ERP report — built only from what actually happened — for the technician to submit."
-->

---

## The crux: the model can't touch the VM

<div class="grid2">
<div class="card dark">

### AI side (proposes)

`proposeSshCommand` — a tool with **no `execute`**.

The model emits a structured proposal and stops. It has **no code path to the shell**.

</div>
<div class="card dark">

### Backend side (executes)

`executeApprovedCommand` — backend-only, **never registered as a model tool**.

Runs only after **human approval** and a **safety re-check**.

</div>
</div>

<br>

> Every command passes the safety gate **twice** — once when proposed, once again after any human edit (humans can paste danger too). This is stronger than "ask for confirmation": the model is **architecturally** incapable of execution.

<!--
Speaker (2:05–2:30): "This is the part I want judges to remember. The AI's only shell tool is 'propose'. It has no execute function — there is no line of code that lets the model run a command. Execution lives in the backend and runs only after a human approves and the command passes our safety check a SECOND time, in case the human edited it into something dangerous. This isn't a confirmation dialog you can bypass — the model is architecturally unable to act."
-->

---

## Differentiator 1 — Diagnosis-first, with ranked hypotheses

The brief's own *"what great looks like."* The agent doesn't fish — it shows a **ranked list of root-cause hypotheses, each with the evidence**, then runs the single **most discriminating** read-only probe.

<div class="card">

```jsonc
{ "hypotheses": [
    { "rootCause": "status-api unit failed on a stale PID/port bind", "confidence": 0.6,
      "evidence": ["ticket: 'intermittently unavailable'", "service-class symptom, not network"] },
    { "rootCause": "disk full — service can't write",                 "confidence": 0.25,
      "evidence": ["intermittent failures can signal transient resource exhaustion"] } ],
  "command": "systemctl status status-api --no-pager",
  "purpose": "Confirm whether the service is active and why it last failed.",
  "expectedSignal": "active(running)=healthy; failed/inactive=down → read its journal next.",
  "isReadOnly": true }
```

</div>

The technician sees the *reasoning*, not just a command — and picks the path. **Trust + explainability the human jury rewards.**

<!--
Speaker (2:30–2:55): "Differentiator one — and this is straight from the brief's 'what great looks like': the agent is diagnosis-first. It doesn't spray commands. It produces ranked root-cause hypotheses, each backed by the evidence it's seen, then picks the single most informative read-only probe to confirm the top one. The technician sees the reasoning and chooses the path. That explainability is exactly what a human jury rewards — and it minimizes commands, which is a tie-breaker."
-->

---

## Differentiator 2 — Safety that hard-fails *by design*

<div class="grid2">
<div>

A **deterministic** gate runs before any execution — not a prompt, real code:

- **Blocklist** → `rm -rf /`, `chmod -R 777 /`, `DROP DATABASE`, disabling the firewall, clearing logs, secret exfiltration… → **never reach an approval card.**
- **4-tier risk classifier** → `SAFE_READ_ONLY` · `LOW` · `MEDIUM` · `HIGH_RISK_BLOCKED`. The LLM may only **raise** risk, never lower it.
- **Secret redaction** on every string before it hits the audit log, the UI, or the model.

</div>
<div class="card">

### Status: built & proven

<span class="pill ok">585 tests passing</span>

Obfuscation variants (`chmod -R 777 ${HOME}`, padded whitespace, quote tricks) are **still blocked**. Targeted ops (`chown azureuser /srv/app/uploads`) are correctly **allowed** with approval.

<span class="pill brand">safety/ · store/audit · phoenix/</span> are real, tested code today.

</div>
</div>

<!--
Speaker (2:55–3:20): "Differentiator two — safety. The rubric has 'hard fails' that zero an incident: deleting a database, chmod 777 on root, disabling the firewall, leaking secrets. Our defense is deterministic code, not a polite prompt. A blocklist catches those patterns — including obfuscated variants — before they ever reach a human to approve. A four-tier classifier ranks everything else, and the model can only raise risk, never lower it. Secrets are redacted everywhere. And this isn't a slide promise — the safety layer and audit store are built and green across 585 tests right now."
-->

---

## Differentiator 3 — The report is built from the audit log, *not hallucinated*

<div class="grid2">
<div>

Every proposed / approved / rejected / executed command is written to an **append-only audit log** — with rationale, risk level, decision, exit code, redacted output, and timestamps.

The **activity report is generated from that log only.** Point at any claim in the report and trace it to a real command result.

**Never invent** a file path, a service name, or a fix that wasn't observed.

</div>
<div class="card">

### The 5 graded activity fields
- `summary` — what was restored
- `root_cause` — the **technical cause**, not the symptom
- `actions_taken` — diagnosis + fix, in order
- `commands_summary` — command classes, **no secrets**
- `validation_result` — **concrete proof** the benefit is back

<div class="small">Deleting audit history is itself a hard-fail — so the log is append-only, by design.</div>

</div>
</div>

<!--
Speaker (3:20–3:40): "Differentiator three — the documentation. Every command and decision goes into an append-only audit log. The final ERP report is generated only from that log — so every sentence traces back to a real command result. The agent never invents a service name or a fix it didn't actually verify. And because hiding your tracks is a hard-fail, the log is append-only by design."
-->

---

## Differentiator 4 — It generalises (no hardcoding)

Grading runs on **fresh VMs we've never seen.** Hardcoding loses. So when no runbook matches, the agent falls back to a **first-principles method** that works for *any* local Linux service fault:

<div class="grid2">
<div class="card">

**1 · Ground-truth sweep** (one read-only batch)
failed units · recent journal errors · listeners · disk/inode/mem · *what changed* · the broken benefit test.

**2 · Localize the failing layer**
`benefit → port → unit → process → config/deps → resource → recent change`.

</div>
<div class="card">

**3 · Follow the chain inward**
harvest the system's own error channels: `systemctl status` → `journalctl` → config test (`nginx -t`) → config → perms → resource.

**4 · Hypothesize *from* evidence**, confirm, then act. **No fix on an unconfirmed cause.**

</div>
</div>

> Every discovery step is read-only and evidence-gated — so an unknown error can never push the agent into a fabricated or unsafe action. We tuned against our 5 practice VMs via the reset endpoint; **nothing is keyed to them.**

<!--
Speaker (3:40–4:00): "Differentiator four — generalization. Grading happens on fresh VMs, so anything hardcoded fails. When the agent hits something it doesn't recognize, it runs a first-principles method: a read-only ground-truth sweep, localize the broken layer, follow the causal chain inward using the system's own error channels, and only then form a hypothesis from evidence and confirm it before touching anything. It's safe precisely because discovery is entirely read-only."
-->

---

## Architecture — a deterministic state machine, AI in the seams

<div class="flow">
Frontend (React) ─▶ <span class="b">Hono routes</span> ─▶ <span class="b">Orchestrator</span> (the state machine — owns truth)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br>
&nbsp;&nbsp;┌──────────────┬──────────────┼──────────────┬──────────────┐<br>
&nbsp;&nbsp;▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br>
<span class="g">AI agents</span>&nbsp;&nbsp;&nbsp;<span class="r">Safety</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="b">Audit store</span>&nbsp;&nbsp;<span class="b">SSH exec</span>&nbsp;&nbsp;&nbsp;<span class="b">Phoenix</span><br>
(propose only)&nbsp;(gate)&nbsp;&nbsp;(append-only)&nbsp;(1 cmd)&nbsp;&nbsp;(ERP client)
</div>

<div class="grid2" style="margin-top:12px">
<div>

**The state machine is the skeleton** — it owns transitions, approvals, execution, and audit. **The AI is the muscle** in specific states. The model can be *wrong* without being *dangerous*, because it never holds the execute tool.

</div>
<div>

<strong>Stack:</strong> Node 22 · <strong>Hono</strong> + TypeScript · <strong>Vercel AI SDK</strong> · <strong>Zod</strong> everywhere · <strong>ssh2</strong> · <strong>better-sqlite3</strong> (JSONL fallback) · SSE for live events · Vitest.

<span class="pill brand">One language, shared Zod types, end to end.</span>

</div>
</div>

<!--
Speaker (4:00–4:20 — for the longer cut / leave-behind): "Architecturally: a deterministic state machine owns truth — every transition, approval, execution, and audit write. The AI is invoked only in specific states to propose and interpret. Stack is Node, Hono, the Vercel AI SDK, Zod for shared types end-to-end, ssh2, and SQLite for a durable audit log. The folder structure mirrors the rubric's named modules verbatim — a judge reading src/ sees the rubric."
-->

---

## The human leads — the AI assists

Beyond approve / edit / reject on **every** command:

<div class="grid3">
<div class="card">

**Run your own command**
Type a command directly — same safety, redaction, and audit path. Unstick or override the agent any time.

</div>
<div class="card">

**Ask & answer**
The agent raises targeted questions (*"need sudo?"*, *"OK to restart X — 4 active connections?"*) instead of guessing.

</div>
<div class="card">

**Undo · Abort · Plan-approval**
One-click revert via the captured rollback. Read-only batches approve as one reviewable plan; every mutation stays its own gate.

</div>
</div>

<br>

> **Blast-radius before a restart:** the approval card shows dependents and active connections. **Idempotency & dry-run:** probe state and `nginx -t` *before* mutating. The technician is the operator — not a button.

<!--
Speaker: "Human control is a first-class surface, not a confirm button. The technician can run their own command through the same safety path, the agent asks rather than guesses, and there's always one-click undo and abort. Before any restart we show blast radius — dependents and active connections — on the approval card."
-->

---

## How we win the rubric — 55 of 100 points are B + C

| Block | Pts | What it checks | Our design response |
|---|--:|---|---|
| **A** ERP & MVP | 20 | load tickets, usable list, sort/filter, customer-system, **complete** activity, survive 401/404/empty | Typed Phoenix client + mock; explicit empty/error states; all 5 activity fields always filled |
| **B** Troubleshooting | 35 | 5 hidden incidents ×7 on fresh VMs: root cause, fix works, **persists**, no regression, summary | Generalising diagnosis-first agent; reboot-safe fixes; minimal-change bias; honest validation |
| **C** Safety & audit | 20 | full audit trail, no blanket commands, secret protection, minimal change, human control. **Hard-fails zero the incident.** | Deterministic gate **before** execution; mandatory approval; redaction; append-only audit |
| **D** Technician UX | 10 | overview, detail, visible progress, followable logs, retry/abort | One ticket list + one run page, live SSE timeline, approval card |
| **E** Engineering | 15 | clean separated modules, real README, runnable tests, error handling/timeouts/retries, sane secrets | Modules mirror the rubric; **585 tests**; mock Phoenix + mock SSH; `.env.example`, keys git-ignored |

<div class="center" style="margin-top:6px"><strong>Tie-breakers:</strong> higher B → higher C → most incidents 7/7 → fewer safety flags → <strong>fewer commands</strong> → shorter time. <span class="small">Our loop is built for exactly this order.</span></div>

<!--
Speaker (4:20–4:45): "And we built to the rubric deliberately. 55 of the 100 points are troubleshooting and safety — so that's where the product's weight is. A polished UI alone doesn't win; solving hidden incidents safely and auditably does. Even the tie-breakers — fewest commands, fewest safety flags — are designed into the loop: diagnosis-first means fewer commands, and the deterministic gate means zero safety flags."
-->

---

## What's real today

<div class="grid2">
<div>

<span class="pill ok">Built & tested · 585 green</span>

- **Zod-validated env** — fails fast on missing config
- **Phoenix ERP client** — auth, retry-on-5xx, timeouts, typed errors (401/404/422), + in-memory mock
- **Safety layer** — blocklist, 4-tier classifier, redaction (the C-category crown jewel)
- **Append-only audit store** — SQLite + JSONL fallback
- **Ticket routes** — list, detail, customer-system, sort/filter

</div>
<div>

<span class="pill warn">Built + tested</span>

- **SSH executor** (`bash -lc`, `sudo -n`, output cap)
- **Agent loop + orchestrator** (the 5 roles)
- **Run API + approvals + SSE**
- **Activity generation** from the audit trail
- **Frontend** workspace

<div class="small" style="margin-top:14px">We built the <strong>hard, point-bearing foundation first</strong> — safety, audit, and the ERP contract — then layer the loop on top. The risky part is done.</div>

</div>
</div>

<!--
Speaker (only in the engineering/Q&A cut): "Where we are: the foundation that actually carries the points — the safety layer, the append-only audit store, and the ERP client — is built and green across 585 tests. The SSH executor, agent loop, run API, and UI are built and covered by the 585-test suite. We deliberately built the hard, point-bearing part first. Mock mode lets the entire loop run offline so the demo can't hard-fail on flaky Wi-Fi."
-->

---

## What we'll show you live

<div class="grid2">
<div>

1. **Load a ticket** from Phoenix → open a run → see the SSH target.
2. **Ranked hypotheses** appear with evidence; approve the most discriminating read-only probe.
3. **Try to break it:** paste `rm -rf /` → it's **blocked before any approval card**.
4. **Edit a command** in the approval card → watch the safety re-check fire.

</div>
<div>

5. **Diagnose → minimal fix → validate** the customer benefit, then **re-check after a restart** (persistence is graded).
6. **Open the audit log** — every command, decision, exit code, redacted output.
7. **The activity drafts itself** from that log; point at a claim, trace it to a command.
8. **Submit** → ticket `DONE`.

</div>
</div>

<div class="center" style="margin-top:8px"><span class="pill brand">Mock mode is first-class</span> &nbsp; the whole loop runs offline — the demo survives flaky Wi-Fi and VM reboots.</div>

<!--
Speaker (4:45–5:10, demo handoff): "Live, we'll load a real ticket, watch the ranked hypotheses, and approve a probe. Then we'll try to paste 'rm -rf slash' — and watch it get blocked before it ever reaches a human. We'll edit a command and see the safety check re-fire. We'll fix the incident, validate it survives a restart, open the full audit log, and watch the ERP report write itself from that log. Everything runs in mock mode too, so the demo can't die on bad Wi-Fi."
-->

---

<!-- _class: close -->

## Why Service Desk Autopilot wins

<div class="grid2">
<div>

1. **The AI can't act on its own** — propose / approve / execute is split in code.
2. **Hard-fails are blocked before they run** — deterministic, tested.
3. **Diagnosis-first** — ranked hypotheses + evidence (the brief's own bar).
4. **The report is the audit log** — nothing invented.
5. **It generalises** — no incident hardcoded.

</div>
<div>

<div class="big" style="color:var(--brand-2)">55/100</div>
<p style="color:#C7D6F5">are B + C — troubleshooting & safety. <strong>That's where we put the product.</strong></p>

<p class="byline" style="margin-top:30px">Build us a technician that never forgets to write it down — and never reaches for <code style="color:#FCA5A5;background:#22132a">rm&nbsp;-rf</code> by accident.</p>

</div>
</div>

<p class="byline">MIT-licensed · <code>docker compose up</code> · mock mode offline · 585 tests green</p>

<!--
Speaker (5:10–5:30, close): "To close: the AI can't act on its own, dangerous commands are blocked before they run, diagnosis is evidence-first, the report is the audit log, and nothing is hardcoded. Fifty-five of a hundred points are troubleshooting and safety — and that's exactly where we put the product. Thank you."
-->
