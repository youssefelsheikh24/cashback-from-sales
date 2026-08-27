"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Clapperboard } from "lucide-react";
import type { ProductionFormData } from "@/types";
import { SERVICE_LABELS } from "@/lib/constants";

/**
 * The frosted brand column on the right of the form (desktop). Reflects the
 * client's live input back to them so the multi-step flow feels responsive —
 * framed like a production call sheet.
 */
export function LiveSummary({
  data,
}: {
  data: ProductionFormData;
  step: number;
}) {
  const hasBrand = data.brandName.trim().length > 0;
  const serviceText = data.services.length
    ? `${data.services
        .slice(0, 2)
        .map((s) => SERVICE_LABELS[s])
        .join(", ")}${data.services.length > 2 ? ` +${data.services.length - 2}` : ""}`
    : "";

  return (
    <div className="relative hidden lg:flex flex-col justify-between p-9 lg:p-10 border-l border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gold-500/15 blur-[90px]" />

      {/* Top */}
      <div className="relative z-10">
        <div className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs">
          <Clapperboard className="h-3.5 w-3.5 text-gold-400" />
          <span className="font-semibold tracking-wide text-gray-200">
            {hasBrand ? data.brandName : "CashBack Production"}
          </span>
        </div>

        <h3 className="mt-7 font-heading text-3xl font-bold uppercase leading-[1.05] text-white">
          Lights.
          <br />
          Camera.
          <br />
          <span className="text-gold-gradient">Action.</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          Every great production starts with a brief. Tell us what you&apos;re
          planning — our team handles the rest.
        </p>
      </div>

      {/* Middle: live call sheet */}
      <div className="relative z-10 my-8">
        <div className="glass-inset-card rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">
            Call Sheet
          </p>
          <SummaryRow label="Brand" value={data.brandName} />
          <SummaryRow label="Services" value={serviceText} />
          <SummaryRow label="Shoot Date" value={data.preferredShootDate} />
          <SummaryRow label="Budget" value={data.budget} last />
        </div>
      </div>

      {/* Bottom */}
      <div className="relative z-10 flex items-center justify-between">
        <Image
          src="/logo.png"
          alt="CashBack"
          width={110}
          height={36}
          className="h-7 w-auto object-contain opacity-80"
        />
        <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] text-gray-300">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-400" />
          <span className="font-medium">Private &amp; Secure</span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${
        last ? "" : "border-b border-white/[0.05]"
      }`}
    >
      <span className="text-[11px] uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={value || "empty"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`text-right text-[13px] font-medium ${
            value ? "text-gold-200" : "text-gray-700"
          }`}
        >
          {value || "—"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
