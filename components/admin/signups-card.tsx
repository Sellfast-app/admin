import { ChevronDown } from "lucide-react";
import { signups } from "@/lib/admin-data";

export function SignupsCard() {
  return (
    <section className="rounded-[8px] border border-[#ECEFEC] bg-white p-5">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h2 className="font-bold">New User Sign ups</h2>
          <p className="text-xs text-[#A1A7A0]">Keep track of recent user signups</p>
        </div>
        <button className="inline-flex items-center gap-3 rounded-[6px] border border-[#EDF0ED] px-3 py-2 text-sm">
          Today
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-5 flex justify-between text-xs font-medium text-[#A1A7A0]">
        <span>User</span>
        <span>Activity</span>
      </div>

      <div className="space-y-6">
        {signups.map((user) => (
          <div key={user.email} className={`flex items-center justify-between gap-4 ${user.muted ? "opacity-35" : ""}`}>
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${user.tint} font-semibold`}>
                {user.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-[#A1A7A0]">
                  {user.email} <span className="mx-1">•</span> {user.country}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#4FCA6A]">{user.stores}</p>
              <p className="text-xs text-[#A1A7A0]">{user.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
