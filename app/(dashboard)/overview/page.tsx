import { GrowthCard } from "@/components/admin/growth-card";
import { RetentionCard } from "@/components/admin/retention-card";
import { SignupsCard } from "@/components/admin/signups-card";
import { StatCard } from "@/components/admin/stat-card";
import { stats } from "@/lib/admin-data";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <RetentionCard />
        <SignupsCard />
      </section>

      <GrowthCard />
    </div>
  );
}
