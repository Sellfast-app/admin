import { StatCard } from "@/components/admin/stat-card";
import { BarsChart } from "@/components/admin/bars-chart";
import { LineChart } from "@/components/admin/line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { overviewStats, signupsData, retentionData, growthData, channelMix } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/admin-types";

const growthDelta = Math.round(
  ((growthData[growthData.length - 1].value - growthData[growthData.length - 2].value) /
    growthData[growthData.length - 2].value) *
    100
);

export default function OverviewPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Merchant growth</CardTitle>
                <p className="text-xs text-muted-foreground">GMV across all sales channels</p>
              </div>
              <Badge
                variant="outline"
                className={growthDelta >= 0 ? "border-primary/20 bg-primary/10 text-primary" : "border-red-200 bg-red-50 text-red-700"}
              >
                {growthDelta >= 0 ? "+" : ""}
                {growthDelta}% MoM
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <LineChart points={growthData} />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Signups</CardTitle>
              <p className="text-xs text-muted-foreground">New merchants per month</p>
            </CardHeader>
            <CardContent>
              <BarsChart points={signupsData} />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Retention</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly active merchant rate</p>
            </CardHeader>
            <CardContent>
              <BarsChart points={retentionData} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sales channel mix</CardTitle>
            <p className="text-xs text-muted-foreground">Order share by acquisition channel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelMix.map((channel) => (
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
            <p className="text-xs text-muted-foreground">Current month, all countries</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Lagos Mart", revenue: 8_930_000 },
              { name: "Item 7 Go", revenue: 4_820_000 },
              { name: "Nairobi Cart", revenue: 3_410_000 },
              { name: "SM Bites", revenue: 2_140_000 },
            ].map((store, index) => (
              <div key={store.name} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{store.name}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(store.revenue)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
