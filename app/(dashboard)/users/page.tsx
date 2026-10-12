"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import type { AdminUser } from "@/lib/admin-data";
import { useAdminList, type AdminUserRow } from "@/lib/admin-client";
import { MetricState } from "@/components/admin/metric-state";

const tabs = ["All", "Nigeria", "Kenya", "Ghana", "United Kingdom"];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const state = useAdminList<AdminUserRow>("users", { search, country: tab }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({
      rows: state.rows ?? [],
      live: state.live,
      loading: state.loading,
    }),
    [state.rows, state.live, state.loading]
  );

  const filtered = useMemo(
    () => (live ? rows : rows.filter((user: AdminUser) => tab === "All" || user.country === tab)),
    [rows, live, tab]
  );

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Merchant",
      render: (user) => (
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    { key: "country", header: "Country" },
    { key: "businessType", header: "Business type" },
    { key: "stores", header: "Stores" },
    { key: "status", header: "Status" },
    { key: "joined", header: "Joined" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Users</h1>
          <p className="text-xs text-muted-foreground">
            {live ? `${state.total} registered merchants` : "Registered merchants"}
          </p>
        </div>
        <LiveBadge live={live} loading={loading} />
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name or email..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        showExport={false}
      />

      <MetricState loading={loading} error={state.error} refresh={state.refresh} empty={false}>
        <DataTable columns={columns} rows={filtered} emptyMessage="No merchants match your filters" />
      </MetricState>
    </div>
  );
}
