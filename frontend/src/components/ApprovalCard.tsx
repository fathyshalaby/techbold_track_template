import { useState } from "react";
import type { CommandApproval } from "../types.js";
import { approveCommand, rejectCommand } from "../api.js";
import { riskBadge } from "../utils/mappers.js";

interface ApprovalCardProps {
  approval: CommandApproval;
  runId: string;
  onDecided: () => void;
}

type Mode = "default" | "edit" | "reject";

export function ApprovalCard({ approval, runId, onDecided }: ApprovalCardProps) {
  const [mode, setMode] = useState<Mode>("default");
  const [editedCommand, setEditedCommand] = useState(approval.proposed_command);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const badge = riskBadge(approval.risk_level);

  async function handleApprove(cmd?: string) {
    setSubmitting(true);
    setError(null);
    try {
      await approveCommand(runId, approval.id, cmd);
      onDecided();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Approval failed";
      if (message.toLowerCase().includes("blocked") || message.toLowerCase().includes("safety")) {
        setError("Command blocked by safety policy — edit or reject.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    setSubmitting(true);
    setError(null);
    try {
      await rejectCommand(runId, approval.id, rejectReason);
      onDecided();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Rejection failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="approval-card">
      <div className="approval-header">Awaiting your decision</div>

      <div className="approval-command">
        <pre>{approval.proposed_command}</pre>
      </div>

      <div className="approval-meta">
        <span>
          <strong>Purpose:</strong> {approval.purpose}
        </span>
        <span>
          <strong>Expected signal:</strong> {approval.expected_signal}
        </span>
        <span className={`badge risk-badge ${badge.colorClass}`}>{badge.label}</span>
        {approval.safety_notes && (
          <span>
            <strong>Safety notes:</strong> {approval.safety_notes}
          </span>
        )}
      </div>

      {mode === "default" && (
        <div className="approval-controls">
          <button
            className="btn btn-approve"
            disabled={submitting}
            onClick={() => handleApprove()}
          >
            Approve
          </button>
          <button
            className="btn btn-edit"
            disabled={submitting}
            onClick={() => {
              setEditedCommand(approval.proposed_command);
              setMode("edit");
            }}
          >
            Edit &amp; Approve
          </button>
          <button
            className="btn btn-reject"
            disabled={submitting}
            onClick={() => setMode("reject")}
          >
            Reject
          </button>
        </div>
      )}

      {mode === "edit" && (
        <div className="approval-controls">
          <textarea
            className="edit-command-textarea"
            rows={4}
            value={editedCommand}
            onChange={(e) => setEditedCommand(e.target.value)}
          />
          <button
            className="btn btn-approve"
            disabled={submitting}
            onClick={() => handleApprove(editedCommand)}
          >
            Submit edited command
          </button>
          <button
            className="btn btn-edit"
            disabled={submitting}
            onClick={() => setMode("default")}
          >
            Cancel
          </button>
        </div>
      )}

      {mode === "reject" && (
        <div className="approval-controls">
          <textarea
            className="reject-reason-textarea"
            placeholder="Reason (required)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <button
            className="btn btn-reject"
            disabled={submitting || rejectReason.trim() === ""}
            onClick={() => handleReject()}
          >
            Confirm reject
          </button>
          <button
            className="btn btn-edit"
            disabled={submitting}
            onClick={() => setMode("default")}
          >
            Cancel
          </button>
        </div>
      )}

      {error && <div className="approval-error">{error}</div>}
    </div>
  );
}
