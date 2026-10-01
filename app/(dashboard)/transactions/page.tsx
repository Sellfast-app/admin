"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import { adminTransactions, type AdminTransaction } from "@/lib/admin-data";
import { useAdminList, type AdminTransactionRow } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/admin-types";
import { toast } from "sonner";

const tabs = ["All", "Successful", "Pending", "Failed", "Abandoned"];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const state = useAdminList<AdminTransactionRow>("transactions", { search, status: tab === "All" ? undefined : tab }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({ rows: state.rows ?? adminTransactions, live: state.live, loading: state.loading }),
    [state.rows, state.live, state.loading]
  );

  const filtered = useMemo(
    () =>
      live
        ? rows
        : rows.filter((txn: AdminTransaction) => tab === "All" || txn.status === tab),
    [rows, live, tab]
  );

  const columns: Column<AdminTransaction>[] = [
    { key: "reference", header: "Reference" },
    { key: "gateway", header: "Gateway" },
    { key: "store", header: "Store" },
    {
      key: "amount",
      header: "Amount",
      render: (txn) => formatCurrency(txn.amount),
    },
    {
      key: "platformFee",
      header: "Platform fee",
      render: (txn) => (
        <span className="font-medium text-primary">{formatCurrency(txn.platformFee)}</span>
      ),
    },
    {
      key: "vendorAmount",
      header: "Vendor amount",
      render: (txn) => formatCurrency(txn.vendorAmount ?? 0),
    },
    { key: "status", header: "Status" },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Transactions</h1>
          <p className="text-xs text-muted-foreground">
            Split-payment breakdown: platform fee vs vendor amount (PRD 2.3)
          </p>
        </div>
        <LiveBadge live={live} loading={loading} />
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search reference or store..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        onExport={() => toast.success("Transactions export queued")}
      />

      <DataTable columns={columns} rows={filtered} emptyMessage="No transactions match your filters" />
    </div>
  );
}
