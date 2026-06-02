import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { RiskActions } from "@/components/risks/RiskActions";
import { GlassCard, SectionTitle } from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { scanRiskSignals } from "@/lib/risk/scanner";
import { riskLevelLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RisksPage() {
  await scanRiskSignals();

  const risks = await prisma.riskSignal.findMany({
    where: { isResolved: false },
    include: {
      opportunity: { include: { customer: true } },
    },
    orderBy: [{ level: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <TopBar title="风险预警与建议行动" />
      <div className="grid gap-4">
        {risks.map((risk) => (
          <GlassCard
            key={risk.id}
            glow={risk.level === "HIGH" ? "orange" : "none"}
            className={
              risk.level === "HIGH"
                ? "border-rose-400/20 bg-rose-500/10"
                : undefined
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  {risk.type} · {riskLevelLabel(risk.level)}风险
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {risk.opportunity.name}
                </p>
                <p className="text-sm text-white/60">
                  {risk.opportunity.customer.companyName}
                </p>
              </div>
              <Link
                href={`/opportunities/${risk.opportunityId}`}
                className="text-sm text-accent-cyan"
              >
                查看机会 →
              </Link>
            </div>
            <p className="mt-3 text-sm text-white/80">{risk.message}</p>
            <p className="mt-2 text-sm">
              <span className="text-accent-orange">建议行动：</span>
              {risk.recommendedAction}
            </p>
            {risk.successRate ? (
              <p className="mt-1 text-xs text-white/50">
                历史成功率约 {Math.round(risk.successRate * 100)}%
              </p>
            ) : null}
            {risk.level === "HIGH" ? (
              <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm">
                【高风险预警】建议立即启动应对任务包：价值信、workshop、金额预测调整
              </div>
            ) : null}
            <RiskActions riskId={risk.id} />
          </GlassCard>
        ))}
        {risks.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-white/50">当前暂无活跃风险信号</p>
          </GlassCard>
        ) : null}
      </div>
    </>
  );
}
