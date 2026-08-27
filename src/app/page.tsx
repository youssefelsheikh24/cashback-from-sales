import Image from "next/image";
import Link from "next/link";
import { Lock, ArrowUpRight } from "lucide-react";
import { ProductionRequestForm } from "@/components/form/ProductionRequestForm";

export default function Home() {
  return (
    <main className="cinema-grain cinema-vignette relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#040406] text-white selection:bg-gold-500/30 selection:text-gold-200">
      {/* ── Cinematic backdrop ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Letterbox bars top & bottom — filmic frame */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Spotlight sweep */}
        <div className="absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-gold-500/10 via-gold-600/[0.04] to-transparent blur-[120px] animate-pulse-glow" />

        {/* Aperture ring — top right */}
        <div className="absolute -right-28 -top-28 h-[440px] w-[440px] opacity-70 animate-float-slow">
          <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-[0_0_50px_rgba(212,175,55,0.35)]">
            <defs>
              <linearGradient id="ap1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="45%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#2A1E05" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="150" fill="none" stroke="url(#ap1)" strokeWidth="2" opacity="0.5" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              const x1 = 200 + Math.cos(a) * 60;
              const y1 = 200 + Math.sin(a) * 60;
              const x2 = 200 + Math.cos(a + 0.9) * 150;
              const y2 = 200 + Math.sin(a + 0.9) * 150;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#ap1)" strokeWidth="10" strokeLinecap="round" opacity="0.55" />
              );
            })}
          </svg>
        </div>

        {/* Film reel — bottom left */}
        <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] opacity-50 animate-float-reverse">
          <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-[0_0_60px_rgba(212,175,55,0.3)]">
            <defs>
              <linearGradient id="reel1" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F9E8A2" />
                <stop offset="55%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#140E02" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="150" fill="none" stroke="url(#reel1)" strokeWidth="14" />
            <circle cx="200" cy="200" r="34" fill="none" stroke="url(#reel1)" strokeWidth="14" />
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i * Math.PI) / 3;
              return (
                <circle key={i} cx={200 + Math.cos(a) * 96} cy={200 + Math.sin(a) * 96} r="26" fill="none" stroke="url(#reel1)" strokeWidth="12" />
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 pb-2 pt-6 sm:px-8">
        <Link href="/" className="group inline-flex items-center transition-transform duration-200 hover:scale-105">
          <Image
            src="/logo.png"
            alt="CashBack Production House"
            width={160}
            height={55}
            className="h-10 w-auto object-contain drop-shadow-[0_2px_12px_rgba(212,175,55,0.25)] sm:h-12"
            priority
          />
        </Link>

        <Link
          href="/sales"
          className="glass-pill focus-gold group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono tracking-wider text-gray-300 shadow-lg transition-all hover:border-gold-500/40 hover:text-gold-300"
        >
          <Lock className="h-3.5 w-3.5 text-gold-400 transition-transform group-hover:rotate-12" />
          <span className="font-semibold">Sales Portal</span>
          <ArrowUpRight className="h-3 w-3 text-gray-500 transition-colors group-hover:text-gold-400" />
        </Link>
      </header>

      {/* ── Hero + Form ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-gold-400/90">
            CashBack Production House
          </p>
          <h1 className="mt-4 font-heading text-5xl font-bold uppercase leading-[0.95] text-white sm:text-7xl">
            Let&apos;s Create <br className="hidden sm:block" />
            <span className="text-gold-gradient">Something</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-gray-400 sm:text-base">
            Tell us what you&apos;re planning. We&apos;ll take care of the production.
          </p>
        </div>

        <ProductionRequestForm />
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-5 text-xs text-gray-500 sm:flex-row sm:px-8">
        <Image src="/logo.png" alt="CashBack" width={100} height={32} className="h-6 w-auto object-contain opacity-70" />
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>VIDEO &bull; PHOTO &bull; PRODUCTION</span>
          <span className="text-gray-700">|</span>
          <span>&copy; {new Date().getFullYear()} CashBack. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
