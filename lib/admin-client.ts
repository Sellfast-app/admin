"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Client data layer for the admin dashboard.
 *
 * All requests go through the Next.js BFF proxy (`/api/admin/*`) which
 * forwards to the Swiftree backend `{base}/admin/*` with the admin session
 * cookie and internal secret. If the backend is unreachable, not configured,
 * or the session is missing, the hook reports an error without inventing data.
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
        if (!res.ok) throw new Error(res.status === 501 ? "This data is not available yet." : "Unable to load data. Please try again.");
        const body = (await res.json()) as Envelope<T[]>;
        if (controller.signal.aborted) return;
        if (body.status && body.status !== "success") throw new Error("The API reported a failed request.");
        if (!Array.isArray(body.data)) throw new Error("Unexpected response shape");
        setRows(path === "users" ? body.data.map(row => mapUser(row as AnyRow)) as T[] : body.data);
        setMeta(body.meta ?? null);
        setLive(true);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
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

  return { rows, total: meta?.total ?? 0, page: meta?.page ?? 1, lastPage: meta?.lastPage ?? 1, live, loading: loading || queryKey !== debouncedKey, error, refresh };
}

// ── Row adapters (server rows -> existing UI row shapes) ────────────────────

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  country: string;
  businessType: string;
  stores: number | null;
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
    name: text(u.merchantName ?? u.name),
    email: text(u.email),
    country: text(u.country),
    businessType: text(u.businessType),
    stores: (u.storesCount ?? u.storeCount ?? u.stores) == null ? null : Number(u.storesCount ?? u.storeCount ?? u.stores),
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

export interface AdminDeliveryRow {
  id: string;
  trackingCode: string;
  provider: string;
  store: string;
  destination: string;
  status: string;
  dispatched: string;
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

export interface AdminTicketRow {
  id: string;
  subject: string;
  requester: string;
  store: string;
  priority: string;
  status: string;
  opened: string;
}
