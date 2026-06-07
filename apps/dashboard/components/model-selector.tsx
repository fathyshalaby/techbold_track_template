"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getModelSettings, setActiveModel } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  CUSTOM_MODEL_ID,
  MAC_MLX_HOST,
  MAC_MLX_PORT,
  MAC_MODEL_SERVE_CMD,
  MAC_MODEL_TRAIN_CMD,
  type ModelCatalogEntry,
  type ModelProvider,
  type ModelSettingsResponse,
  isCustomModelId,
  modelLabel,
} from "@techbold/contracts";
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const HEADER_CONTROL_CLASS = "h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium";

type ModelTab = "openai" | "gateway" | "mlx";

function tabForModel(modelId: string): ModelTab {
  if (isCustomModelId(modelId)) return "mlx";
  if (modelId.startsWith("openai/")) return "openai";
  return "gateway";
}

function openAiModels(models: ModelCatalogEntry[]): ModelCatalogEntry[] {
  return models.filter((entry) => entry.provider === "OpenAI");
}

function gatewayModels(models: ModelCatalogEntry[]): ModelCatalogEntry[] {
  return models.filter((entry) => entry.provider !== "OpenAI" && !isCustomModelId(entry.id));
}

// Provider display order for the grouped gateway catalog.
const PROVIDER_ORDER: ModelProvider[] = [
  "OpenAI",
  "Anthropic",
  "Google",
  "xAI",
  "DeepSeek",
  "Meta",
  "Mistral",
  "Qwen",
  "Custom",
];

function groupByProvider(models: ModelCatalogEntry[]): Array<[ModelProvider, ModelCatalogEntry[]]> {
  const buckets = new Map<ModelProvider, ModelCatalogEntry[]>();
  for (const entry of models) {
    const list = buckets.get(entry.provider) ?? [];
    list.push(entry);
    buckets.set(entry.provider, list);
  }
  return PROVIDER_ORDER.filter((provider) => buckets.has(provider)).map((provider) => [
    provider,
    buckets.get(provider) ?? [],
  ]);
}

function ModelRow({
  entry,
  selected,
  disabled,
  onPick,
}: {
  entry: ModelCatalogEntry;
  selected: boolean;
  disabled?: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(entry.id)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
        selected && "bg-accent font-medium",
      )}
    >
      <Check
        className={cn("size-3.5 shrink-0", selected ? "opacity-100" : "opacity-0")}
        aria-hidden="true"
      />
      <span className="truncate">{entry.label}</span>
      {entry.recommended ? (
        <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium text-muted-foreground">
          Recommended
        </span>
      ) : null}
    </button>
  );
}

function ModelList({
  models,
  activeModel,
  disabled,
  grouped,
  onPick,
}: {
  models: ModelCatalogEntry[];
  activeModel: string;
  disabled?: boolean;
  grouped?: boolean;
  onPick: (id: string) => void;
}) {
  if (models.length === 0) {
    return <p className="text-xs text-muted-foreground">No models in this group.</p>;
  }

  if (!grouped) {
    return (
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1">
        <ul className="space-y-0.5">
          {models.map((entry) => (
            <li key={entry.id}>
              <ModelRow
                entry={entry}
                selected={entry.id === activeModel}
                disabled={disabled}
                onPick={onPick}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1">
      {groupByProvider(models).map(([provider, entries]) => (
        <div key={provider} className="pb-1.5">
          <p className="sticky top-0 z-10 bg-popover px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {provider}
          </p>
          <ul className="space-y-0.5">
            {entries.map((entry) => (
              <li key={entry.id}>
                <ModelRow
                  entry={entry}
                  selected={entry.id === activeModel}
                  disabled={disabled}
                  onPick={onPick}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ModelSelector({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<ModelTab>("mlx");
  const [activeModel, setActiveModelState] = useState(CUSTOM_MODEL_ID);
  const [settings, setSettings] = useState<ModelSettingsResponse | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getModelSettings();
      setSettings(next);
      setActiveModelState(next.model);
      setTab(tabForModel(next.model));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load model settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const catalog = settings?.models ?? [];
  const openAiCatalog = useMemo(() => openAiModels(catalog), [catalog]);
  const gatewayCatalog = useMemo(() => gatewayModels(catalog), [catalog]);

  const pickModel = async (modelId: string) => {
    if (modelId === activeModel || busy) return;
    setBusy(true);
    try {
      const updated = await setActiveModel(modelId);
      setSettings(updated);
      setActiveModelState(updated.model);
      setTab(tabForModel(updated.model));
      toast.success(`Model set to ${modelLabel(updated.model)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update model");
    } finally {
      setBusy(false);
    }
  };

  const mockLlm = settings?.provider === "mock";
  const macActive = isCustomModelId(activeModel);
  const label = loading ? "Loading..." : modelLabel(activeModel);
  const cloudPickDisabled = busy || (settings !== null && !mockLlm && !settings.liveConfigured);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || loading}
            aria-label="Model selector"
            className={cn(HEADER_CONTROL_CLASS, "max-w-52 justify-between", className)}
          />
        }
      >
        <Sparkles className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
        <span className="truncate">{label}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-[min(24rem,calc(100vw-2rem))] max-h-[min(32rem,calc(100vh-4rem))] flex-col overflow-hidden p-3"
      >
        <div className="shrink-0 space-y-1">
          <p className="text-sm font-medium">Model routing</p>
          {settings ? (
            <p className="text-xs text-muted-foreground">
              Backend provider: {settings.providerLabel}
              {!macActive && settings.runtimeModel !== activeModel
                ? ` (runtime: ${settings.runtimeModel})`
                : null}
            </p>
          ) : null}
        </div>

        {mockLlm ? (
          <div className="mt-3 shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-700 dark:text-amber-400">
            LLM mock mode is on. Set <code className="font-mono">MOCK_LLM=false</code> in{" "}
            <code className="font-mono">.env</code> for live agent calls.
          </div>
        ) : null}

        {!mockLlm && settings && !settings.liveConfigured ? (
          <div className="mt-3 shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-700 dark:text-amber-400">
            No live cloud provider configured. Set <code className="font-mono">OPENAI_API_KEY</code>{" "}
            or <code className="font-mono">AI_GATEWAY_API_KEY</code> in{" "}
            <code className="font-mono">.env</code>, or use the MLX tab.
          </div>
        ) : null}

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as ModelTab)}
          className="mt-3 flex min-h-0 flex-1 flex-col gap-3"
        >
          <TabsList className="grid h-8 w-full shrink-0 grid-cols-3">
            <TabsTrigger value="openai" className="px-1 text-xs">
              OpenAI
            </TabsTrigger>
            <TabsTrigger value="gateway" className="px-1 text-xs">
              AI Gateway
            </TabsTrigger>
            <TabsTrigger value="mlx" className="px-1 text-xs">
              MLX
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="openai"
            className="mt-0 flex min-h-0 flex-1 flex-col gap-2 data-hidden:hidden"
          >
            <p className="shrink-0 text-xs text-muted-foreground">
              OpenAI models from the cloud via your configured{" "}
              <code className="font-mono">OPENAI_API_KEY</code> or AI Gateway when a gateway key is
              present.
            </p>
            {settings && !settings.canSwitchModels && settings.provider === "openai" ? (
              <p className="shrink-0 text-xs text-muted-foreground">
                Direct OpenAI routing uses deployment{" "}
                <code className="font-mono">{settings.runtimeModel}</code> unless you switch to AI
                Gateway.
              </p>
            ) : null}
            <ModelList
              models={openAiCatalog}
              activeModel={activeModel}
              disabled={cloudPickDisabled}
              onPick={pickModel}
            />
          </TabsContent>

          <TabsContent
            value="gateway"
            className="mt-0 flex min-h-0 flex-1 flex-col gap-2 data-hidden:hidden"
          >
            <p className="shrink-0 text-xs text-muted-foreground">
              Multi-provider catalog through Vercel AI Gateway. Requires{" "}
              <code className="font-mono">AI_GATEWAY_API_KEY</code> and{" "}
              <code className="font-mono">LLM_PROVIDER=gateway</code> (or a gateway key in{" "}
              <code className="font-mono">.env</code>).
            </p>
            <ModelList
              models={gatewayCatalog}
              activeModel={activeModel}
              disabled={cloudPickDisabled}
              grouped
              onPick={pickModel}
            />
          </TabsContent>

          <TabsContent
            value="mlx"
            className="mt-0 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain data-hidden:hidden"
          >
            <div>
              <p className="font-medium text-sm">{modelLabel(CUSTOM_MODEL_ID)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mac-only stack. The trained adapter runs on Apple Silicon via MLX at{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
                  {MAC_MLX_HOST}:{MAC_MLX_PORT}
                </code>
                .
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              variant={macActive ? "secondary" : "default"}
              disabled={busy || macActive}
              className="w-full"
              onClick={() => void pickModel(CUSTOM_MODEL_ID)}
            >
              {macActive ? "Active" : "Use MLX model"}
            </Button>

            {macActive && !mockLlm ? (
              <div className="rounded-md bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
                Live routing enabled. Agent calls use the trained MLX adapter on this Mac.
              </div>
            ) : null}

            <ol className="list-decimal space-y-1.5 pl-4 text-xs text-muted-foreground">
              <li>
                Train once: <code className="font-mono">{MAC_MODEL_TRAIN_CMD}</code>
              </li>
              <li>
                Serve (blocks): <code className="font-mono">{MAC_MODEL_SERVE_CMD}</code>
              </li>
              <li>
                Stack: <code className="font-mono">docker compose up --build</code>
              </li>
            </ol>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

export { HEADER_CONTROL_CLASS };
