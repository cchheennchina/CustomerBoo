import { prisma } from "@/lib/db";
import { generateFollowUpScript } from "@/lib/ai/client";
import { parseJson } from "@/lib/utils";

interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

const DAY_LABELS: Record<string, string> = {
  MON: "周一",
  TUE: "周二",
  WED: "周三",
  THU: "周四",
  FRI: "周五",
};

export async function getTopContactWindows(limit = 3) {
  const settings = await prisma.userSettings.findFirst();
  const slots = parseJson<TimeSlot[]>(settings?.availableSlots ?? "[]", []);

  return slots.slice(0, limit).map((slot, index) => ({
    label: `${DAY_LABELS[slot.day] ?? slot.day} ${slot.start}-${slot.end}`,
    successRate: 0.78 - index * 0.03,
  }));
}

export async function generateFollowUpRecommendations(opportunityId: string) {
  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      customer: { include: { contacts: true } },
      engagements: { orderBy: { occurredAt: "desc" }, take: 5 },
    },
  });
  if (!opp) return [];

  const contact = opp.customer.contacts[0];
  const action =
    opp.emailOpenCount > 0
      ? `在最佳时段发送行业 benchmark 数据，跟进 ${contact?.name ?? "客户"} 对方案的反馈`
      : `改发简短语音消息，前 5 秒提及 ROI 与 ${opp.customer.industry ?? "行业"} 痛点`;

  const script = await generateFollowUpScript({
    contactName: contact?.name ?? "客户",
    action,
    industry: opp.customer.industry ?? undefined,
  });

  const rec = await prisma.followUpRecommendation.create({
    data: {
      opportunityId,
      action,
      channel: opp.emailOpenCount > 0 ? "邮件" : "语音消息",
      suggestedAt: new Date(Date.now() + 86400000),
      expectedRate: 0.78,
      script,
    },
  });

  return [rec];
}

export async function evaluateTriggerRules() {
  const opportunities = await prisma.opportunity.findMany({
    include: {
      engagements: {
        where: { type: "EMAIL_OPEN" },
        orderBy: { occurredAt: "desc" },
        take: 1,
      },
    },
  });

  const created = [];
  for (const opp of opportunities) {
    const lastOpen = opp.engagements[0];
    if (!lastOpen) continue;

    const hoursSince =
      (Date.now() - lastOpen.occurredAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince > 48) continue;

    const existing = await prisma.reminder.findFirst({
      where: {
        opportunityId: opp.id,
        title: { contains: "打开方案" },
        createdAt: { gte: new Date(Date.now() - 86400000) },
      },
    });
    if (existing) continue;

    const reminder = await prisma.reminder.create({
      data: {
        opportunityId: opp.id,
        title: "客户打开方案附件",
        message: `客户已于 ${lastOpen.occurredAt.toLocaleString("zh-CN")} 打开方案，建议 24 小时内跟进询问反馈。`,
        triggerRule: JSON.stringify({ type: "EMAIL_OPEN", withinHours: 24 }),
        dueAt: new Date(lastOpen.occurredAt.getTime() + 24 * 3600000),
      },
    });

    await prisma.notification.create({
      data: {
        type: "FOLLOW_UP",
        title: "跟进提醒",
        body: reminder.message,
        metadata: JSON.stringify({ opportunityId: opp.id }),
      },
    });

    created.push(reminder);
  }

  return created;
}
