"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/sales";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Invalid email or password.");
      }
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="glass-main-card w-full max-w-md rounded-[28px] p-8 sm:p-10">
      <div className="mb-8 text-center">
        <Image src="/logo.png" alt="CashBack" width={150} height={50} className="mx-auto h-11 w-auto object-contain" priority />
        <div className="accent-bar-gold mx-auto mt-5" />
        <h1 className="mt-5 font-heading text-2xl font-bold uppercase text-white">
          Sales Portal
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Authorized CashBack Sales team only.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sales@cashback.agency"
              required
              className="glass-input w-full rounded-xl py-3.5 pl-11 pr-4 text-[15px] text-white placeholder:text-gray-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="glass-input w-full rounded-xl py-3.5 pl-11 pr-4 text-[15px] text-white placeholder:text-gray-600"
            />
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold-glow focus-gold mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
          ) : (
            <>Sign In <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gold-300">
        <ArrowLeft className="h-3 w-3" />
        Back to request form
      </Link>
    </div>
  );
}

export default function SalesLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040406] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px] animate-pulse-glow" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<div className="text-center text-gray-500">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
