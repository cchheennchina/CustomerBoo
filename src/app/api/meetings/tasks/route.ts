import { NextResponse } from "next/server";
import { createTasksFromMeeting } from "@/lib/meetings/service";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    opportunityId?: string;
    actionItems?: Array<{
      title: string;
      assignee: "SALES" | "PRESALES" | "DELIVERY";
      dueDays: number;
    }>;
  };

  if (!body.opportunityId || !body.actionItems) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const tasks = await createTasksFromMeeting(
    body.opportunityId,
    body.actionItems
  );

  return NextResponse.json({
    success: true,
    message: `已同步 ${tasks.length} 个行动项到任务中心`,
  });
}
