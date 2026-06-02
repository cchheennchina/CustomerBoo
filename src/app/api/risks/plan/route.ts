import { NextResponse } from "next/server";
import { createResponsePlan } from "@/lib/risk/scanner";

export async function POST(request: Request) {
  const { riskId } = (await request.json()) as { riskId?: string };
  if (!riskId) {
    return NextResponse.json({ error: "riskId 必填" }, { status: 400 });
  }

  const tasks = await createResponsePlan(riskId);
  if (!tasks) {
    return NextResponse.json({ error: "风险不存在" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: `已创建 ${tasks.length} 项应对任务`,
    tasks,
  });
}
