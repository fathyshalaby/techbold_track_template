import { useState } from "react";
import type { ActivityDraft } from "../types.js";
import { submitActivity } from "../api.js";

interface ActivityViewProps {
  runId: string;
  activityDraft: ActivityDraft | null;
  onBack: () => void;
}

export default function ActivityView({ runId, activityDraft, onBack }: ActivityViewProps) {
  const [summary, setSummary] = useState(activityDraft?.summary ?? "");
  const [rootCause, setRootCause] = useState(activityDraft?.root_cause ?? "");
  const [actionsTaken, setActionsTaken] = useState(activityDraft?.actions_taken ?? "");
  const [commandsSummary, setCommandsSummary] = useState(activityDraft?.commands_summary ?? "");
  const [validationResult, setValidationResult] = useState(activityDraft?.validation_result ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = submitting || submitted;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const overrides: Partial<ActivityDraft> = {};
    if (summary) overrides.summary = summary;
    if (rootCause) overrides.root_cause = rootCause;
    if (actionsTaken) overrides.actions_taken = actionsTaken;
    if (commandsSummary) overrides.commands_summary = commandsSummary;
    if (validationResult) overrides.validation_result = validationResult;

    try {
      await submitActivity(runId, overrides);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="activity-view">
      <h2>Activity Report</h2>
      <p className="activity-subtitle">
        Review and edit the AI-generated report before submitting to Phoenix.
      </p>

      <label htmlFor="field-summary">Summary</label>
      <textarea
        id="field-summary"
        className="activity-field"
        rows={5}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        disabled={disabled}
      />

      <label htmlFor="field-root-cause">Root Cause</label>
      <textarea
        id="field-root-cause"
        className="activity-field"
        rows={5}
        value={rootCause}
        onChange={(e) => setRootCause(e.target.value)}
        disabled={disabled}
      />

      <label htmlFor="field-actions-taken">Actions Taken</label>
      <textarea
        id="field-actions-taken"
        className="activity-field"
        rows={5}
        value={actionsTaken}
        onChange={(e) => setActionsTaken(e.target.value)}
        disabled={disabled}
      />

      <label htmlFor="field-commands-summary">Commands Summary</label>
      <textarea
        id="field-commands-summary"
        className="activity-field"
        rows={5}
        value={commandsSummary}
        onChange={(e) => setCommandsSummary(e.target.value)}
        disabled={disabled}
      />

      <label htmlFor="field-validation-result">Validation Result</label>
      <textarea
        id="field-validation-result"
        className="activity-field"
        rows={5}
        value={validationResult}
        onChange={(e) => setValidationResult(e.target.value)}
        disabled={disabled}
      />

      <div className="activity-controls">
        <button className="btn btn-back" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-submit"
          onClick={handleSubmit}
          disabled={disabled}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>

      {submitted && (
        <div className="activity-success">Activity submitted successfully.</div>
      )}
      {error && <div className="activity-error">{error}</div>}
    </div>
  );
}
