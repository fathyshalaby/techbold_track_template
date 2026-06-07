"use client";

import { HEADER_CONTROL_CLASS } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(HEADER_CONTROL_CLASS)}
      onClick={() => router.refresh()}
    >
      <IconRefresh className="size-3.5" />
      Refresh
    </Button>
  );
}
