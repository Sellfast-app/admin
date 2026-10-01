import { formatCompact, formatCurrency } from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface StatItem {
  label: string;
  value: number;
  isCurrency?: boolean;
  delta?: number;
  sparkline?: number[];
}

export function StatCard({ stat }: { stat: StatItem }) {
  const display = stat.isCurrency ? formatCurrency(stat.value) : formatCompact(stat.value);
  const positive = (stat.delta ?? 0) >= 0;

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tracking-tight">{display}</p>
          {typeof stat.delta === "number" && (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                positive ? "text-primary" : "text-red-600"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {positive ? "+" : ""}
              {stat.delta}% vs last month
            </p>
          )}
        </div>
        {stat.sparkline && <Sparkline points={stat.sparkline} positive={positive} />}
      </div>
    </div>
  );
}

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((point - min) / range) * 100;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-12 w-24 shrink-0">
      <path
        d={path}
        fill="none"
        stroke={positive ? "var(--primary)" : "#dc2626"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
