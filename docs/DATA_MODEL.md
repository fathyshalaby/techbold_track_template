# Data Model - Sphinx

The persistence layer: what the backend stores, why, and the invariants that make it trustworthy. The store is the **source of truth for the activity report** (rubric B forbids invented actions) and the **artefact the judge inspects** (rubric C). Documented from the implemented schema in `backend/src/store/schema.ts`.

- **Engine:** SQLite via `better-sqlite3` (synchronous, single file), with a **JSONL fallback** (`store/db.ts`) if SQLite is unavailable - audit durability is the one hard requirement.
- **Validation:** every row shape is a **Zod schema** (`.strict()`), so reads/writes are type-checked and round-trip safely between SQLite and JSONL.
- **IDs:** ULIDs (sortable, time-ordered) with type prefixes - `run_…`, `ev_…`, `appr_…`.
- **Timestamps:** ISO-8601 UTC strings.
- **Invariant:** the audit log is **append-only - there is no delete path** anywhere in the store. Deleting audit history is itself a rubric hard-fail, so the code simply does not offer it.

---

## Tables

### `runs` - one row per troubleshooting run

| Column                      | Type      | Notes                                                                          |
| --------------------------- | --------- | ------------------------------------------------------------------------------ |
| `id`                        | TEXT PK   | `run_<ulid>`                                                                   |
| `ticket_id`                 | INTEGER   | the Phoenix ticket being worked                                                |
| `customer_system_id`        | TEXT      | `ip:port` (no secrets)                                                         |
| `status`                    | TEXT enum | `CREATED \| RUNNING \| COMPLETED \| FAILED \| ABORTED`                         |
| `current_phase`             | TEXT enum | `CREATED \| ANALYSIS \| DIAGNOSIS \| FIX \| VALIDATION \| REPORT \| COMPLETED` |
| `started_at` / `updated_at` | TEXT      | lifecycle timestamps                                                           |
| `completed_at`              | TEXT?     | set on terminal success                                                        |
| `error_message`             | TEXT?     | set on `FAILED`                                                                |

> **Honest note - two levels of "phase".** The persisted `current_phase` enum above is deliberately **coarse** (7 stable buckets). The conceptual state machine in [ARCHITECTURE.md section 4](ARCHITECTURE.md) is **finer** (`TRIAGING`, `WAITING_FOR_APPROVAL`, `EXECUTING_COMMAND`, `OBSERVING`, …). The orchestrator drives the fine-grained machine in memory and maps to the coarse, durable `current_phase` for storage and UI. This keeps the stored state simple and restart-safe while the runtime stays expressive.

### `audit_events` - append-only event log (the spine)

| Column         | Type      | Notes                                                                                  |
| -------------- | --------- | -------------------------------------------------------------------------------------- |
| `id`           | TEXT PK   | `ev_<ulid>`                                                                            |
| `run_id`       | TEXT FK   |                                                                                        |
| `type`         | TEXT      | **equals the SSE event type** (see [API.md](API.md)) - one taxonomy for stream + audit |
| `actor`        | TEXT enum | `system \| technician \| agent \| phoenix \| ssh` - who caused it                      |
| `ts`           | TEXT      |                                                                                        |
| `payload_json` | TEXT      | the event payload, **redacted before write**                                           |

Every meaningful side-effect emits one audit event _and_ one SSE event with the same `type` - so the live timeline and the permanent record can never diverge.

### `command_approvals` - the decision record for every proposed command

| Column                                      | Type      | Notes                                                                          |
| ------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `id`                                        | TEXT PK   | `appr_<ulid>`                                                                  |
| `run_id`                                    | TEXT FK   |                                                                                |
| `proposed_command`                          | TEXT      | verbatim, as the model proposed it                                             |
| `edited_command`                            | TEXT?     | null unless the technician edited                                              |
| `final_command`                             | TEXT?     | what actually ran (post-edit) - null if blocked/rejected                       |
| `purpose` / `expected_signal`               | TEXT      | the model's rationale (why + what would confirm/deny)                          |
| `risk_level`                                | TEXT enum | `SAFE_READ_ONLY \| LOW_RISK_CHANGE \| MEDIUM_RISK_CHANGE \| HIGH_RISK_BLOCKED` |
| `safety_notes`                              | TEXT      | classifier notes                                                               |
| `status`                                    | TEXT enum | `PENDING → APPROVED \| REJECTED \| EXECUTED \| BLOCKED`                        |
| `technician_reason`                         | TEXT?     | reason on edit/reject                                                          |
| `created_at` / `decided_at` / `executed_at` | TEXT(?)   | proposed → decided → executed                                                  |

This single row captures the **entire human-control story** for one command: what was proposed, what the human did, what ran, and how it was classified - exactly what rubric C inspects.

### `command_results` - what the SSH execution returned

| Column                                | Type    | Notes                                           |
| ------------------------------------- | ------- | ----------------------------------------------- |
| `id` / `run_id` / `approval_id`       | TEXT    | links the result to its approval                |
| `command`                             | TEXT    | the executed command                            |
| `exit_code`                           | INTEGER | **exit code is truth** (stderr ≠ failure)       |
| `stdout_redacted` / `stderr_redacted` | TEXT    | capped (≈16 KB) **and** redacted before storage |
| `duration_ms`                         | INTEGER |                                                 |
| `timed_out`                           | INTEGER | 0/1                                             |
| `created_at`                          | TEXT    |                                                 |

### `observations` - model-readable, redacted summaries

| Column          | Type      | Notes                                             |
| --------------- | --------- | ------------------------------------------------- |
| `id` / `run_id` | TEXT      |                                                   |
| `source`        | TEXT enum | `ssh \| phoenix \| agent \| technician`           |
| `content`       | TEXT      | redacted summary the agent reads on the next turn |
| `created_at`    | TEXT      |                                                   |

The agent reads `observations` + `command_results` + the ticket - **never raw secrets** (redaction happens before write).

### `activity_drafts` - the ERP report, built from the audit trail

| Column                                                                                | Type    | Notes                   |
| ------------------------------------------------------------------------------------- | ------- | ----------------------- |
| `id` / `run_id`                                                                       | TEXT    |                         |
| `summary` / `root_cause` / `actions_taken` / `commands_summary` / `validation_result` | TEXT    | **the 5 graded fields** |
| `submitted`                                                                           | INTEGER | 0/1                     |
| `created_at` / `submitted_at`                                                         | TEXT(?) |                         |

The activity writer reads **only** `command_results` + `observations` + the approvals - so every field traces to a real, recorded fact.

---

## How the tables relate

```
ticket (Phoenix)
   │ 1
   ▼
 runs ──1:N──▶ audit_events            (the full timeline; type == SSE type)
   │
   ├──1:N──▶ command_approvals ──1:1──▶ command_results
   │                                        │
   ├──1:N──▶ observations  ◀────redacted────┘   (results summarised into observations)
   │
   └──1:1──▶ activity_drafts            (generated from results + observations only)
```

## Write path & redaction (the safety-critical part)

Every string crossing into the store passes `safety/redaction.ts` first. The order for one executed command:

1. `command_approvals` row created `PENDING` at proposal → audit `command.proposed` / `approval.required`.
2. On approve: status → `APPROVED`, `final_command` set; safety re-check on the final command (a dangerous edit → `BLOCKED`, never executed).
3. SSH runs the command → raw output captured, **capped, then redacted** → `command_results` row + a redacted `observations` summary → audit `command.completed` / `observation.added`.
4. The model only ever sees the redacted `observations`/`command_results` - never raw output.

Because (a) redaction runs before any persistence, (b) the log is append-only, and (c) the activity reads only from the log, the system cannot store a secret, cannot hide an action, and cannot report an action that did not happen.

---

_Companions: [ARCHITECTURE.md section 6](ARCHITECTURE.md) (the original schema sketch) · [SAFETY_POLICY.md section 6-7](SAFETY_POLICY.md) (redaction + the mandatory audit record) · [API.md](API.md) (how this surfaces over HTTP/SSE)._
