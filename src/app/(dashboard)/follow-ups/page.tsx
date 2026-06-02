import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { FollowUpActions } from "@/components/follow-ups/FollowUpActions";
import { GlassCard, SectionTitle } from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { getTopContactWindows } from "@/lib/follow-up/service";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const [windows, opportunities, reminders, recommendations] = await Promise.all([
    getTopContactWindows(3),
    prisma.opportunity.findMany({
      include: { customer: { include: { contacts: true } } },
      take: 5,
    }),
    prisma.reminder.findMany({
      include: { opportunity: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.followUpRecommendation.findMany({
      include: { opportunity: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <>
      <TopBar title="智能跟进提醒" />
      <div className="grid gap-4 xl:grid-cols-12">
        <GlassCard glow="pink" className="xl:col-span-5">
          <SectionTitle title="本周 Top3 高成功率时间窗" />
          <div className="space-y-3">
            {windows.map((w, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-medium">{w.label}</p>
                <p className="text-sm text-accent-pink">
                  预计成功率 {Math.round(w.successRate * 100)}%
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-7">
          <SectionTitle title="专属最佳联系时段" subtitle="基于联系人配置" />
          <div className="space-y-2">
            {opportunities.map((opp) => {
              const contact = opp.customer.contacts[0];
              return (
                <div
                  key={opp.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="font-medium hover:text-accent-cyan"
                    >
                      {contact?.name ?? opp.name}
                    </Link>
                    <p className="text-white/50">{opp.customer.companyName}</p>
                  </div>
                  <p className="text-white/70">周二/周四 14:00-16:00</p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-6">
          <SectionTitle title="条件化自动提醒" />
          <div className="space-y-2">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"
              >
                <p className="font-medium">{r.title}</p>
                <p className="mt-1 text-white/70">{r.message}</p>
              </div>
            ))}
            {reminders.length === 0 ? (
              <p className="text-sm text-white/50">暂无触发提醒</p>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard glow="purple" className="xl:col-span-6">
          <SectionTitle title="智能跟进动作建议" />
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"
              >
                <p className="font-medium">{rec.opportunity.name}</p>
                <p className="mt-1 text-white/75">{rec.action}</p>
                {rec.script ? (
                  <p className="mt-2 rounded-xl bg-black/20 p-2 text-white/60">
                    {rec.script}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-12">
          <SectionTitle title="一键生成话术" />
          <FollowUpActions opportunities={opportunities.map((o) => ({
            id: o.id,
            name: o.name,
            industry: o.customer.industry,
            contactName: o.customer.contacts[0]?.name ?? "客户",
          }))} />
        </GlassCard>
      </div>
    </>
  );
}
