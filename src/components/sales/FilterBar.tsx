"use client";

import { Search, ArrowUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterBar({
  query,
  onQuery,
  sort,
  onSort,
  resultCount,
}: {
  query: string;
  onQuery: (v: string) => void;
  sort: "newest" | "oldest";
  onSort: (v: "newest" | "oldest") => void;
  resultCount: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search name, brand, email, phone or ref…"
          aria-label="Search requests"
          className="glass-input w-full rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder:text-gray-600"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 tabular-nums">
          {resultCount} {resultCount === 1 ? "request" : "requests"}
        </span>
        <button
          type="button"
          onClick={() => onSort(sort === "newest" ? "oldest" : "newest")}
          className={cn(
            "btn-ghost focus-gold inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium text-gray-300"
          )}
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-gold-400" />
          {sort === "newest" ? "Newest first" : "Oldest first"}
        </button>
      </div>
    </div>
  );
}
