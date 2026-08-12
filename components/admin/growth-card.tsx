import { growth } from "@/lib/admin-data";

export function GrowthCard() {
  return (
    <section className="rounded-[8px] border border-[#ECEFEC] bg-white p-5">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h2 className="font-bold">User Growth vs Revenue Growth</h2>
          <p className="text-xs text-[#A1A7A0]">An overview of our user growth and revenue growth.</p>
        </div>
        <div className="flex rounded-[8px] bg-[#F7F8F7] p-1 text-xs text-[#9DA39C]">
          {["1D", "1W", "1M", "1Y", "Max"].map((item) => (
            <button key={item} className={`rounded-[6px] px-3 py-2 ${item === "Max" ? "bg-white text-[#071706] shadow-sm" : ""}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[330px] overflow-hidden rounded-[6px] px-2">
        <div className="absolute left-0 top-0 grid h-[270px] w-full grid-rows-5 text-xs text-[#8C958A]">
          {[40, 30, 20, 10, 0].map((tick) => (
            <div key={tick} className="flex items-start border-b border-dashed border-[#E8EEE8]">
              <span className="w-8 -translate-y-2">{tick}</span>
            </div>
          ))}
        </div>

        <div className="ml-10 flex h-[270px] items-end justify-between gap-3">
          {growth.map((item) => (
            <div key={item.month} className="flex h-full flex-1 flex-col justify-end">
              <div className="flex h-full items-end justify-center gap-1">
                <span className="w-[34%] rounded-t-sm bg-[#DDEBFB]">
                  <span className="block rounded-t-sm bg-[#6EAFF5]" style={{ height: `${Math.max(item.users * 7, 1)}px` }} />
                </span>
                <span className="w-[34%] rounded-t-sm bg-[#DFF1E1]">
                  <span className="block rounded-t-sm bg-[#62BD72]" style={{ height: `${Math.max(item.revenue * 7, 1)}px` }} />
                </span>
              </div>
              <p className="mt-3 text-center text-xs text-[#4A5548]">{item.month}</p>
            </div>
          ))}
        </div>

        <div className="absolute left-[38%] top-[104px] rounded-[8px] bg-[#001700] px-4 py-3 text-sm text-white shadow-xl">
          <p className="mb-3 text-[#A7B2A6]">April 2026</p>
          <p><span className="text-[#6EAFF5]">■</span> 6,170 <span className="text-[#71806F]">• User Count</span></p>
          <p className="mt-2"><span className="text-[#62BD72]">■</span> ₦35,460,114.00 <span className="text-[#71806F]">• Revenue Count</span></p>
        </div>
      </div>

      <div className="flex justify-center gap-8 text-xs text-[#A1A7A0]">
        <span><span className="text-[#6EAFF5]">■</span> User Count</span>
        <span><span className="text-[#62BD72]">■</span> Revenue Count</span>
      </div>
    </section>
  );
}
