"use client";

import { motion } from "framer-motion";
import { Check, ArrowUpRight, Copy } from "lucide-react";
import { useState } from "react";

export function SuccessScreen({
  brandName,
  reference,
}: {
  brandName?: string;
  reference: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center py-6 sm:py-10"
    >
      {/* Animated seal */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-gold-500/30 blur-2xl animate-pulse-glow" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#F6E29C] via-[#D4AF37] to-[#9B7517] shadow-[0_0_40px_-8px_rgba(212,175,55,0.7)]">
          <Check className="h-9 w-9 text-black" strokeWidth={3} />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold-400/90 mb-4"
      >
        That&apos;s a wrap
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-heading text-4xl sm:text-5xl font-bold uppercase leading-[1.05] text-white"
      >
        Request <span className="text-gold-gradient">Received.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-5 max-w-md text-[15px] leading-relaxed text-gray-400"
      >
        Our Sales team has received your production request
        {brandName ? `, ${brandName}` : ""}. We&apos;ll review the details and get
        back to you shortly.
      </motion.p>

      {/* Reference number */}
      <motion.button
        type="button"
        onClick={copyRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="group mt-8 inline-flex items-center gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] px-6 py-4 transition-colors hover:border-gold-500/50"
        title="Copy reference"
      >
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
            Reference #
          </div>
          <div className="font-heading text-2xl font-bold tracking-[0.15em] text-gold-200">
            {reference}
          </div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-gray-400 transition-colors group-hover:text-gold-300">
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.72 }}
        className="mt-9 flex flex-col items-center gap-4"
      >
        <div className="glass-pill flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs text-gray-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
          </span>
          Our Sales team has been notified
        </div>

        <a
          href="https://cashback.agency"
          className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gold-300"
        >
          Explore our work
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </motion.div>
    </motion.div>
  );
}
