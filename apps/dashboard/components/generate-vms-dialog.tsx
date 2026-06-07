"use client";

import { IconLoader2, IconServer } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateVms } from "@/lib/api";

const ARCHETYPES = [
  { id: "service-health", label: "Service health" },
  { id: "document-upload", label: "Document upload" },
  { id: "partner-sync", label: "Partner sync" },
  { id: "erp-write-path", label: "ERP write path" },
  { id: "monitoring-data", label: "Monitoring data" },
] as const;

export function GenerateVmsDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState("3");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onGenerate() {
    const parsed = Number.parseInt(count, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
      setError("Count must be between 1 and 10.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const archetypes = selected.size > 0 ? [...selected] : undefined;
      const result = await generateVms({ count: parsed, archetypes, randomize: true });
      router.refresh();
      if (result.errors.length > 0) {
        const detail = result.errors[0]?.error ?? "unknown error";
        setError(
          `Created ${result.created.length} of ${parsed}. ${result.errors.length} failed: ${detail}`,
        );
        return;
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function toggleArchetype(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <IconServer />
        Generate practice VMs
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate practice VMs</DialogTitle>
          <DialogDescription>
            Build customer Linux VMs with injected faults. Each VM appears as a new ticket.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vm-count">Number of VMs</Label>
            <Input
              id="vm-count"
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Fault families (optional)</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {ARCHETYPES.map((archetype) => (
                <label
                  key={archetype.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(archetype.id)}
                    onChange={() => toggleArchetype(archetype.id)}
                  />
                  {archetype.label}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Leave all unchecked for random fault families.
            </p>
          </div>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => void onGenerate()} disabled={busy}>
            {busy ? <IconLoader2 className="animate-spin" /> : <IconServer />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
