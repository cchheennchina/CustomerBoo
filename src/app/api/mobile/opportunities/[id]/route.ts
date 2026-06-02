import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/request-session";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      customer: { include: { contacts: true } },
      healthSnapshots: { orderBy: { createdAt: "desc" }, take: 1 },
      riskSignals: { where: { isResolved: false }, take: 3 },
    },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "机会不存在" }, { status: 404 });
  }

  const snapshot = opportunity.healthSnapshots[0];
  const deductions = snapshot
    ? parseJson<Array<{ dimension: string; reason: string; impact: number }>>(
        snapshot.deductions,
        []
      )
    : [];

  return NextResponse.json({ opportunity, deductions, snapshot });
}
