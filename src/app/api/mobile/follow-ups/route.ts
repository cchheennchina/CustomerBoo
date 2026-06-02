import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/request-session";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    include: { opportunity: true },
    orderBy: [{ completed: "asc" }, { dueAt: "asc" }],
  });

  const reminders = await prisma.reminder.findMany({
    include: { opportunity: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const risks = await prisma.riskSignal.findMany({
    where: { isResolved: false },
    include: { opportunity: { include: { customer: true } } },
    orderBy: [{ level: "desc" }, { createdAt: "desc" }],
    take: 10,
  });

  return NextResponse.json({ tasks, reminders, risks });
}
