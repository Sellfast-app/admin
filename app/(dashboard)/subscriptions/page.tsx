"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import { adminSubscriptions, type AdminSubscription } from "@/lib/admin-data";
import { useAdminList, type AdminSubscriptionRow } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/admin-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const tabs = ["All", "Active", "Trialing", "Cancelled", "Overdue"];

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const state = useAdminList<AdminSubscriptionRow>("subscriptions", { search, status: tab === "All" ? undefined : tab }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({ rows: state.rows ?? adminSubscriptions, live: state.live, loading: state.loading }),
    [state.rows, state.live, state.loading]
  );

  const filtered = useMemo(
    () => (live ? rows : rows.filter((sub: AdminSubscription) => tab === "All" || sub.status === tab)),
    [rows, live, tab]
  );

  const columns: Column<AdminSubscription>[] = [
    { key: "store", header: "Store" },
    { key: "plan", header: "Plan" },
    { key: "interval", header: "Billing interval" },
    {
      key: "amount",
      header: "Amount",
      render: (sub) => (sub.amount > 0 ? formatCurrency(sub.amount) : "₦0 upfront"),
    },
    { key: "status", header: "Status" },
    { key: "renews", header: "Renews" },
  ];

  const subscriptionCount = live
    ? rows.filter((s: AdminSubscriptionRow) => s.plan?.toLowerCase().includes("sub")).length
    : adminSubscriptions.filter((s) => s.plan === "Subscription").length;
  const markupCount = live
    ? rows.filter((s: AdminSubscriptionRow) => Number(s.amount) === 0).length
    : adminSubscriptions.filter((s) => s.plan === "Markup").length;
  const attentionCount = rows.filter((s) =>
    ["Overdue", "Trialing", "overdue", "trialing"].includes(s.status)
  ).length;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Subscriptions</h1>
          <p className="text-xs text-muted-foreground">
            Plan distribution across subscription and markup monetization models
          </p>
        </div>
        <LiveBadge live={live} loading={loading} />
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Subscription plan stores</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{subscriptionCount}</p></CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Markup model stores</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{markupCount}</p></CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Overdue / trialing</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{attentionCount}</p></CardContent>
        </Card>
      </section>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search vendor or plan..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        onExport={() => toast.success("Subscriptions export queued")}
      />

      <DataTable columns={columns} rows={filtered} emptyMessage="No subscriptions match your filters" />
    </div>
  );
}
