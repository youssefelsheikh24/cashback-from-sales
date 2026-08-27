"use client";

import Image from "next/image";
import { LogOut, Wifi, WifiOff } from "lucide-react";
import type { NotificationItem } from "@/types";
import { NotificationCenter } from "./NotificationCenter";
import { cn } from "@/lib/utils";

export function SalesHeader({
  adminName,
  connected,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onViewRequest,
  onLogout,
}: {
  adminName: string;
  connected: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onViewRequest: (requestId: string, notificationId: string) => void;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#040406]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="CashBack" width={130} height={44} className="h-9 w-auto object-contain" priority />
          <div className="hidden h-6 w-px bg-white/10 sm:block" />
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Sales &amp; Production
            </p>
            <p className="text-sm font-semibold text-white">Request Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            title={connected ? "Realtime connected" : "Reconnecting…"}
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-medium sm:inline-flex",
              connected
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/25 bg-amber-500/10 text-amber-300"
            )}
          >
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? "Live" : "Offline"}
          </div>

          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onViewRequest={onViewRequest}
          />

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#F6E29C] to-[#9B7517] text-[11px] font-bold text-black">
              {adminName.trim()[0]?.toUpperCase() || "S"}
            </span>
            <span className="text-xs font-medium text-gray-300">{adminName}</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className="btn-ghost focus-gold flex h-10 items-center gap-2 rounded-full px-3.5 text-xs font-medium text-gray-300 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
