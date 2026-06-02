import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/request-session";
import { prisma } from "@/lib/db";
import { buildMorningBrief } from "@/lib/scoring/refresh-health";

export async function GET(request: Request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

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

  return NextResponse.json({
    avgScore,
    distribution: {
      healthy: opportunities.filter((o) => o.healthStatus === "HEALTHY").length,
      subhealthy: opportunities.filter((o) => o.healthStatus === "SUBHEALTHY")
        .length,
      dangerous: opportunities.filter((o) => o.healthStatus === "DANGEROUS")
        .length,
    },
    brief,
    user,
  });
}
