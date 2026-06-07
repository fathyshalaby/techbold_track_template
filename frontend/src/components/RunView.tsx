import type { CustomerSystem } from "../types.js";

interface RunViewProps {
  runId: string;
  ticketTitle: string;
  customerSystem: CustomerSystem | null;
  onActivityReady: () => void;
}

export default function RunView(_props: RunViewProps) {
  return <div>Run view — coming in plan 08-04</div>;
}
