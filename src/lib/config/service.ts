import { prisma } from "@/lib/db";
import {
  DEFAULT_DASHBOARD_CONFIG,
  parseDashboardConfig,
  type DashboardConfig,
} from "@/lib/config/dashboard";
import {
  DEFAULT_AI_CONFIG,
  parseAiConfig,
  resolveAiConfig,
  type AiConfig,
} from "@/lib/config/ai";

export async function getDashboardConfig(): Promise<DashboardConfig> {
  const row = await prisma.systemConfig.findUnique({ where: { id: "default" } });
  return parseDashboardConfig(row?.dashboardConfig);
}

export async function getAiConfig(): Promise<AiConfig> {
  const row = await prisma.systemConfig.findUnique({ where: { id: "default" } });
  return resolveAiConfig(parseAiConfig(row?.aiConfig));
}

export async function getAiConfigRaw(): Promise<AiConfig> {
  const row = await prisma.systemConfig.findUnique({ where: { id: "default" } });
  return parseAiConfig(row?.aiConfig);
}

export async function saveAiConfig(
  config: AiConfig,
  options?: { keepExistingKey?: boolean }
) {
  const existing = await getAiConfigRaw();
  const next: AiConfig = {
    ...config,
    apiKey:
      options?.keepExistingKey && !config.apiKey
        ? existing.apiKey
        : config.apiKey,
  };

  await prisma.systemConfig.upsert({
    where: { id: "default" },
    update: { aiConfig: JSON.stringify(next) },
    create: {
      id: "default",
      dashboardConfig: JSON.stringify(DEFAULT_DASHBOARD_CONFIG),
      aiConfig: JSON.stringify(next),
    },
  });

  return next;
}

export async function saveDashboardConfig(config: DashboardConfig) {
  await prisma.systemConfig.upsert({
    where: { id: "default" },
    update: { dashboardConfig: JSON.stringify(config) },
    create: {
      id: "default",
      dashboardConfig: JSON.stringify(config),
      aiConfig: JSON.stringify(DEFAULT_AI_CONFIG),
    },
  });
  return config;
}

export async function ensureSystemConfig() {
  const existing = await prisma.systemConfig.findUnique({ where: { id: "default" } });
  if (!existing) {
    await prisma.systemConfig.create({
      data: {
        id: "default",
        dashboardConfig: JSON.stringify(DEFAULT_DASHBOARD_CONFIG),
        aiConfig: JSON.stringify(DEFAULT_AI_CONFIG),
      },
    });
  }
}
