"use client";

import { useEffect, useState } from "react";

export function useAdminMetric<T>(path: string, parse: (value: unknown) => T) {
  const [retry, setRetry] = useState(0);
  const key = `${path}:${retry}`;
  const [state, setState] = useState<{ key: string; data: T | null; error: string | null }>({ key: "", data: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch(`/api/admin/${path}`, { cache: "no-store", signal: controller.signal });
        const body = await res.json();
        if (!res.ok || body.status !== "success") throw new Error(body.message || "Unable to load data");
        const data = parse(body.data);
        if (!controller.signal.aborted) setState({ key, data, error: null });
      } catch (error) {
        if (!controller.signal.aborted) setState({ key, data: null, error: error instanceof Error ? error.message : "Unable to load data" });
      }
    }
    void load();
    return () => controller.abort();
  }, [path, parse, key]);
  const current = state.key === key;
  return { data: current ? state.data : null, error: current ? state.error : null, loading: !current, refresh: () => setRetry(r => r + 1) };
}
