# Phase 2: Browser SSE UAT - UI Design Contract

## Purpose

Validate the current technician workspace in the browser. This contract preserves the existing operational UI and limits changes to UAT blockers found during the phase.

## Locked Surface

- Entry path: `frontend/src/main.tsx` mounting `frontend/src/App.tsx`.
- Main views: ticket list, run view, approval card, audit trail, live events panel, and activity draft panel.
- Primary controls: `Start run`, `Advance agent (/next)`, `Approve & run`, `Reject`, `Draft activity`, `Submit to ERP & close ticket`, `Abort`, and `Back to tickets`.
- Primary evidence areas: run phase/status line, audit trail event count and rows, live events panel rows, approval command textarea, and activity draft fields.

## Visual Contract

- Keep the existing quiet operational layout during validation.
- Do not introduce a new palette, new navigation structure, marketing content, or decorative elements.
- Preserve readable button labels and dense but scannable cards.
- If a UAT fix is needed, prefer the smallest text, state, or handler correction that makes the primary path observable.

## Interaction Contract

- Starting a run must replace the ticket list with the run view.
- Advancing the agent must update run phase/status and either produce a pending approval, continue the workflow, or show a clear error.
- Approving a command must execute through the backend approval path and refresh run state.
- Live SSE events must appear without manual page refresh while the EventSource remains open.
- Activity draft and submit controls must remain technician-controlled.

## Copy Contract

- Keep operator-facing copy factual and short.
- Do not claim real Phoenix, SSH, or LLM validation in this phase.
- Error text should expose the failing boundary without leaking secrets.

## Accessibility Contract

- Existing native buttons, inputs, and textareas remain keyboard-reachable.
- Browser UAT should use visible control names where practical.
- Any added control must have visible text or a native label.

## Out of Scope

- Redesigning the UI.
- Adding dashboards, charts, auth, or new product features.
- Automated test implementation, except for temporary browser checks used as UAT evidence.
