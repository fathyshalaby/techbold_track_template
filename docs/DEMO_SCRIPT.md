# Demo Script & Live-Run Guide — winning the techbold track

Rubric: **A 20 · B 35 · C 20 · D 10 · E 15**. The two biggest blocks are **B
(troubleshooting) + C (safety/audit) = 55**. "A polished UI alone will not win."
Grading is **attended / human-in-the-loop** — the rules require a human to confirm
every action, so use the **node backend** (`apps/backend`, strict per-command HITL).

---

## 0. One-time live setup (paste-and-go)

```bash
# 1. Get on the merged trunk
git checkout main && git pull

# 2. Credentials (NEVER commit — .env and *.pem are git-ignored)
cp .env.example .env
#   edit .env and set:
#     PHOENIX_API_BASE_URL=http://68.210.101.85:8000     # (already correct)
#     PHOENIX_API_TOKEN=<your Builder Base team token>
#     OPENAI_API_KEY=<your key>            # or AZURE_ENDPOINT/AZURE_API_KEY/AZURE_DEPLOYMENT, LLM_PROVIDER=azure
#     SSH_PRIVATE_KEY_PATH=/keys/case1_key.pem
#     SSH_USERNAME=azureuser
#   (MOCK_MODE must be false for a real run)

# 3. SSH keys — multi-key SSH auto-tries every key in /keys, so drop them all in:
cp tb-hackathon-ssh/tb-hackathon-ssh/case*_key.pem keys/

# 4. Run
docker compose up --build      # backend :8000, dashboard :3000
```

### Verify the live wiring (no token needed to prove reachability)
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://68.210.101.85:8000/api/v1/me   # 401 = reachable, needs token
curl -s http://localhost:8000/health                                            # {"status":"ok",...}
curl -s http://localhost:8000/api/me               | jq .                       # your technician (real token)
curl -s http://localhost:8000/api/tickets          | jq '.[].title'             # your tickets (real token)
curl -s http://localhost:8000/api/tickets/<id>/connection | jq .                # {reachable:true, latencyMs} — SSH preflight
```

---

## 1. Rehearse on the 5 practice VMs first
You have 5 case keys (`tb-hackathon-ssh/case{1..5}_key.pem`) = 5 practice incidents
(same fault families as the hidden ones: systemd lifecycle, file-ownership,
name-resolution/`/etc/hosts`, DB sequence-grant, systemd drop-in override). Run each
end-to-end once so the live demo is muscle memory. **No hardcoding** — the agent must
reason from the runbook method (grading uses fresh VMs and penalises hardcoding).

---

## 2. The winning demo (~3 minutes) — the arc that scores

| Beat | What you show | Points it earns |
|---|---|---|
| 1 | Real ticket list from Phoenix → open one (title, customer, priority, system info) | **A** + **D** |
| 2 | Agent proposes a **read-only** probe → you **approve** → it states a *root cause, not a symptom*, citing the evidence line | **B** (root cause) + **D** |
| 3 | Agent proposes a **minimal, reversible** fix (with rollback + persistence note) → approve → fixed | **B** (fix works) + **C** (minimal change) |
| 4 | Click **Reset/reboot** (`POST /api/reset`) → service **still green** → say: "persistence — most fixes die at reboot; ours survives." | **B** (fix persists) + **tiebreaker** most teams miss |
| 5 | Try a dangerous edit (`rm -rf /var/lib/postgresql`) → **safety gate blocks it live** | **C** (no dangerous commands — memorable) |
| 6 | **Activity auto-drafts from the audit trail** → submit → show the immutable audit log | **C** (audit) + **D** + **A** (activity) + **E** |

**The "wow":** beat 4 (rebooted, still green) + beat 5 (refuses a destructive command).

---

## 3. Pre-demo checklist (protects against losing)
- [ ] **No secrets in repo / screenshots / logs** — `git ls-files | grep -E '\.env$|\.pem$'` returns nothing; `.env` + keys git-ignored. *(A leak is a hard-fail / disqualification.)*
- [ ] Live run done at least once (B graded on real evidence, not mock).
- [ ] Persistence shown: validator checks `is-active` **AND** `is-enabled`, re-tested after reboot.
- [ ] README + `.env.example` present and accurate (E).
- [ ] Demo runs in **real** mode (not MOCK) — or clearly labelled if showing mock.

---

## 4. Talk track (30-second framing)
"Service-desk techs fix hidden Linux incidents under time pressure, then forget to
document them — and a wrong command can destroy customer data. Our copilot proposes
**one command at a time**, a human approves **every** action, a deterministic safety
gate blocks the dangerous ones, and the ERP activity writes **itself** from an
immutable audit trail. It fixes the incident, proves the fix **survives a reboot**,
and never leaks a secret. Built for unseen VMs — it reasons from runbooks, it doesn't
hardcode."
