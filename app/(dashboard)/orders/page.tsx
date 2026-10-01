"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { adminOrders, type AdminOrder } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/admin-types";
import { toast } from "sonner";

const tabs = ["All", "Website", "WhatsApp AI", "Web Chat"];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const rows = useMemo(
    () =>
      adminOrders.filter(
        (order) =>
          (tab === "All" || order.channel === tab) &&
          (order.reference.toLowerCase().includes(search.toLowerCase()) ||
            order.store.toLowerCase().includes(search.toLowerCase()) ||
            order.customer.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, tab]
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
      <div>
        <h1 className="text-lg font-semibold">Orders</h1>
        <p className="text-xs text-muted-foreground">All orders across website, WhatsApp AI and web chat channels</p>
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

      <DataTable columns={columns} rows={rows} emptyMessage="No orders match your filters" />
    </div>
  );
}
