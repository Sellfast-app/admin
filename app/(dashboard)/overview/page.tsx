"use client";

import { useState } from "react";
import { BarsChart } from "@/components/admin/bars-chart";
import { LineChart } from "@/components/admin/line-chart";
import { MetricState } from "@/components/admin/metric-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chartPath, parseChart } from "@/lib/admin-metrics";
import { useAdminMetric } from "@/lib/use-admin-metric";

export default function OverviewPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState("all");
  const growth = useAdminMetric(chartPath("merchant-growth", year), parseChart);
  const signups = useAdminMetric(chartPath("signups", year), parseChart);
  const retention = useAdminMetric(chartPath("retention", year, month), parseChart);
  const charts = [
    { title: "Merchant growth", state: growth, line: true },
    { title: "Signups", state: signups, line: false },
    { title: "Retention", state: retention, line: false },
  ];

  return <div className="space-y-6 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-lg font-semibold">Overview</h1><p className="text-sm text-muted-foreground">Merchant activity</p></div>
      <label className="flex items-center gap-2 text-sm">Year
        <select aria-label="Overview year" value={year} onChange={e => setYear(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-base">
          <option value="all">All years</option>
          {Array.from({ length: 10 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
    </div>
    <section className="grid min-w-0 gap-5 lg:grid-cols-2">
      {charts.map(({ title, state, line }) => <Card key={title} className={`min-w-0 shadow-none ${line ? "lg:col-span-2" : ""}`}>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div><CardTitle className="text-base">{title}</CardTitle>
            {title === "Retention" && <p className="mt-1 text-sm text-muted-foreground">Monthly active merchants</p>}
          </div>
          {line && state.data?.momGrowth && <span className="text-sm">{state.data.momGrowth} MoM</span>}
          {title === "Retention" && <label className="flex items-center gap-2 text-sm">Month
            <select aria-label="Retention month" value={month} onChange={e => setMonth(e.target.value)} className="h-10 max-w-full rounded-md border bg-background px-2 text-base">
              <option value="all">All months</option>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(2020, i, 1).toLocaleString("en", { month: "long" })}</option>)}
            </select>
          </label>}
        </CardHeader>
        <CardContent>
          <MetricState {...state} empty={!state.data?.chartData.length}>
            <div className="overflow-x-auto">
              <div style={{ minWidth: (state.data?.chartData.length ?? 0) > 6 ? `${state.data!.chartData.length * 50}px` : undefined }}>
                {line && (state.data?.chartData.length ?? 0) > 1 ? <LineChart points={state.data!.chartData} /> : <BarsChart points={state.data?.chartData ?? []} />}
              </div>
            </div>
            <details className="mt-4 text-sm"><summary className="cursor-pointer">View values</summary><dl className="mt-3 space-y-2">{state.data?.chartData.map(p => <div key={p.label} className="flex justify-between gap-3"><dt>{p.label}</dt><dd className="tabular-nums">{p.value.toLocaleString()}</dd></div>)}</dl></details>
          </MetricState>
        </CardContent>
      </Card>)}
    </section>
    <section className="grid gap-5 sm:grid-cols-2">
      {["Sales channel mix", "Top stores by revenue"].map(title => <Card key={title} className="shadow-none"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Data unavailable.</p></CardContent></Card>)}
    </section>
  </div>;
}
