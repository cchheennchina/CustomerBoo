import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { HealthDonut } from "@/components/dashboard/HealthDonut";
import {
  GlassCard,
  SectionTitle,
  StatusBadge,
} from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { generateCustomerSummary } from "@/lib/ai/client";
import { refreshOpportunityHealth } from "@/lib/scoring/refresh-health";
import { formatCurrency, formatDate, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await refreshOpportunityHealth(id);

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      customer: { include: { contacts: true } },
      healthSnapshots: { orderBy: { createdAt: "desc" }, take: 1 },
      engagements: { orderBy: { occurredAt: "desc" }, take: 5 },
    },
  });

  if (!opportunity) notFound();

  const snapshot = opportunity.healthSnapshots[0];
  const deductions = snapshot
    ? parseJson<Array<{ dimension: string; reason: string; impact: number }>>(
        snapshot.deductions,
        []
      )
    : [];

  const contact = opportunity.customer.contacts[0];
  const summary = await generateCustomerSummary({
    contactName: contact?.name ?? "客户",
    companyName: opportunity.customer.companyName,
    requirementText: opportunity.requirementText,
    competitorNotes: opportunity.competitorNotes,
    recentEngagements: opportunity.engagements.map(
      (e) => `${e.type} @ ${e.occurredAt.toLocaleDateString("zh-CN")}`
    ),
  });

  const cardText = `${contact?.name ?? "客户"}（${opportunity.customer.companyName} ${contact?.title ?? ""}）
核心承诺：${summary.commitments}
核心关注：${summary.customerFocus}
已做动作：${summary.actionsTaken}
关系温度：${summary.relationshipScore} 分（${summary.relationshipNote}）
下次沟通重点：${summary.nextFocus}`;

  return (
    <>
      <TopBar title={opportunity.name} />
      <div className="mb-4">
        <Link href="/opportunities" className="text-sm text-white/50 hover:text-white">
          ← 返回机会列表
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <GlassCard glow="purple" className="xl:col-span-4">
          <SectionTitle title="机会健康度" />
          <HealthDonut score={opportunity.healthScore} />
          <div className="mt-2 flex items-center justify-between">
            <StatusBadge status={opportunity.healthStatus} />
            <span className="text-sm text-white/60">
              成交概率 {Math.round(opportunity.winProbability * 100)}%
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70">
            <div>互动 {Math.round(snapshot?.interactionScore ?? 0)}</div>
            <div>决策链 {Math.round(snapshot?.decisionChainScore ?? 0)}</div>
            <div>匹配度 {Math.round(snapshot?.fitScore ?? 0)}</div>
            <div>紧迫性 {Math.round(snapshot?.urgencyScore ?? 0)}</div>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-8">
          <SectionTitle title="丢分原因明细" subtitle="针对性优化跟进动作" />
          <div className="space-y-2">
            {deductions.slice(0, 6).map((d, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-accent-orange">{d.dimension}</span>
                <span className="text-white/50"> · 影响 -{d.impact}</span>
                <p className="mt-1 text-white/80">{d.reason}</p>
              </div>
            ))}
            {deductions.length === 0 ? (
              <p className="text-sm text-white/50">暂无丢分项</p>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard glow="cyan" className="xl:col-span-6">
          <SectionTitle title="客户 360° 智能摘要" subtitle="三段式快速重温" />
          <div className="space-y-3 text-sm leading-7">
            <p>
              <span className="text-accent-cyan">我们承诺过：</span>
              {summary.commitments}
            </p>
            <p>
              <span className="text-accent-cyan">客户最在意：</span>
              {summary.customerFocus}
            </p>
            <p>
              <span className="text-accent-cyan">我们已做：</span>
              {summary.actionsTaken}
            </p>
          </div>
        </GlassCard>

        <GlassCard glow="pink" className="xl:col-span-6">
          <SectionTitle title="关系温度计" subtitle="0-10 分情感评分" />
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold text-accent-pink">
              {summary.relationshipScore}
            </span>
            <span className="pb-2 text-sm text-white/70">/ 10</span>
          </div>
          <p className="mt-3 text-sm text-white/75">{summary.relationshipNote}</p>
          <p className="mt-4 text-sm text-white/60">
            下次重点：{summary.nextFocus}
          </p>
        </GlassCard>

        <GlassCard className="xl:col-span-12">
          <SectionTitle title="30 秒客户卡片" subtitle="会议前快速浏览" />
          <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/85">
            {cardText}
          </pre>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/60">
            <span>金额 {formatCurrency(opportunity.amount)}</span>
            <span>阶段 {opportunity.stage}</span>
            <span>上次联系 {formatDate(opportunity.lastContactAt)}</span>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
