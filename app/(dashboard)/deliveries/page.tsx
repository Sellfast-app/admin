"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import { adminDeliveries, type AdminDelivery } from "@/lib/admin-data";
import { useAdminList, type AdminDeliveryRow } from "@/lib/admin-client";
import { toast } from "sonner";

const tabs = ["All", "GIG Logistics", "Sendbox", "Bolt", "Manual"];

export default function DeliveriesPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const state = useAdminList<AdminDeliveryRow>("deliveries", { search }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({ rows: state.rows ?? adminDeliveries, live: state.live, loading: state.loading }),
    [state.rows, state.live, state.loading]
  );

  const filtered = useMemo(
    () => (live ? rows : rows.filter((d: AdminDelivery) => tab === "All" || d.provider === tab)),
    [rows, live, tab]
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Deliveries</h1>
          <p className="text-xs text-muted-foreground">
            {live
              ? `${state.total} shipments across all logistics partners`
              : "Automated logistics (GIGL, Sendbox, Bolt) plus manual and branch pickup shipments"}
          </p>
        </div>
        <LiveBadge live={live} loading={loading} />
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

      <DataTable columns={columns} rows={filtered} emptyMessage="No deliveries match your filters" />
    </div>
  );
}
