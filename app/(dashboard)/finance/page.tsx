"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, type StatItem } from "@/components/admin/stat-card";
import { LiveBadge } from "@/components/admin/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { financeSummary, gatewayVolume } from "@/lib/admin-data";
import { useAdminPayload } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/admin-types";
import { toast } from "sonner";

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };

interface FinancePayload {
  summary: { label: string; value: number; isCurrency?: boolean }[];
  trend: { label: string; value: number }[];
  gateways: { label: string; count: number; value: number; volume: number }[];
}

export default function FinancePage() {
  const [period, setPeriod] = useState("30d");

  const from = useMemo(() => {
    const days = PERIOD_DAYS[period] ?? 30;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  }, [period]);

  const { data, live, loading } = useAdminPayload<FinancePayload>(`finance/summary?from=${encodeURIComponent(from)}`);

  const summary = data?.summary?.length ? data.summary : financeSummary;
  const gateways = data?.gateways?.length
    ? data.gateways
    : gatewayVolume.map((g) => ({ label: g.label, count: 0, value: g.value, volume: 0 }));
  const pendingSettlements =
    summary.find((s) => s.label.toLowerCase().includes("pending"))?.value ?? null;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Finance</h1>
          <p className="text-xs text-muted-foreground">
            Platform earnings, settlements and gateway reconciliation
          </p>
        </div>
        <LiveBadge live={live} loading={loading} />
      </div>

      <DataToolbar
        periodValue={period}
        onPeriodChange={setPeriod}
        onExport={() => toast.success("Finance export queued")}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading && !data
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[118px] rounded-xl" />)
          : summary.map((item) => <StatCard key={item.label} stat={item as StatItem} />)}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gateway volume share</CardTitle>
            <p className="text-xs text-muted-foreground">Order share by payment method</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {gateways.map((gateway) => (
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
              <p className="mt-1 text-2xl font-bold text-primary">
                {live ? formatCurrency(data?.summary?.find((s) => s.label.toLowerCase().includes("platform revenue"))?.value ?? 0) : formatCurrency(42_180_500)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {live ? "Platform revenue for the selected period · NGN" : "Sample data · NGN"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Pending settlements</p>
                <p className="mt-1 text-sm font-semibold">
                  {pendingSettlements === null ? "—" : formatCurrency(pendingSettlements)}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Successful transactions</p>
                <p className="mt-1 text-sm font-semibold">
                  {live ? String(data?.gateways?.reduce((acc, g) => acc + (g.count || 0), 0) ?? "—") : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
