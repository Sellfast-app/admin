import type { StatItem } from "@/components/admin/stat-card";

// ── Overview ────────────────────────────────────────────────────────────────
export const overviewStats: StatItem[] = [
  { label: "Total Users Accumulated", value: 18422, delta: 8.2, sparkline: [42, 48, 45, 61, 58, 72, 81, 92] },
  { label: "Total Active Users", value: 4310, delta: 4.6, sparkline: [30, 34, 38, 36, 44, 41, 52, 58] },
  { label: "Total Orders Processed", value: 27814, delta: 12.4, sparkline: [51, 48, 62, 70, 66, 79, 88, 95] },
  { label: "Gross Merchandise Value", value: 184_500_000, isCurrency: true, delta: 9.8, sparkline: [38, 42, 47, 52, 61, 66, 74, 82] },
  { label: "Total Transaction Volume", value: 202_300_000, isCurrency: true, delta: 7.1, sparkline: [35, 40, 44, 55, 58, 63, 70, 78] },
  { label: "Total Successful Transactions", value: 24112, delta: 6.3, sparkline: [40, 44, 48, 55, 60, 64, 72, 80] },
  { label: "Total Failed Transactions", value: 1320, delta: -2.4, sparkline: [60, 55, 58, 50, 46, 42, 38, 34] },
  { label: "Total Platform Subscribers", value: 1284, delta: 5.1, sparkline: [28, 32, 36, 40, 46, 52, 56, 62] },
];

// ── Charts ──────────────────────────────────────────────────────────────────
export const signupsData = [
  { label: "Apr", value: 420 }, { label: "May", value: 510 }, { label: "Jun", value: 480 },
  { label: "Jul", value: 620 }, { label: "Aug", value: 710 }, { label: "Sep", value: 690 },
  { label: "Oct", value: 820 }, { label: "Nov", value: 910 }, { label: "Dec", value: 1050 },
  { label: "Jan", value: 880 }, { label: "Feb", value: 960 }, { label: "Mar", value: 1104 },
];

export const retentionData = [
  { label: "Apr", value: 62 }, { label: "May", value: 60 }, { label: "Jun", value: 64 },
  { label: "Jul", value: 61 }, { label: "Aug", value: 66 }, { label: "Sep", value: 68 },
  { label: "Oct", value: 65 }, { label: "Nov", value: 70 }, { label: "Dec", value: 72 },
  { label: "Jan", value: 69 }, { label: "Feb", value: 73 }, { label: "Mar", value: 75 },
];

export const growthData = [
  { label: "Apr", value: 9_800_000 }, { label: "May", value: 11_200_000 }, { label: "Jun", value: 10_600_000 },
  { label: "Jul", value: 12_900_000 }, { label: "Aug", value: 14_100_000 }, { label: "Sep", value: 13_700_000 },
  { label: "Oct", value: 15_600_000 }, { label: "Nov", value: 17_200_000 }, { label: "Dec", value: 19_800_000 },
  { label: "Jan", value: 16_400_000 }, { label: "Feb", value: 17_900_000 }, { label: "Mar", value: 20_100_000 },
];

export const channelMix = [
  { label: "Website", value: 58 },
  { label: "WhatsApp AI", value: 27 },
  { label: "Web Chat", value: 15 },
];

// ── Users ───────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  country: string;
  businessType: string;
  stores: number;
  status: string;
  joined: string;
}

export const adminUsers: AdminUser[] = [
  { id: "u-001", name: "Anozie Kingsley Chuibike", email: "kingsley@swiftree.app", country: "Nigeria", businessType: "Retail & Wholesale", stores: 2, status: "Active", joined: "2026-08-12" },
  { id: "u-002", name: "Maryanne Blaire", email: "maryanne@item7go.com", country: "Nigeria", businessType: "Food & Restaurant", stores: 1, status: "Active", joined: "2026-07-02" },
  { id: "u-003", name: "Isiong Esther Geraldine", email: "estiong@swiftree.app", country: "Ghana", businessType: "Retail & Wholesale", stores: 1, status: "Pending", joined: "2026-09-18" },
  { id: "u-004", name: "George Michael", email: "george@ticketsplus.ke", country: "Kenya", businessType: "Ticketing", stores: 1, status: "Active", joined: "2026-06-25" },
  { id: "u-005", name: "Tomiwa Ogunlesi", email: "tomiwa@lagosmart.ng", country: "Nigeria", businessType: "Retail & Wholesale", stores: 3, status: "Suspended", joined: "2026-02-14" },
  { id: "u-006", name: "Chiamaka Obi", email: "chiamaka@quickbites.ng", country: "Nigeria", businessType: "Food & Restaurant", stores: 1, status: "Active", joined: "2026-09-01" },
  { id: "u-007", name: "Ibrahim Musa", email: "ibrahim@kanothreads.com", country: "Nigeria", businessType: "Retail & Wholesale", stores: 1, status: "Pending", joined: "2026-09-22" },
  { id: "u-008", name: "Grace Wanjiku", email: "grace@nairobicart.ke", country: "Kenya", businessType: "Retail & Wholesale", stores: 2, status: "Active", joined: "2026-05-30" },
];

// ── Orders ──────────────────────────────────────────────────────────────────
export interface AdminOrder {
  id: string;
  reference: string;
  store: string;
  customer: string;
  channel: string;
  amount: number;
  status: string;
  date: string;
}

export const adminOrders: AdminOrder[] = [
  { id: "o-1001", reference: "#SW-92841", store: "Item 7 Go", customer: "Ogheneochuko A.", channel: "Website", amount: 45_500, status: "Completed", date: "2026-09-30" },
  { id: "o-1002", reference: "#SW-92840", store: "SM Bites", customer: "Caleb A.", channel: "WhatsApp AI", amount: 12_000, status: "Processing", date: "2026-09-30" },
  { id: "o-1003", reference: "#SW-92839", store: "Blaze Grill", customer: "Ngozi E.", channel: "Web Chat", amount: 8_750, status: "Completed", date: "2026-09-29" },
  { id: "o-1004", reference: "#SW-92838", store: "TommyArt's Place", customer: "Deji O.", channel: "Website", amount: 23_000, status: "Cancelled", date: "2026-09-29" },
  { id: "o-1005", reference: "#SW-92837", store: "Item 7 Go", customer: "Fatima B.", channel: "WhatsApp AI", amount: 6_200, status: "Pending", date: "2026-09-29" },
  { id: "o-1006", reference: "#SW-92836", store: "Nairobi Cart", customer: "Wanjiku G.", channel: "Website", amount: 31_400, status: "Completed", date: "2026-09-28" },
  { id: "o-1007", reference: "#SW-92835", store: "Lagos Mart", customer: "Tunde A.", channel: "Web Chat", amount: 15_800, status: "Failed", date: "2026-09-28" },
  { id: "o-1008", reference: "#SW-92834", store: "SM Bites", customer: "Zainab M.", channel: "WhatsApp AI", amount: 9_900, status: "Completed", date: "2026-09-27" },
];

// ── Transactions ────────────────────────────────────────────────────────────
export interface AdminTransaction {
  id: string;
  reference: string;
  gateway: string;
  store: string;
  amount: number;
  platformFee: number;
  status: string;
  date: string;
}

export const adminTransactions: AdminTransaction[] = [
  { id: "t-5001", reference: "TRX-88112", gateway: "Paystack", store: "Item 7 Go", amount: 45_500, platformFee: 1_864, status: "Successful", date: "2026-09-30" },
  { id: "t-5002", reference: "TRX-88111", gateway: "Kuvarpay", store: "SM Bites", amount: 12_000, platformFee: 1_100, status: "Successful", date: "2026-09-30" },
  { id: "t-5003", reference: "TRX-88110", gateway: "Paystack", store: "Blaze Grill", amount: 8_750, platformFee: 938, status: "Failed", date: "2026-09-29" },
  { id: "t-5004", reference: "TRX-88109", gateway: "Nomba", store: "TommyArt's Place", amount: 23_000, platformFee: 1_190, status: "Successful", date: "2026-09-29" },
  { id: "t-5005", reference: "TRX-88108", gateway: "Paystack", store: "Item 7 Go", amount: 6_200, platformFee: 810, status: "Pending", date: "2026-09-29" },
  { id: "t-5006", reference: "TRX-88107", gateway: "Paystack", store: "Nairobi Cart", amount: 31_400, platformFee: 1_442, status: "Successful", date: "2026-09-28" },
  { id: "t-5007", reference: "TRX-88106", gateway: "Nomba", store: "Lagos Mart", amount: 15_800, platformFee: 974, status: "Failed", date: "2026-09-28" },
  { id: "t-5008", reference: "TRX-88105", gateway: "Kuvarpay", store: "SM Bites", amount: 9_900, platformFee: 995, status: "Successful", date: "2026-09-27" },
];

// ── Deliveries ──────────────────────────────────────────────────────────────
export interface AdminDelivery {
  id: string;
  trackingCode: string;
  provider: string;
  store: string;
  destination: string;
  status: string;
  dispatched: string;
}

export const adminDeliveries: AdminDelivery[] = [
  { id: "d-201", trackingCode: "GIG-778201", provider: "GIG Logistics", store: "Item 7 Go", destination: "Ibadan, Oyo", status: "In transit", dispatched: "2026-09-30" },
  { id: "d-202", trackingCode: "SBX-55118", provider: "Sendbox", store: "SM Bites", destination: "Lekki, Lagos", status: "Delivered", dispatched: "2026-09-29" },
  { id: "d-203", trackingCode: "BLT-33045", provider: "Bolt", store: "Blaze Grill", destination: "Yaba, Lagos", status: "Delivered", dispatched: "2026-09-29" },
  { id: "d-204", trackingCode: "MAN-00912", provider: "Manual", store: "TommyArt's Place", destination: "Surulere, Lagos", status: "Scheduled", dispatched: "2026-09-30" },
  { id: "d-205", trackingCode: "GIG-778133", provider: "GIG Logistics", store: "Nairobi Cart", destination: "Westlands, Nairobi", status: "In transit", dispatched: "2026-09-28" },
  { id: "d-206", trackingCode: "SBX-55098", provider: "Sendbox", store: "Lagos Mart", destination: "Ikeja, Lagos", status: "Failed", dispatched: "2026-09-27" },
];

// ── Finance ─────────────────────────────────────────────────────────────────
export const financeSummary = [
  { label: "Platform Revenue (MTD)", value: 12_840_000, isCurrency: true, delta: 10.4 },
  { label: "Markup Fees (MTD)", value: 3_120_000, isCurrency: true, delta: 8.9 },
  { label: "Transaction Fees (MTD)", value: 9_720_000, isCurrency: true, delta: 11.2 },
  { label: "Pending Settlements", value: 2_240_000, isCurrency: true, delta: -4.1 },
];

export const gatewayVolume = [
  { label: "Paystack", value: 61 },
  { label: "Nomba", value: 18 },
  { label: "Kuvarpay", value: 13 },
  { label: "Fincra", value: 8 },
];

// ── Subscriptions ───────────────────────────────────────────────────────────
export interface AdminSubscription {
  id: string;
  store: string;
  plan: string;
  interval: string;
  amount: number;
  status: string;
  renews: string;
}

export const adminSubscriptions: AdminSubscription[] = [
  { id: "s-301", store: "Item 7 Go", plan: "Markup", interval: "—", amount: 0, status: "Active", renews: "—" },
  { id: "s-302", store: "SM Bites", plan: "Markup", interval: "—", amount: 0, status: "Active", renews: "—" },
  { id: "s-303", store: "Lagos Mart", plan: "Subscription", interval: "Yearly", amount: 180_000, status: "Active", renews: "2027-03-01" },
  { id: "s-304", store: "Nairobi Cart", plan: "Subscription", interval: "Quarterly", amount: 54_000, status: "Trialing", renews: "2026-10-14" },
  { id: "s-305", store: "TommyArt's Place", plan: "Subscription", interval: "Bi-Annually", amount: 108_000, status: "Overdue", renews: "2026-09-20" },
  { id: "s-306", store: "Blaze Grill", plan: "Markup", interval: "—", amount: 0, status: "Active", renews: "—" },
];

// ── Support ─────────────────────────────────────────────────────────────────
export interface AdminTicket {
  id: string;
  subject: string;
  requester: string;
  store: string;
  priority: string;
  status: string;
  opened: string;
}

export const adminTickets: AdminTicket[] = [
  { id: "tk-01", subject: "Payout not received", requester: "Maryanne Blaire", store: "Item 7 Go", priority: "High", status: "Open", opened: "2026-09-30" },
  { id: "tk-02", subject: "Coupon code not applying", requester: "Caleb Akpomughe", store: "SM Bites", priority: "Medium", status: "In progress", opened: "2026-09-29" },
  { id: "tk-03", subject: "Logo upload failing", requester: "Tomiwa Ogunlesi", store: "Lagos Mart", priority: "Low", status: "Resolved", opened: "2026-09-27" },
  { id: "tk-04", subject: "Delivery tracking link broken", requester: "Grace Wanjiku", store: "Nairobi Cart", priority: "Medium", status: "Open", opened: "2026-09-30" },
];

// ── Stores (for drilldown) ──────────────────────────────────────────────────
export interface AdminStore {
  id: string;
  name: string;
  owner: string;
  country: string;
  plan: string;
  products: number;
  revenue: number;
  status: string;
}

export const adminStores: AdminStore[] = [
  { id: "st-01", name: "Item 7 Go", owner: "Maryanne Blaire", country: "Nigeria", plan: "Markup", products: 34, revenue: 4_820_000, status: "Active" },
  { id: "st-02", name: "SM Bites", owner: "Caleb Akpomughe", country: "Nigeria", plan: "Markup", products: 18, revenue: 2_140_000, status: "Active" },
  { id: "st-03", name: "Lagos Mart", owner: "Tomiwa Ogunlesi", country: "Nigeria", plan: "Subscription", products: 156, revenue: 8_930_000, status: "Active" },
  { id: "st-04", name: "Nairobi Cart", owner: "Grace Wanjiku", country: "Kenya", plan: "Subscription", products: 88, revenue: 3_410_000, status: "Active" },
  { id: "st-05", name: "TommyArt's Place", owner: "George Michael", country: "Kenya", plan: "Subscription", products: 12, revenue: 640_000, status: "Suspended" },
];
