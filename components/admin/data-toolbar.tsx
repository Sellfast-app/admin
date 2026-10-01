"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search } from "lucide-react";

interface DataToolbarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  periodValue?: string;
  onPeriodChange?: (value: string) => void;
  showExport?: boolean;
  onExport?: () => void;
}

export function DataToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  tabs,
  activeTab,
  onTabChange,
  periodValue,
  onPeriodChange,
  showExport = true,
  onExport,
}: DataToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {tabs && tabs.length > 0 && activeTab !== undefined && onTabChange && (
        <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
        {onSearchChange && (
          <div className="relative min-w-[180px] flex-1 sm:max-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 h-9"
            />
          </div>
        )}

        {onPeriodChange && (
          <Select value={periodValue} onValueChange={onPeriodChange}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showExport && (
          <Button variant="outline" size="sm" className="h-9" onClick={onExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Export</span>
          </Button>
        )}
      </div>
    </div>
  );
}
