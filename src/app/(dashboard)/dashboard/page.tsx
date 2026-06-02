import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { HealthDonut } from "@/components/dashboard/HealthDonut";
import {
  GlassCard,
  SectionTitle,
  StatusBadge,
} from "@/components/glass/GlassCard";
import { prisma } from "@/lib/db";
import { getDashboardConfig } from "@/lib/config/service";
import { buildMorningBrief } from "@/lib/scoring/refresh-health";
import { colSpanClass } from "@/lib/config/dashboard";
import { formatCurrency, healthStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

function DrillLink({
  enabled,
  href,
  children,
  className,
}: {
  enabled: boolean;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <Link href={href} className={`block transition hover:opacity-90 ${className ?? ""}`}>
      {children}
    </Link>
  );
}

export default async function DashboardPage() {
  const config = await getDashboardConfig();

  const opportunities = await prisma.opportunity.findMany({
    include: { customer: true },
    orderBy: { healthScore: "asc" },
  });

  const avgScore =
    opportunities.length > 0
      ? Math.round(
          opportunities.reduce((sum, o) => sum + o.healthScore, 0) /
            opportunities.length
        )
      : 0;

  const brief = buildMorningBrief(opportunities);
  const distribution = {
    healthy: opportunities.filter((o) => o.healthStatus === "HEALTHY").length,
    subhealthy: opportunities.filter((o) => o.healthStatus === "SUBHEALTHY")
      .length,
    dangerous: opportunities.filter((o) => o.healthStatus === "DANGEROUS")
      .length,
  };

  const widgetMap = Object.fromEntries(config.widgets.map((w) => [w.id, w]));
  const drill = config.enableDrillDown;

  const renderWidget = (id: string, node: React.ReactNode) => {
    const widget = widgetMap[id];
    if (!widget?.enabled) return null;
    return (
      <div key={id} className={colSpanClass(widget.colSpan)}>
        {node}
      </div>
    );
  };

  return (
    <>
      <TopBar title={config.pageTitle} />
      <div className="grid gap-4 xl:grid-cols-12">
        {renderWidget(
          "healthOverview",
          <GlassCard glow="purple">
            <SectionTitle
              title={widgetMap.healthOverview?.title ?? "机会健康度"}
              subtitle={widgetMap.healthOverview?.subtitle}
              action={
                drill ? (
                  <Link href="/dashboard/health" className="text-sm text-accent-purple">
                    下钻分析 →
                  </Link>
                ) : null
              }
            />
            <DrillLink enabled={drill} href="/dashboard/health">
              {config.showAverageScore ? (
                <HealthDonut score={avgScore} label="平均健康分" />
              ) : null}
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                <DrillLink
                  enabled={drill}
                  href="/opportunities?status=HEALTHY"
                  className="rounded-xl py-2 hover:bg-white/5"
                >
                  <p className="text-emerald-400">{distribution.healthy}</p>
                  <p className="text-white/50">健康</p>
                </DrillLink>
                <DrillLink
                  enabled={drill}
                  href="/opportunities?status=SUBHEALTHY"
                  className="rounded-xl py-2 hover:bg-white/5"
                >
                  <p className="text-amber-400">{distribution.subhealthy}</p>
                  <p className="text-white/50">亚健康</p>
                </DrillLink>
                <DrillLink
                  enabled={drill}
                  href="/opportunities?status=DANGEROUS"
                  className="rounded-xl py-2 hover:bg-white/5"
                >
                  <p className="text-rose-400">{distribution.dangerous}</p>
                  <p className="text-white/50">危险</p>
                </DrillLink>
              </div>
            </DrillLink>
          </GlassCard>
        )}

        {renderWidget(
          "followUpTeaser",
          <GlassCard glow="pink">
            <SectionTitle
              title={widgetMap.followUpTeaser?.title ?? "智能跟进提醒"}
              subtitle={widgetMap.followUpTeaser?.subtitle}
              action={
                <Link href="/follow-ups" className="text-sm text-accent-pink">
                  查看 →
                </Link>
              }
            />
            <div className="flex h-40 items-center justify-center">
              <p className="max-w-xs text-center text-sm text-white/80">
                AI 已匹配最佳跟进时段，点击查看动作建议与话术
              </p>
            </div>
          </GlassCard>
        )}

        {renderWidget(
          "contentTeaser",
          <GlassCard glow="cyan">
            <SectionTitle
              title={widgetMap.contentTeaser?.title ?? "个性化内容推送"}
              subtitle={widgetMap.contentTeaser?.subtitle}
              action={
                <Link href="/content" className="text-sm text-accent-cyan">
                  查看 →
                </Link>
              }
            />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="mb-2 h-2 w-3/4 rounded bg-gradient-to-r from-accent-pink to-accent-cyan" />
                  <div className="h-1.5 w-full rounded bg-white/10" />
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {renderWidget(
          "morningBrief",
          <GlassCard>
            <SectionTitle
              title={widgetMap.morningBrief?.title ?? "晨间机会体温图"}
              subtitle={widgetMap.morningBrief?.subtitle}
              action={
                drill ? (
                  <Link
                    href="/dashboard/health?status=SUBHEALTHY"
                    className="text-sm text-white/60 hover:text-white"
                  >
                    查看亚健康明细 →
                  </Link>
                ) : null
              }
            />
            <p className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/85">
              {brief.summary}
            </p>
            <div className="space-y-2">
              {brief.priority
                .slice(0, widgetMap.morningBrief?.maxItems ?? 5)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/opportunities/${item.id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-white/50">
                        {item.customer.companyName} · {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={item.healthStatus} />
                      <p
                        className={`mt-1 text-sm font-semibold ${healthStatusColor(item.healthStatus)}`}
                      >
                        {item.healthScore} 分
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </GlassCard>
        )}

        {renderWidget(
          "riskPreview",
          <GlassCard glow="orange">
            <SectionTitle
              title={widgetMap.riskPreview?.title ?? "风险预警"}
              subtitle={widgetMap.riskPreview?.subtitle}
              action={
                <Link href="/risks" className="text-sm text-accent-orange">
                  全部 →
                </Link>
              }
            />
            <div className="space-y-3">
              {opportunities
                .filter((o) => o.healthStatus === "DANGEROUS")
                .slice(0, widgetMap.riskPreview?.maxItems ?? 3)
                .map((o) => (
                  <Link
                    key={o.id}
                    href={`/opportunities/${o.id}`}
                    className="block rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 transition hover:bg-rose-500/20"
                  >
                    <p className="text-sm font-medium">{o.name}</p>
                    <p className="mt-1 text-xs text-rose-200/80">
                      健康分 {o.healthScore}，建议立即跟进
                    </p>
                  </Link>
                ))}
              {distribution.dangerous === 0 ? (
                <p className="text-sm text-white/50">暂无危险机会</p>
              ) : null}
            </div>
          </GlassCard>
        )}
      </div>
    </>
  );
}
