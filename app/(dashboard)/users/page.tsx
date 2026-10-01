"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { adminUsers, type AdminUser } from "@/lib/admin-data";
import { toast } from "sonner";

const tabs = ["All", "Nigeria", "Kenya", "Ghana", "United Kingdom"];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const rows = useMemo(
    () =>
      adminUsers.filter(
        (user) =>
          (tab === "All" || user.country === tab) &&
          (user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, tab]
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Users</h1>
          <p className="text-xs text-muted-foreground">{adminUsers.length} registered merchants</p>
        </div>
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

      <DataTable columns={columns} rows={rows} emptyMessage="No merchants match your filters" />
    </div>
  );
}
