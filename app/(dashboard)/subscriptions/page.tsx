"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { adminSubscriptions, type AdminSubscription } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/admin-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const tabs = ["All", "Subscription", "Markup"];

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const rows = useMemo(
    () =>
      adminSubscriptions.filter(
        (sub) =>
          (tab === "All" || sub.plan === tab) &&
          sub.store.toLowerCase().includes(search.toLowerCase())
      ),
    [search, tab]
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

  const subscriptionCount = adminSubscriptions.filter((s) => s.plan === "Subscription").length;
  const markupCount = adminSubscriptions.filter((s) => s.plan === "Markup").length;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold">Subscriptions</h1>
        <p className="text-xs text-muted-foreground">
          Plan distribution across subscription and markup monetization models
        </p>
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
          <CardContent>
            <p className="text-2xl font-bold">
              {adminSubscriptions.filter((s) => s.status === "Overdue" || s.status === "Trialing").length}
            </p>
          </CardContent>
        </Card>
      </section>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search store..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        onExport={() => toast.success("Subscriptions export queued")}
      />

      <DataTable columns={columns} rows={rows} emptyMessage="No subscriptions match your filters" />
    </div>
  );
}
