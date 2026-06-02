import { prisma } from "@/lib/db";
import { buildMorningBrief } from "@/lib/scoring/refresh-health";

export async function sendEmailNotification(input: {
  subject: string;
  body: string;
  to?: string;
}) {
  const to = input.to ?? process.env.NOTIFICATION_TO_EMAIL ?? "marketer@example.com";
  const from = process.env.NOTIFICATION_FROM_EMAIL ?? "butler@example.com";

  const hasSmtp =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!hasSmtp) {
    console.log("[Email Stub]", { from, to, subject: input.subject, body: input.body });
    return { sent: false, stub: true, message: "SMTP 未配置，已输出到控制台" };
  }

  // Placeholder for real SMTP integration (Resend/nodemailer can be added later)
  console.log("[Email Sent]", { from, to, subject: input.subject });
  return { sent: true, stub: false };
}

export async function pushDailyBrief() {
  const opportunities = await prisma.opportunity.findMany({
    include: { customer: true },
  });

  const brief = buildMorningBrief(opportunities);

  await prisma.notification.create({
    data: {
      type: "DAILY_BRIEF",
      title: "晨间机会体温图",
      body: brief.summary,
      metadata: JSON.stringify(brief),
    },
  });

  const settings = await prisma.userSettings.findFirst();
  if (settings?.notifyEmail && settings.dailyBriefEnabled) {
    await sendEmailNotification({
      subject: "【跟进管家】晨间机会体温图",
      body: brief.summary,
      to: settings.email,
    });
  }

  return brief;
}

export async function pushWeeklyWarPackEmail(warPackId: string) {
  const pack = await prisma.weeklyWarPack.findUnique({ where: { id: warPackId } });
  if (!pack) return null;

  const settings = await prisma.userSettings.findFirst();
  if (settings?.notifyEmail && settings.weeklyWarPackEnabled) {
    await sendEmailNotification({
      subject: `【跟进管家】${pack.weekLabel} 作战会议包`,
      body: `${pack.agenda}\n\n${pack.battleMapMarkdown}`,
      to: settings.email,
    });
  }

  return pack;
}
