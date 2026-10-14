"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricState } from "@/components/admin/metric-state";
import { financePath, financeRanges, parseFinance, parseGateways, type FinanceRange } from "@/lib/admin-metrics";
import { useAdminMetric } from "@/lib/use-admin-metric";
import { formatCurrency } from "@/lib/admin-types";

export default function FinancePage() {
  const [range, setRange] = useState<FinanceRange>("30d");
  const metrics = useAdminMetric(financePath("metrics", range), parseFinance);
  const gateways = useAdminMetric(financePath("gateway-volume", range), parseGateways);
  return <div className="space-y-5 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-lg font-semibold">Finance</h1><p className="text-sm text-muted-foreground">Platform earnings and settlements</p></div>
      <label className="flex items-center gap-2 text-sm">Period
        <select aria-label="Finance period" value={range} onChange={e => setRange(e.target.value as FinanceRange)} className="h-10 rounded-md border bg-background px-3 text-base">
          {financeRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </label>
    </div>
    <MetricState {...metrics} empty={!metrics.data?.length}>
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.data?.map(item => <Card key={item.label} className="min-w-0 shadow-none"><CardHeader><CardTitle className="text-sm font-medium">{item.label}</CardTitle></CardHeader><CardContent>
          <p className="break-words text-2xl font-semibold tabular-nums">{formatCurrency(item.value)}</p>
          {item.trend !== null && <p className="mt-2 text-sm text-muted-foreground">Trend: {item.trend > 0 ? "+" : ""}{item.trend}%</p>}
        </CardContent></Card>)}
      </section>
    </MetricState>
    <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Gateway volume share</CardTitle></CardHeader><CardContent>
      <MetricState {...gateways} empty={!gateways.data?.length}>
        <div className="space-y-5">{gateways.data?.map(gateway => <div key={gateway.name}>
          <div className="mb-2 flex justify-between gap-3 text-sm"><span>{gateway.name}</span><span className="tabular-nums">{gateway.percentage}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${gateway.percentage}%` }} /></div>
        </div>)}</div>
      </MetricState>
    </CardContent></Card>
  </div>;
}
