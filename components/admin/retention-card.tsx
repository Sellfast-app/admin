export function RetentionCard() {
  return (
    <section className="rounded-[8px] border border-[#ECEFEC] bg-white">
      <div className="flex gap-4 border-b border-[#F0F2F0] p-4">
        <button className="rounded-[6px] bg-[#4FCA6A] px-4 py-2 text-sm font-bold text-white">
          Active Vs Inactive
        </button>
        <button className="rounded-[6px] border border-[#E9ECE9] px-4 py-2 text-sm font-medium text-[#A4AAA3]">
          User Category Segmentation
        </button>
        <button className="rounded-[6px] border border-[#E9ECE9] px-4 py-2 text-sm font-medium text-[#A4AAA3]">
          Subscriber Ratio
        </button>
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold">Active Vs Inactive Users</h2>
            <p className="text-xs text-[#A1A7A0]">Across our userbase this is the ratio of active vs inactive users</p>
          </div>
          <div className="flex rounded-[8px] bg-[#F7F8F7] p-1 text-xs text-[#9DA39C]">
            {["1D", "1W", "1M", "1Y", "Max"].map((item) => (
              <button key={item} className={`rounded-[6px] px-3 py-2 ${item === "Max" ? "bg-white text-[#071706] shadow-sm" : ""}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-center gap-8 md:grid-cols-[1fr_270px]">
          <div className="flex justify-center">
            <div className="relative h-[210px] w-[210px] rounded-full bg-[conic-gradient(#4FCA6A_0_78%,#F3484E_78%_100%)]">
              <div className="absolute inset-[30px] flex items-center justify-center rounded-full bg-white text-xl font-bold">
                12,870
              </div>
              <span className="absolute left-6 top-12 text-sm font-bold text-white">22%</span>
              <span className="absolute bottom-8 right-12 text-sm font-bold text-white">78%</span>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-sm bg-[#4FCA6A]" />
              <span className="text-[#9AA199]">Active Users</span>
              <span className="text-[#9AA199]">•</span>
              <span className="font-medium">10,045</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-sm bg-[#F3484E]" />
              <span className="text-[#9AA199]">Inactive Users</span>
              <span className="text-[#9AA199]">•</span>
              <span className="font-medium">2,825</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[6px] border border-[#FFC476] bg-[#FFF8EF] px-4 py-3 text-sm text-[#9E9E9E]">
          Based on data, we&apos;ve reached <strong className="text-[#071706]">78% retention rate</strong> and less than{" "}
          <strong className="text-[#071706]">22% churn rate</strong> translating to over{" "}
          <strong className="text-[#071706]">10,000 active users MoM</strong>
        </div>
      </div>
    </section>
  );
}
