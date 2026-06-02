import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    notifyEmail?: boolean;
    notifyInApp?: boolean;
    dailyBriefEnabled?: boolean;
    weeklyWarPackEnabled?: boolean;
    availableSlots?: string;
  };

  const existing = await prisma.userSettings.findFirst();
  const data = {
    email: body.email ?? existing?.email ?? "marketer@example.com",
    notifyEmail: body.notifyEmail ?? existing?.notifyEmail ?? true,
    notifyInApp: body.notifyInApp ?? existing?.notifyInApp ?? true,
    dailyBriefEnabled:
      body.dailyBriefEnabled ?? existing?.dailyBriefEnabled ?? true,
    weeklyWarPackEnabled:
      body.weeklyWarPackEnabled ?? existing?.weeklyWarPackEnabled ?? true,
    availableSlots: body.availableSlots ?? existing?.availableSlots ?? "[]",
  };

  if (existing) {
    await prisma.userSettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.userSettings.create({ data });
  }

  return NextResponse.json({ success: true, message: "设置已保存" });
}
