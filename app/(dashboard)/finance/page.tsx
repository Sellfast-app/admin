"use client";

import { DataToolbar } from "@/components/admin/data-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";
import { financeSummary, gatewayVolume } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/admin-types";
import { toast } from "sonner";

export default function FinancePage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold">Finance</h1>
        <p className="text-xs text-muted-foreground">
          Platform earnings, settlements and gateway reconciliation
        </p>
      </div>

      <DataToolbar periodValue="30d" onPeriodChange={() => {}} onExport={() => toast.success("Finance export queued")} />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {financeSummary.map((item) => (
          <StatCard key={item.label} stat={item} />
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gateway volume share</CardTitle>
            <p className="text-xs text-muted-foreground">Processed volume by payment provider</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {gatewayVolume.map((gateway) => (
              <div key={gateway.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{gateway.label}</span>
                  <span className="text-muted-foreground">{gateway.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${gateway.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Settlement account</CardTitle>
            <p className="text-xs text-muted-foreground">Master wallet and pending payouts</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-[#F7FFF9] p-4 dark:bg-primary/5">
              <p className="text-xs text-muted-foreground">Swiftree Master Wallet</p>
              <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(42_180_500)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Instantly available · NGN</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Pending settlements</p>
                <p className="mt-1 text-sm font-semibold">{formatCurrency(2_240_000)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Failed volume (30d)</p>
                <p className="mt-1 text-sm font-semibold text-red-600">{formatCurrency(1_120_000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
