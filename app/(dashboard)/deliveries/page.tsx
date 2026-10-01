"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { adminDeliveries, type AdminDelivery } from "@/lib/admin-data";
import { toast } from "sonner";

const tabs = ["All", "GIG Logistics", "Sendbox", "Bolt", "Manual"];

export default function DeliveriesPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const rows = useMemo(
    () =>
      adminDeliveries.filter(
        (delivery) =>
          (tab === "All" || delivery.provider === tab) &&
          (delivery.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
            delivery.store.toLowerCase().includes(search.toLowerCase()) ||
            delivery.destination.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, tab]
  );

  const columns: Column<AdminDelivery>[] = [
    { key: "trackingCode", header: "Tracking code" },
    { key: "provider", header: "Provider" },
    { key: "store", header: "Store" },
    { key: "destination", header: "Destination" },
    { key: "status", header: "Status" },
    { key: "dispatched", header: "Dispatched" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold">Deliveries</h1>
        <p className="text-xs text-muted-foreground">
          Automated logistics (GIGL, Sendbox, Bolt) plus manual and branch pickup shipments
        </p>
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tracking code, store or city..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        onExport={() => toast.success("Deliveries export queued")}
      />

      <DataTable columns={columns} rows={rows} emptyMessage="No deliveries match your filters" />
    </div>
  );
}
