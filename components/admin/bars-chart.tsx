import { formatCompact } from "@/lib/admin-types";

interface BarsChartProps {
  points: { label: string; value: number }[];
  className?: string;
}

export function BarsChart({ points, className }: BarsChartProps) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className={className}>
      <div className="flex h-44 items-end gap-1.5">
        {points.map((point) => (
          <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {formatCompact(point.value)}
            </span>
            <div
              className="w-full rounded-t-md bg-primary/25 transition-colors group-hover:bg-primary"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {points.map((point) => (
          <span
            key={point.label}
            className="flex-1 truncate text-center text-[10px] text-muted-foreground"
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
