import { PrismaClient } from "@prisma/client";
import { calculateHealthScore } from "../src/lib/scoring/health-scorer";
import { refreshOpportunityHealth } from "../src/lib/scoring/refresh-health";
import { hashPassword } from "../src/lib/auth/session";
import { DEFAULT_DASHBOARD_CONFIG } from "../src/lib/config/dashboard";
import { DEFAULT_AI_CONFIG } from "../src/lib/config/ai";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.riskSignal.deleteMany();
  await prisma.meetingSession.deleteMany();
  await prisma.contentCalendar.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.followUpRecommendation.deleteMany();
  await prisma.healthScoreSnapshot.deleteMany();
  await prisma.engagement.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.weeklyWarPack.deleteMany();
  await prisma.resourceCapacity.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        username: "marketer",
        passwordHash: hashPassword("demo123"),
        displayName: "市场专员",
        role: "MARKETER",
      },
      {
        username: "admin",
        passwordHash: hashPassword("admin123"),
        displayName: "系统管理员",
        role: "ADMIN",
      },
    ],
  });

  await prisma.systemConfig.upsert({
    where: { id: "default" },
    update: { dashboardConfig: JSON.stringify(DEFAULT_DASHBOARD_CONFIG) },
    create: {
      id: "default",
      dashboardConfig: JSON.stringify(DEFAULT_DASHBOARD_CONFIG),
      aiConfig: JSON.stringify(DEFAULT_AI_CONFIG),
    },
  });

  await prisma.userSettings.upsert({
    where: { email: "marketer@example.com" },
    update: {},
    create: {
      email: "marketer@example.com",
      availableSlots: JSON.stringify([
        { day: "TUE", start: "14:00", end: "16:00" },
        { day: "THU", start: "15:30", end: "17:00" },
        { day: "FRI", start: "10:00", end: "12:00" },
      ]),
    },
  });

  await prisma.resourceCapacity.createMany({
    data: [
      {
        roleName: "售前",
        personName: "李工",
        weekLoad: 3,
        maxLoad: 3,
        notes: "本周演示排期已满",
      },
      {
        roleName: "交付",
        personName: "王顾问",
        weekLoad: 1,
        maxLoad: 3,
      },
    ],
  });

  const samples = [
    {
      companyName: "星河科技",
      industry: "智能制造",
      keywords: ["AI质检", "数据整合"],
      contactName: "张总",
      contactTitle: "采购总监",
      isDecisionMaker: true,
      opportunityName: "张总-智能质检项目",
      amount: 500000,
      winProbability: 0.7,
      stage: "方案推进",
      lastContactAt: new Date(Date.now() - 10 * 86400000),
      nextActivityAt: new Date(Date.now() + 3 * 86400000),
      deadlineAt: new Date(Date.now() + 45 * 86400000),
      proposalCount: 2,
      emailOpenCount: 3,
      meetingAttendRate: 0.9,
      requirementText: "需要AI质检与多系统数据整合，关注合规审计",
      competitorNotes: "",
      personnelNotes: "",
    },
    {
      companyName: "云图信息",
      industry: "金融科技",
      keywords: ["合规", "安全"],
      contactName: "李总",
      contactTitle: "IT经理",
      isDecisionMaker: false,
      opportunityName: "李总-核心系统升级",
      amount: 400000,
      winProbability: 0.65,
      stage: "需求沟通",
      lastContactAt: new Date(Date.now() - 32 * 86400000),
      nextActivityAt: new Date(Date.now() - 5 * 86400000),
      deadlineAt: new Date(Date.now() + 20 * 86400000),
      proposalCount: 1,
      emailOpenCount: 0,
      meetingAttendRate: 0.4,
      requirementText: "系统升级、合规审计、控制维护成本",
      competitorNotes: "竞品A近期降价15%",
      personnelNotes: "",
    },
    {
      companyName: "启航医疗",
      industry: "医疗健康",
      keywords: ["HIPAA", "迁移"],
      contactName: "王总",
      contactTitle: "VP",
      isDecisionMaker: true,
      opportunityName: "王总-数据平台项目",
      amount: 350000,
      winProbability: 0.68,
      stage: "初步接触",
      lastContactAt: new Date(Date.now() - 5 * 86400000),
      nextActivityAt: new Date(Date.now() + 7 * 86400000),
      deadlineAt: new Date(Date.now() + 60 * 86400000),
      proposalCount: 1,
      emailOpenCount: 2,
      meetingAttendRate: 1,
      requirementText: "数据迁移、HIPAA合规",
      competitorNotes: "",
      personnelNotes: "新任命采购总监",
    },
  ];

  for (const s of samples) {
    const customer = await prisma.customer.create({
      data: {
        companyName: s.companyName,
        industry: s.industry,
        keywords: JSON.stringify(s.keywords),
        contacts: {
          create: [
            {
              name: s.contactName,
              title: s.contactTitle,
              isDecisionMaker: s.isDecisionMaker,
            },
            {
              name: "对接人",
              title: "项目经理",
              isDecisionMaker: false,
            },
          ],
        },
        opportunities: {
          create: {
            name: s.opportunityName,
            amount: s.amount,
            winProbability: s.winProbability,
            stage: s.stage,
            lastContactAt: s.lastContactAt,
            nextActivityAt: s.nextActivityAt,
            deadlineAt: s.deadlineAt,
            proposalCount: s.proposalCount,
            emailOpenCount: s.emailOpenCount,
            meetingAttendRate: s.meetingAttendRate,
            requirementText: s.requirementText,
            competitorNotes: s.competitorNotes,
            personnelNotes: s.personnelNotes,
            engagements: {
              create: [
                { type: "MEETING", occurredAt: s.lastContactAt ?? new Date() },
                { type: "EMAIL_OPEN", occurredAt: new Date(Date.now() - 86400000) },
              ],
            },
          },
        },
      },
      include: { opportunities: true },
    });

    const oppId = customer.opportunities[0].id;
    await refreshOpportunityHealth(oppId);

    await prisma.contentItem.create({
      data: {
        opportunityId: oppId,
        title: `${s.industry}数字化转型白皮书发布`,
        summary: `头部企业正在通过 AI 提升${s.industry}效率，与贵司方向一致。`,
        valuePoint: "我们的模块支持跨系统迁移，效率提升 50%",
        wechatCopy: `${s.contactName}～行业白皮书刚发布，和贵司需求很契合～`,
        emailCopy: `尊敬的${s.contactName}，附件为行业白皮书摘要...`,
        linkedinCopy: `${s.industry}数字化趋势更新，欢迎交流应用场景挑战。`,
      },
    });

    await prisma.contentCalendar.createMany({
      data: [
        {
          opportunityId: oppId,
          dayOfWeek: "周一",
          theme: "行业洞察",
          contentHint: "分享行业趋势报告",
        },
        {
          opportunityId: oppId,
          dayOfWeek: "周三",
          theme: "案例短故事",
          contentHint: "同行业成功案例",
        },
        {
          opportunityId: oppId,
          dayOfWeek: "周五",
          theme: "轻松问候",
          contentHint: "结合客户近期动态友好互动",
        },
      ],
    });
  }

  await prisma.notification.create({
    data: {
      type: "SYSTEM",
      title: "演示数据已加载",
      body: "欢迎使用客户关系跟进管家，可在仪表盘查看机会健康度。",
    },
  });

  console.log("Seed completed. Sample health score demo:",
    calculateHealthScore({
      lastContactAt: new Date(Date.now() - 32 * 86400000),
      nextActivityAt: null,
      deadlineAt: new Date(Date.now() + 20 * 86400000),
      proposalCount: 1,
      emailOpenCount: 0,
      meetingAttendRate: 0.4,
      requirementText: "合规审计",
      decisionMakerCount: 0,
      totalContactCount: 1,
      keywords: ["合规"],
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
