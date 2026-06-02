import { HealthStatus } from "@prisma/client";

export interface ScoreDeduction {
  dimension: string;
  reason: string;
  impact: number;
}

export interface HealthScoreResult {
  totalScore: number;
  status: HealthStatus;
  interactionScore: number;
  decisionChainScore: number;
  fitScore: number;
  urgencyScore: number;
  deductions: ScoreDeduction[];
}

export interface OpportunityScoreInput {
  lastContactAt: Date | null;
  nextActivityAt: Date | null;
  deadlineAt: Date | null;
  proposalCount: number;
  emailOpenCount: number;
  meetingAttendRate: number;
  requirementText: string;
  decisionMakerCount: number;
  totalContactCount: number;
  keywords: string[];
}

const WEIGHTS = {
  interaction: 0.3,
  decisionChain: 0.25,
  fit: 0.25,
  urgency: 0.2,
};

function daysSince(date: Date | null, now = new Date()): number | null {
  if (!date) return null;
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(date: Date | null, now = new Date()): number | null {
  if (!date) return null;
  return Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function scoreInteraction(input: OpportunityScoreInput): {
  score: number;
  deductions: ScoreDeduction[];
} {
  const deductions: ScoreDeduction[] = [];
  let score = 100;
  const days = daysSince(input.lastContactAt);

  if (days === null) {
    score -= 50;
    deductions.push({
      dimension: "互动频率",
      reason: "尚无联系记录",
      impact: 50,
    });
  } else if (days > 21) {
    score -= 45;
    deductions.push({
      dimension: "互动频率",
      reason: `上次联系已是 ${days} 天前`,
      impact: 45,
    });
  } else if (days > 14) {
    score -= 30;
    deductions.push({
      dimension: "互动频率",
      reason: `上次联系已是 ${days} 天前`,
      impact: 30,
    });
  } else if (days > 7) {
    score -= 15;
    deductions.push({
      dimension: "互动频率",
      reason: `上次联系已是 ${days} 天前，建议本周内跟进`,
      impact: 15,
    });
  }

  if (input.emailOpenCount === 0 && input.proposalCount > 0) {
    score -= 20;
    deductions.push({
      dimension: "互动频率",
      reason: "已发方案但客户尚未打开邮件",
      impact: 20,
    });
  } else if (input.emailOpenCount > 0 && input.emailOpenCount < 2) {
    score -= 8;
    deductions.push({
      dimension: "互动频率",
      reason: "客户最近两次未打开邮件",
      impact: 8,
    });
  }

  if (input.meetingAttendRate < 0.5) {
    score -= 15;
    deductions.push({
      dimension: "互动频率",
      reason: "会议参与率偏低",
      impact: 15,
    });
  }

  return { score: Math.max(0, Math.min(100, score)), deductions };
}

export function scoreDecisionChain(input: OpportunityScoreInput): {
  score: number;
  deductions: ScoreDeduction[];
} {
  const deductions: ScoreDeduction[] = [];
  let score = 100;

  if (input.totalContactCount <= 1) {
    score -= 55;
    deductions.push({
      dimension: "决策链覆盖度",
      reason: "仅联系客户对接人，未覆盖决策层",
      impact: 55,
    });
  } else if (input.decisionMakerCount === 0) {
    score -= 40;
    deductions.push({
      dimension: "决策链覆盖度",
      reason: "尚未触达任何决策层联系人",
      impact: 40,
    });
  } else if (input.decisionMakerCount === 1 && input.totalContactCount < 3) {
    score -= 20;
    deductions.push({
      dimension: "决策链覆盖度",
      reason: "决策链覆盖不完整，建议补充部门负责人",
      impact: 20,
    });
  }

  return { score: Math.max(0, Math.min(100, score)), deductions };
}

export function scoreFit(input: OpportunityScoreInput): {
  score: number;
  deductions: ScoreDeduction[];
} {
  const deductions: ScoreDeduction[] = [];
  let score = 75;

  const req = input.requirementText.toLowerCase();
  const keywordHits = input.keywords.filter((k) =>
    req.includes(k.toLowerCase())
  ).length;

  if (input.requirementText.trim().length === 0) {
    score -= 25;
    deductions.push({
      dimension: "方案匹配度",
      reason: "缺少客户需求描述，无法评估匹配度",
      impact: 25,
    });
  } else if (keywordHits === 0 && input.keywords.length > 0) {
    score -= 20;
    deductions.push({
      dimension: "方案匹配度",
      reason: "需求文本与行业关键词匹配度较低",
      impact: 20,
    });
  } else {
    score += Math.min(25, keywordHits * 8);
  }

  if (input.proposalCount === 0) {
    score -= 15;
    deductions.push({
      dimension: "方案匹配度",
      reason: "尚未发送任何方案",
      impact: 15,
    });
  } else if (input.proposalCount >= 3 && input.emailOpenCount === 0) {
    score -= 10;
    deductions.push({
      dimension: "方案匹配度",
      reason: "多次发送方案但客户反馈不足",
      impact: 10,
    });
  }

  return { score: Math.max(0, Math.min(100, score)), deductions };
}

export function scoreUrgency(input: OpportunityScoreInput): {
  score: number;
  deductions: ScoreDeduction[];
} {
  const deductions: ScoreDeduction[] = [];
  let score = 80;
  const deadlineDays = daysUntil(input.deadlineAt);
  const nextActivityDays = daysUntil(input.nextActivityAt);

  if (deadlineDays !== null) {
    if (deadlineDays < 0) {
      score -= 40;
      deductions.push({
        dimension: "时间紧迫性",
        reason: "已过客户立项/预算截止日",
        impact: 40,
      });
    } else if (deadlineDays <= 14) {
      score += 15;
    } else if (deadlineDays <= 30) {
      score += 5;
    } else {
      score -= 10;
      deductions.push({
        dimension: "时间紧迫性",
        reason: "距离截止日仍较远，推进节奏可加强",
        impact: 10,
      });
    }
  } else {
    score -= 15;
    deductions.push({
      dimension: "时间紧迫性",
      reason: "未设置立项/预算截止日",
      impact: 15,
    });
  }

  if (nextActivityDays !== null && nextActivityDays < 0) {
    score -= 20;
    deductions.push({
      dimension: "时间紧迫性",
      reason: "下次活动日期已过期",
      impact: 20,
    });
  }

  return { score: Math.max(0, Math.min(100, score)), deductions };
}

export function calculateHealthScore(
  input: OpportunityScoreInput
): HealthScoreResult {
  const interaction = scoreInteraction(input);
  const decisionChain = scoreDecisionChain(input);
  const fit = scoreFit(input);
  const urgency = scoreUrgency(input);

  const totalScore = Math.round(
    interaction.score * WEIGHTS.interaction +
      decisionChain.score * WEIGHTS.decisionChain +
      fit.score * WEIGHTS.fit +
      urgency.score * WEIGHTS.urgency
  );

  let status: HealthStatus = "SUBHEALTHY";
  if (totalScore > 70) status = "HEALTHY";
  else if (totalScore < 40) status = "DANGEROUS";

  return {
    totalScore,
    status,
    interactionScore: interaction.score,
    decisionChainScore: decisionChain.score,
    fitScore: fit.score,
    urgencyScore: urgency.score,
    deductions: [
      ...interaction.deductions,
      ...decisionChain.deductions,
      ...fit.deductions,
      ...urgency.deductions,
    ].sort((a, b) => b.impact - a.impact),
  };
}

export function statusFromScore(score: number): HealthStatus {
  if (score > 70) return "HEALTHY";
  if (score < 40) return "DANGEROUS";
  return "SUBHEALTHY";
}
