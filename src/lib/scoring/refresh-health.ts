import { prisma } from "@/lib/db";
import {
  calculateHealthScore,
  type OpportunityScoreInput,
} from "@/lib/scoring/health-scorer";
import { parseJson } from "@/lib/utils";

export async function buildScoreInput(
  opportunityId: string
): Promise<OpportunityScoreInput | null> {
  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      customer: { include: { contacts: true } },
    },
  });
  if (!opp) return null;

  return {
    lastContactAt: opp.lastContactAt,
    nextActivityAt: opp.nextActivityAt,
    deadlineAt: opp.deadlineAt,
    proposalCount: opp.proposalCount,
    emailOpenCount: opp.emailOpenCount,
    meetingAttendRate: opp.meetingAttendRate,
    requirementText: opp.requirementText,
    decisionMakerCount: opp.customer.contacts.filter((c) => c.isDecisionMaker)
      .length,
    totalContactCount: opp.customer.contacts.length,
    keywords: parseJson<string[]>(opp.customer.keywords, []),
  };
}

export async function refreshOpportunityHealth(opportunityId: string) {
  const input = await buildScoreInput(opportunityId);
  if (!input) return null;

  const result = calculateHealthScore(input);

  await prisma.$transaction([
    prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        healthScore: result.totalScore,
        healthStatus: result.status,
      },
    }),
    prisma.healthScoreSnapshot.create({
      data: {
        opportunityId,
        totalScore: result.totalScore,
        status: result.status,
        interactionScore: result.interactionScore,
        decisionChainScore: result.decisionChainScore,
        fitScore: result.fitScore,
        urgencyScore: result.urgencyScore,
        deductions: JSON.stringify(result.deductions),
      },
    }),
  ]);

  return result;
}

export async function refreshAllHealthScores() {
  const opportunities = await prisma.opportunity.findMany({
    select: { id: true },
  });
  const results = [];
  for (const opp of opportunities) {
    results.push(await refreshOpportunityHealth(opp.id));
  }
  return results;
}

export function buildMorningBrief(
  opportunities: Array<{
    id: string;
    name: string;
    healthScore: number;
    healthStatus: string;
    winProbability: number;
    amount: number;
    customer: { companyName: string };
  }>
) {
  const subhealthy = opportunities.filter((o) => o.healthStatus === "SUBHEALTHY");
  const dangerous = opportunities.filter((o) => o.healthStatus === "DANGEROUS");

  const priority = [...subhealthy, ...dangerous]
    .sort((a, b) => {
      const scoreDiff = a.healthScore - b.healthScore;
      if (scoreDiff !== 0) return scoreDiff;
      return b.winProbability * b.amount - a.winProbability * a.amount;
    })
    .slice(0, 3);

  const top = priority[0];
  const topLine = top
    ? `建议优先处理${top.name}（${top.customer.companyName}，成交概率 ${Math.round(top.winProbability * 100)}%，金额 ${Math.round(top.amount / 10000)} 万）`
    : "当前无高风险机会，可聚焦健康机会推进签约。";

  return {
    summary: `你有 ${subhealthy.length} 个亚健康机会，${dangerous.length} 个危险机会。${topLine}`,
    subhealthyCount: subhealthy.length,
    dangerousCount: dangerous.length,
    healthyCount: opportunities.filter((o) => o.healthStatus === "HEALTHY")
      .length,
    priority,
  };
}
