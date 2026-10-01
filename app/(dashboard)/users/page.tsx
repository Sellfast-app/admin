"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import { adminUsers, type AdminUser } from "@/lib/admin-data";
import { useAdminList, type AdminUserRow } from "@/lib/admin-client";
import { toast } from "sonner";

const tabs = ["All", "Nigeria", "Kenya", "Ghana", "United Kingdom"];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const state = useAdminList<AdminUserRow>("users", { search, country: tab }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({
      rows: state.rows ?? adminUsers,
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
            {live ? `${state.total} registered merchants` : `${adminUsers.length} sample merchants — connect the backend for live data`}
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
        onExport={() => toast.success("Users export queued")}
      />

      <DataTable columns={columns} rows={filtered} emptyMessage="No merchants match your filters" />
    </div>
  );
}
