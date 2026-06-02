import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export async function generateWeeklyWarPack() {
  const opportunities = await prisma.opportunity.findMany({
    include: { customer: { include: { contacts: true } } },
    orderBy: [{ healthScore: "asc" }, { winProbability: "desc" }],
  });

  const top3 = opportunities
    .filter((o) => o.healthStatus !== "HEALTHY" || o.winProbability >= 0.65)
    .sort((a, b) => {
      const priorityA = (100 - a.healthScore) * a.winProbability * a.amount;
      const priorityB = (100 - b.healthScore) * b.winProbability * b.amount;
      return priorityB - priorityA;
    })
    .slice(0, 3);

  const resources = await prisma.resourceCapacity.findMany();
  const weekLabel = `第 ${getWeekNumber(new Date())} 周`;

  const agenda = `# 本周机会作战会议议程（${weekLabel}）

1. 核心机会推进：${top3.map((o) => o.name).join("、") || "暂无"} 进展同步
2. 风险处理：${opportunities.filter((o) => o.healthStatus === "DANGEROUS").length} 个危险机会应对
3. 资源协调：售前/交付支持预约
4. 下周计划：明确核心目标与关键动作`;

  const plans = top3.map((opp) => ({
    name: opp.name,
    amount: opp.amount,
    winProbability: opp.winProbability,
    healthScore: opp.healthScore,
    goal: opp.healthStatus === "DANGEROUS" ? "重新激活客户并确认需求" : "确认方案细节，推进签约意向",
    resources: "售前支持（建议周二上午演示）",
    fallback: "若客户对价格有异议，可提供分期或增值维护服务",
  }));

  const resourceNotes =
    resources.length > 0
      ? resources
          .map(
            (r) =>
              `${r.personName}（${r.roleName}）负荷 ${r.weekLoad}/${r.maxLoad}${r.weekLoad >= r.maxLoad ? "，建议预约下周时段" : ""}`
          )
          .join("\n")
      : "可在设置页录入内部资源负荷数据";

  const battleMapMarkdown = `# A4 作战地图 — ${weekLabel}

| 机会 | 本周目标 | 关键动作 | 话术钩子 | 所需资源 |
|------|----------|----------|----------|----------|
${top3
  .map(
    (o) =>
      `| ${o.name}（${formatCurrency(o.amount)}） | ${o.healthStatus === "DANGEROUS" ? "风险化解" : "推进签约"} | 1. 安排演示 2. 跟进反馈 | "贵司关注的合规问题，我们已通过相关认证" | 售前支持 |`
  )
  .join("\n")}

## 资源瓶颈
${resourceNotes}
`;

  const pack = await prisma.weeklyWarPack.create({
    data: {
      weekLabel,
      agenda,
      topOpportunities: JSON.stringify(top3.map((o) => ({
        id: o.id,
        name: o.name,
        healthScore: o.healthScore,
        winProbability: o.winProbability,
        amount: o.amount,
      }))),
      plans: JSON.stringify(plans),
      resourceNotes,
      battleMapMarkdown,
    },
  });

  await prisma.notification.create({
    data: {
      type: "WEEKLY_WARPACK",
      title: "周度作战会议包已生成",
      body: `${weekLabel} 作战地图已就绪，包含 ${top3.length} 个核心机会。`,
      metadata: JSON.stringify({ warPackId: pack.id }),
    },
  });

  return pack;
}

function getWeekNumber(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}
