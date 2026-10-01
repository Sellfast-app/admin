"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import { adminOrders, type AdminOrder } from "@/lib/admin-data";
import { useAdminList, type AdminOrderRow } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/admin-types";
import { toast } from "sonner";

const tabs = ["All", "Website", "WhatsApp AI", "Web Chat", "Sendbox", "Relay"];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const state = useAdminList<AdminOrderRow>("orders", { search, status: tab === "All" ? undefined : tab }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({ rows: state.rows ?? adminOrders, live: state.live, loading: state.loading }),
    [state.rows, state.live, state.loading]
  );

  const filtered = useMemo(
    () => (live ? rows : rows.filter((order: AdminOrder) => tab === "All" || order.channel === tab)),
    [rows, live, tab]
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
            {live ? `${state.total} orders across all channels` : "All orders across website, WhatsApp AI and web chat channels"}
          </p>
        </div>
        <LiveBadge live={live} loading={loading} />
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search reference, store or customer..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        onExport={() => toast.success("Orders export queued")}
      />

      <DataTable columns={columns} rows={filtered} emptyMessage="No orders match your filters" />
    </div>
  );
}
