interface LineChartProps {
  points: { label: string; value: number }[];
  className?: string;
}

export function LineChart({ points, className }: LineChartProps) {
  if (points.length < 2) return null;

  const max = Math.max(...points.map((p) => p.value), 1);
  const width = 600;
  const height = 200;

  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - (point.value / max) * (height - 16) - 4;
    return { x, y, ...point };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineFill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {coords.map((c) => (
          <circle key={c.label} cx={c.x} cy={c.y} r="3" fill="var(--primary)" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between">
        {points.map((p, i) => (
          <span
            key={p.label}
            className={i % 2 === 0 ? "text-[10px] text-muted-foreground" : "hidden sm:inline text-[10px] text-muted-foreground"}
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
