export interface TrendPoint { label: string; value: number }
export interface ChartPayload { chartData: TrendPoint[]; momGrowth?: string }
export type FinanceRange = "7d" | "30d" | "90d" | "12m";
export const financeRanges: { value: FinanceRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" }, { value: "12m", label: "Last 12 months" },
];
export function chartPath(metric: "merchant-growth" | "signups" | "retention", year: string, month = "all") {
  const params = new URLSearchParams();
  if (year !== "all") params.set("year", year);
  if (metric === "retention" && month !== "all") params.set("month", month);
  return `overview/${metric}${params.size ? `?${params}` : ""}`;
}
export function financePath(metric: "metrics" | "gateway-volume", range: FinanceRange) {
  return `finance/${metric}?range=${range}`;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Unexpected response shape");
  return value as Record<string, unknown>;
}
export function parseChart(value: unknown): ChartPayload {
  const data = object(value);
  if (!Array.isArray(data.chartData)) throw new Error("Missing chart data");
  const points = data.chartData.map(row => {
    const point = object(row);
    if (typeof point.label !== "string" || typeof point.value !== "number" || !Number.isFinite(point.value)) throw new Error("Invalid chart point");
    return { label: point.label, value: point.value };
  });
  return { chartData: points, ...(typeof data.momGrowth === "string" ? { momGrowth: data.momGrowth } : {}) };
}
export const financeLabels = {
  platformRevenue: "Platform revenue", markupFees: "Markup fees",
  transactionFees: "Transaction fees", pendingSettlements: "Pending settlements",
};
export function parseFinance(value: unknown) {
  const data = object(value);
  return Object.entries(financeLabels).map(([key, label]) => {
    const metric = object(data[key]);
    if (typeof metric.amount !== "number" || !Number.isFinite(metric.amount)) throw new Error("Invalid finance amount");
    return { label, value: metric.amount, trend: typeof metric.trend === "number" && Number.isFinite(metric.trend) ? metric.trend : null };
  });
}
export function parseGateways(value: unknown) {
  if (!Array.isArray(value)) throw new Error("Missing gateway data");
  return value.map(row => {
    const item = object(row);
    if (typeof item.name !== "string" || typeof item.percentage !== "number" || !Number.isFinite(item.percentage) || item.percentage < 0 || item.percentage > 100) throw new Error("Invalid gateway share");
    return { name: item.name, percentage: item.percentage };
  });
}
