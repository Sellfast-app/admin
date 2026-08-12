export function Sparkline({
  values,
  color,
  fill,
}: {
  values: number[];
  color: string;
  fill: string;
}) {
  const width = 82;
  const height = 30;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 3) - 1.5;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[34px] w-[92px]" aria-hidden="true">
      <polygon points={area} fill={fill} />
      <polyline points={points} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}
