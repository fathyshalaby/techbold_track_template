# Training source policy

The best dataset for this adapter is approved, redacted MSP work: tickets, logs, runbooks, command/audit traces, final remediation, verification, rollback, and escalation notes.

Public datasets are secondary. Use them for coverage and style variety, not as the main specialization source.

## Approved public-source catalog

The code catalog in `msp_model.ingest_data` currently allows:

| Dataset | License | Use |
|---|---|---|
| `benjaminmacklin/IT_Support_V2` | MIT | Broad IT support phrasing; filter and down-weight. |
| `Snaseem2026/devops-incident-response` | MIT | Small incident-response seed set. |
| `ibm-research/ITBench-Lite` | Apache-2.0 | SRE/IT operations incident examples. |

Non-commercial or unclear-license data is blocked by default:

| Dataset | License | Use |
|---|---|---|
| `Tobi-Bueck/customer-support-tickets` | CC-BY-NC-4.0 | Experiments only unless legal approves. |
| Stack Exchange dumps | CC BY-SA | Legal review required before commercial adapter training. |
| Vendor documentation | Mixed/restrictive | Prefer RAG, not supervised fine-tuning data. |

## Quality target

Minimum useful dataset:

- 500 to 1,000 excellent examples for answer style and safety.
- 5,000 to 20,000 curated examples for noticeable specialization.
- 100 to 300 incident-family-separated held-out eval cases.

Each example should include:

- The ticket or customer report.
- Relevant logs and context.
- Evidence-backed diagnosis.
- Safe read-only checks first.
- Minimal remediation.
- Verification.
- Rollback or escalation.
- Metadata for source, license, approval, redaction, and privacy status.
