import { TopBar } from "@/components/layout/TopBar";
import { WarRoomActions } from "@/components/weekly/WarRoomActions";
import { GlassCard, SectionTitle } from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WeeklyWarRoomPage() {
  const [latestPack, resources] = await Promise.all([
    prisma.weeklyWarPack.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.resourceCapacity.findMany(),
  ]);

  const topOpps = latestPack
    ? parseJson<
        Array<{
          name: string;
          healthScore: number;
          winProbability: number;
          amount: number;
        }>
      >(latestPack.topOpportunities, [])
    : [];

  const plans = latestPack
    ? parseJson<
        Array<{
          name: string;
          goal: string;
          resources: string;
          fallback: string;
        }>
      >(latestPack.plans, [])
    : [];

  return (
    <>
      <TopBar title="每周机会作战会议包" />
      <div className="mb-4">
        <WarRoomActions />
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <GlassCard glow="purple" className="xl:col-span-5">
          <SectionTitle
            title="周度作战议程"
            subtitle={latestPack?.weekLabel ?? "尚未生成"}
          />
          <pre className="whitespace-pre-wrap text-sm leading-7 text-white/80">
            {latestPack?.agenda ?? "点击上方按钮生成本周作战包"}
          </pre>
        </GlassCard>

        <GlassCard className="xl:col-span-7">
          <SectionTitle title="本周核心推进机会 Top3" />
          <div className="space-y-3">
            {topOpps.map((opp, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-medium">
                  {i + 1}. {opp.name}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  健康分 {opp.healthScore} · 成交概率{" "}
                  {Math.round(opp.winProbability * 100)}% · 金额{" "}
                  {Math.round(opp.amount / 10000)} 万
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-6">
          <SectionTitle title="机会推进方案" />
          <div className="space-y-3 text-sm">
            {plans.map((plan, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-medium">{plan.name}</p>
                <p className="mt-1 text-white/70">目标：{plan.goal}</p>
                <p className="text-white/60">资源：{plan.resources}</p>
                <p className="text-white/50">备选：{plan.fallback}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard glow="orange" className="xl:col-span-6">
          <SectionTitle title="内部资源瓶颈" />
          <div className="space-y-2 text-sm">
            {resources.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <p className="font-medium">
                  {r.personName}（{r.roleName}）
                </p>
                <p className="text-white/60">
                  负荷 {r.weekLoad}/{r.maxLoad}
                  {r.weekLoad >= r.maxLoad ? " · 建议预约下周时段" : ""}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/50">
            {latestPack?.resourceNotes}
          </p>
        </GlassCard>

        <GlassCard className="xl:col-span-12">
          <SectionTitle title="A4 作战地图" subtitle="可导出 Markdown / PDF" />
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/80">
            {latestPack?.battleMapMarkdown ?? "生成作战包后显示"}
          </pre>
        </GlassCard>
      </div>
    </>
  );
}
