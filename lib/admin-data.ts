import {
  Bell,
  Box,
  CircleDollarSign,
  Headphones,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Settings,
  ShoppingBag,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

export const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Users", icon: Users },
  { label: "Finance", icon: WalletCards },
  { label: "Subscriptions", icon: CircleDollarSign },
  { label: "Deliveries", icon: Box },
  { label: "Support", icon: Headphones },
];

export const sidebarFooterItems = [
  { label: "Settings", icon: Settings },
  { label: "Logout", icon: LogOut, danger: true },
];

export const stats = [
  {
    label: "Total Users Accumulated",
    value: "12,870",
    change: "+12.5% from last month",
    tone: "green",
    icon: UserRound,
    sparkline: [16, 20, 18, 27, 25, 38, 36, 43, 30, 34],
  },
  {
    label: "Total Active Users",
    value: "10,045",
    change: "+8.2% from last month",
    tone: "violet",
    icon: Users,
    sparkline: [10, 15, 13, 20, 18, 30, 28, 34, 22, 27],
  },
  {
    label: "Total Platform Subscribers",
    value: "8,382",
    change: "+14.7% from last month",
    tone: "pink",
    icon: Users,
    sparkline: [8, 10, 18, 14, 28, 24, 36, 39, 22, 26],
  },
  {
    label: "Total Orders Processed",
    value: "300,214",
    change: "+22.3% from last month",
    tone: "orange",
    icon: ShoppingBag,
    sparkline: [12, 14, 10, 22, 18, 30, 28, 34, 19, 25],
  },
  {
    label: "Total Successful Transactions",
    value: "291,208",
    change: "+18.2% from last month",
    tone: "mint",
    icon: PackageCheck,
    sparkline: [14, 19, 17, 26, 24, 33, 31, 36, 22, 28],
  },
  {
    label: "Total Failed Transactions",
    value: "9,006",
    change: "-4.1% from last month",
    tone: "red",
    icon: Box,
    sparkline: [6, 10, 8, 16, 14, 29, 27, 32, 18, 20],
    negative: true,
  },
  {
    label: "Gross Merchandise Value",
    value: "₦200,458,900.00",
    change: "+17.2% from last month",
    tone: "yellow",
    icon: Bell,
    sparkline: [10, 14, 12, 22, 19, 28, 26, 31, 18, 23],
  },
  {
    label: "Total Transaction Volume",
    value: "₦213,780,500.00",
    change: "+9.4% from last month",
    tone: "blue",
    icon: WalletCards,
    sparkline: [8, 12, 10, 19, 16, 27, 24, 30, 17, 21],
  },
];

export const signups = [
  {
    initials: "IE",
    name: "Isiong Esther Geraldine",
    email: "isiongesther09@gmail.com",
    country: "Nigeria",
    stores: "2 stores",
    time: "Just now",
    tint: "bg-[#FFF2DF]",
  },
  {
    initials: "AK",
    name: "Anozie Kingsley Chuibike",
    email: "kingsleyanozie@gmail.com",
    country: "Nigeria",
    stores: "1 store",
    time: "30 secs ago",
    tint: "bg-[#EAF4FF]",
  },
  {
    initials: "GM",
    name: "George Michael",
    email: "thegeorgemickky@gmail.com",
    country: "United Kingdom",
    stores: "1 store",
    time: "1 min ago",
    tint: "bg-[#F0E9FF]",
  },
  {
    initials: "MB",
    name: "Maryanne Blaire",
    email: "maryanneblaire@gmail.com",
    country: "United States",
    stores: "2 stores",
    time: "2 min ago",
    tint: "bg-[#E9F8EC]",
    muted: true,
  },
];

export const growth = [
  { month: "Jan", users: 1, revenue: 8 },
  { month: "Feb", users: 2, revenue: 15 },
  { month: "Mar", users: 4, revenue: 20 },
  { month: "Apr", users: 6, revenue: 32 },
  { month: "May", users: 0, revenue: 0 },
  { month: "Jun", users: 0, revenue: 0 },
  { month: "Jul", users: 0, revenue: 0 },
  { month: "Aug", users: 0, revenue: 0 },
  { month: "Sep", users: 0, revenue: 0 },
  { month: "Oct", users: 0, revenue: 0 },
  { month: "Nov", users: 0, revenue: 0 },
  { month: "Dec", users: 0, revenue: 0 },
];

export const toneClasses: Record<string, { bg: string; text: string; line: string; fill: string }> = {
  green: { bg: "bg-[#D2FFD9]", text: "text-[#27AF4C]", line: "#59D878", fill: "rgba(89, 216, 120, 0.12)" },
  violet: { bg: "bg-[#F1EAFE]", text: "text-[#8B5CF6]", line: "#9B7CFF", fill: "rgba(155, 124, 255, 0.14)" },
  pink: { bg: "bg-[#FFE3F1]", text: "text-[#F33E97]", line: "#FF4C9A", fill: "rgba(255, 76, 154, 0.13)" },
  orange: { bg: "bg-[#FFF1E8]", text: "text-[#FF8B3D]", line: "#FF9347", fill: "rgba(255, 147, 71, 0.14)" },
  mint: { bg: "bg-[#DDFBF1]", text: "text-[#22C8A2]", line: "#26D7B1", fill: "rgba(38, 215, 177, 0.13)" },
  red: { bg: "bg-[#FFE2E2]", text: "text-[#F3484E]", line: "#F3484E", fill: "rgba(243, 72, 78, 0.12)" },
  yellow: { bg: "bg-[#FFF7D6]", text: "text-[#D5A800]", line: "#F0C33A", fill: "rgba(240, 195, 58, 0.14)" },
  blue: { bg: "bg-[#E4EAFF]", text: "text-[#5272FF]", line: "#5B7CFF", fill: "rgba(91, 124, 255, 0.13)" },
};
