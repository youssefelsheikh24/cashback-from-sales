"use client";

import { cn } from "@/lib/utils";
import { REQUEST_STATUSES, STATUS_STYLES } from "@/lib/constants";
import type { RequestStatus } from "@/types";

export function StatsOverview({
  stats,
  activeStatus,
  onSelectStatus,
}: {
  stats: Record<string, number>;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {/* Total */}
      <button
        type="button"
        onClick={() => onSelectStatus("")}
        className={cn(
          "glass-inset-card focus-gold rounded-2xl p-4 text-left transition-all hover:border-gold-500/30",
          activeStatus === "" && "ring-1 ring-gold-500/50"
        )}
      >
        <div className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
          Total Requests
        </div>
        <div className="mt-1.5 font-heading text-2xl font-bold text-gold-gradient">
          {stats.total ?? 0}
        </div>
      </button>

      {REQUEST_STATUSES.map((status) => (
        <StatCard
          key={status}
          status={status}
          count={stats[status] ?? 0}
          active={activeStatus === status}
          onClick={() => onSelectStatus(status)}
        />
      ))}
    </div>
  );
}

function StatCard({
  status,
  count,
  active,
  onClick,
}: {
  status: RequestStatus;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const s = STATUS_STYLES[status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass-inset-card focus-gold rounded-2xl p-4 text-left transition-all hover:border-white/20",
        active && "ring-1 ring-gold-500/50"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
        <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
          {s.label}
        </span>
      </div>
      <div className={cn("mt-1.5 font-heading text-2xl font-bold", s.text)}>
        {count}
      </div>
    </button>
  );
}
