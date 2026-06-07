"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActivityDraft } from "@techbold/contracts";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type FieldKey = "summary" | "rootCause" | "actionsTaken" | "commandsSummary" | "validationResult";

const FIELD_CONFIG: { key: FieldKey; label: string; draftKey: keyof ActivityDraft }[] = [
  { key: "summary", label: "Summary", draftKey: "summary" },
  { key: "rootCause", label: "Root cause", draftKey: "root_cause" },
  { key: "actionsTaken", label: "Actions taken", draftKey: "actions_taken" },
  { key: "commandsSummary", label: "Commands", draftKey: "commands_summary" },
  { key: "validationResult", label: "Validation result", draftKey: "validation_result" },
];

function seedFromDraft(draft: ActivityDraft): Record<FieldKey, string> {
  return {
    summary: draft.summary ?? "",
    rootCause: draft.root_cause ?? "",
    actionsTaken: draft.actions_taken ?? "",
    commandsSummary: draft.commands_summary ?? "",
    validationResult: draft.validation_result ?? "",
  };
}

export function ResolutionArtifact({
  draft,
  readOnly,
  busy,
  onSubmit,
  onRegenerate,
}: {
  draft: ActivityDraft;
  readOnly: boolean;
  busy: boolean;
  onSubmit: (overrides: Partial<Record<FieldKey, string>>) => void;
  onRegenerate?: () => void;
}) {
  const [values, setValues] = useState(() => seedFromDraft(draft));

  useEffect(() => {
    setValues(seedFromDraft(draft));
  }, [draft]);

  const overrides = useMemo(() => {
    const seeded = seedFromDraft(draft);
    const changed: Partial<Record<FieldKey, string>> = {};
    for (const field of FIELD_CONFIG) {
      if (values[field.key] !== seeded[field.key]) {
        changed[field.key] = values[field.key];
      }
    }
    return changed;
  }, [draft, values]);

  const submitted = Boolean(draft.submitted) || readOnly;

  return (
    <div className="space-y-4">
      {submitted && (
        <p className="text-sm text-muted-foreground">Resolution submitted. Fields are read-only.</p>
      )}

      {FIELD_CONFIG.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`resolution-${field.key}`}>{field.label}</Label>
          <Textarea
            id={`resolution-${field.key}`}
            value={values[field.key]}
            readOnly={submitted}
            rows={field.key === "summary" ? 4 : 3}
            className="resize-y text-sm"
            onChange={(event) =>
              setValues((current) => ({ ...current, [field.key]: event.target.value }))
            }
          />
        </div>
      ))}

      {!submitted && (
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="button" size="sm" disabled={busy} onClick={() => onSubmit(overrides)}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              "Submit resolution"
            )}
          </Button>
          {onRegenerate && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={onRegenerate}
            >
              Regenerate draft
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
