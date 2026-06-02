import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/request-session";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const opportunities = await prisma.opportunity.findMany({
    where: status ? { healthStatus: status as "HEALTHY" | "SUBHEALTHY" | "DANGEROUS" } : undefined,
    include: {
      customer: { include: { contacts: true } },
      healthSnapshots: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ healthScore: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ opportunities });
}
