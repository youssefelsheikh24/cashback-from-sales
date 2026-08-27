"use client";

import { Pencil } from "lucide-react";
import type { ProductionFormData } from "@/types";
import { SERVICE_LABELS, SHOOT_SERVICES } from "@/lib/constants";
import { StepHeader } from "./steps";

function firstFilled(...vals: (string | undefined)[]): string {
  return vals.find((v) => v && v.trim().length > 0) || "";
}

export function ReviewSummary({
  data,
  goToStep,
}: {
  data: ProductionFormData;
  goToStep: (step: number) => void;
}) {
  const d = data.details;

  const servicesText =
    data.services.map((s) => SERVICE_LABELS[s]).join(" + ") || "—";

  // Project type — best guess from whichever service the client detailed.
  const projectType = firstFilled(
    d.videoProduction?.creating,
    d.photography?.shooting && `${d.photography.shooting} Photography`,
    d.studio?.shooting && `${d.studio.shooting} (Studio)`,
    d.fullProduction?.producing,
    d.location?.locationType && `${d.location.locationType} Location`
  );

  const videos = firstFilled(
    d.videoProduction?.numberOfVideos,
    d.fullProduction?.numberOfVideos,
    d.montage?.numberToEdit
  );

  const shooting = firstFilled(
    d.location?.shootingDays,
    d.crew?.shootingDays && `${d.crew.shootingDays} day(s)`,
    d.studio?.hours && `${d.studio.hours} hours`
  );

  const shootDate = firstFilled(
    data.preferredShootDate,
    d.location?.preferredDate,
    d.studio?.preferredDate,
    d.crew?.preferredDate,
    d.fullProduction?.preferredDate
  );

  const fileCount = data._files?.length || 0;

  const rows: { label: string; value: string; step: number }[] = [
    { label: "Service", value: servicesText, step: 2 },
    ...(projectType ? [{ label: "Project", value: projectType, step: 3 }] : []),
    ...(videos ? [{ label: "Videos", value: videos, step: 3 }] : []),
    ...(shooting ? [{ label: "Shooting", value: shooting, step: 3 }] : []),
    ...(shootDate ? [{ label: "Date", value: shootDate, step: 4 }] : []),
    ...(data.deliveryDeadline
      ? [{ label: "Delivery", value: data.deliveryDeadline, step: 4 }]
      : []),
    ...(data.flexibility
      ? [{ label: "Flexibility", value: data.flexibility, step: 4 }]
      : []),
    { label: "Budget", value: data.budget || "—", step: 5 },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 06 — Review"
        title="Your request"
        subtitle="Give it a final look. Tap edit on anything you'd like to change."
      />

      {/* Contact card */}
      <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Contact
          </div>
          <p className="mt-1 font-heading text-lg font-semibold text-white">
            {data.fullName || "—"}
          </p>
          <p className="text-sm text-gold-200/80">{data.brandName}</p>
          <p className="mt-1 text-xs text-gray-400">
            {data.phone}
            {data.email ? ` · ${data.email}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="btn-ghost focus-gold inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-medium text-gray-300 hover:text-gold-300"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      {/* Summary rows */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        {rows.map((r, i) => (
          <div
            key={`${r.label}-${i}`}
            className="flex items-center justify-between gap-4 border-b border-white/[0.05] px-5 py-3.5 last:border-0"
          >
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                {r.label}
              </div>
              <div className="mt-0.5 truncate text-sm font-medium text-white">
                {r.value}
              </div>
            </div>
            <button
              type="button"
              onClick={() => goToStep(r.step)}
              className="focus-gold inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:text-gold-300"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Brief preview */}
      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            The Brief
          </div>
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="focus-gold inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gold-300"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
        <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
          {data.projectDescription || "—"}
        </p>
        {(fileCount > 0 || data.referenceLink) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {fileCount > 0 && (
              <span className="rounded-full border border-gold-500/25 bg-gold-500/10 px-2.5 py-1 text-xs text-gold-200">
                {fileCount} reference file{fileCount > 1 ? "s" : ""}
              </span>
            )}
            {data.referenceLink && (
              <span className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-gray-300">
                🔗 {data.referenceLink}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
