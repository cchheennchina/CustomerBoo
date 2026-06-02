import { TopBar } from "@/components/layout/TopBar";
import { MeetingPanel } from "@/components/meetings/MeetingPanel";
import { GlassCard, SectionTitle } from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const [sessions, opportunities] = await Promise.all([
    prisma.meetingSession.findMany({
      include: { opportunity: { include: { customer: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.opportunity.findMany({ include: { customer: true } }),
  ]);

  return (
    <>
      <TopBar title="会议纪要与行动项" />
      <div className="grid gap-4 xl:grid-cols-12">
        <GlassCard glow="orange" className="xl:col-span-5">
          <SectionTitle title="粘贴会议转写 / 笔记" subtitle="5 分钟生成结构化纪要" />
          <MeetingPanel
            opportunities={opportunities.map((o) => ({
              id: o.id,
              label: `${o.name} · ${o.customer.companyName}`,
            }))}
          />
        </GlassCard>

        <GlassCard className="xl:col-span-7">
          <SectionTitle title="最近会议纪要" />
          <div className="space-y-4">
            {sessions.map((s) => {
              const parsed = parseJson<{
                needs?: string[];
                concerns?: string[];
                structuredMinutes?: string;
              }>(s.structuredOutput, {});
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-white/50">
                    {s.opportunity.name} ·{" "}
                    {s.createdAt.toLocaleString("zh-CN")}
                  </p>
                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-accent-cyan">核心需求</p>
                      <ul className="mt-1 list-disc pl-5 text-white/70">
                        {(parsed.needs ?? []).map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-accent-orange">客户顾虑</p>
                      <ul className="mt-1 list-disc pl-5 text-white/70">
                        {(parsed.concerns ?? []).map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
