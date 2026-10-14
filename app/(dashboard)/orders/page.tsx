"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import type { AdminOrder } from "@/lib/admin-data";
import { useAdminList, type AdminOrderRow } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/admin-types";
import { MetricState } from "@/components/admin/metric-state";
import { filterOrders, orderChannels, type OrderChannel } from "@/lib/admin-order-filters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<OrderChannel>("All");
  const [page, setPage] = useState(1);

  const state = useAdminList<AdminOrderRow>("orders", { search, channel: tab === "All" ? undefined : tab, page }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({ rows: state.rows ?? [], live: state.live, loading: state.loading }),
    [state.rows, state.live, state.loading]
  );

  const filtered = useMemo(
    () => filterOrders(rows, tab, search),
    [rows, tab, search]
  );

  const columns: Column<AdminOrder>[] = [
    { key: "reference", header: "Reference" },
    { key: "store", header: "Store" },
    { key: "customer", header: "Customer" },
    { key: "channel", header: "Channel" },
    {
      key: "amount",
      header: "Amount",
      render: (order) => formatCurrency(order.amount),
    },
    { key: "status", header: "Status" },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Orders</h1>
          <p className="text-xs text-muted-foreground">
            {live && !loading ? `${filtered.length} matching orders on this page` : "Orders by sales channel"}
          </p>
        </div>
        <LiveBadge live={live} loading={loading} />
      </div>

      <DataToolbar
        search={search}
        onSearchChange={value => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search reference, store or customer..."
        tabs={[...orderChannels]}
        activeTab={tab}
        onTabChange={value => { setTab(value as OrderChannel); setPage(1); }}
        showExport={false}
      />

      <MetricState loading={loading} error={state.error} refresh={state.refresh} empty={false}>
        <DataTable columns={columns} rows={filtered} emptyMessage="No matching orders in this page of API results" />
      </MetricState>
      {live && state.lastPage > 1 && <div className="flex items-center justify-end gap-3 text-sm">
        <span>Page {page} of {state.lastPage}</span>
        <Button variant="outline" size="icon" aria-label="Previous page" disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
        <Button variant="outline" size="icon" aria-label="Next page" disabled={loading || page >= state.lastPage} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
      </div>}
    </div>
  );
}
