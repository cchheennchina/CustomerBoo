import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { GlassCard, SectionTitle, StatusBadge } from "@/components/glass/GlassCard";
import { CsvImportPanel } from "@/components/opportunities/CsvImportPanel";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, healthStatusLabel } from "@/lib/utils";
import type { HealthStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter =
    status && ["HEALTHY", "SUBHEALTHY", "DANGEROUS"].includes(status.toUpperCase())
      ? (status.toUpperCase() as HealthStatus)
      : undefined;

  const opportunities = await prisma.opportunity.findMany({
    where: statusFilter ? { healthStatus: statusFilter } : undefined,
    include: { customer: true },
    orderBy: [{ healthScore: "asc" }, { updatedAt: "desc" }],
  });

  const filters = [
    { key: undefined, label: "全部" },
    { key: "HEALTHY", label: "健康" },
    { key: "SUBHEALTHY", label: "亚健康" },
    { key: "DANGEROUS", label: "危险" },
  ] as const;

  return (
    <>
      <TopBar title="客户机会" />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/opportunities?status=${f.key}` : "/opportunities"}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              (statusFilter ?? null) === (f.key ?? null)
                ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      {statusFilter ? (
        <p className="mb-4 text-sm text-white/60">
          当前筛选：{healthStatusLabel(statusFilter)}状态 · 共 {opportunities.length} 条
          <Link href="/dashboard/health" className="ml-3 text-accent-purple hover:underline">
            返回健康度下钻
          </Link>
        </p>
      ) : null}
      <div className="mb-6">
        <CsvImportPanel />
      </div>
      <GlassCard>
        <SectionTitle
          title="在途机会列表"
          subtitle={`共 ${opportunities.length} 个机会`}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-white/50">
              <tr className="border-b border-white/10">
                <th className="px-3 py-3 font-medium">机会</th>
                <th className="px-3 py-3 font-medium">客户</th>
                <th className="px-3 py-3 font-medium">金额</th>
                <th className="px-3 py-3 font-medium">健康分</th>
                <th className="px-3 py-3 font-medium">状态</th>
                <th className="px-3 py-3 font-medium">上次联系</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr
                  key={opp.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="px-3 py-3">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="font-medium text-white hover:text-accent-cyan"
                    >
                      {opp.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-white/70">
                    {opp.customer.companyName}
                  </td>
                  <td className="px-3 py-3">{formatCurrency(opp.amount)}</td>
                  <td className="px-3 py-3 font-semibold">{opp.healthScore}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={opp.healthStatus} />
                  </td>
                  <td className="px-3 py-3 text-white/60">
                    {formatDate(opp.lastContactAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {opportunities.length === 0 ? (
            <p className="py-8 text-center text-white/50">
              暂无数据，请导入 CSV 或在「客户信息」页添加客户
            </p>
          ) : null}
        </div>
      </GlassCard>
    </>
  );
}
