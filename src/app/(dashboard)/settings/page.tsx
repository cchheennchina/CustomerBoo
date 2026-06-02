import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { GlassCard, SectionTitle } from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { getAiConfig } from "@/lib/config/service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, notifications, aiConfig] = await Promise.all([
    prisma.userSettings.findFirst(),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getAiConfig(),
  ]);

  return (
    <>
      <TopBar title="设置与通知" />
      <div className="grid gap-4 xl:grid-cols-12">
        <GlassCard glow="purple" className="xl:col-span-12">
          <SectionTitle
            title="AI 大模型"
            subtitle={`当前模型：${aiConfig.model}${aiConfig.apiKey ? "" : "（未配置 Key，使用模板降级）"}`}
            action={
              <Link href="/settings/ai" className="text-sm text-accent-purple">
                进入配置 →
              </Link>
            }
          />
          <p className="text-sm text-white/60">
            在此选择 GPT / DeepSeek / 通义千问等 OpenAI 兼容模型，并配置 API Key。
          </p>
        </GlassCard>

        <GlassCard className="xl:col-span-5">
          <SectionTitle title="用户偏好" subtitle="通知与可联络时段" />
          <SettingsPanel
            settings={{
              email: settings?.email ?? "marketer@example.com",
              notifyEmail: settings?.notifyEmail ?? true,
              notifyInApp: settings?.notifyInApp ?? true,
              dailyBriefEnabled: settings?.dailyBriefEnabled ?? true,
              weeklyWarPackEnabled: settings?.weeklyWarPackEnabled ?? true,
              availableSlots: settings?.availableSlots ?? "[]",
            }}
          />
        </GlassCard>

        <GlassCard glow="cyan" className="xl:col-span-7">
          <SectionTitle title="站内通知" />
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{n.title}</p>
                  <span className="text-xs text-white/40">
                    {n.createdAt.toLocaleString("zh-CN")}
                  </span>
                </div>
                <p className="mt-1 text-white/70">{n.body}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
