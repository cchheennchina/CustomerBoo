export type DashboardWidgetId =
  | "healthOverview"
  | "followUpTeaser"
  | "contentTeaser"
  | "morningBrief"
  | "riskPreview";

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  enabled: boolean;
  colSpan: number;
  title: string;
  subtitle?: string;
  maxItems?: number;
}

export interface DashboardConfig {
  pageTitle: string;
  showAverageScore: boolean;
  enableDrillDown: boolean;
  widgets: DashboardWidgetConfig[];
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  pageTitle: "机会健康度仪表盘",
  showAverageScore: true,
  enableDrillDown: true,
  widgets: [
    {
      id: "healthOverview",
      enabled: true,
      colSpan: 4,
      title: "机会健康度",
      subtitle: "自动评分 0-100",
    },
    {
      id: "followUpTeaser",
      enabled: true,
      colSpan: 4,
      title: "智能跟进提醒",
      subtitle: "本周高成功率时间窗",
    },
    {
      id: "contentTeaser",
      enabled: true,
      colSpan: 4,
      title: "个性化内容推送",
      subtitle: "动态素材库",
    },
    {
      id: "morningBrief",
      enabled: true,
      colSpan: 8,
      title: "晨间机会体温图",
      subtitle: "每日跟进优先级简报",
      maxItems: 5,
    },
    {
      id: "riskPreview",
      enabled: true,
      colSpan: 4,
      title: "风险预警",
      subtitle: "需优先处理",
      maxItems: 3,
    },
  ],
};

export function parseDashboardConfig(raw: string | null | undefined): DashboardConfig {
  if (!raw) return DEFAULT_DASHBOARD_CONFIG;
  try {
    const parsed = JSON.parse(raw) as Partial<DashboardConfig>;
    return {
      ...DEFAULT_DASHBOARD_CONFIG,
      ...parsed,
      widgets: parsed.widgets?.length
        ? parsed.widgets.map((w) => ({
            ...DEFAULT_DASHBOARD_CONFIG.widgets.find((d) => d.id === w.id),
            ...w,
          })) as DashboardWidgetConfig[]
        : DEFAULT_DASHBOARD_CONFIG.widgets,
    };
  } catch {
    return DEFAULT_DASHBOARD_CONFIG;
  }
}

export function colSpanClass(span: number) {
  const map: Record<number, string> = {
    3: "xl:col-span-3",
    4: "xl:col-span-4",
    5: "xl:col-span-5",
    6: "xl:col-span-6",
    7: "xl:col-span-7",
    8: "xl:col-span-8",
    9: "xl:col-span-9",
    12: "xl:col-span-12",
  };
  return map[span] ?? "xl:col-span-4";
}
