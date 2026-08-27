"use client";

import { Check } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import type { ServiceId } from "@/types";
import { cn } from "@/lib/utils";

export function ServiceCards({
  selected,
  onToggle,
  error,
}: {
  selected: ServiceId[];
  onToggle: (id: ServiceId) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SERVICES.map((svc) => {
          const isSelected = selected.includes(svc.id);
          return (
            <button
              key={svc.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => onToggle(svc.id)}
              className={cn(
                "service-card focus-gold group relative flex items-start gap-4 rounded-2xl p-5 text-left",
                isSelected && "selected"
              )}
            >
              {/* Selected check badge */}
              <span
                className={cn(
                  "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                  isSelected
                    ? "scale-100 border-gold-400 bg-gold-500 text-black"
                    : "scale-90 border-white/15 bg-white/5 text-transparent"
                )}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>

              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110",
                  isSelected ? "bg-gold-500/15" : "bg-white/[0.04]"
                )}
              >
                {svc.icon}
              </span>

              <div className="min-w-0 pr-6">
                <h3 className="font-heading text-lg font-semibold uppercase tracking-wide text-white">
                  {svc.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-gray-400">
                  {svc.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
