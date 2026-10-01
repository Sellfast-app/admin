"use client";

import { StatCard, type StatItem } from "@/components/admin/stat-card";
import { BarsChart } from "@/components/admin/bars-chart";
import { LineChart } from "@/components/admin/line-chart";
import { LiveBadge } from "@/components/admin/live-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { signupsData, retentionData, growthData, channelMix } from "@/lib/admin-data";
import { useAdminPayload } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/admin-types";

interface TrendPoint {
  label: string;
  value: number;
}

interface OverviewPayload {
  stats: StatItem[];
  metrics: Record<string, number>;
  signups: TrendPoint[];
  retention: TrendPoint[];
  growth: TrendPoint[];
  channelMix: { label: string; value: number }[];
  topStores: { name: string; revenue: number }[];
  generatedAt: string;
}

export default function OverviewPage() {
  const { data, live, loading } = useAdminPayload<OverviewPayload>("metrics/overview");

  const stats = data?.stats ?? [];
  const growthPoints = data?.growth?.length ? data.growth : growthData;
  const signupPoints = data?.signups?.length ? data.signups : signupsData;
  const retentionPoints = data?.retention?.length ? data.retention : retentionData;
  const channels = data?.channelMix?.length ? data.channelMix : channelMix;
  const topStores = data?.topStores?.length ? data.topStores : [];

  const growthDelta =
    growthPoints.length >= 2 && growthPoints[growthPoints.length - 2].value > 0
      ? Math.round(
          ((growthPoints[growthPoints.length - 1].value - growthPoints[growthPoints.length - 2].value) /
            growthPoints[growthPoints.length - 2].value) *
            100
        )
      : null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Overview</h1>
          <p className="text-xs text-muted-foreground">Platform-wide metrics across all merchants</p>
        </div>
        <LiveBadge live={live} loading={loading} />
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {(loading && !data ? Array.from({ length: 8 }) : stats).map((stat, index) =>
          stat ? (
            <StatCard key={(stat as StatItem).label} stat={stat as StatItem} />
          ) : (
            <Skeleton key={index} className="h-[118px] rounded-xl" />
          )
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Merchant growth</CardTitle>
                <p className="text-xs text-muted-foreground">GMV across all sales channels</p>
              </div>
              {growthDelta !== null && (
                <Badge
                  variant="outline"
                  className={growthDelta >= 0 ? "border-primary/20 bg-primary/10 text-primary" : "border-red-200 bg-red-50 text-red-700"}
                >
                  {growthDelta >= 0 ? "+" : ""}
                  {growthDelta}% MoM
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <LineChart points={growthPoints} />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Signups</CardTitle>
              <p className="text-xs text-muted-foreground">New merchants per month</p>
            </CardHeader>
            <CardContent>
              <BarsChart points={signupPoints} />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Retention</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly active merchant rate</p>
            </CardHeader>
            <CardContent>
              <BarsChart points={retentionPoints} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sales channel mix</CardTitle>
            <p className="text-xs text-muted-foreground">Order share by fulfillment channel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{channel.label}</span>
                  <span className="text-muted-foreground">{channel.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${channel.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top stores by revenue</CardTitle>
            <p className="text-xs text-muted-foreground">
              {live ? "All time, all countries" : "Sample data — connect the backend to see live values"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStores.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No store revenue recorded yet</p>
            ) : (
              topStores.map((store, index) => (
                <div key={store.name} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{store.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(store.revenue)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
