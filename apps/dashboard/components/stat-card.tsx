import type { Icon } from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: IconComponent,
  hint,
  accent = false,
}: {
  label: string;
  value: number | string;
  icon: Icon;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className={cn(accent && "border-primary/40 bg-primary/5")}>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">
            {label}
          </span>
          <IconComponent
            className={cn("size-4 text-muted-foreground", accent && "text-primary")}
            aria-hidden="true"
          />
        </div>
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
