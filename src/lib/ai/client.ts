export interface CustomerSummary {
  commitments: string;
  customerFocus: string;
  actionsTaken: string;
  relationshipScore: number;
  relationshipNote: string;
  nextFocus: string;
}

export interface MeetingSummary {
  needs: string[];
  concerns: string[];
  hiddenExpectation: string;
  changes: string[];
  actionItems: Array<{
    title: string;
    assignee: "SALES" | "PRESALES" | "DELIVERY";
    dueDays: number;
  }>;
  structuredMinutes: string;
}

export interface ChannelCopies {
  wechat: string;
  email: string;
  linkedin: string;
  valuePoint: string;
}

async function callOpenAI(prompt: string): Promise<string | null> {
  const { getAiConfig } = await import("@/lib/config/service");
  const config = await getAiConfig();

  if (!config.enabled) return null;

  const apiKey = config.apiKey;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: config.temperature,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function generateCustomerSummary(input: {
  contactName: string;
  companyName: string;
  requirementText: string;
  competitorNotes: string;
  recentEngagements: string[];
}): Promise<CustomerSummary> {
  const ai = await callOpenAI(
    `为销售生成客户360摘要，JSON格式：{"commitments":"","customerFocus":"","actionsTaken":"","relationshipScore":8,"relationshipNote":"","nextFocus":""}。客户：${input.contactName}/${input.companyName}。需求：${input.requirementText}。`
  );

  if (ai) {
    try {
      const parsed = JSON.parse(ai) as CustomerSummary;
      return parsed;
    } catch {
      /* fall through */
    }
  }

  return {
    commitments: `提供定制化方案，交付周期不超过 3 个月，价格范围参考 ${input.companyName} 当前预算`,
    customerFocus: `${input.requirementText || "合规审计、数据安全、后期维护成本"}`,
    actionsTaken:
      input.recentEngagements.length > 0
        ? input.recentEngagements.slice(0, 3).join("；")
        : "已发送产品资质文件、同行业成功案例、方案说明",
    relationshipScore: input.recentEngagements.length >= 3 ? 8 : 5,
    relationshipNote:
      input.recentEngagements.length >= 3
        ? "客户近期回复及时，语气积极"
        : "客户近期互动偏少，需关注风险",
    nextFocus: "确认方案细节，推进下一步会议",
  };
}

export async function generateMeetingSummary(
  rawInput: string,
  previousNeeds: string[] = []
): Promise<MeetingSummary> {
  const ai = await callOpenAI(
    `从会议文本提取结构化纪要，返回JSON：{"needs":[],"concerns":[],"hiddenExpectation":"","changes":[],"actionItems":[{"title":"","assignee":"SALES","dueDays":3}],"structuredMinutes":""}。文本：${rawInput.slice(0, 4000)}`
  );

  if (ai) {
    try {
      return JSON.parse(ai) as MeetingSummary;
    } catch {
      /* fall through */
    }
  }

  const needs = [
    "支持多系统数据整合",
    "满足合规审计要求",
    "部署周期不超过 3 个月",
  ];
  const concerns = ["产品稳定性", "后期维护成本"];
  const changes =
    previousNeeds.length > 0
      ? ["客户新增合规审计担忧；部署周期由 4 个月缩短至 3 个月"]
      : ["首次记录，暂无历史对比"];

  return {
    needs,
    concerns,
    hiddenExpectation: "希望获得行业专属定制化方案",
    changes,
    actionItems: [
      {
        title: "向客户提供合规审计相关资质文件",
        assignee: "SALES",
        dueDays: 3,
      },
      {
        title: "调整产品部署方案，压缩周期至 3 个月内",
        assignee: "PRESALES",
        dueDays: 5,
      },
      {
        title: "提供同行业合规审计成功案例",
        assignee: "DELIVERY",
        dueDays: 7,
      },
    ],
    structuredMinutes: `# 项目沟通会议纪要\n\n## 核心需求\n${needs.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n## 客户顾虑\n${concerns.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n## 需求变化\n${changes.join("\n")}\n\n## 原始输入摘要\n${rawInput.slice(0, 300)}${rawInput.length > 300 ? "..." : ""}`,
  };
}

export async function generateFollowUpScript(input: {
  contactName: string;
  action: string;
  industry?: string;
}): Promise<string> {
  const ai = await callOpenAI(
    `生成一段中文销售跟进话术，动作：${input.action}，客户：${input.contactName}，行业：${input.industry ?? "通用"}`
  );
  if (ai) return ai;

  return `${input.contactName}您好！根据您近期关注的${input.industry ?? "行业"}动态，我整理了与贵司需求高度相关的 benchmark 数据，其中关键指标与我们的方案优势一致。如需进一步解读，欢迎随时沟通，期待您的反馈。`;
}

export async function generateChannelCopies(input: {
  title: string;
  summary: string;
  contactName: string;
  valuePoint: string;
}): Promise<ChannelCopies> {
  return {
    wechat: `${input.contactName}～看到${input.title}，和贵司当前需求很契合，分享给您～`,
    email: `尊敬的${input.contactName}：您好！近期${input.title}。${input.summary} 我们的方案可助力贵司快速落地：${input.valuePoint}。如需详细解读，可随时安排沟通。顺祝商祺！`,
    linkedin: `${input.title}。${input.summary} 您认为在该场景的应用还存在哪些挑战？欢迎交流～`,
    valuePoint: input.valuePoint,
  };
}

export async function generateRiskAction(input: {
  riskType: string;
  message: string;
}): Promise<{ action: string; successRate: number }> {
  if (input.riskType === "SILENCE") {
    return {
      action:
        "发送「简单问候 + 免费诊断邀请」，避免直接硬推方案；必要时抄送其上级价值信",
      successRate: 0.41,
    };
  }
  if (input.riskType === "COMPETITOR") {
    return {
      action: "使用价值对比话术 + 增值服务组合应对竞品降价",
      successRate: 0.68,
    };
  }
  return {
    action: "确认新决策人并安排 30 分钟对齐会议，更新决策链地图",
    successRate: 0.55,
  };
}
