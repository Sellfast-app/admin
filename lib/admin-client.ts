"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Client data layer for the admin dashboard.
 *
 * All requests go through the Next.js BFF proxy (`/api/admin/*`) which
 * forwards to the Swiftree backend `{base}/admin/*` with the admin session
 * cookie and internal secret. If the backend is unreachable, not configured,
 * or the session is missing, the hook reports `live: false` and callers fall
 * back to the bundled sample data so the dashboard never renders empty/broken.
 *
 * Standard upstream list contract:
 *   { status, message, data: [...], meta: { total, page, lastPage } }
 */

type Envelope<T> = {
  status?: string;
  message?: string;
  data: T;
  meta?: { total: number; page: number; lastPage: number; note?: string };
};

export interface AdminListState<T> {
  rows: T[] | null; // null while loading with no data yet
  total: number;
  page: number;
  lastPage: number;
  live: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const DEBOUNCE_MS = 350;

export function useAdminList<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
  options: { limit?: number } = {}
): AdminListState<T> {
  const [rows, setRows] = useState<T[] | null>(null);
  const [meta, setMeta] = useState<{ total: number; page: number; lastPage: number } | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const { limit = 50 } = options;

  // Debounce the query (mainly so search typing doesn't spam the API).
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const queryKey = JSON.stringify(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);
  const debouncedKey = JSON.stringify(debouncedQuery);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params = new URLSearchParams();
    Object.entries(debouncedQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "All") {
        params.set(key, String(value));
      }
    });
    params.set("limit", String(limit));

    setLoading(true);
    fetch(`/api/admin/${path}?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Upstream ${res.status}`);
        const body = (await res.json()) as Envelope<T[]>;
        if (!Array.isArray(body.data)) throw new Error("Unexpected response shape");
        setRows(body.data);
        setMeta(body.meta ?? null);
        setLive(true);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLive(false);
        setRows(null);
        setMeta(null);
        setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, debouncedKey, limit, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { rows, total: meta?.total ?? 0, page: meta?.page ?? 1, lastPage: meta?.lastPage ?? 1, live, loading, error, refresh };
}

/** Fetch a single JSON payload (metrics, finance summary) with the same fallback pattern. */
export function useAdminPayload<T>(
  path: string
): { data: T | null; live: boolean; loading: boolean; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/admin/${path}`, { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Upstream ${res.status}`);
        const body = (await res.json()) as Envelope<T>;
        setData(body.data);
        setLive(true);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setData(null);
        setLive(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, tick]);

  return { data, live, loading, refresh: useCallback(() => setTick((t) => t + 1), []) };
}

// ── Row adapters (server rows -> existing UI row shapes) ────────────────────

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  country: string;
  businessType: string;
  stores: number;
  status: string;
  joined: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

const text = (v: unknown, fallback = "—"): string => {
  const s = v == null ? "" : String(v).trim();
  return s || fallback;
};

export function mapUser(u: AnyRow): AdminUserRow {
  return {
    id: u.id,
    name: text(u.name),
    email: text(u.email),
    country: text(u.country),
    businessType: text(u.businessType),
    stores: Number(u.storeCount ?? u.stores ?? 0),
    status: text(u.status),
    joined: text(u.joined),
  };
}

export interface AdminOrderRow {
  id: string;
  reference: string;
  store: string;
  customer: string;
  channel: string;
  amount: number;
  status: string;
  date: string;
}

export function mapOrder(o: AnyRow): AdminOrderRow {
  return {
    id: o.id,
    reference: text(o.reference),
    store: text(o.store),
    customer: text(o.customer),
    channel: text(o.channel),
    amount: Number(o.amount ?? 0),
    status: text(o.status),
    date: text(o.date),
  };
}

export interface AdminTransactionRow {
  id: string;
  reference: string;
  gateway: string;
  store: string;
  amount: number;
  platformFee: number;
  vendorAmount: number;
  status: string;
  date: string;
}

export function mapTransaction(t: AnyRow): AdminTransactionRow {
  return {
    id: t.id,
    reference: text(t.reference),
    gateway: text(t.gateway),
    store: text(t.store),
    amount: Number(t.amount ?? 0),
    platformFee: Number(t.platformFee ?? 0),
    vendorAmount: Number(t.vendorAmount ?? 0),
    status: text(t.status),
    date: text(t.date),
  };
}

export interface AdminDeliveryRow {
  id: string;
  trackingCode: string;
  provider: string;
  store: string;
  destination: string;
  status: string;
  dispatched: string;
}

export function mapDelivery(d: AnyRow): AdminDeliveryRow {
  return {
    id: d.id,
    trackingCode: text(d.trackingCode),
    provider: text(d.provider),
    store: text(d.store),
    destination: text(d.destination),
    status: text(d.status),
    dispatched: text(d.dispatched),
  };
}

export interface AdminSubscriptionRow {
  id: string;
  store: string;
  plan: string;
  interval: string;
  amount: number;
  status: string;
  renews: string;
}

export function mapSubscription(s: AnyRow): AdminSubscriptionRow {
  const amount = Number(s.amount ?? 0);
  return {
    id: s.id,
    store: text(s.store ?? s.vendor),
    plan: text(s.plan),
    interval: text(s.interval),
    amount,
    status: text(s.status),
    renews: text(s.renews),
  };
}

/** The backend has no ticketing module yet; keep the UI working on sample data. */
export function mapTicket(t: AnyRow): AdminTicketRow {
  return {
    id: t.id,
    subject: text(t.subject),
    requester: text(t.requester),
    store: text(t.store),
    priority: text(t.priority, "Medium"),
    status: text(t.status),
    opened: text(t.opened),
  };
}

export interface AdminTicketRow {
  id: string;
  subject: string;
  requester: string;
  store: string;
  priority: string;
  status: string;
  opened: string;
}

/** Convenience: rows ?? fallback, memoized. */
export function useRowsOrFallback<T>(state: AdminListState<T>, fallback: T[]): { rows: T[]; live: boolean; loading: boolean } {
  return useMemo(
    () => ({
      rows: state.rows ?? fallback,
      live: state.live,
      loading: state.loading,
    }),
    [state.rows, state.live, state.loading, fallback]
  );
}
