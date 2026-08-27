"use client";

import { STATUS_STYLES } from "@/lib/constants";
import type { RequestStatus } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  size = "md",
}: {
  status: RequestStatus;
  size?: "sm" | "md";
}) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.New;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        s.bg,
        s.border,
        s.text,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
