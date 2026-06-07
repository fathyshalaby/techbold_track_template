import { DashboardError, DashboardShell } from "@/components/dashboard-shell";
import { MemoryVectorMap } from "@/components/memory-vector-map";
import { getDashboard, getMemory, getMemoryVectors } from "@/lib/api";

type MemoryPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  try {
    const params = await searchParams;
    const query = params.q?.trim() ?? "";
    const [dashboard, memory, vectors] = await Promise.all([
      getDashboard(),
      getMemory(),
      getMemoryVectors(query),
    ]);

    const stats = memory.stats ?? dashboard.memory.stats;

    return (
      <DashboardShell title="Memory" sourceLabel={undefined} healthLabel={dashboard.health.status}>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
          <p className="text-sm text-muted-foreground">
            Vector recall of past incidents, runbooks, and public troubleshooting knowledge.
          </p>
        </div>

        <MemoryVectorMap
          points={vectors.points}
          stats={stats ?? null}
          available={memory.available}
          message={dashboard.memory.message}
          initialQuery={query}
        />
      </DashboardShell>
    );
  } catch {
    return <DashboardError />;
  }
}
