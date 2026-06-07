import type { ActivityDraft } from "../types.js";

interface ActivityViewProps {
  runId: string;
  activityDraft: ActivityDraft | null;
  onBack: () => void;
}

export default function ActivityView(_props: ActivityViewProps) {
  return <div>Activity editor — coming in plan 08-05</div>;
}
