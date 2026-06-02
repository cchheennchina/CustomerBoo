import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { HealthDonut } from "@/components/dashboard/HealthDonut";
import {
  GlassCard,
  SectionTitle,
  StatusBadge,
} from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { formatCurrency, healthStatusColor, parseJson } from "@/lib/utils";
import type { HealthStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_TABS: Array<{ key: HealthStatus | "ALL"; label: string }> = [
  { key: "ALL", label: "全部" },
  { key: "HEALTHY", label: "健康" },
  { key: "SUBHEALTHY", label: "亚健康" },
  { key: "DANGEROUS", label: "危险" },
];

export default async function DashboardHealthPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dimension?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status?.toUpperCase();
  const dimension = params.dimension;

  const opportunities = await prisma.opportunity.findMany({
    include: {
      customer: true,
      healthSnapshots: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    where:
      statusFilter && statusFilter !== "ALL"
        ? { healthStatus: statusFilter as HealthStatus }
        : undefined,
    orderBy: { healthScore: "asc" },
  });

  const allOpps = await prisma.opportunity.findMany({
    include: { healthSnapshots: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const avg = (values: number[]) =>
    values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;

  const dimensionAvgs = {
    interaction: avg(allOpps.map((o) => o.healthSnapshots[0]?.interactionScore ?? 0)),
    decisionChain: avg(allOpps.map((o) => o.healthSnapshots[0]?.decisionChainScore ?? 0)),
    fit: avg(allOpps.map((o) => o.healthSnapshots[0]?.fitScore ?? 0)),
    urgency: avg(allOpps.map((o) => o.healthSnapshots[0]?.urgencyScore ?? 0)),
  };

  const dimensionLabels: Record<string, string> = {
    interaction: "互动频率",
    decisionChain: "决策链覆盖",
    fit: "方案匹配度",
    urgency: "时间紧迫性",
  };

  return (
    <>
      <TopBar title="机会健康度下钻" />
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm text-white/50 hover:text-white">
          ← 返回仪表盘
        </Link>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        {Object.entries(dimensionAvgs).map(([key, value]) => (
          <Link
            key={key}
            href={`/dashboard/health?dimension=${key}`}
            className={`rounded-2xl border p-4 transition ${
              dimension === key
                ? "border-accent-purple bg-accent-purple/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-sm text-white/60">{dimensionLabels[key]}</p>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-white/40">平均分 · 点击查看相关机会</p>
          </Link>
        ))}
      </div>

      <GlassCard className="mb-4">
        <SectionTitle title="按健康状态筛选" subtitle="点击标签下钻到机会列表" />
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={
                tab.key === "ALL"
                  ? "/dashboard/health"
                  : `/dashboard/health?status=${tab.key}`
              }
              className={`rounded-full border px-4 py-2 text-sm ${
                (statusFilter ?? "ALL") === tab.key
                  ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {tab.label}
              {tab.key !== "ALL"
                ? ` (${allOpps.filter((o) => o.healthStatus === tab.key).length})`
                : ` (${allOpps.length})`}
            </Link>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-12">
        <GlassCard glow="purple" className="xl:col-span-4">
          <SectionTitle title="当前筛选概览" />
          <HealthDonut
            score={
              opportunities.length
                ? Math.round(
                    opportunities.reduce((s, o) => s + o.healthScore, 0) /
                      opportunities.length
                  )
                : 0
            }
            label="筛选平均健康分"
          />
        </GlassCard>

        <GlassCard className="xl:col-span-8">
          <SectionTitle
            title="机会明细"
            subtitle={
              dimension
                ? `维度：${dimensionLabels[dimension]} · 按健康分升序`
                : "按健康分升序，点击可进入机会详情"
            }
          />
          <div className="space-y-2">
            {opportunities.map((opp) => {
              const snapshot = opp.healthSnapshots[0];
              const deductions = snapshot
                ? parseJson<Array<{ dimension: string; reason: string }>>(
                    snapshot.deductions,
                    []
                  )
                : [];
              const dimReason = dimension
                ? deductions.find((d) =>
                    d.dimension.includes(
                      dimensionLabels[dimension]?.slice(0, 2) ?? ""
                    )
                  )
                : null;

              return (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{opp.name}</p>
                      <p className="text-xs text-white/50">
                        {opp.customer.companyName} · {formatCurrency(opp.amount)}
                      </p>
                      {dimReason ? (
                        <p className="mt-1 text-xs text-amber-300">
                          丢分：{dimReason.reason}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <StatusBadge status={opp.healthStatus} />
                      <p
                        className={`mt-1 text-sm font-semibold ${healthStatusColor(opp.healthStatus)}`}
                      >
                        {opp.healthScore} 分
                      </p>
                    </div>
                  </div>
                  {snapshot ? (
                    <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-white/50">
                      <span>互动 {Math.round(snapshot.interactionScore)}</span>
                      <span>决策链 {Math.round(snapshot.decisionChainScore)}</span>
                      <span>匹配 {Math.round(snapshot.fitScore)}</span>
                      <span>紧迫 {Math.round(snapshot.urgencyScore)}</span>
                    </div>
                  ) : null}
                </Link>
              );
            })}
            {opportunities.length === 0 ? (
              <p className="py-6 text-center text-white/50">无匹配机会</p>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
