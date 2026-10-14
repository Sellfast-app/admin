// Verified against the published Postman collection on 2026-10-12.
export const adminEndpoints: Record<string, string> = {
  users: "/admin/users/list",
  orders: "/admin/orders/list",
  transactions: "/admin/transactions/list",
  deliveries: "/admin/deliveries/list",
  "metrics/signups": "/admin/overview/signups",
  "metrics/retention": "/admin/overview/retention",
  "metrics/growth": "/admin/overview/merchant-growth",
  "overview/signups": "/admin/overview/signups",
  "overview/retention": "/admin/overview/retention",
  "overview/merchant-growth": "/admin/overview/merchant-growth",
  "finance/metrics": "/admin/finance/metrics",
  "finance/gateway-volume": "/admin/finance/gateway-volume",
};

export function normalizeAdminEnvelope(parsed: Record<string, unknown>) {
  const data = parsed.data;
  const nested = data && typeof data === "object" && !Array.isArray(data)
    ? data as Record<string, unknown> : null;
  if (nested && Array.isArray(nested.data)) {
    const meta = nested.meta as Record<string, unknown> | undefined;
    return {
      status: parsed.status ?? "success",
      message: parsed.message ?? "OK",
      data: nested.data,
      ...(meta ? { meta: {
        ...meta,
        total: meta.totalCount ?? meta.total,
        page: meta.currentPage ?? meta.page,
        lastPage: meta.pageCount ?? meta.lastPage,
      } } : {}),
    };
  }
  return parsed;
}
