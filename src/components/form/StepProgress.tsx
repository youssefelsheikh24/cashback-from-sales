"use client";

import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Contact",
  "Services",
  "Production",
  "The Shoot",
  "Budget",
  "Review",
];

export function StepProgress({
  current,
  total,
}: {
  current: number; // 1-indexed
  total: number;
}) {
  const pct = Math.round(((current - 1) / (total - 1)) * 100);

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-heading text-sm tracking-[0.2em] text-gold-300 tabular-nums">
          {String(current).padStart(2, "0")}{" "}
          <span className="text-gray-600">/ {String(total).padStart(2, "0")}</span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
          {STEP_LABELS[current - 1]}
        </div>
      </div>

      {/* Progress rail — reads like a film scrubber */}
      <div className="relative h-[3px] w-full rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F5DF90] via-[#D4AF37] to-[#8E6D18] transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>

      {/* Step ticks */}
      <div className="mt-3 flex items-center justify-between">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const state =
            step < current ? "done" : step === current ? "active" : "upcoming";
          return (
            <div
              key={step}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                state === "active"
                  ? "w-8 bg-gold-400"
                  : state === "done"
                  ? "w-4 bg-gold-600/70"
                  : "w-4 bg-white/10"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
