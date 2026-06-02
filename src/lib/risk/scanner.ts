import { RiskLevel, RiskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateRiskAction } from "@/lib/ai/client";

function daysSince(date: Date | null): number {
  if (!date) return 999;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export async function scanRiskSignals(opportunityId?: string) {
  const opportunities = await prisma.opportunity.findMany({
    where: opportunityId ? { id: opportunityId } : undefined,
    include: { customer: true },
  });

  const signals = [];

  for (const opp of opportunities) {
    const silenceDays = daysSince(opp.lastContactAt);
    let type: RiskType | null = null;
    let level: RiskLevel = "LOW";
    let message = "";

    if (silenceDays >= 30 && opp.amount >= 300000) {
      type = "SILENCE";
      level = "HIGH";
      message = `${opp.name} 已沉默 ${silenceDays} 天（金额 ${Math.round(opp.amount / 10000)} 万）`;
    } else if (silenceDays >= 21) {
      type = "SILENCE";
      level = silenceDays >= 30 ? "HIGH" : "MEDIUM";
      message = `${opp.name} 触发沉默风险（已沉默 ${silenceDays} 天）`;
    }

    if (opp.competitorNotes.trim()) {
      type = "COMPETITOR";
      level = opp.competitorNotes.includes("降价") ? "HIGH" : "MEDIUM";
      message = `${opp.customer.companyName} 检测到竞品动态：${opp.competitorNotes}`;
    }

    if (opp.personnelNotes.trim()) {
      type = "PERSONNEL";
      level = opp.personnelNotes.includes("总监") || opp.personnelNotes.includes("负责人")
        ? "HIGH"
        : "MEDIUM";
      message = `${opp.customer.companyName} 人事变动：${opp.personnelNotes}`;
    }

    if (!type) continue;

    const recommendation = await generateRiskAction({
      riskType: type,
      message,
    });

    const existing = await prisma.riskSignal.findFirst({
      where: {
        opportunityId: opp.id,
        type,
        isResolved: false,
      },
    });

    if (existing) {
      await prisma.riskSignal.update({
        where: { id: existing.id },
        data: {
          level,
          message,
          recommendedAction: recommendation.action,
          successRate: recommendation.successRate,
        },
      });
      signals.push(existing.id);
    } else {
      const created = await prisma.riskSignal.create({
        data: {
          opportunityId: opp.id,
          type,
          level,
          message,
          recommendedAction: recommendation.action,
          successRate: recommendation.successRate,
        },
      });
      signals.push(created.id);

      if (level === "HIGH") {
        await prisma.notification.create({
          data: {
            type: "RISK",
            title: "高风险预警",
            body: `【${opp.name}】${message}。建议：${recommendation.action}`,
            metadata: JSON.stringify({ opportunityId: opp.id, riskId: created.id }),
          },
        });
      }
    }
  }

  return signals;
}

export async function createResponsePlan(riskId: string) {
  const risk = await prisma.riskSignal.findUnique({
    where: { id: riskId },
    include: { opportunity: true },
  });
  if (!risk) return null;

  const tasks = [
    {
      title: `风险应对：${risk.recommendedAction}`,
      assignee: "SALES" as const,
      dueDays: 2,
    },
    {
      title: `安排跟进会议 - ${risk.opportunity.name}`,
      assignee: "PRESALES" as const,
      dueDays: 4,
    },
  ];

  const createdTasks = [];
  for (const t of tasks) {
    const task = await prisma.task.create({
      data: {
        opportunityId: risk.opportunityId,
        title: t.title,
        assignee: t.assignee,
        source: "RISK",
        dueAt: new Date(Date.now() + t.dueDays * 86400000),
      },
    });
    createdTasks.push(task);
  }

  return createdTasks;
}
