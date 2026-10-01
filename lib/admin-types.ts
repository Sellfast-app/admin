export type Currency = "NGN" | "GHS" | "KES" | "GBP";

export interface MetricSummary {
  totalUsers: number;
  activeUsers: number;
  ordersProcessed: number;
  subscribers: number;
  gmv: number;
  transactionVolume: number;
  successfulTransactions: number;
  failedTransactions: number;
  usersAccumulated: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface ListRow {
  id: string;
  [key: string]: string | number;
}

export const formatCurrency = (
  value: number,
  currency: Currency = "NGN"
): string => {
  const symbols: Record<Currency, string> = {
    NGN: "₦",
    GHS: "₵",
    KES: "KSh",
    GBP: "£",
  };
  return `${symbols[currency]}${value.toLocaleString("en-NG")}`;
};

export const formatCompact = (value: number): string =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
