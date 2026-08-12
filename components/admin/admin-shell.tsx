import { Bell, ChevronDown, Mail, MoreVertical, Search } from "lucide-react";
import Image from "next/image";
import { sidebarFooterItems, sidebarItems } from "@/lib/admin-data";
import { SwiftreeMark } from "./swiftree-mark";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#071706]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col bg-[#001700] text-white lg:flex">
        <div className="flex h-[108px] items-center gap-3 border-b border-white/10 px-7">
          <SwiftreeMark className="h-11 w-11 shrink-0" />
          <div>
            <p className="text-lg font-semibold text-[#4FCA6A]">Swiftree</p>
            <p className="text-xs text-white/70">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4 py-5">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`relative flex h-11 w-[calc(100%-38px)] items-center gap-3 rounded-[8px] px-3 text-left text-sm transition ${
                item.active
                  ? "ml-5 bg-[#073D16] text-[#4FCA6A]"
                  : "mx-5 text-white/82 hover:bg-white/6 hover:text-white"
              }`}
            >
              {item.active && <span className="absolute -left-5 h-11 w-1.5 rounded-r-full bg-[#4FCA6A]" />}
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-3 border-b border-white/10 px-5 pb-6">
          {sidebarFooterItems.map((item) => (
            <button
              key={item.label}
              className={`flex h-10 w-full items-center gap-3 rounded-[8px] px-3 text-left text-sm ${
                item.danger ? "text-[#FF5555]" : "text-white/82"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-6 py-6">
          <div className="relative h-9 w-9 overflow-hidden rounded-[8px] bg-[#4FCA6A]">
            <Image
              src="/admin-avatar.png"
              alt="Joshua Ogbudu"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Joshua Ogbudu</p>
            <p className="text-xs font-medium text-[#4FCA6A]">Admin</p>
          </div>
          <MoreVertical className="h-4 w-4 text-white/70" />
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[108px] items-center justify-between border-b border-[#ECEFEC] bg-white px-4 md:px-10">
          <div className="flex w-full max-w-[390px] items-center gap-3 rounded-[8px] border border-[#ECEFEC] bg-white px-4 py-3 text-[#9EA49D]">
            <input
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#A7ADA6]"
              placeholder="Search..."
            />
            <Search className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-5">
            <button className="relative hidden text-[#071706] sm:block">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#FF4757]" />
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#E5E8E5] bg-white px-4 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Invite Team
            </button>
          </div>
        </header>

        <main className="soft-scrollbar mx-auto max-w-[1460px] px-4 py-9 md:px-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold tracking-normal">Overview</h1>
            <div className="flex gap-3">
              <button className="inline-flex h-11 items-center gap-3 rounded-[8px] border border-[#E4E7E4] bg-white px-4 text-sm font-medium">
                Last 24 hours
                <ChevronDown className="h-4 w-4" />
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#E4E7E4] bg-white px-4 text-sm font-medium">
                Export
              </button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
