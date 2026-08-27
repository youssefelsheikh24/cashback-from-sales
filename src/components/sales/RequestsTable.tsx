"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ProductionRequest } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { SERVICE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RequestsTable({
  requests,
  highlightIds,
  onOpen,
}: {
  requests: ProductionRequest[];
  highlightIds: Set<string>;
  onOpen: (r: ProductionRequest) => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="glass-inset-card flex flex-col items-center justify-center rounded-2xl py-20 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-2xl">
          🎬
        </div>
        <p className="font-heading text-lg font-semibold uppercase text-white">
          No requests found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          New production requests will appear here the moment they arrive.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-inset-card overflow-hidden rounded-2xl">
      <div className="hidden grid-cols-[1.4fr_1.1fr_1.4fr_0.9fr_1fr_auto] gap-4 border-b border-white/[0.06] px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-500 lg:grid">
        <span>Client</span>
        <span>Ref</span>
        <span>Services</span>
        <span>Budget</span>
        <span>Status</span>
        <span className="text-right">Date</span>
      </div>

      <ul className="divide-y divide-white/[0.05]">
        {requests.map((r) => {
          const highlighted = highlightIds.has(r.id);
          const services = r.services.map((s) => SERVICE_LABELS[s] || s);
          const mainService = services[0] || "—";
          const extra = services.length - 1;
          return (
            <li key={r.id}>
              <motion.button
                type="button"
                onClick={() => onOpen(r)}
                initial={highlighted ? { backgroundColor: "rgba(212,175,55,0.14)" } : false}
                animate={{ backgroundColor: "rgba(212,175,55,0)" }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="group grid w-full grid-cols-1 items-center gap-2 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] lg:grid-cols-[1.4fr_1.1fr_1.4fr_0.9fr_1fr_auto] lg:gap-4"
              >
                {/* Client */}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      highlighted ? "bg-gold-500 text-black" : "bg-white/[0.06] text-gold-300"
                    )}
                  >
                    {initials(r.fullName)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">
                        {r.fullName}
                      </span>
                      {highlighted && (
                        <span className="rounded-full bg-gold-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-300">
                          New
                        </span>
                      )}
                    </div>
                    <span className="truncate text-xs text-gray-500">{r.brandName}</span>
                  </div>
                </div>

                {/* Ref */}
                <span className="hidden truncate font-mono text-xs text-gray-400 lg:block">
                  {r.reference}
                </span>

                {/* Services */}
                <span className="hidden truncate text-sm text-gray-400 lg:block">
                  {mainService}
                  {extra > 0 && <span className="text-gray-600"> +{extra}</span>}
                </span>

                {/* Budget */}
                <span className="hidden truncate text-sm text-gold-200/90 lg:block">
                  {r.budget}
                </span>

                {/* Status */}
                <div className="flex items-center gap-2 lg:block">
                  <StatusBadge status={r.status} size="sm" />
                </div>

                <div className="flex items-center justify-between gap-2 lg:justify-end">
                  <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
                  <ChevronRight className="hidden h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-400 lg:block" />
                </div>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}
