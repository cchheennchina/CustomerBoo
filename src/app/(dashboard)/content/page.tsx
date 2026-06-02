import { TopBar } from "@/components/layout/TopBar";
import { ContentPanel } from "@/components/content/ContentPanel";
import { GlassCard, SectionTitle } from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const [items, calendars, opportunities] = await Promise.all([
    prisma.contentItem.findMany({
      include: { opportunity: { include: { customer: true } } },
      orderBy: { relevance: "desc" },
    }),
    prisma.contentCalendar.findMany({
      include: { opportunity: true },
    }),
    prisma.opportunity.findMany({
      include: { customer: true },
    }),
  ]);

  return (
    <>
      <TopBar title="个性化内容推送" />
      <div className="grid gap-4 xl:grid-cols-12">
        <GlassCard glow="cyan" className="xl:col-span-8">
          <SectionTitle title="可推送内容列表" subtitle="按相关性排序" />
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-white/60">{item.summary}</p>
                  </div>
                  <span className="text-xs text-accent-cyan">
                    {item.opportunity.name}
                  </span>
                </div>
                <p className="mt-3 text-sm text-accent-pink">
                  价值点：{item.valuePoint}
                </p>
                <div className="mt-3 grid gap-2 text-xs text-white/70 md:grid-cols-3">
                  <p>微信：{item.wechatCopy}</p>
                  <p>邮件：{item.emailCopy?.slice(0, 80)}...</p>
                  <p>LinkedIn：{item.linkedinCopy?.slice(0, 80)}...</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-4">
          <SectionTitle title="个性化内容日历" />
          <div className="space-y-2">
            {calendars.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"
              >
                <p className="font-medium">{c.dayOfWeek}</p>
                <p className="text-white/70">{c.theme}</p>
                <p className="mt-1 text-white/50">{c.contentHint}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-12">
          <SectionTitle title="新增内容素材" subtitle="手动录入 / 模拟 RSS" />
          <ContentPanel
            opportunities={opportunities.map((o) => ({
              id: o.id,
              label: `${o.name} · ${o.customer.companyName}`,
            }))}
          />
        </GlassCard>
      </div>
    </>
  );
}
