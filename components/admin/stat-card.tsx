import { stats, toneClasses } from "@/lib/admin-data";
import { Sparkline } from "./sparkline";

type Stat = (typeof stats)[number];

export function StatCard({ stat }: { stat: Stat }) {
  const tone = toneClasses[stat.tone];

  return (
    <article className="rounded-[8px] border border-[#EEF0EE] bg-white p-4 shadow-[0_1px_2px_rgba(6,20,0,0.02)]">
      <div className="mb-9 flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-[#303A2F]">{stat.label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.text}`}>
          <stat.icon className="h-5 w-5" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xl font-bold tracking-normal">{stat.value}</p>
          <p className={`mt-1 text-xs font-medium ${stat.negative ? "text-[#F3484E]" : "text-[#4FCA6A]"}`}>
            {stat.change}
          </p>
        </div>
        <Sparkline values={stat.sparkline} color={tone.line} fill={tone.fill} />
      </div>
    </article>
  );
}
