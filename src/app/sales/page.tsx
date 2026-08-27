"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import type { ProductionRequest, NotificationItem } from "@/types";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { StatsOverview } from "@/components/sales/StatsOverview";
import { FilterBar } from "@/components/sales/FilterBar";
import { RequestsTable } from "@/components/sales/RequestsTable";
import { RequestDetailModal } from "@/components/sales/RequestDetailModal";

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [adminName, setAdminName] = useState("CashBack Sales");
  const [requests, setRequests] = useState<ProductionRequest[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({ total: 0 });
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const [selected, setSelected] = useState<ProductionRequest | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [alertsOn, setAlertsOn] = useState(false);

  /* ── Data fetching ── */
  const fetchRequests = useCallback(async () => {
    const p = new URLSearchParams();
    if (debouncedQuery) p.set("q", debouncedQuery);
    if (statusFilter) p.set("status", statusFilter);
    p.set("sort", sort);
    try {
      const res = await fetch(`/api/requests?${p.toString()}`, { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/sales/login");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setRequests(json.requests);
        setStats(json.stats);
      }
    } catch {
      /* keep existing data on transient network error */
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, sort, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setNotifications(json.notifications);
        setUnreadCount(json.unreadCount);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchRequestsRef = useRef(fetchRequests);
  const fetchNotifsRef = useRef(fetchNotifications);
  useEffect(() => {
    fetchRequestsRef.current = fetchRequests;
    fetchNotifsRef.current = fetchNotifications;
  }, [fetchRequests, fetchNotifications]);

  /* ── Identity ── */
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.user?.name && setAdminName(j.user.name))
      .catch(() => {});
  }, []);

  /* ── Debounce search ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ── Realtime SSE ── */
  useEffect(() => {
    setAlertsOn(
      typeof Notification !== "undefined" && Notification.permission === "granted"
    );

    const es = new EventSource("/api/notifications/sse");

    es.addEventListener("connected", () => setConnected(true));
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload.type === "NEW_REQUEST") {
          fetchRequestsRef.current();
          fetchNotifsRef.current();
          const id = payload.request?.id as string | undefined;
          if (id) {
            setHighlightIds((prev) => new Set(prev).add(id));
            setTimeout(() => {
              setHighlightIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }, 8000);
          }
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            const name = payload.request?.fullName || "A new client";
            new Notification("New Production Request", {
              body: `${name} · ${payload.notification?.brand ?? ""}`,
              icon: "/logo.png",
            });
          }
        } else if (payload.type === "STATUS_UPDATE") {
          fetchRequestsRef.current();
        }
      } catch {
        /* ignore malformed event */
      }
    };

    return () => es.close();
  }, []);

  /* ── Deep-link: open a request from ?requestId= (email "View Request" links) ── */
  const handledDeepLink = useRef(false);
  useEffect(() => {
    const requestId = searchParams.get("requestId");
    if (!requestId || handledDeepLink.current) return;
    handledDeepLink.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/requests/${requestId}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success) setSelected(json.request);
      } catch {
        /* ignore */
      } finally {
        router.replace("/sales");
      }
    })();
  }, [searchParams, router]);

  /* ── Notification actions ── */
  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  };

  const viewRequestFromNotification = async (requestId: string, notificationId: string) => {
    markRead(notificationId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setSelected(json.request);
    } catch {
      /* ignore */
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/sales/login");
    router.refresh();
  };

  const enableAlerts = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setAlertsOn(perm === "granted");
  };

  return (
    <div className="min-h-screen bg-[#040406]">
      <SalesHeader
        adminName={adminName}
        connected={connected}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onViewRequest={viewRequestFromNotification}
        onLogout={logout}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase text-white sm:text-3xl">
              Production Requests
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Every booking &amp; quote request, captured and ready to quote.
            </p>
          </div>
          {!alertsOn && (
            <button
              type="button"
              onClick={enableAlerts}
              className="btn-ghost focus-gold inline-flex items-center gap-2 self-start rounded-full px-4 py-2.5 text-xs font-medium text-gray-300 hover:text-gold-300 sm:self-auto"
            >
              <Bell className="h-3.5 w-3.5 text-gold-400" />
              Enable desktop alerts
            </button>
          )}
        </div>

        <div className="mb-6">
          <StatsOverview stats={stats} activeStatus={statusFilter} onSelectStatus={setStatusFilter} />
        </div>

        <div className="mb-4">
          <FilterBar query={query} onQuery={setQuery} sort={sort} onSort={setSort} resultCount={requests.length} />
        </div>

        {loading ? (
          <div className="glass-inset-card flex items-center justify-center rounded-2xl py-24 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-gold-400" />
            Loading requests…
          </div>
        ) : (
          <RequestsTable requests={requests} highlightIds={highlightIds} onOpen={setSelected} />
        )}
      </main>

      {selected && (
        <RequestDetailModal
          request={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setSelected(updated);
            setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            fetchRequests();
          }}
          onDeleted={(id) => {
            setSelected(null);
            setRequests((prev) => prev.filter((r) => r.id !== id));
            fetchRequests();
            fetchNotifications();
          }}
        />
      )}
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#040406] text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-gold-400" />
          Loading…
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
