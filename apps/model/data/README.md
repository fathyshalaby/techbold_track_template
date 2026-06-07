# Data drop zone

Put only approved, redacted JSONL training files in:

```text
data/source/*.jsonl
```

Run:

```bash
make data
```

Generated files appear in `data/processed/` and are ignored by git.

Do not commit raw datasets, private tickets, logs containing secrets, or generated processed datasets.
If a record contains private or unredacted data, fix it outside this repository before placing it in `data/source/`.

Schema per line:

```json
{
  "messages": [
    {"role": "system", "content": "You are a careful MSP support engineer."},
    {"role": "user", "content": "Ticket/logs/question..."},
    {"role": "assistant", "content": "Diagnosis, evidence, checks, remediation, verification..."}
  ],
  "meta": {
    "source": "internal_redacted_or_public_source_name",
    "license": "license_or_internal_approval_reference",
    "approved_for_training": true,
    "contains_private_data": false,
    "redacted": true
  }
}
```

Validation rejects records when:

- `messages` is missing, empty, or does not end with an assistant answer.
- `meta.approved_for_training` is not exactly `true`.
- `meta.contains_private_data` is not exactly `false`.
- `meta.redacted` is not exactly `true`.
- `meta.source` or `meta.license` is missing.
