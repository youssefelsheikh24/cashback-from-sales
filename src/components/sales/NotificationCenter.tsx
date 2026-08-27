"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, ArrowRight, Clapperboard } from "lucide-react";
import type { NotificationItem } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onViewRequest,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onViewRequest: (requestId: string, notificationId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className="glass-pill focus-gold relative flex h-10 w-10 items-center justify-center rounded-full text-gray-300 transition-colors hover:text-gold-300"
      >
        <Bell className="h-[18px] w-[18px]" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-black shadow-[0_0_12px_rgba(212,175,55,0.6)]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass-main-card absolute right-0 z-50 mt-3 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-gold-400" />
                <span className="text-sm font-semibold text-white">Production Requests</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-bold text-gold-300">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-[11px] font-medium text-gray-400 hover:text-gold-300"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-gray-500">
                  You&apos;re all caught up.
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.05]">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={cn(
                        "px-4 py-3.5 transition-colors",
                        !n.isRead && "bg-gold-500/[0.06]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            n.isRead ? "bg-transparent" : "bg-gold-400"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-gold-400/90">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-200">{n.message}</p>
                          <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                            {n.reference && (
                              <p>Ref: <span className="font-mono text-gray-400">{n.reference}</span></p>
                            )}
                            {n.brand && <p>Brand: <span className="text-gray-400">{n.brand}</span></p>}
                            {n.budget && <p>Budget: <span className="text-gray-400">{n.budget}</span></p>}
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            {n.requestId && (
                              <button
                                type="button"
                                onClick={() => {
                                  onViewRequest(n.requestId!, n.id);
                                  setOpen(false);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300 hover:text-gold-200"
                              >
                                View Request
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => onMarkRead(n.id)}
                                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
                              >
                                <Check className="h-3 w-3" />
                                Mark read
                              </button>
                            )}
                            <span className="ml-auto text-[11px] text-gray-600">
                              {formatDate(n.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
