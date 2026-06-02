import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  getDashboardConfig,
  saveDashboardConfig,
} from "@/lib/config/service";
import type { DashboardConfig } from "@/lib/config/dashboard";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
  }

  const config = await getDashboardConfig();
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
  }

  const body = (await request.json()) as { config?: DashboardConfig };
  if (!body.config) {
    return NextResponse.json({ error: "config 必填" }, { status: 400 });
  }

  const saved = await saveDashboardConfig(body.config);
  return NextResponse.json({ success: true, config: saved });
}
