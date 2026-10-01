"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { adminTransactions, type AdminTransaction } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/admin-types";
import { toast } from "sonner";

const tabs = ["All", "Paystack", "Nomba", "Kuvarpay", "Fincra"];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const rows = useMemo(
    () =>
      adminTransactions.filter(
        (txn) =>
          (tab === "All" || txn.gateway === tab) &&
          (txn.reference.toLowerCase().includes(search.toLowerCase()) ||
            txn.store.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, tab]
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
    { key: "status", header: "Status" },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold">Transactions</h1>
        <p className="text-xs text-muted-foreground">
          Split-payment breakdown: platform fee = ₦500 markup + transaction percentage
        </p>
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

      <DataTable columns={columns} rows={rows} emptyMessage="No transactions match your filters" />
    </div>
  );
}
